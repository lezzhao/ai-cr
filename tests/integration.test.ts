// Jest globals are available without import
import { configManager } from '../src/config/index';
import { CodeAnalyzer } from '../src/core/analyzer';
import { GitIntegration } from '../src/integrations/git';
import { GitHooksIntegration } from '../src/integrations/git-hooks';
import { AIProviderFactory } from '../src/services/ai-factory';
import { ReportGenerator } from '../src/core/report-generator';

describe('AI Code Review Integration Tests', () => {
  let gitIntegration: GitIntegration;
  let analyzer: CodeAnalyzer;
  let reportGenerator: ReportGenerator;

  beforeAll(() => {
    // 创建测试报告目录
    const fs = require('fs');
    const path = require('path');
    const testReportsDir = path.join(process.cwd(), 'test-reports');
    try {
      fs.mkdirSync(testReportsDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }
    
    // 设置测试环境变量
    process.env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';
    process.env['OPENAI_API_KEY'] = 'test-openai-key';
    process.env['MOONSHOT_API_KEY'] = 'test-moonshot-key';
    process.env['DEFAULT_AI_PROVIDER'] = 'mock';
  });

  beforeEach(() => {
    // 确保测试报告目录存在
    const fs = require('fs');
    const path = require('path');
    const testReportsDir = path.join(process.cwd(), 'test-reports');
    try {
      fs.mkdirSync(testReportsDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }
  });

  beforeAll(async () => {
    gitIntegration = new GitIntegration();
    const config = configManager.getConfig();
    analyzer = new CodeAnalyzer(config);
    reportGenerator = new ReportGenerator('./test-reports');
  });

  afterAll(async () => {
    // 清理测试文件
    const fs = await import('fs');
    if (fs.existsSync('./test-reports')) {
      fs.rmSync('./test-reports', { recursive: true, force: true });
    }
  });

  describe('配置管理', () => {
    test('应该能够加载配置', () => {
      const config = configManager.getConfig();
      expect(config).toBeDefined();
      expect(config.ai).toBeDefined();
      expect(config.analysis).toBeDefined();
      expect(config.output).toBeDefined();
      expect(config.web).toBeDefined();
    });

    test('应该能够验证配置', () => {
      const validation = configManager.validateConfig();
      expect(validation).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });

  describe('Git集成', () => {
    test('应该能够检测Git仓库', async () => {
      const isGitRepo = await gitIntegration.isGitRepository();
      expect(typeof isGitRepo).toBe('boolean');
    });

    test('应该能够获取当前分支', async () => {
      const branch = await gitIntegration.getCurrentBranch();
      expect(typeof branch).toBe('string');
    });

    test('应该能够获取暂存区文件', async () => {
      const stagedFiles = await gitIntegration.getStagedChanges();
      expect(Array.isArray(stagedFiles)).toBe(true);
    });

    test('应该能够获取工作区文件', async () => {
      const workingFiles = await gitIntegration.getWorkingChanges();
      expect(Array.isArray(workingFiles)).toBe(true);
    });
  });

  describe('AI服务提供商', () => {
    test('应该能够创建AI提供商', () => {
      const config = configManager.getConfig();
      const providers = ['deepseek', 'openai', 'moonshot'] as const;
      
      providers.forEach(provider => {
        expect(() => {
          AIProviderFactory.createProvider(provider, config.ai);
        }).not.toThrow();
      });
    });

    test('应该能够验证AI提供商', () => {
      const config = configManager.getConfig();
      const validation = AIProviderFactory.validateProvider('deepseek', config.ai);
      expect(validation).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(typeof validation.message).toBe('string');
    });
  });

  describe('代码分析器', () => {
    test('应该能够初始化分析器', () => {
      expect(analyzer).toBeDefined();
    });

    test('应该能够分析空文件列表', async () => {
      const response = await analyzer.analyzeFiles([]);
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.summary).toBeDefined();
    });
  });

  describe('报告生成器', () => {
    test('应该能够生成Markdown报告', async () => {
      const mockResponse = {
        results: [],
        summary: {
          totalFiles: 0,
          totalIssues: 0,
          totalSuggestions: 0,
          severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
          categoryCounts: { bug: 0, security: 0, performance: 0, style: 0, maintainability: 0, accessibility: 0, 'best-practice': 0 },
          qualityScore: 100,
          processingTime: 0
        },
        metadata: {
          timestamp: new Date(),
          version: '0.1.0',
          provider: 'deepseek' as const,
          processingTime: 0
        }
      };

      const reportPath = await reportGenerator.generateReport(mockResponse, 'markdown', 'test-report.md');
      expect(typeof reportPath).toBe('string');
    });

    test('应该能够生成JSON报告', async () => {
      const mockResponse = {
        results: [],
        summary: {
          totalFiles: 0,
          totalIssues: 0,
          totalSuggestions: 0,
          severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
          categoryCounts: { bug: 0, security: 0, performance: 0, style: 0, maintainability: 0, accessibility: 0, 'best-practice': 0 },
          qualityScore: 100,
          processingTime: 0
        },
        metadata: {
          timestamp: new Date(),
          version: '0.1.0',
          provider: 'deepseek' as const,
          processingTime: 0
        }
      };

      const reportPath = await reportGenerator.generateReport(mockResponse, 'json', 'test-report.json');
      expect(typeof reportPath).toBe('string');
    });
  });

  describe('Git Hooks集成', () => {
    test('应该能够初始化Git Hooks集成', () => {
      const hooksIntegration = new GitHooksIntegration();
      expect(hooksIntegration).toBeDefined();
    });

    test('应该能够检测Git仓库', () => {
      const hooksIntegration = new GitHooksIntegration();
      const isGitRepo = hooksIntegration.isGitRepository();
      expect(typeof isGitRepo).toBe('boolean');
    });
  });
});
