import { supabase } from '../utils/supabaseClient.js';
import { generateCorrelationId } from '../utils/idGenerator.js';
import { normalizeEntity } from '../utils/entityNormalizer.js';
import { AIService } from './ai/AIService.js';
import { AuditService } from './auditService.js';
import { Correlation } from '../types/index.js';

export interface CorrelationCandidate {
  caseId: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  sourceFindingId?: string;
  targetFindingId?: string;
  entityType: string;
  entityValue: string;
}

export class CorrelationEngine {
  private aiService: AIService;

  constructor(aiService?: AIService) {
    this.aiService = aiService || new AIService();
  }

  /**
   * Scans all findings within a case and evaluates cross-evidence correlations based on normalized entities.
   */
  async correlateCase(caseId: string): Promise<Correlation[]> {
    // 1. Fetch all findings for the case
    const { data: findings, error: fndErr } = await supabase
      .from('findings')
      .select('*, evidence(id, evidence_id, type)')
      .eq('case_id', caseId);

    if (fndErr || !findings || findings.length < 2) {
      return [];
    }

    const createdCorrelations: Correlation[] = [];

    // Map entities per finding
    const entityMap: Array<{
      findingId: string;
      evidenceId: string;
      entities: Array<{ type: string; original: string; normalized: string }>;
    }> = [];

    for (const f of findings) {
      if (!f.evidence_id) continue;
      const entitiesList: Array<{ type: string; original: string; normalized: string }> = [];

      const rawEntities = f.entities || {};
      for (const [entityType, values] of Object.entries(rawEntities)) {
        if (Array.isArray(values)) {
          for (const val of values) {
            if (typeof val === 'string' && val.trim().length > 0) {
              entitiesList.push(normalizeEntity(entityType, val));
            }
          }
        }
      }

      entityMap.push({
        findingId: f.id,
        evidenceId: f.evidence_id,
        entities: entitiesList,
      });
    }

    // Pairwise comparison between findings from different evidence items
    for (let i = 0; i < entityMap.length; i++) {
      for (let j = i + 1; j < entityMap.length; j++) {
        const source = entityMap[i];
        const target = entityMap[j];

        // Do NOT correlate findings from the same evidence
        if (source.evidenceId === target.evidenceId) continue;

        for (const srcEnt of source.entities) {
          for (const tgtEnt of target.entities) {
            if (srcEnt.normalized === tgtEnt.normalized && srcEnt.normalized.length >= 3) {
              // Exact normalized entity match found
              const correlation = await this.evaluateAndStore({
                caseId,
                sourceEvidenceId: source.evidenceId,
                targetEvidenceId: target.evidenceId,
                sourceFindingId: source.findingId,
                targetFindingId: target.findingId,
                entityType: srcEnt.type,
                entityValue: srcEnt.original,
              });

              if (correlation) {
                createdCorrelations.push(correlation);
              }
            }
          }
        }
      }
    }

    return createdCorrelations;
  }

  /**
   * Deterministic confidence calculation & optional AI confirmation for ambiguous matches.
   */
  async evaluateAndStore(candidate: CorrelationCandidate): Promise<Correlation | null> {
    const { caseId, sourceEvidenceId, targetEvidenceId, sourceFindingId, targetFindingId, entityType, entityValue } = candidate;

    // Check if correlation already exists
    const { data: existing } = await supabase
      .from('correlations')
      .select('*')
      .eq('case_id', caseId)
      .eq('source_evidence_id', sourceEvidenceId)
      .eq('target_evidence_id', targetEvidenceId)
      .eq('matched_entity_value', entityValue)
      .single();

    if (existing) {
      return existing as Correlation;
    }

    // Deterministic Confidence Scoring
    let confidence = 0.85; // Base strong match for exact normalized entity match
    let reason = `Exact normalized entity match on ${entityType.toUpperCase()}: '${entityValue}'.`;

    // Certain high-uniqueness entity types receive higher confidence
    const highUniquenessTypes = ['email', 'emails', 'ip_address', 'ip', 'phone_number', 'phone'];
    if (highUniquenessTypes.includes(entityType.toLowerCase())) {
      confidence = 0.95;
      reason += ' High-uniqueness entity match.';
    } else if (['people', 'organization', 'organizations', 'username'].includes(entityType.toLowerCase())) {
      confidence = 0.70; // Slightly ambiguous (names/organizations)
      reason += ' Name/username match evaluated for contextual ambiguity.';
    }

    // If ambiguous (60% - 80%), attempt AI confirmation if available
    if (confidence >= 0.60 && confidence <= 0.80) {
      try {
        const availableProviders = this.aiService.getAvailableProviders();
        if (availableProviders.length > 0) {
          const aiPrompt = `Validate if matching entity '${entityValue}' of type '${entityType}' between two distinct evidence files indicates a strong forensic correlation. Return JSON with {"is_valid": true|false, "reason": "..."}`;
          const aiRes = await this.aiService.analyzeText(aiPrompt);
          if (aiRes.confidence && aiRes.confidence > 0.7) {
            confidence = 0.88;
            reason += ` [AI Confirmed]: ${aiRes.reasoning || 'Contextual correlation validated.'}`;
          }
        }
      } catch {
        // AI fallback: retain deterministic confidence
      }
    }

    const correlationIdStr = generateCorrelationId();

    const { data: newCorr, error } = await supabase
      .from('correlations')
      .insert({
        correlation_id: correlationIdStr,
        case_id: caseId,
        source_evidence_id: sourceEvidenceId,
        target_evidence_id: targetEvidenceId,
        source_finding_id: sourceFindingId || null,
        target_finding_id: targetFindingId || null,
        matched_entity_type: entityType,
        matched_entity_value: entityValue,
        correlation_type: 'SHARED_ENTITY',
        confidence,
        reason,
      })
      .select()
      .single();

    if (error) {
      console.error('[CORRELATION STORAGE ERROR]:', error.message);
      return null;
    }

    // Log audit event
    await AuditService.logEvent({
      caseId,
      eventType: 'CORRELATION_CREATED',
      description: `Cross-evidence correlation ${correlationIdStr} detected for entity '${entityValue}'.`,
      metadata: { correlation_id: correlationIdStr, matched_entity: entityValue, confidence },
    });

    return newCorr as Correlation;
  }
}
