import { AIProvider, AI_ANALYSIS_PROMPT } from './AIProvider.js';
import { AIAnalysisResult } from '../../types/index.js';

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async analyzeText(text: string): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('Groq API key is not configured.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
      throw new Error(`Groq API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty response.');
    }

    const parsed: AIAnalysisResult = JSON.parse(content);
    parsed.raw_provider = this.name;
    return parsed;
  }

  async analyzeImage(_imageBuffer: Buffer, _mimeType: string, ocrText?: string): Promise<AIAnalysisResult> {
    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('Groq provider requires OCR text for image analysis.');
    }
    return this.analyzeText(`[OCR Extracted Text from Image]\n${ocrText}`);
  }
}
