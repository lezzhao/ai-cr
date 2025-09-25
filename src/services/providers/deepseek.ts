import { BaseAIProvider } from '../ai-provider.js';
import { AIConfig, CodeAnalysisResult, FileChange } from '../../types/index.js';

export class DeepSeekProvider extends BaseAIProvider {
  async analyzeCode(files: FileChange[], config: AIConfig): Promise<CodeAnalysisResult[]> {
    const prompt = this.formatPrompt(files);
    
    const requestData = {
      model: config.model || 'deepseek-coder',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的代码审查专家，擅长分析代码质量、安全性、性能和最佳实践。请提供详细、准确的分析结果。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.1,
      max_tokens: config.maxTokens || 4000,
      stream: false
    };

    try {
      const response = await this.makeRequest(
        `${config.baseUrl}/chat/completions`,
        requestData
      );

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from DeepSeek API');
      }

      return this.parseResponse(content, files);
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API request failed: ${(error as Error).message}`);
    }
  }

  getProviderName(): string {
    return 'DeepSeek';
  }

  isAvailable(): boolean {
    return !!(this.config.apiKey && this.config.baseUrl);
  }

  private parseResponse(content: string, files: FileChange[]): CodeAnalysisResult[] {
    try {
      // 尝试解析JSON响应
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.formatResults(parsed.results || [], files);
      }

      // 如果无法解析JSON，创建基础分析结果
      return this.createFallbackResults(files);
    } catch (error) {
      console.warn('Failed to parse DeepSeek response:', error);
      return this.createFallbackResults(files);
    }
  }

  private formatResults(results: any[], files: FileChange[]): CodeAnalysisResult[] {
    return results.map((result, index) => ({
      filePath: result.filePath || files[index]?.filePath || 'unknown',
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      summary: {
        totalFiles: 1,
        totalIssues: result.issues?.length || 0,
        totalSuggestions: result.suggestions?.length || 0,
        severityCounts: this.countSeverities(result.issues || []),
        categoryCounts: this.countCategories(result.issues || []),
        qualityScore: result.summary?.qualityScore || 80,
        processingTime: 0
      }
    }));
  }

  private createFallbackResults(files: FileChange[]): CodeAnalysisResult[] {
    return files.map(file => ({
      filePath: file.filePath,
      issues: [],
      suggestions: [
        {
          id: `suggestion-${Date.now()}`,
          type: 'enhancement',
          priority: 'medium',
          title: '代码审查完成',
          description: 'AI分析已完成，但无法解析详细结果。建议手动检查代码质量。'
        }
      ],
      summary: {
        totalFiles: 1,
        totalIssues: 0,
        totalSuggestions: 1,
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        categoryCounts: { bug: 0, security: 0, performance: 0, style: 0, maintainability: 0, accessibility: 0, 'best-practice': 0 },
        qualityScore: 75,
        processingTime: 0
      }
    }));
  }

  private countSeverities(issues: any[]): Record<string, number> {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    issues.forEach(issue => {
      const severity = issue.severity?.toLowerCase() || 'info';
      if (severity in counts) {
        (counts as any)[severity]++;
      }
    });
    return counts;
  }

  private countCategories(issues: any[]): Record<string, number> {
    const counts = { bug: 0, security: 0, performance: 0, style: 0, maintainability: 0, accessibility: 0, 'best-practice': 0 };
    issues.forEach(issue => {
      const type = issue.type?.toLowerCase() || 'style';
      if (type in counts) {
        (counts as any)[type]++;
      }
    });
    return counts;
  }
}
