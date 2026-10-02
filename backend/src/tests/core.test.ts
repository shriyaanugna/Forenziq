import { describe, it, expect, vi } from 'vitest';
import { generateCaseId, generateEvidenceId, generateFindingId } from '../utils/idGenerator.js';
import { calculateSHA256, calculateSHA256FromString } from '../utils/hashUtils.js';
import { evaluateSeverity } from '../services/severityEngine.js';
import { AIService } from '../services/ai/AIService.js';
import { AIProvider } from '../services/ai/AIProvider.js';

describe('ID Generator', () => {
  it('should generate uniquely formatted case IDs', () => {
    const id1 = generateCaseId();
    const id2 = generateCaseId();
    expect(id1).toMatch(/^CASE-[A-F0-9]{8}$/);
    expect(id2).toMatch(/^CASE-[A-F0-9]{8}$/);
    expect(id1).not.toBe(id2);
  });

  it('should generate evidence IDs with proper prefixes', () => {
    const imgId = generateEvidenceId('IMAGE');
    const chatId = generateEvidenceId('CHAT');
    expect(imgId).toMatch(/^IMG-[A-F0-9]{8}$/);
    expect(chatId).toMatch(/^CHAT-[A-F0-9]{8}$/);
  });

  it('should generate finding IDs', () => {
    const fndId = generateFindingId();
    expect(fndId).toMatch(/^FND-[A-F0-9]{8}$/);
  });
});

describe('SHA-256 Hash Utilities', () => {
  it('should compute deterministic SHA-256 for strings and buffers', () => {
    const sample = 'Digital Forensics Evidence 123';
    const hashStr = calculateSHA256FromString(sample);
    const hashBuf = calculateSHA256(Buffer.from(sample, 'utf-8'));

    expect(hashStr).toBe(hashBuf);
    expect(hashStr.length).toBe(64);
  });
});

describe('Severity Engine', () => {
  it('should evaluate CRITICAL severity for threats and violence', () => {
    const result = evaluateSeverity({
      textContext: 'The suspect threatened to bring a bomb and shoot the building.',
      suggestedSeverity: 'CRITICAL',
      confidence: 0.95,
    });
    expect(result.severity).toBe('CRITICAL');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.reasons.some((r) => r.includes('explicit threat'))).toBe(true);
  });

  it('should evaluate HIGH severity for ransomware / malware', () => {
    const result = evaluateSeverity({
      textContext: 'System compromised by ransomware payload and exploit.',
      suggestedSeverity: 'HIGH',
      confidence: 0.9,
    });
    expect(['HIGH', 'CRITICAL']).toContain(result.severity);
    expect(result.score).toBeGreaterThanOrEqual(45);
  });

  it('should evaluate LOW severity for benign text', () => {
    const result = evaluateSeverity({
      textContext: 'Meeting minutes from team standup on Tuesday.',
      suggestedSeverity: 'LOW',
      confidence: 0.8,
    });
    expect(result.severity).toBe('LOW');
    expect(result.score).toBeLessThan(20);
  });
});

describe('AI Provider Fallback', () => {
  it('should throw error when no providers are configured', async () => {
    const mockProvider1: AIProvider = {
      name: 'Mock1',
      isConfigured: () => false,
      analyzeText: vi.fn(),
      analyzeImage: vi.fn(),
    };

    const aiService = new AIService([mockProvider1]);
    await expect(aiService.analyzeText('test')).rejects.toThrow('No AI providers are currently configured');
  });

  it('should fallback to second provider if first provider fails', async () => {
    const failingProvider: AIProvider = {
      name: 'FailingProvider',
      isConfigured: () => true,
      analyzeText: vi.fn().mockRejectedValue(new Error('API quota exceeded')),
      analyzeImage: vi.fn(),
    };

    const workingProvider: AIProvider = {
      name: 'WorkingProvider',
      isConfigured: () => true,
      analyzeText: vi.fn().mockResolvedValue({
        summary: 'Success',
        finding_type: 'GENERAL_NOTE',
        title: 'Success Finding',
        description: 'Analyzed successfully',
        suggested_severity: 'LOW',
        confidence: 0.9,
        reasoning: 'Normal text',
        entities: {},
        indicators: [],
        raw_provider: 'WorkingProvider',
      }),
      analyzeImage: vi.fn(),
    };

    const aiService = new AIService([failingProvider, workingProvider]);
    const result = await aiService.analyzeText('Sample evidence text');

    expect(failingProvider.analyzeText).toHaveBeenCalledTimes(1);
    expect(workingProvider.analyzeText).toHaveBeenCalledTimes(1);
    expect(result.summary).toBe('Success');
  });
});
