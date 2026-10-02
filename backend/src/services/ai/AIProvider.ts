import { AIAnalysisResult } from '../../types/index.js';

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  analyzeText(text: string): Promise<AIAnalysisResult>;
  analyzeImage(imageBuffer: Buffer, mimeType: string, ocrText?: string): Promise<AIAnalysisResult>;
}

export const AI_ANALYSIS_PROMPT = `
You are an expert digital forensics AI assistant.
Analyze the provided evidence (text or image OCR context) for forensic investigation.

Perform entity extraction, identify suspicious patterns, determine finding category, and suggest severity and confidence.

Return ONLY a valid JSON object matching this exact structure:
{
  "summary": "<Brief summary of the evidence>",
  "finding_type": "<Category e.g. SUSPICIOUS_CHAT, CREDENTIAL_LEAK, FINANCIAL_FRAUD, MALWARE_INDICATOR, GENERAL_NOTE>",
  "title": "<Concise title for the finding>",
  "description": "<Detailed forensic analysis and description>",
  "suggested_severity": "<LOW | MEDIUM | HIGH | CRITICAL>",
  "confidence": <number between 0.0 and 1.0>,
  "reasoning": "<Forensic reasoning for the severity and finding>",
  "entities": {
    "people": [],
    "usernames": [],
    "phone_numbers": [],
    "emails": [],
    "urls": [],
    "ip_addresses": [],
    "locations": [],
    "organizations": [],
    "dates": [],
    "visible_text": [],
    "documents": [],
    "objects": []
  },
  "indicators": [
    {
      "type": "<e.g. SUSPICIOUS_KEYWORD, NETWORK_ENDPOINT, PHISHING_LINK>",
      "value": "<the value>",
      "context": "<context snippet>"
    }
  ]
}
Do not wrap in backticks or markdown, return ONLY raw JSON.
`;
