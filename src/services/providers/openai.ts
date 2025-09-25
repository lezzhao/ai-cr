import { BaseAIProvider } from '../ai-provider.js';
import { AIConfig, CodeAnalysisResult, FileChange } from '../../types/index.js';

export class OpenAIProvider extends BaseAIProvider {
  async analyzeCode(files: FileChange[], config: AIConfig): Promise<CodeAnalysisResult[]> {
    const prompt = this.formatPrompt(files);
    
    const requestData = {
      model: config.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional code review expert, skilled in analyzing code quality, security, performance, and best practices. Please provide detailed and accurate analysis results.'
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
        throw new Error('No response content from OpenAI API');
      }

      return this.parseResponse(content, files);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API request failed: ${(error as Error).message}`);
    }
  }

  getProviderName(): string {
    return 'OpenAI';
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
      console.warn('Failed to parse OpenAI response:', error);
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
          title: 'Code Review Completed',
          description: 'AI analysis completed, but detailed results could not be parsed. Manual code quality check recommended.'
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
