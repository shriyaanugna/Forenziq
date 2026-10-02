import { SeverityLevel, ExtractedEntities, SuspiciousIndicator } from '../types/index.js';

export interface SeverityInput {
  suggestedSeverity?: SeverityLevel;
  confidence?: number;
  entities?: ExtractedEntities;
  indicators?: SuspiciousIndicator[];
  textContext?: string;
}

export interface SeverityEvaluation {
  severity: SeverityLevel;
  score: number;
  aiSuggestedSeverity: SeverityLevel;
  decisionReason: string;
  reasons: string[];
}

/**
 * DETERMINISTIC SEVERITY ENGINE RULES & SCORING:
 *
 * Score Range -> Severity Level:
 * - Score >= 60  : CRITICAL
 * - Score >= 40  : HIGH
 * - Score >= 20  : MEDIUM
 * - Score < 20   : LOW
 *
 * Rules & Weightings:
 * 1. Explicit Threats & Violence:
 *    - Weapon mentions, assault, explosives, death threats (+40 pts)
 * 2. Malware & Cyber Crime:
 *    - Malware, ransomware, phishing, exploit, payload (+35 pts)
 * 3. Credential Exposure & Leaks:
 *    - Passwords, API keys, private keys, database dumps (+30 pts)
 * 4. Financial & Fraud Indicators:
 *    - Wire transfer fraud, crypto wallet theft, credit card dumps (+25 pts)
 * 5. Malicious URLs / IP addresses:
 *    - Suspicious domains/IPs in indicators (+15 pts)
 * 6. High Indicator Count:
 *    - 5+ indicators detected (+15 pts)
 * 7. AI Suggested Severity Alignment:
 *    - CRITICAL (+20 pts)
 *    - HIGH (+15 pts)
 *    - MEDIUM (+10 pts)
 */
export function evaluateSeverity(input: SeverityInput): SeverityEvaluation {
  let score = 0;
  const reasons: string[] = [];
  const aiSuggested = input.suggestedSeverity || 'LOW';

  const textToScan = [
    input.textContext || '',
    ...(input.indicators?.map(i => `${i.type} ${i.value} ${i.context}`) || []),
    ...(input.entities?.urls || []),
  ].join(' ').toLowerCase();

  // Rule 1: Explicit Threats & Violence
  const threatKeywords = ['kill', 'murder', 'bomb', 'weapon', 'gun', 'explosive', 'assassinate', 'shoot', 'death threat', 'threatened'];
  if (threatKeywords.some(kw => textToScan.includes(kw))) {
    score += 40;
    reasons.push('Detected potential explicit threat or weapon-related language (+40)');
  }

  // Rule 2: Malware & Cyber Crime
  const malwareKeywords = ['malware', 'ransomware', 'trojan', 'exploit', 'payload', 'keylogger', 'backdoor', 'ddos', 'zero-day'];
  if (malwareKeywords.some(kw => textToScan.includes(kw))) {
    score += 35;
    reasons.push('Detected potential cyber threat, malware, or exploit references (+35)');
  }

  // Rule 3: Credential Exposure & Leaks
  const credKeywords = ['password', 'passwd', 'private_key', 'secret_key', 'api_key', 'token_leak', 'credentials', 'hash_dump'];
  if (credKeywords.some(kw => textToScan.includes(kw))) {
    score += 30;
    reasons.push('Detected potential credential exposure or sensitive key leaks (+30)');
  }

  // Rule 4: Financial & Fraud Indicators
  const financialKeywords = ['credit_card', 'cvv', 'wire_transfer', 'unauthorized_transaction', 'crypto_wallet', 'bitcoin_tumbler', 'transfer', 'recipient account', 'delete this conversation'];
  if (financialKeywords.some(kw => textToScan.includes(kw))) {
    score += 25;
    reasons.push('Detected potential financial fraud or illicit transactional indicators (+25)');
  }

  // Rule 5: Suspicious URLs / IPs
  if ((input.entities?.urls && input.entities.urls.length > 0) || (input.entities?.ip_addresses && input.entities.ip_addresses.length > 0)) {
    score += 15;
    reasons.push('Detected external network endpoints (URLs/IP addresses) (+15)');
  }

  // Rule 6: Indicator Density
  if (input.indicators && input.indicators.length >= 5) {
    score += 15;
    reasons.push('High concentration of suspicious indicators (5+) (+15)');
  }

  // Rule 7: AI Suggested Severity Alignment
  if (aiSuggested === 'CRITICAL') {
    score += 20;
    reasons.push('AI analysis suggested CRITICAL severity (+20)');
  } else if (aiSuggested === 'HIGH') {
    score += 15;
    reasons.push('AI analysis suggested HIGH severity (+15)');
  } else if (aiSuggested === 'MEDIUM') {
    score += 10;
    reasons.push('AI analysis suggested MEDIUM severity (+10)');
  }

  // Rule 8: Confidence Multiplier adjustment
  if (input.confidence && input.confidence < 0.5) {
    score = Math.floor(score * 0.8);
    reasons.push('Confidence is below 50%; reduced overall risk score');
  }

  // Determine Final Authoritative Severity Level from Score
  let severity: SeverityLevel = 'LOW';
  if (score >= 60) {
    severity = 'CRITICAL';
  } else if (score >= 40) {
    severity = 'HIGH';
  } else if (score >= 20) {
    severity = 'MEDIUM';
  } else {
    severity = 'LOW';
  }

  let decisionReason = `Final severity assigned by deterministic severity engine (Score: ${score}).`;
  if (aiSuggested !== severity) {
    decisionReason = `AI suggested ${aiSuggested}, but authoritative deterministic evaluation assigned ${severity} based on score ${score}.`;
  }

  return {
    severity,
    score,
    aiSuggestedSeverity: aiSuggested,
    decisionReason,
    reasons,
  };
}
