import { writeFileSync, existsSync, chmodSync } from 'fs';
import { join } from 'path';

export class GitHooksIntegration {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * 安装pre-commit hook
   */
  async installPreCommitHook(): Promise<boolean> {
    try {
      const hooksDir = join(this.repoPath, '.git', 'hooks');
      const hookPath = join(hooksDir, 'pre-commit');
      
      const hookContent = `#!/bin/sh
# AI Code Review - Pre-commit Hook
# This hook runs AI code analysis on staged files

echo "🔍 AI Code Review - Analyzing staged files..."

# Run AI code review
npx ai-cr analyze --staged --format console

# Check if analysis passed
if [ $? -ne 0 ]; then
    echo "❌ AI Code Review failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ AI Code Review passed. Proceeding with commit."
exit 0
`;

      writeFileSync(hookPath, hookContent);
      chmodSync(hookPath, '755');
      
      console.log('✅ Pre-commit hook installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install pre-commit hook:', error);
      return false;
    }
  }

  /**
   * 安装commit-msg hook
   */
  async installCommitMsgHook(): Promise<boolean> {
    try {
      const hooksDir = join(this.repoPath, '.git', 'hooks');
      const hookPath = join(hooksDir, 'commit-msg');
      
      const hookContent = `#!/bin/sh
# AI Code Review - Commit Message Hook
# This hook analyzes the commit message

echo "🔍 AI Code Review - Analyzing commit message..."

# Get commit message
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Run AI analysis on commit message
npx ai-cr analyze-commit-msg "$COMMIT_MSG"

# Check if analysis passed
if [ $? -ne 0 ]; then
    echo "❌ Commit message analysis failed. Please improve your commit message."
    exit 1
fi

echo "✅ Commit message analysis passed."
exit 0
`;

      writeFileSync(hookPath, hookContent);
      chmodSync(hookPath, '755');
      
      console.log('✅ Commit-msg hook installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install commit-msg hook:', error);
      return false;
    }
  }

  /**
   * 安装post-commit hook
   */
  async installPostCommitHook(): Promise<boolean> {
    try {
      const hooksDir = join(this.repoPath, '.git', 'hooks');
      const hookPath = join(hooksDir, 'post-commit');
      
      const hookContent = `#!/bin/sh
# AI Code Review - Post-commit Hook
# This hook generates a detailed analysis report after commit

echo "📊 AI Code Review - Generating post-commit report..."

# Run comprehensive analysis
npx ai-cr analyze --commit HEAD --format markdown --output ./reports

echo "✅ Post-commit analysis completed. Report saved to ./reports/"
exit 0
`;

      writeFileSync(hookPath, hookContent);
      chmodSync(hookPath, '755');
      
      console.log('✅ Post-commit hook installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install post-commit hook:', error);
      return false;
    }
  }

  /**
   * 安装所有hooks
   */
  async installAllHooks(): Promise<boolean> {
    console.log('🚀 Installing AI Code Review Git hooks...');
    
    const results = await Promise.all([
      this.installPreCommitHook(),
      this.installCommitMsgHook(),
      this.installPostCommitHook()
    ]);
    
    const success = results.every(result => result);
    
    if (success) {
      console.log('✅ All Git hooks installed successfully!');
      console.log('📝 Hooks installed:');
      console.log('   - pre-commit: Analyzes staged files before commit');
      console.log('   - commit-msg: Analyzes commit message quality');
      console.log('   - post-commit: Generates detailed analysis report');
    } else {
      console.log('❌ Some hooks failed to install. Please check the errors above.');
    }
    
    return success;
  }

  /**
   * 卸载所有hooks
   */
  async uninstallAllHooks(): Promise<boolean> {
    try {
      const hooksDir = join(this.repoPath, '.git', 'hooks');
      const hooks = ['pre-commit', 'commit-msg', 'post-commit'];
      
      for (const hook of hooks) {
        const hookPath = join(hooksDir, hook);
        if (existsSync(hookPath)) {
          // 检查是否是我们安装的hook
          const content = require('fs').readFileSync(hookPath, 'utf-8');
          if (content.includes('AI Code Review')) {
            require('fs').unlinkSync(hookPath);
            console.log(`✅ Removed ${hook} hook`);
          }
        }
      }
      
      console.log('✅ All AI Code Review hooks uninstalled successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to uninstall hooks:', error);
      return false;
    }
  }

  /**
   * 检查hooks状态
   */
  async checkHooksStatus(): Promise<{ [key: string]: boolean }> {
    const hooksDir = join(this.repoPath, '.git', 'hooks');
    const hooks = ['pre-commit', 'commit-msg', 'post-commit'];
    const status: { [key: string]: boolean } = {};
    
    for (const hook of hooks) {
      const hookPath = join(hooksDir, hook);
      if (existsSync(hookPath)) {
        const content = require('fs').readFileSync(hookPath, 'utf-8');
        status[hook] = content.includes('AI Code Review');
      } else {
        status[hook] = false;
      }
    }
    
    return status;
  }

  /**
   * 检查是否为Git仓库
   */
  isGitRepository(): boolean {
    const gitDir = join(this.repoPath, '.git');
    return existsSync(gitDir);
  }

}
