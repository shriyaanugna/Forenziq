import { AIProvider, AI_ANALYSIS_PROMPT } from './AIProvider.js';
import { AIAnalysisResult } from '../../types/index.js';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async analyzeText(text: string): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://forenziq.local',
        'X-Title': 'FORENZIQ Digital Forensics Platform',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: AI_ANALYSIS_PROMPT },
          { role: 'user', content: `Evidence text to analyze:\n\n${text}` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned empty response.');
    }

    const parsed: AIAnalysisResult = JSON.parse(content);
    parsed.raw_provider = this.name;
    return parsed;
  }

  async analyzeImage(_imageBuffer: Buffer, _mimeType: string, ocrText?: string): Promise<AIAnalysisResult> {
    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('OpenRouter provider requires OCR text for image analysis.');
    }
    return this.analyzeText(`[OCR Extracted Text from Image]\n${ocrText}`);
  }
}
