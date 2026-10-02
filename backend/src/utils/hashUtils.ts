import crypto from 'crypto';

export function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function calculateSHA256FromString(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
}
