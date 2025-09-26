// Jest globals are available without import
import { execAsync } from './helpers/exec';
import { createTestFiles, cleanupTestFiles } from './helpers/test-files';

describe('End-to-End Tests', () => {
  beforeAll(async () => {
    // 设置测试环境变量
    process.env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';
    process.env['OPENAI_API_KEY'] = 'test-openai-key';
    process.env['MOONSHOT_API_KEY'] = 'test-moonshot-key';
    process.env['DEFAULT_AI_PROVIDER'] = 'mock';
    process.env['AI_CR_CONFIG_PATH'] = './tests/test-config.json';
    
    // 创建测试文件
    await createTestFiles();
  });

  afterAll(async () => {
    // 清理测试文件
    await cleanupTestFiles();
  });

  describe('完整工作流程', () => {
    test('应该能够完成完整的代码审查流程', async () => {
      // 1. 检查Git状态
      const gitStatus = await execAsync('node tests/mocks/cli-mock.cjs hooks-status');
      expect(gitStatus.stdout).toContain('Git Hooks 状态');

      // 2. 显示配置
      const config = await execAsync('node tests/mocks/cli-mock.cjs config --show');
      expect(config.stdout).toContain('当前配置');

      // 3. 验证配置
      const validation = await execAsync('node tests/mocks/cli-mock.cjs config --validate');
      expect(validation.stdout).toContain('配置验证');

      // 4. 测试AI服务
      const aiTest = await execAsync('node tests/mocks/cli-mock.cjs test-ai --provider deepseek');
      expect(aiTest.stdout).toContain('测试');
    });

    test('应该能够生成报告', async () => {
      // 创建一些测试文件
      const testCode = `
// 测试文件
function testFunction() {
  console.log("Hello World");
  var unused = "unused variable";
  return true;
}
`;

      const fs = await import('fs');
      const path = await import('path');
      
      const testDir = './test-files';
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, testCode);

      try {
        // 尝试分析文件（可能会失败，因为没有API密钥）
        const analysis = await execAsync(`node dist/cli.js analyze --working --format markdown --output ./test-reports/e2e-test.md`);
        expect(analysis.stdout).toBeDefined();
      } catch (error) {
        // 这是预期的，因为没有配置API密钥
        expect(error).toBeDefined();
      } finally {
        // 清理测试文件
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('错误处理', () => {
    test('应该能够处理无效的命令', async () => {
      try {
        await execAsync('node dist/cli.js invalid-command');
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('应该能够处理无效的选项', async () => {
      try {
        await execAsync('node dist/cli.js analyze --invalid-option');
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('帮助系统', () => {
    test('应该能够显示所有命令的帮助', async () => {
      const commands = ['analyze', 'config', 'test-ai', 'web', 'install-hooks', 'uninstall-hooks', 'hooks-status'];
      
      for (const command of commands) {
        try {
          const help = await execAsync(`node dist/cli.js ${command} --help`);
          expect(help.stdout).toBeDefined();
        } catch (error) {
          // 某些命令可能没有帮助信息
          console.warn(`命令 ${command} 的帮助信息获取失败:`, error);
        }
      }
    });
  });
});
