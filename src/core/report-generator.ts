import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { AnalysisResponse, OutputFormat, Severity, IssueType } from '../types/index.js';
import { marked } from 'marked';

export class ReportGenerator {
  private outputDir: string;

  constructor(outputDir: string = './reports') {
    this.outputDir = outputDir;
    this.ensureOutputDirectory();
  }

  /**
   * 生成报告
   */
  async generateReport(response: AnalysisResponse, format: OutputFormat, filename?: string): Promise<string> {
    switch (format) {
      case 'markdown':
        return this.generateMarkdownReport(response, filename);
      case 'html':
        return this.generateHtmlReport(response, filename);
      case 'json':
        return this.generateJsonReport(response, filename);
      case 'console':
        return this.generateConsoleReport(response);
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }

  /**
   * 生成Markdown报告
   */
  private async generateMarkdownReport(response: AnalysisResponse, filename?: string): Promise<string> {
    const content = this.buildMarkdownContent(response);
    const filePath = this.getOutputPath(filename || 'ai-code-review-report.md');
    
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * 生成HTML报告
   */
  private async generateHtmlReport(response: AnalysisResponse, filename?: string): Promise<string> {
    const markdownContent = this.buildMarkdownContent(response);
    const htmlContent = this.markdownToHtml(markdownContent);
    const filePath = this.getOutputPath(filename || 'ai-code-review-report.html');
    
    writeFileSync(filePath, htmlContent, 'utf-8');
    return filePath;
  }

  /**
   * 生成JSON报告
   */
  private async generateJsonReport(response: AnalysisResponse, filename?: string): Promise<string> {
    const content = JSON.stringify(response, null, 2);
    const filePath = this.getOutputPath(filename || 'ai-code-review-report.json');
    
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * 生成控制台报告
   */
  private async generateConsoleReport(response: AnalysisResponse): Promise<string> {
    const chalk = (await import('chalk')).default;
    let output = '\n';
    
    // 标题
    output += chalk.bold.blue('🔍 AI Code Review Report\n');
    output += chalk.gray('=' .repeat(50) + '\n\n');
    
    // 汇总信息
    output += chalk.bold('📊 分析汇总\n');
    output += `总文件数: ${chalk.cyan(response.summary.totalFiles)}\n`;
    output += `总问题数: ${chalk.red(response.summary.totalIssues)}\n`;
    output += `总建议数: ${chalk.green(response.summary.totalSuggestions)}\n`;
    output += `质量评分: ${this.getQualityScoreColor(response.summary.qualityScore)}\n`;
    output += `处理时间: ${chalk.gray(response.metadata.processingTime)}ms\n\n`;
    
    // 严重程度统计
    output += chalk.bold('⚠️  问题严重程度分布\n');
    const severityColors = {
      critical: chalk.red.bold,
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.blue,
      info: chalk.gray
    };
    
    Object.entries(response.summary.severityCounts).forEach(([severity, count]) => {
      if (count > 0) {
        const color = severityColors[severity as Severity];
        output += `${severity.toUpperCase()}: ${color(count)}\n`;
      }
    });
    output += '\n';
    
    // 问题类型统计
    output += chalk.bold('📋 问题类型分布\n');
    const typeLabels = {
      bug: '🐛 Bug',
      security: '🔒 安全',
      performance: '⚡ 性能',
      style: '🎨 样式',
      maintainability: '🔧 可维护性',
      accessibility: '♿ 可访问性',
      'best-practice': '✅ 最佳实践'
    };
    
    Object.entries(response.summary.categoryCounts).forEach(([type, count]) => {
      if (count > 0) {
        const label = typeLabels[type as IssueType] || type;
        output += `${label}: ${chalk.cyan(count)}\n`;
      }
    });
    output += '\n';
    
    // 详细结果
    if (response.results.length > 0) {
      output += chalk.bold('📁 文件详细分析\n');
      output += chalk.gray('-'.repeat(50) + '\n\n');
      
      response.results.forEach((result, index) => {
        output += chalk.bold.underline(`${index + 1}. ${result.filePath}\n`);
        
        if (result.issues.length > 0) {
          output += chalk.red('   🚨 问题:\n');
          result.issues.forEach(issue => {
            const severityColor = severityColors[issue.severity];
            output += `   ${severityColor(`[${issue.severity.toUpperCase()}]`)} `;
            if (issue.line) {
              output += chalk.gray(`L${issue.line}: `);
            }
            output += `${issue.message}\n`;
            if (issue.description) {
              output += chalk.gray(`      ${issue.description}\n`);
            }
            if (issue.suggestion) {
              output += chalk.green(`      💡 建议: ${issue.suggestion}\n`);
            }
            output += '\n';
          });
        }
        
        if (result.suggestions.length > 0) {
          output += chalk.green('   💡 建议:\n');
          result.suggestions.forEach(suggestion => {
            output += `   ${chalk.blue(`[${suggestion.priority.toUpperCase()}]`)} `;
            if (suggestion.line) {
              output += chalk.gray(`L${suggestion.line}: `);
            }
            output += `${suggestion.title}\n`;
            if (suggestion.description) {
              output += chalk.gray(`      ${suggestion.description}\n`);
            }
            output += '\n';
          });
        }
        
        output += '\n';
      });
    }
    
    return output;
  }

  /**
   * 构建Markdown内容
   */
  private buildMarkdownContent(response: AnalysisResponse): string {
    let content = '';
    
    // 标题
    content += '# 🔍 AI Code Review Report\n\n';
    content += `**生成时间**: ${response.metadata.timestamp.toLocaleString('zh-CN')}\n`;
    content += `**AI服务商**: ${response.metadata.provider}\n`;
    content += `**处理时间**: ${response.metadata.processingTime}ms\n\n`;
    
    // 汇总信息
    content += '## 📊 分析汇总\n\n';
    content += `| 指标 | 数值 |\n`;
    content += `|------|------|\n`;
    content += `| 总文件数 | ${response.summary.totalFiles} |\n`;
    content += `| 总问题数 | ${response.summary.totalIssues} |\n`;
    content += `| 总建议数 | ${response.summary.totalSuggestions} |\n`;
    content += `| 质量评分 | ${response.summary.qualityScore}/100 |\n\n`;
    
    // 严重程度统计
    content += '## ⚠️ 问题严重程度分布\n\n';
    Object.entries(response.summary.severityCounts).forEach(([severity, count]) => {
      if (count > 0) {
        content += `- **${severity.toUpperCase()}**: ${count}\n`;
      }
    });
    content += '\n';
    
    // 问题类型统计
    content += '## 📋 问题类型分布\n\n';
    const typeLabels = {
      bug: '🐛 Bug',
      security: '🔒 安全',
      performance: '⚡ 性能',
      style: '🎨 样式',
      maintainability: '🔧 可维护性',
      accessibility: '♿ 可访问性',
      'best-practice': '✅ 最佳实践'
    };
    
    Object.entries(response.summary.categoryCounts).forEach(([type, count]) => {
      if (count > 0) {
        const label = typeLabels[type as IssueType] || type;
        content += `- **${label}**: ${count}\n`;
      }
    });
    content += '\n';
    
    // 详细结果
    if (response.results.length > 0) {
      content += '## 📁 文件详细分析\n\n';
      
      response.results.forEach((result, index) => {
        content += `### ${index + 1}. ${result.filePath}\n\n`;
        
        if (result.issues.length > 0) {
          content += '#### 🚨 问题\n\n';
          result.issues.forEach(issue => {
            content += `**${issue.severity.toUpperCase()}**`;
            if (issue.line) {
              content += ` (L${issue.line})`;
            }
            content += `: ${issue.message}\n\n`;
            
            if (issue.description) {
              content += `${issue.description}\n\n`;
            }
            
            if (issue.suggestion) {
              content += `💡 **建议**: ${issue.suggestion}\n\n`;
            }
            
            content += '---\n\n';
          });
        }
        
        if (result.suggestions.length > 0) {
          content += '#### 💡 建议\n\n';
          result.suggestions.forEach(suggestion => {
            content += `**${suggestion.priority.toUpperCase()}**`;
            if (suggestion.line) {
              content += ` (L${suggestion.line})`;
            }
            content += `: ${suggestion.title}\n\n`;
            
            if (suggestion.description) {
              content += `${suggestion.description}\n\n`;
            }
            
            if (suggestion.code) {
              content += '```\n';
              content += suggestion.code;
              content += '\n```\n\n';
            }
            
            content += '---\n\n';
          });
        }
      });
    }
    
    return content;
  }

  /**
   * Markdown转HTML
   */
  private markdownToHtml(markdown: string): string {
    const html = marked.parse(markdown);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Review Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #1f2937; margin-top: 30px; }
        h3 { color: #374151; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: 600; }
        code { background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; }
        pre { background-color: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
        .critical { color: #dc2626; font-weight: bold; }
        .high { color: #ea580c; }
        .medium { color: #d97706; }
        .low { color: #2563eb; }
        .info { color: #6b7280; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  /**
   * 获取质量评分颜色
   */
  private async getQualityScoreColor(score: number): Promise<string> {
    const chalk = (await import('chalk')).default;
    if (score >= 90) return chalk.green.bold(score);
    if (score >= 80) return chalk.yellow(score);
    if (score >= 70) return chalk.hex('#ff8c00')(score);
    return chalk.red(score);
  }

  /**
   * 获取输出路径
   */
  private getOutputPath(filename: string): string {
    return join(this.outputDir, filename);
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDirectory(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }
}
