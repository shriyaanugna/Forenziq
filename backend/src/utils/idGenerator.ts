import crypto from 'crypto';

export function generateRandomHex(length: number = 8): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
}

export function generateCaseId(): string {
  return `CASE-${generateRandomHex(8)}`;
}

export function generateEvidenceId(type: 'IMAGE' | 'CHAT' | 'TEXT'): string {
  const prefix = type === 'IMAGE' ? 'IMG' : 'CHAT';
  return `${prefix}-${generateRandomHex(8)}`;
}

export function generateFindingId(): string {
  return `FND-${generateRandomHex(8)}`;
}
