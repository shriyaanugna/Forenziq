import { supabase } from '../utils/supabaseClient.js';
import { generateAuditEventId } from '../utils/idGenerator.js';
import { AuditEventType, AuditLog } from '../types/index.js';

export class AuditService {
  /**
   * Records a chain-of-custody audit log entry in Supabase PostgreSQL.
   */
  static async logEvent(params: {
    caseId: string;
    eventType: AuditEventType;
    description: string;
    evidenceId?: string;
    actorUserId?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLog | null> {
    try {
      const eventIdStr = generateAuditEventId();

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          event_id: eventIdStr,
          case_id: params.caseId,
          evidence_id: params.evidenceId || null,
          actor_user_id: params.actorUserId || null,
          event_type: params.eventType,
          description: params.description,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error(`[AUDIT LOG ERROR]: Failed to record event ${params.eventType}:`, error.message);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error(`[AUDIT LOG EXCEPTION]:`, err.message || err);
      return null;
    }
  }

  /**
   * Retrieves chronological audit timeline for a given case.
   */
  static async getCaseAuditTrail(caseId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch audit trail: ${error.message}`);
    }

    return data || [];
  }
}
