#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { configManager } from './config/index.js';
import { CodeAnalyzer } from './core/analyzer.js';
import { ReportGenerator } from './core/report-generator.js';
import { GitHooksIntegration } from './integrations/git-hooks.js';
import { AIProviderFactory } from './services/ai-factory.js';
import { OutputFormat } from './types/index.js';

const program = new Command();

program
  .name('ai-cr')
  .description('AI驱动的代码审查工具')
  .version('0.1.0');

// 分析命令
program
  .command('analyze')
  .description('分析代码变更')
  .option('-s, --staged', '分析暂存区文件')
  .option('-w, --working', '分析工作区文件')
  .option('-c, --commit <hash>', '分析指定提交')
  .option('-f, --format <format>', '输出格式 (markdown|console|json|html)', 'console')
  .option('-o, --output <path>', '输出文件路径')
  .option('--provider <provider>', 'AI服务提供商 (deepseek|openai|moonshot)')
  .action(async (options) => {
    try {
      const spinner = ora('🔍 正在分析代码...').start();
      
      // 获取配置
      const config = configManager.getConfig();
      
      // 如果指定了提供商，更新配置
      if (options.provider) {
        config.ai.provider = options.provider as any;
        config.ai.apiKey = process.env[`${options.provider.toUpperCase()}_API_KEY`] || '';
        config.ai.baseUrl = process.env[`${options.provider.toUpperCase()}_BASE_URL`] || '';
      }
      
      // 验证配置
      const validation = configManager.validateConfig();
      if (!validation.valid) {
        spinner.fail('❌ 配置验证失败');
        console.error(chalk.red('配置错误:'));
        validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }
      
      // 创建分析器
      const analyzer = new CodeAnalyzer(config);
      let response;
      
      // 根据选项执行分析
      if (options.staged) {
        response = await analyzer.analyzeStagedFiles();
      } else if (options.working) {
        response = await analyzer.analyzeWorkingFiles();
      } else if (options.commit) {
        response = await analyzer.analyzeCommit(options.commit);
      } else {
        // 默认分析暂存区
        response = await analyzer.analyzeStagedFiles();
      }
      
      spinner.succeed('✅ 代码分析完成');
      
      // 生成报告
      const reportGenerator = new ReportGenerator();
      const outputPath = await reportGenerator.generateReport(
        response,
        options.format as OutputFormat,
        options.output
      );
      
      if (options.format === 'console') {
        console.log(outputPath);
      } else {
        console.log(chalk.green(`📄 报告已生成: ${outputPath}`));
      }
      
      // 根据质量评分决定退出码
      if (response.summary.qualityScore < 70) {
        console.log(chalk.yellow('⚠️  代码质量评分较低，建议改进'));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 分析失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// Git hooks 安装命令
program
  .command('install-hooks')
  .description('安装Git hooks')
  .action(async () => {
    try {
      const hooksIntegration = new GitHooksIntegration();
      
      if (!hooksIntegration.isGitRepository()) {
        console.error(chalk.red('❌ 当前目录不是Git仓库'));
        process.exit(1);
      }
      
      const success = await hooksIntegration.installAllHooks();
      
      if (success) {
        console.log(chalk.green('✅ Git hooks安装成功'));
      } else {
        console.log(chalk.red('❌ Git hooks安装失败'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ 安装失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// Git hooks 卸载命令
program
  .command('uninstall-hooks')
  .description('卸载Git hooks')
  .action(async () => {
    try {
      const hooksIntegration = new GitHooksIntegration();
      
      if (!hooksIntegration.isGitRepository()) {
        console.error(chalk.red('❌ 当前目录不是Git仓库'));
        process.exit(1);
      }
      
      const success = await hooksIntegration.uninstallAllHooks();
      
      if (success) {
        console.log(chalk.green('✅ Git hooks卸载成功'));
      } else {
        console.log(chalk.red('❌ Git hooks卸载失败'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ 卸载失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// 检查hooks状态命令
program
  .command('hooks-status')
  .description('检查Git hooks状态')
  .action(async () => {
    try {
      const hooksIntegration = new GitHooksIntegration();
      
      if (!hooksIntegration.isGitRepository()) {
        console.error(chalk.red('❌ 当前目录不是Git仓库'));
        process.exit(1);
      }
      
      const status = await hooksIntegration.checkHooksStatus();
      
      console.log(chalk.bold('📋 Git Hooks 状态:'));
      console.log('');
      
      Object.entries(status).forEach(([hook, installed]) => {
        const statusText = installed ? chalk.green('✅ 已安装') : chalk.red('❌ 未安装');
        console.log(`  ${hook}: ${statusText}`);
      });
      
    } catch (error) {
      console.error(chalk.red('❌ 检查失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// 配置命令
program
  .command('config')
  .description('配置管理')
  .option('--validate', '验证配置')
  .option('--show', '显示当前配置')
  .action(async (options) => {
    try {
      const config = configManager.getConfig();
      
      if (options.validate) {
        const validation = configManager.validateConfig();
        if (validation.valid) {
          console.log(chalk.green('✅ 配置验证通过'));
        } else {
          console.log(chalk.red('❌ 配置验证失败:'));
          validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
          process.exit(1);
        }
      }
      
      if (options.show) {
        console.log(chalk.bold('📋 当前配置:'));
        console.log('');
        console.log(chalk.blue('AI配置:'));
        console.log(`  提供商: ${config.ai.provider}`);
        console.log(`  API Key: ${config.ai.apiKey ? '***' + config.ai.apiKey.slice(-4) : '未设置'}`);
        console.log(`  Base URL: ${config.ai.baseUrl}`);
        console.log(`  模型: ${config.ai.model}`);
        console.log('');
        console.log(chalk.blue('分析配置:'));
        console.log(`  最大文件大小: ${config.analysis.maxFileSize} bytes`);
        console.log(`  最大文件数: ${config.analysis.maxFilesPerAnalysis}`);
        console.log(`  超时时间: ${config.analysis.timeout} seconds`);
        console.log('');
        console.log(chalk.blue('输出配置:'));
        console.log(`  格式: ${config.output.format}`);
        console.log(`  目录: ${config.output.directory}`);
      }
    } catch (error) {
      console.error(chalk.red('❌ 配置操作失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// 测试AI服务命令
program
  .command('test-ai')
  .description('测试AI服务连接')
  .option('--provider <provider>', '测试指定提供商 (deepseek|openai|moonshot)')
  .action(async (options) => {
    try {
      const config = configManager.getConfig();
      const provider = options.provider || config.ai.provider;
      
      console.log(chalk.bold(`🧪 测试 ${provider} AI服务...`));
      
      const validation = AIProviderFactory.validateProvider(provider, config.ai);
      
      if (validation.valid) {
        console.log(chalk.green(`✅ ${validation.message}`));
      } else {
        console.log(chalk.red(`❌ ${validation.message}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ 测试失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// Web服务命令
program
  .command('web')
  .description('启动Web服务')
  .option('-p, --port <port>', '端口号', '8000')
  .option('-h, --host <host>', '主机地址', '127.0.0.1')
  .action(async (options) => {
    try {
      console.log(chalk.bold('🚀 启动Web服务...'));
      console.log(chalk.blue(`访问地址: http://${options.host}:${options.port}`));
      
      // 动态导入Web服务
      const { startWebServer } = await import('./web/server.js');
      await startWebServer(options.host, parseInt(options.port));
    } catch (error) {
      console.error(chalk.red('❌ Web服务启动失败:'), (error as Error).message);
      process.exit(1);
    }
  });

// 处理未捕获的错误
process.on('uncaughtException', (error: Error) => {
  console.error(chalk.red('❌ 未捕获的异常:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error(chalk.red('❌ 未处理的Promise拒绝:'), reason);
  process.exit(1);
});

// 解析命令行参数
program.parse();
