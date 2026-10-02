import { AIProvider } from './AIProvider.js';
import { GroqProvider } from './GroqProvider.js';
import { CerebrasProvider } from './CerebrasProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { OpenRouterProvider } from './OpenRouterProvider.js';
import { AIAnalysisResult } from '../../types/index.js';

export class AIService {
  private providers: AIProvider[];

  constructor(customProviders?: AIProvider[]) {
    this.providers = customProviders || [
      new GroqProvider(),
      new CerebrasProvider(),
      new GeminiProvider(),
      new OpenRouterProvider(),
    ];
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter((p) => p.isConfigured())
      .map((p) => p.name);
  }

  async analyzeText(text: string): Promise<AIAnalysisResult> {
    const configuredProviders = this.providers.filter((p) => p.isConfigured());

    if (configuredProviders.length === 0) {
      throw new Error('No AI providers are currently configured. Please configure GROQ_API_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY.');
    }

    const errors: string[] = [];

    for (const provider of configuredProviders) {
      try {
        const result = await provider.analyzeText(text);
        return result;
      } catch (err: any) {
        errors.push(`${provider.name}: ${err.message || String(err)}`);
      }
    }

    throw new Error(`All configured AI providers failed to analyze text:\n${errors.join('\n')}`);
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string, ocrText?: string): Promise<AIAnalysisResult> {
    const configuredProviders = this.providers.filter((p) => p.isConfigured());

    if (configuredProviders.length === 0) {
      throw new Error('No AI providers are currently configured. Please configure GROQ_API_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY.');
    }

    const errors: string[] = [];

    for (const provider of configuredProviders) {
      try {
        const result = await provider.analyzeImage(imageBuffer, mimeType, ocrText);
        return result;
      } catch (err: any) {
        errors.push(`${provider.name}: ${err.message || String(err)}`);
      }
    }

    throw new Error(`All configured AI providers failed to analyze image:\n${errors.join('\n')}`);
  }
}
