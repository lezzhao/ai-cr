import { BaseAIProvider } from '../ai-provider.js';
import { AIConfig, CodeAnalysisResult, FileChange } from '../../types/index.js';

export class MockProvider extends BaseAIProvider {
  async analyzeCode(files: FileChange[], _config: AIConfig): Promise<CodeAnalysisResult[]> {
    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return files.map(file => ({
      filePath: file.filePath,
      issues: this.generateMockIssues(file),
      suggestions: this.generateMockSuggestions(file),
      summary: {
        totalFiles: 1,
        totalIssues: this.generateMockIssues(file).length,
        totalSuggestions: this.generateMockSuggestions(file).length,
        severityCounts: { critical: 0, high: 1, medium: 2, low: 1, info: 0 },
        categoryCounts: { bug: 1, security: 1, performance: 1, style: 1, maintainability: 0, accessibility: 0, 'best-practice': 0 },
        qualityScore: 75,
        processingTime: 1000
      }
    }));
  }

  getProviderName(): string {
    return 'Mock';
  }

  isAvailable(): boolean {
    return true;
  }

  private generateMockIssues(file: FileChange): any[] {
    const issues = [];
    
    if (file.filePath.includes('.js')) {
      issues.push({
        id: 'js-001',
        type: 'style',
        severity: 'medium',
        line: 3,
        column: 1,
        message: '使用var声明变量，建议使用let或const',
        description: '现代JavaScript推荐使用let和const而不是var，以避免变量提升和块级作用域问题。',
        suggestion: '将var改为let或const',
        rule: 'no-var'
      });

      issues.push({
        id: 'js-002',
        type: 'bug',
        severity: 'high',
        line: 15,
        column: 1,
        message: '缺少错误处理',
        description: 'JSON.parse可能抛出异常，但没有try-catch处理。',
        suggestion: '添加try-catch块来处理JSON解析错误',
        rule: 'error-handling'
      });

      issues.push({
        id: 'js-003',
        type: 'security',
        severity: 'critical',
        line: 25,
        column: 1,
        message: '使用eval()存在安全风险',
        description: 'eval()函数会执行任意代码，可能导致代码注入攻击。',
        suggestion: '避免使用eval()，考虑使用其他安全的替代方案',
        rule: 'no-eval'
      });
    }

    if (file.filePath.includes('.ts')) {
      issues.push({
        id: 'ts-001',
        type: 'style',
        severity: 'medium',
        line: 12,
        column: 1,
        message: '缺少返回类型注解',
        description: 'TypeScript函数应该明确指定返回类型以提高代码可读性。',
        suggestion: '为函数添加明确的返回类型注解',
        rule: 'explicit-return-type'
      });

      issues.push({
        id: 'ts-002',
        type: 'bug',
        severity: 'high',
        line: 18,
        column: 1,
        message: '缺少错误处理',
        description: '数组操作可能失败，但没有错误处理机制。',
        suggestion: '添加错误处理和边界检查',
        rule: 'error-handling'
      });

      issues.push({
        id: 'ts-003',
        type: 'style',
        severity: 'low',
        line: 30,
        column: 1,
        message: '使用any类型',
        description: '使用any类型会失去TypeScript的类型检查优势。',
        suggestion: '使用更具体的类型定义',
        rule: 'no-any'
      });
    }

    return issues;
  }

  private generateMockSuggestions(file: FileChange): any[] {
    const suggestions = [];

    if (file.filePath.includes('.js')) {
      suggestions.push({
        id: 'js-sug-001',
        type: 'refactor',
        priority: 'high',
        line: 1,
        title: '添加JSDoc注释',
        description: '为函数添加JSDoc注释可以提高代码可读性和维护性。',
        code: '/**\n * 计算两个数的和\n * @param {number} a - 第一个数\n * @param {number} b - 第二个数\n * @returns {number} 两数之和\n */'
      });

      suggestions.push({
        id: 'js-sug-002',
        type: 'optimization',
        priority: 'medium',
        line: 8,
        title: '使用现代JavaScript语法',
        description: '可以使用箭头函数和数组方法简化代码。',
        code: 'const result = data.filter(item => item > 0).map(item => item * 2);'
      });
    }

    if (file.filePath.includes('.ts')) {
      suggestions.push({
        id: 'ts-sug-001',
        type: 'enhancement',
        priority: 'high',
        line: 5,
        title: '添加访问修饰符',
        description: '明确指定方法的访问级别。',
        code: 'public addUser(user: User): void {'
      });

      suggestions.push({
        id: 'ts-sug-002',
        type: 'refactor',
        priority: 'medium',
        line: 12,
        title: '添加返回类型注解',
        description: '为函数添加明确的返回类型。',
        code: 'findUser(id: number): User | undefined {'
      });
    }

    return suggestions;
  }
}
