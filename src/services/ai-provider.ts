import { AIConfig, CodeAnalysisResult, FileChange } from '../types/index.js';

export interface AIProviderInterface {
  analyzeCode(files: FileChange[], config: AIConfig): Promise<CodeAnalysisResult[]>;
  getProviderName(): string;
  isAvailable(): boolean;
}

export abstract class BaseAIProvider implements AIProviderInterface {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  abstract analyzeCode(files: FileChange[], config: AIConfig): Promise<CodeAnalysisResult[]>;
  abstract getProviderName(): string;
  abstract isAvailable(): boolean;

  protected async makeRequest(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ): Promise<any> {
    const axios = (await import('axios')).default;
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...headers,
      },
      timeout: this.config.timeout,
    });

    return response.data;
  }

  protected formatPrompt(files: FileChange[]): string {
    const fileContents = files
      .map(file => {
        if (file.status === 'deleted') {
          return `文件: ${file.filePath}\n状态: 已删除\n`;
        }
        return `文件: ${file.filePath}\n状态: ${file.status}\n内容:\n\`\`\`\n${file.content}\n\`\`\`\n`;
      })
      .join('\n---\n\n');

    return `请分析以下代码变更，提供详细的代码审查意见。请从以下维度进行分析：

1. **代码质量**: 代码结构、可读性、可维护性
2. **安全性**: 潜在的安全漏洞和风险
3. **性能**: 性能优化建议
4. **最佳实践**: 是否符合编程最佳实践
5. **错误处理**: 异常处理和边界情况
6. **测试覆盖**: 是否需要添加测试

请为每个问题提供：
- 问题类型和严重程度
- 具体位置（行号）
- 详细描述
- 改进建议
- 示例代码（如适用）

代码变更内容：
${fileContents}

请以JSON格式返回分析结果，格式如下：
{
  "results": [
    {
      "filePath": "文件路径",
      "issues": [
        {
          "id": "唯一标识",
          "type": "问题类型",
          "severity": "严重程度",
          "line": 行号,
          "column": 列号,
          "message": "简短描述",
          "description": "详细描述",
          "suggestion": "改进建议",
          "rule": "相关规则"
        }
      ],
      "suggestions": [
        {
          "id": "唯一标识",
          "type": "建议类型",
          "priority": "优先级",
          "line": 行号,
          "title": "建议标题",
          "description": "详细描述",
          "code": "示例代码"
        }
      ],
      "summary": {
        "totalIssues": 问题总数,
        "totalSuggestions": 建议总数,
        "qualityScore": 质量评分(0-100)
      }
    }
  ]
}`;
  }
}
