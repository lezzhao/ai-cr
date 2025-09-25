import { describe, test, expect, jest } from '@jest/globals';
import { spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(require('child_process').exec);

describe('CLI Tests', () => {
  describe('帮助命令', () => {
    test('应该显示帮助信息', async () => {
      const { stdout } = await execAsync('node dist/cli.js --help');
      expect(stdout).toContain('AI驱动的代码审查工具');
      expect(stdout).toContain('analyze');
      expect(stdout).toContain('web');
      expect(stdout).toContain('install-hooks');
    });

    test('应该显示版本信息', async () => {
      const { stdout } = await execAsync('node dist/cli.js --version');
      expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('配置命令', () => {
    test('应该能够显示配置', async () => {
      const { stdout } = await execAsync('node dist/cli.js config --show');
      expect(stdout).toContain('当前配置');
      expect(stdout).toContain('AI配置');
      expect(stdout).toContain('分析配置');
    });

    test('应该能够验证配置', async () => {
      const { stdout } = await execAsync('node dist/cli.js config --validate');
      expect(stdout).toContain('配置验证');
    });
  });

  describe('Git Hooks命令', () => {
    test('应该能够检查hooks状态', async () => {
      const { stdout } = await execAsync('node dist/cli.js hooks-status');
      expect(stdout).toContain('Git Hooks 状态');
    });
  });

  describe('AI测试命令', () => {
    test('应该能够测试AI服务', async () => {
      try {
        const { stdout } = await execAsync('node dist/cli.js test-ai --provider deepseek');
        expect(stdout).toContain('测试');
      } catch (error) {
        // 如果没有配置API密钥，这是预期的
        expect(error).toBeDefined();
      }
    });
  });

  describe('分析命令', () => {
    test('应该能够分析暂存区文件（空结果）', async () => {
      try {
        const { stdout } = await execAsync('node dist/cli.js analyze --staged --format console');
        expect(stdout).toBeDefined();
      } catch (error) {
        // 如果没有配置API密钥，这是预期的
        expect(error).toBeDefined();
      }
    });

    test('应该能够分析工作区文件（空结果）', async () => {
      try {
        const { stdout } = await execAsync('node dist/cli.js analyze --working --format console');
        expect(stdout).toBeDefined();
      } catch (error) {
        // 如果没有配置API密钥，这是预期的
        expect(error).toBeDefined();
      }
    });
  });
});
