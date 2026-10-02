import { AIProvider, AI_ANALYSIS_PROMPT } from './AIProvider.js';
import { AIAnalysisResult } from '../../types/index.js';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async analyzeText(text: string): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${AI_ANALYSIS_PROMPT}\n\nEvidence text to analyze:\n\n${text}` },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Gemini returned empty response.');
    }

    const parsed: AIAnalysisResult = JSON.parse(content);
    parsed.raw_provider = this.name;
    return parsed;
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string, ocrText?: string): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const base64Data = imageBuffer.toString('base64');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const promptText = `${AI_ANALYSIS_PROMPT}\n\nAnalyze this forensic image evidence.${
      ocrText ? ` OCR Context:\n${ocrText}` : ''
    }`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      // Fall back to OCR text analysis if vision API call fails
      if (ocrText && ocrText.trim().length > 0) {
        return this.analyzeText(`[OCR Extracted Text from Image]\n${ocrText}`);
      }
      const errText = await response.text();
      throw new Error(`Gemini Vision API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Gemini vision returned empty response.');
    }

    const parsed: AIAnalysisResult = JSON.parse(content);
    parsed.raw_provider = `${this.name} Vision`;
    return parsed;
  }
}
