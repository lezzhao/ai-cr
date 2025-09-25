import { simpleGit, SimpleGit } from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { FileChange, CommitInfo } from '../types/index.js';

export class GitIntegration {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = resolve(repoPath);
    this.git = simpleGit(this.repoPath);
  }

  /**
   * 获取暂存区的文件变更
   */
  async getStagedChanges(): Promise<FileChange[]> {
    try {
      const status = await this.git.status();
      const stagedFiles = status.staged;
      
      const changes: FileChange[] = [];
      
      for (const file of stagedFiles) {
        const change = await this.getFileChange(file, 'modified');
        if (change) {
          changes.push(change);
        }
      }
      
      return changes;
    } catch (error) {
      console.error('Failed to get staged changes:', error);
      return [];
    }
  }

  /**
   * 获取工作区的文件变更
   */
  async getWorkingChanges(): Promise<FileChange[]> {
    try {
      const status = await this.git.status();
      const changes: FileChange[] = [];
      
      // 处理修改的文件
      for (const file of status.modified) {
        const change = await this.getFileChange(file, 'modified');
        if (change) {
          changes.push(change);
        }
      }
      
      // 处理新增的文件
      for (const file of status.not_added) {
        const change = await this.getFileChange(file, 'added');
        if (change) {
          changes.push(change);
        }
      }
      
      // 处理删除的文件
      for (const file of status.deleted) {
        const change = await this.getFileChange(file, 'deleted');
        if (change) {
          changes.push(change);
        }
      }
      
      return changes;
    } catch (error) {
      console.error('Failed to get working changes:', error);
      return [];
    }
  }

  /**
   * 获取最后一次提交的信息
   */
  async getLastCommit(): Promise<CommitInfo | null> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      if (log.total === 0) {
        return null;
      }
      
      const commit = log.latest;
      if (!commit) return null;
      const files = await this.getCommitFiles(commit.hash);
      
      return {
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: new Date(commit.date),
        files
      };
    } catch (error) {
      console.error('Failed to get last commit:', error);
      return null;
    }
  }

  /**
   * 获取指定提交的文件变更
   */
  async getCommitFiles(commitHash: string): Promise<FileChange[]> {
    try {
      const diff = await this.git.diff([`${commitHash}^`, commitHash, '--name-status']);
      const changes: FileChange[] = [];
      
      const lines = diff.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
      const [status, filePath] = line.split('\t');
      if (!filePath || !status) continue;
        
        const change = await this.getFileChangeFromCommit(filePath, status, commitHash);
        if (change) {
          changes.push(change);
        }
      }
      
      return changes;
    } catch (error) {
      console.error('Failed to get commit files:', error);
      return [];
    }
  }

  /**
   * 获取文件变更详情
   */
  private async getFileChange(filePath: string, status: string): Promise<FileChange | null> {
    try {
      const fullPath = join(this.repoPath, filePath);
      
      if (!existsSync(fullPath) && status !== 'deleted') {
        return null;
      }
      
      let content = '';
      let size = 0;
      
      if (existsSync(fullPath)) {
        content = readFileSync(fullPath, 'utf-8');
        size = content.length;
      }
      
      // 获取diff信息
      let diff = '';
      try {
        if (status === 'modified') {
          diff = await this.git.diff(['--cached', filePath]);
        } else if (status === 'added') {
          diff = await this.git.diff(['--cached', '--no-index', '/dev/null', filePath]);
        }
      } catch (error) {
        // 忽略diff获取错误
      }
      
      return {
        filePath,
        status: status as any,
        content,
        diff,
        size
      };
    } catch (error) {
      console.error(`Failed to get file change for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 从提交中获取文件变更
   */
  private async getFileChangeFromCommit(filePath: string, status: string, commitHash: string): Promise<FileChange | null> {
    try {
      let content = '';
      let size = 0;
      
      // 获取文件内容
      try {
        content = await this.git.show([`${commitHash}:${filePath}`]);
        size = content.length;
      } catch (error) {
        // 文件可能被删除
        if (status !== 'D') {
          console.warn(`Failed to get content for ${filePath} in commit ${commitHash}`);
        }
      }
      
      // 获取diff信息
      let diff = '';
      try {
        diff = await this.git.diff([`${commitHash}^`, commitHash, '--', filePath]);
      } catch (error) {
        // 忽略diff获取错误
      }
      
      const changeStatus = this.mapGitStatus(status);
      
      return {
        filePath,
        status: changeStatus,
        content,
        diff,
        size
      };
    } catch (error) {
      console.error(`Failed to get file change from commit for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 映射Git状态到我们的状态类型
   */
  private mapGitStatus(gitStatus: string): 'added' | 'modified' | 'deleted' | 'renamed' {
    switch (gitStatus) {
      case 'A':
        return 'added';
      case 'M':
        return 'modified';
      case 'D':
        return 'deleted';
      case 'R':
        return 'renamed';
      default:
        return 'modified';
    }
  }

  /**
   * 检查是否为Git仓库
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前分支
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      return branch.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 获取远程仓库信息
   */
  async getRemoteInfo(): Promise<{ name: string; url: string } | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      
      if (origin) {
        return {
          name: origin.name,
          url: origin.refs.fetch
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
