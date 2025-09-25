import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Config, AIProvider } from '../types/index.js';

// 加载环境变量
config();

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  public updateConfig(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
  }

  private loadConfig(): Config {
    // 尝试加载配置文件
    const configPath = join(process.cwd(), 'ai-cr.config.yaml');
    let fileConfig = {};

    if (existsSync(configPath)) {
      try {
        // 同步加载YAML配置
        readFileSync(configPath, 'utf-8');
        // 简单的YAML解析，或者跳过配置文件加载
        console.warn('YAML config file found but not loaded in sync mode');
      } catch (error) {
        console.warn('Failed to load config file:', error);
      }
    }

    // 合并环境变量和文件配置
    return {
      ai: {
        provider: (process.env['DEFAULT_AI_PROVIDER'] as AIProvider) || 'deepseek',
        apiKey: this.getAPIKey(),
        baseUrl: this.getBaseUrl(),
        model: this.getModel(),
        temperature: parseFloat(process.env['AI_TEMPERATURE'] || '0.1'),
        maxTokens: parseInt(process.env['AI_MAX_TOKENS'] || '4000'),
        timeout: parseInt(process.env['AI_TIMEOUT'] || '30000'),
        ...(fileConfig as any).ai,
      },
      analysis: {
        maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '100000'),
        maxFilesPerAnalysis: parseInt(process.env['MAX_FILES_PER_ANALYSIS'] || '50'),
        timeout: parseInt(process.env['ANALYSIS_TIMEOUT'] || '300'),
        includePatterns: this.parsePatterns(process.env['INCLUDE_PATTERNS'] || '**/*.{js,ts,jsx,tsx,py,java,go,rs}'),
        excludePatterns: this.parsePatterns(process.env['EXCLUDE_PATTERNS'] || 'node_modules/**,dist/**,build/**'),
        customRules: [],
        ...(fileConfig as any).analysis,
      },
      output: {
        format: (process.env['OUTPUT_FORMAT'] as any) || 'markdown',
        directory: process.env['OUTPUT_DIR'] || './reports',
        includeSummary: process.env['INCLUDE_SUMMARY'] !== 'false',
        includeDetails: process.env['INCLUDE_DETAILS'] !== 'false',
        groupByFile: process.env['GROUP_BY_FILE'] !== 'false',
        ...(fileConfig as any).output,
      },
      web: {
        host: process.env['WEB_HOST'] || '127.0.0.1',
        port: parseInt(process.env['WEB_PORT'] || '8000'),
        debug: process.env['WEB_DEBUG'] === 'true',
        cors: process.env['WEB_CORS'] !== 'false',
        ...(fileConfig as any).web,
      },
    };
  }

  private getAPIKey(): string {
    const provider = (process.env['DEFAULT_AI_PROVIDER'] as AIProvider) || 'deepseek';
    
    switch (provider) {
      case 'deepseek':
        return process.env['DEEPSEEK_API_KEY'] || '';
      case 'openai':
        return process.env['OPENAI_API_KEY'] || '';
      case 'moonshot':
        return process.env['MOONSHOT_API_KEY'] || '';
      default:
        return '';
    }
  }

  private getBaseUrl(): string {
    const provider = (process.env['DEFAULT_AI_PROVIDER'] as AIProvider) || 'deepseek';
    
    switch (provider) {
      case 'deepseek':
        return process.env['DEEPSEEK_BASE_URL'] || 'https://api.deepseek.com';
      case 'openai':
        return process.env['OPENAI_BASE_URL'] || 'https://api.openai.com/v1';
      case 'moonshot':
        return process.env['MOONSHOT_BASE_URL'] || 'https://api.moonshot.cn/v1';
      default:
        return '';
    }
  }

  private getModel(): string {
    const provider = (process.env['DEFAULT_AI_PROVIDER'] as AIProvider) || 'deepseek';
    
    switch (provider) {
      case 'deepseek':
        return process.env['DEEPSEEK_MODEL'] || 'deepseek-coder';
      case 'openai':
        return process.env['OPENAI_MODEL'] || 'gpt-4';
      case 'moonshot':
        return process.env['MOONSHOT_MODEL'] || 'moonshot-v1-8k';
      default:
        return '';
    }
  }

  private parsePatterns(patterns: string): string[] {
    return patterns.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Mock提供商不需要API密钥和URL
    if (this.config.ai.provider !== 'mock') {
      if (!this.config.ai.apiKey) {
        errors.push('AI API key is required');
      }

      if (!this.config.ai.baseUrl) {
        errors.push('AI base URL is required');
      }
    }

    if (this.config.analysis.maxFileSize <= 0) {
      errors.push('Max file size must be greater than 0');
    }

    if (this.config.analysis.maxFilesPerAnalysis <= 0) {
      errors.push('Max files per analysis must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const configManager = ConfigManager.getInstance();
