import { configManager } from '../src/config';

describe('ConfigManager', () => {
  beforeEach(() => {
    // 重置环境变量
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.MOONSHOT_API_KEY;
    delete process.env.DEFAULT_AI_PROVIDER;
  });

  test('should load default configuration', () => {
    const config = configManager.getConfig();
    
    expect(config.ai.provider).toBe('deepseek');
    expect(config.analysis.maxFileSize).toBe(100000);
    expect(config.output.format).toBe('markdown');
  });

  test('should validate configuration', () => {
    const validation = configManager.validateConfig();
    
    // 没有API key时应该验证失败
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('AI API key is required');
  });

  test('should update configuration', () => {
    const updates = {
      ai: {
        provider: 'openai' as any,
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1'
      }
    };
    
    configManager.updateConfig(updates);
    const config = configManager.getConfig();
    
    expect(config.ai.provider).toBe('openai');
    expect(config.ai.apiKey).toBe('test-key');
  });
});
