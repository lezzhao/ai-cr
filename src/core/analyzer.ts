import { AIProviderFactory } from '../services/ai-factory.js';
import { GitIntegration } from '../integrations/git.js';
import { 
  Config, 
  FileChange, 
  CodeAnalysisResult, 
  AnalysisResponse, 
  AnalysisSummary,
  CommitInfo 
} from '../types/index.js';

export class CodeAnalyzer {
  private config: Config;
  private gitIntegration: GitIntegration;

  constructor(config: Config) {
    this.config = config;
    this.gitIntegration = new GitIntegration();
  }

  /**
   * 分析暂存区的文件
   */
  async analyzeStagedFiles(): Promise<AnalysisResponse> {
    const files = await this.gitIntegration.getStagedChanges();
    return this.analyzeFiles(files);
  }

  /**
   * 分析工作区的文件
   */
  async analyzeWorkingFiles(): Promise<AnalysisResponse> {
    const files = await this.gitIntegration.getWorkingChanges();
    return this.analyzeFiles(files);
  }

  /**
   * 分析指定提交的文件
   */
  async analyzeCommit(_commitHash: string): Promise<AnalysisResponse> {
    const commitInfo = await this.gitIntegration.getLastCommit();
    if (!commitInfo) {
      throw new Error('No commit information found');
    }
    
    return this.analyzeFiles(commitInfo.files, commitInfo);
  }

  /**
   * 分析指定文件列表
   */
  async analyzeFiles(files: FileChange[], _commitInfo?: CommitInfo): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    // 过滤文件
    const filteredFiles = this.filterFiles(files);
    
    if (filteredFiles.length === 0) {
      return this.createEmptyResponse(startTime);
    }

    // 检查文件大小限制
    const validFiles = this.validateFileSizes(filteredFiles);
    
    if (validFiles.length === 0) {
      throw new Error('No valid files to analyze (all files exceed size limit)');
    }

    // 分批处理文件
    const batches = this.createBatches(validFiles);
    const allResults: CodeAnalysisResult[] = [];

    for (const batch of batches) {
      try {
        const batchResults = await this.analyzeBatch(batch);
        allResults.push(...batchResults);
      } catch (error) {
        console.error('Batch analysis failed:', error);
        // 继续处理下一批
      }
    }

    // 生成汇总
    const summary = this.generateSummary(allResults, startTime);
    
    return {
      results: allResults,
      summary,
      metadata: {
        timestamp: new Date(),
        version: '0.1.0',
        provider: this.config.ai.provider,
        processingTime: Date.now() - startTime
      }
    };
  }

  /**
   * 分析一批文件
   */
  private async analyzeBatch(files: FileChange[]): Promise<CodeAnalysisResult[]> {
    const aiProvider = AIProviderFactory.createProvider(
      this.config.ai.provider,
      this.config.ai
    );

    if (!aiProvider.isAvailable()) {
      throw new Error(`AI provider ${this.config.ai.provider} is not available`);
    }

    return await aiProvider.analyzeCode(files, this.config.ai);
  }

  /**
   * 过滤文件
   */
  private filterFiles(files: FileChange[]): FileChange[] {
    return files.filter(file => {
      // 检查包含模式
      const matchesInclude = this.config.analysis.includePatterns.some(pattern => 
        this.matchesPattern(file.filePath, pattern)
      );

      // 检查排除模式
      const matchesExclude = this.config.analysis.excludePatterns.some(pattern => 
        this.matchesPattern(file.filePath, pattern)
      );

      return matchesInclude && !matchesExclude;
    });
  }

  /**
   * 验证文件大小
   */
  private validateFileSizes(files: FileChange[]): FileChange[] {
    return files.filter(file => file.size <= this.config.analysis.maxFileSize);
  }

  /**
   * 创建文件批次
   */
  private createBatches(files: FileChange[]): FileChange[][] {
    const batches: FileChange[][] = [];
    const maxFiles = this.config.analysis.maxFilesPerAnalysis;

    for (let i = 0; i < files.length; i += maxFiles) {
      batches.push(files.slice(i, i + maxFiles));
    }

    return batches;
  }

  /**
   * 生成分析汇总
   */
  private generateSummary(results: CodeAnalysisResult[], startTime: number): AnalysisSummary {
    const totalFiles = results.length;
    let totalIssues = 0;
    let totalSuggestions = 0;
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    const categoryCounts = { 
      bug: 0, 
      security: 0, 
      performance: 0, 
      style: 0, 
      maintainability: 0, 
      accessibility: 0, 
      'best-practice': 0 
    };

    for (const result of results) {
      totalIssues += result.issues.length;
      totalSuggestions += result.suggestions.length;

      // 统计严重程度
      for (const issue of result.issues) {
        severityCounts[issue.severity]++;
        categoryCounts[issue.type]++;
      }
    }

    // 计算质量评分
    const qualityScore = this.calculateQualityScore(totalIssues, totalSuggestions, totalFiles);

    return {
      totalFiles,
      totalIssues,
      totalSuggestions,
      severityCounts,
      categoryCounts,
      qualityScore,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(issues: number, suggestions: number, files: number): number {
    if (files === 0) return 100;
    
    const issuesPerFile = issues / files;
    const suggestionsPerFile = suggestions / files;
    
    // 基础分数
    let score = 100;
    
    // 根据问题数量扣分
    score -= Math.min(issuesPerFile * 10, 50);
    
    // 根据建议数量加分（适度）
    score += Math.min(suggestionsPerFile * 2, 10);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 模式匹配
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // 简单的glob模式匹配
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
    );
    
    return regex.test(filePath);
  }

  /**
   * 创建空响应
   */
  private createEmptyResponse(startTime: number): AnalysisResponse {
    return {
      results: [],
      summary: {
        totalFiles: 0,
        totalIssues: 0,
        totalSuggestions: 0,
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        categoryCounts: { bug: 0, security: 0, performance: 0, style: 0, maintainability: 0, accessibility: 0, 'best-practice': 0 },
        qualityScore: 100,
        processingTime: Date.now() - startTime
      },
      metadata: {
        timestamp: new Date(),
        version: '0.1.0',
        provider: this.config.ai.provider,
        processingTime: Date.now() - startTime
      }
    };
  }
}
