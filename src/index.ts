/**
 * AI Code Review Tool
 * 
 * This is the main entry point for the AI Code Review package.
 * It exports all the core functionality for programmatic usage.
 */

// Core functionality
export { CodeAnalyzer } from './core/analyzer.js';
export { ReportGenerator } from './core/report-generator.js';

// Services
export { AIProviderFactory } from './services/ai-factory.js';
export { AIProviderInterface } from './services/ai-provider.js';

// AI Providers
export { DeepSeekProvider } from './services/providers/deepseek.js';
export { OpenAIProvider } from './services/providers/openai.js';
export { MoonshotProvider } from './services/providers/moonshot.js';
export { MockProvider } from './services/providers/mock.js';

// Integrations
export { GitIntegration } from './integrations/git.js';
export { GitHooksIntegration } from './integrations/git-hooks.js';

// Configuration
export { ConfigManager } from './config/index.js';

// Types
export * from './types/index.js';

// Utilities
export * from './utils/index.js';

// Web server (optional)
export { startWebServer } from './web/server.js';
