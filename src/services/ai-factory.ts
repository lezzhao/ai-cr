import { AIProviderInterface } from './ai-provider.js';
import { DeepSeekProvider } from './providers/deepseek.js';
import { OpenAIProvider } from './providers/openai.js';
import { MoonshotProvider } from './providers/moonshot.js';
import { MockProvider } from './providers/mock.js';
import { AIProvider, AIConfig } from '../types/index.js';

export class AIProviderFactory {
  static createProvider(provider: AIProvider, config: AIConfig): AIProviderInterface {
    switch (provider) {
      case 'deepseek':
        return new DeepSeekProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'moonshot':
        return new MoonshotProvider(config);
      case 'mock':
        return new MockProvider(config);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  static getAvailableProviders(config: AIConfig): AIProvider[] {
    const providers: AIProvider[] = [];
    
    // 检查DeepSeek
    if (config.apiKey && config.baseUrl.includes('deepseek')) {
      providers.push('deepseek');
    }
    
    // 检查OpenAI
    if (config.apiKey && config.baseUrl.includes('openai')) {
      providers.push('openai');
    }
    
    // 检查Moonshot
    if (config.apiKey && config.baseUrl.includes('moonshot')) {
      providers.push('moonshot');
    }
    
    return providers;
  }

  static validateProvider(provider: AIProvider, config: AIConfig): { valid: boolean; message: string } {
    try {
      const aiProvider = this.createProvider(provider, config);
      const isAvailable = aiProvider.isAvailable();
      
      return {
        valid: isAvailable,
        message: isAvailable 
          ? `${provider} provider is available` 
          : `${provider} provider is not available - check API key and base URL`
      };
    } catch (error) {
      return {
        valid: false,
        message: `Failed to create ${provider} provider: ${(error as Error).message}`
      };
    }
  }
}
