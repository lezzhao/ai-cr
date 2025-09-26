#!/usr/bin/env node

// Mock CLI for testing
// 简化Mock，不依赖实际的配置管理器

// Mock configuration for testing
const mockConfig = {
  ai: {
    provider: 'mock',
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com/v1',
    model: 'test-model',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30000
  },
  analysis: {
    maxFileSize: 100000,
    excludePatterns: ['node_modules/**', 'dist/**', '*.log'],
    includePatterns: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']
  },
  output: {
    format: 'markdown',
    outputDir: './reports',
    filename: 'ai-code-review-report'
  },
  git: {
    autoCommit: false,
    commitMessage: 'AI Code Review: {timestamp}',
    branchPrefix: 'ai-review/'
  }
};

// Mock config is ready for testing

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log('AI驱动的代码审查工具');
  console.log('analyze - 分析代码');
  console.log('web - 启动Web服务器');
  console.log('install-hooks - 安装Git hooks');
  process.exit(0);
}

if (args.includes('--version')) {
  console.log('1.0.0');
  process.exit(0);
}

if (args.includes('config')) {
  if (args.includes('--show')) {
    console.log('当前配置');
    console.log('AI配置: mock provider');
    console.log('分析配置: 默认设置');
    process.exit(0);
  }
  
  if (args.includes('--validate')) {
    console.log('配置验证');
    console.log('✅ 配置有效');
    process.exit(0);
  }
}

if (args.includes('hooks-status')) {
  console.log('Git Hooks 状态');
  console.log('pre-commit: 未安装');
  console.log('commit-msg: 未安装');
  console.log('post-commit: 未安装');
  process.exit(0);
}

if (args.includes('test-ai')) {
  console.log('测试AI服务');
  console.log('✅ Mock provider 连接成功');
  process.exit(0);
}

// Default help
console.log('AI驱动的代码审查工具');
console.log('使用 --help 查看帮助信息');
