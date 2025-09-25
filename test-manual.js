#!/usr/bin/env node

import { configManager } from './dist/config/index.js';
import { CodeAnalyzer } from './dist/core/analyzer.js';
import { GitIntegration } from './dist/integrations/git.js';
import { GitHooksIntegration } from './dist/integrations/git-hooks.js';
import { AIProviderFactory } from './dist/services/ai-factory.js';
import { ReportGenerator } from './dist/core/report-generator.js';
import { startWebServer } from './dist/web/server.js';
import chalk from 'chalk';

async function runManualTests() {
  console.log(chalk.bold.blue('🧪 AI Code Review 手动测试套件\n'));

  // 测试1: 配置管理
  console.log(chalk.yellow('1. 测试配置管理...'));
  try {
    const config = configManager.getConfig();
    console.log(chalk.green('   ✅ 配置加载成功'));
    console.log(`   📋 AI提供商: ${config.ai.provider}`);
    console.log(`   📋 最大文件大小: ${config.analysis.maxFileSize} bytes`);
    console.log(`   📋 输出格式: ${config.output.format}`);
    
    const validation = configManager.validateConfig();
    if (validation.valid) {
      console.log(chalk.green('   ✅ 配置验证通过'));
    } else {
      console.log(chalk.yellow('   ⚠️  配置验证失败:'));
      validation.errors.forEach(error => console.log(chalk.red(`      - ${error}`)));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ 配置管理测试失败: ${error.message}`));
  }

  // 测试2: Git集成
  console.log(chalk.yellow('\n2. 测试Git集成...'));
  try {
    const gitIntegration = new GitIntegration();
    const isGitRepo = await gitIntegration.isGitRepository();
    
    if (isGitRepo) {
      console.log(chalk.green('   ✅ Git仓库检测成功'));
      
      const currentBranch = await gitIntegration.getCurrentBranch();
      console.log(`   📋 当前分支: ${currentBranch}`);
      
      const stagedFiles = await gitIntegration.getStagedChanges();
      console.log(`   📋 暂存区文件数: ${stagedFiles.length}`);
      
      const workingFiles = await gitIntegration.getWorkingChanges();
      console.log(`   📋 工作区文件数: ${workingFiles.length}`);
      
      if (workingFiles.length > 0) {
        console.log('   📋 工作区文件示例:');
        workingFiles.slice(0, 3).forEach(file => {
          console.log(`      - ${file.filePath} (${file.status})`);
        });
      }
    } else {
      console.log(chalk.yellow('   ⚠️  当前目录不是Git仓库'));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ Git集成测试失败: ${error.message}`));
  }

  // 测试3: AI服务提供商
  console.log(chalk.yellow('\n3. 测试AI服务提供商...'));
  try {
    const config = configManager.getConfig();
    const providers = ['deepseek', 'openai', 'moonshot'];
    
    for (const provider of providers) {
      try {
        const aiProvider = AIProviderFactory.createProvider(provider, config.ai);
        const isAvailable = aiProvider.isAvailable();
        const status = isAvailable ? '✅' : '❌';
        console.log(`   ${status} ${provider}: ${isAvailable ? '可用' : '不可用'}`);
      } catch (error) {
        console.log(`   ❌ ${provider}: 创建失败`);
      }
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ AI服务提供商测试失败: ${error.message}`));
  }

  // 测试4: 代码分析器
  console.log(chalk.yellow('\n4. 测试代码分析器...'));
  try {
    const config = configManager.getConfig();
    const analyzer = new CodeAnalyzer(config);
    console.log(chalk.green('   ✅ 代码分析器初始化成功'));
    
    // 测试空文件分析
    const emptyResponse = await analyzer.analyzeFiles([]);
    console.log(`   📋 空文件分析结果: ${emptyResponse.results.length} 个文件`);
    console.log(`   📋 质量评分: ${emptyResponse.summary.qualityScore}`);
  } catch (error) {
    console.log(chalk.red(`   ❌ 代码分析器测试失败: ${error.message}`));
  }

  // 测试5: 报告生成器
  console.log(chalk.yellow('\n5. 测试报告生成器...'));
  try {
    const reportGenerator = new ReportGenerator('./test-reports');
    
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
        provider: 'deepseek',
        processingTime: 0
      }
    };

    const markdownReport = await reportGenerator.generateReport(mockResponse, 'markdown', 'test-report.md');
    console.log(chalk.green(`   ✅ Markdown报告生成成功: ${markdownReport}`));
    
    const jsonReport = await reportGenerator.generateReport(mockResponse, 'json', 'test-report.json');
    console.log(chalk.green(`   ✅ JSON报告生成成功: ${jsonReport}`));
  } catch (error) {
    console.log(chalk.red(`   ❌ 报告生成器测试失败: ${error.message}`));
  }

  // 测试6: Git Hooks集成
  console.log(chalk.yellow('\n6. 测试Git Hooks集成...'));
  try {
    const hooksIntegration = new GitHooksIntegration();
    const isGitRepo = hooksIntegration.isGitRepository();
    
    if (isGitRepo) {
      console.log(chalk.green('   ✅ Git仓库检测成功'));
      
      const status = await hooksIntegration.checkHooksStatus();
      console.log('   📋 Git Hooks状态:');
      Object.entries(status).forEach(([hook, installed]) => {
        const statusIcon = installed ? '✅' : '❌';
        console.log(`      ${statusIcon} ${hook}: ${installed ? '已安装' : '未安装'}`);
      });
    } else {
      console.log(chalk.yellow('   ⚠️  当前目录不是Git仓库'));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ Git Hooks集成测试失败: ${error.message}`));
  }

  // 测试7: Web服务器
  console.log(chalk.yellow('\n7. 测试Web服务器...'));
  try {
    console.log('   🚀 启动Web服务器 (端口 8003)...');
    console.log('   📋 访问地址: http://127.0.0.1:8003');
    console.log('   📋 按 Ctrl+C 停止服务器');
    
    // 启动Web服务器
    await startWebServer('127.0.0.1', 8003);
  } catch (error) {
    console.log(chalk.red(`   ❌ Web服务器测试失败: ${error.message}`));
  }

  console.log(chalk.bold.green('\n🎉 手动测试完成！'));
  console.log(chalk.blue('\n📝 下一步:'));
  console.log('   1. 配置AI API密钥: 编辑 .env 文件');
  console.log('   2. 运行单元测试: pnpm test');
  console.log('   3. 运行集成测试: pnpm test:integration');
  console.log('   4. 启动Web界面: npx ai-cr web');
  console.log('   5. 安装Git hooks: npx ai-cr install-hooks');
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 测试结束，正在清理...'));
  process.exit(0);
});

runManualTests().catch(console.error);
