/**
 * AI Code Review - TypeScript 高级使用示例
 *
 * 这个示例展示了如何在 TypeScript 项目中使用 @lezzhao/ai-cr 包
 * 包括类型安全、批量分析、自定义配置等高级功能
 *
 * 运行方式:
 * 1. 确保已安装: npm install @lezzhao/ai-cr
 * 2. 配置环境变量或创建 ai-cr.config.yaml 文件
 * 3. 编译: npx tsc examples/typescript-usage.ts --target ES2022 --module ES2022 --moduleResolution node
 * 4. 运行: node examples/typescript-usage.js
 */
import { CodeAnalyzer, AIProviderFactory, ConfigManager, GitIntegration, ReportGenerator, GitHooksIntegration } from '@lezzhao/ai-cr';
// 分析结果处理器
class AnalysisResultProcessor {
    results = [];
    addResult(result) {
        this.results.push(result);
    }
    getSummary() {
        const totalFiles = this.results.length;
        const totalIssues = this.results.reduce((sum, result) => sum + (result.issues?.length || 0), 0);
        const totalSuggestions = this.results.reduce((sum, result) => sum + (result.suggestions?.length || 0), 0);
        const qualityScore = totalFiles > 0
            ? Math.max(0, 100 - (totalIssues * 10))
            : 100;
        return {
            totalFiles,
            totalIssues,
            totalSuggestions,
            qualityScore,
            severityCounts: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            },
            categoryCounts: {
                bug: 0,
                security: 0,
                performance: 0,
                style: 0,
                maintainability: 0,
                accessibility: 0,
                'best-practice': 0
            },
            processingTime: 0
        };
    }
    generateReport() {
        const summary = this.getSummary();
        return `
# 代码分析报告

## 概览
- 分析文件数: ${summary.totalFiles}
- 发现问题数: ${summary.totalIssues}
- 建议数量: ${summary.totalSuggestions}
- 质量评分: ${summary.qualityScore}/100

## 详细结果
${this.results.map((result, index) => `
### 文件 ${index + 1}: ${result.filePath}
${result.issues?.map((issue) => `- ⚠️ ${issue.severity}: ${issue.message}`).join('\n') || '- ✅ 未发现问题'}
`).join('\n')}
    `.trim();
    }
    getResults() {
        return this.results;
    }
}
async function typescriptUsageExample() {
    try {
        console.log('🚀 AI Code Review TypeScript 高级使用示例\n');
        // 1. 获取配置
        console.log('1. 加载配置...');
        const configManager = ConfigManager.getInstance();
        const config = configManager.getConfig();
        console.log(`   ✅ 配置加载成功，AI提供商: ${config.ai.provider}\n`);
        // 2. 创建 AI 提供者
        console.log('2. 创建AI提供者...');
        const aiProvider = AIProviderFactory.createProvider(config.ai.provider, config.ai);
        console.log(`   ✅ AI提供者创建成功: ${config.ai.provider}\n`);
        // 3. 创建代码分析器
        console.log('3. 创建代码分析器...');
        const analyzer = new CodeAnalyzer(config);
        console.log('   ✅ 代码分析器创建成功\n');
        // 4. 创建报告生成器
        console.log('4. 创建报告生成器...');
        const reportGenerator = new ReportGenerator();
        console.log('   ✅ 报告生成器创建成功\n');
        // 5. 创建结果处理器
        console.log('5. 创建结果处理器...');
        const resultProcessor = new AnalysisResultProcessor();
        console.log('   ✅ 结果处理器创建成功\n');
        // 6. 获取 Git 集成
        console.log('6. 检查Git集成...');
        const gitIntegration = new GitIntegration();
        const isGitRepo = await gitIntegration.isGitRepository();
        if (isGitRepo) {
            console.log('   ✅ 检测到Git仓库');
            const branch = await gitIntegration.getCurrentBranch();
            console.log(`   📋 当前分支: ${branch}`);
            const stagedChanges = await gitIntegration.getStagedChanges();
            console.log(`   📋 暂存区文件数: ${stagedChanges.length}`);
        }
        else {
            console.log('   ⚠️  未检测到Git仓库');
        }
        console.log('');
        // 7. 分析示例TypeScript代码
        console.log('7. 分析示例TypeScript代码...');
        const sampleFiles = [
            {
                filePath: 'src/components/Button.tsx',
                fileContent: `
import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Button click error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleClick} 
      disabled={disabled || isLoading}
      className="btn btn-primary"
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
};
        `,
                changeType: 'added'
            },
            {
                filePath: 'src/utils/helpers.ts',
                fileContent: `
export function calculateSum(a: number, b: number): number {
  return a + b;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 这个函数缺少错误处理
export function parseJSON<T>(jsonString: string): T {
  return JSON.parse(jsonString);
}

export class DataProcessor {
  private data: any[] = [];
  
  addItem(item: any): void {
    this.data.push(item);
  }
  
  getItems(): any[] {
    return this.data;
  }
  
  // 缺少类型定义
  processItems(processor: Function): any[] {
    return this.data.map(processor);
  }
}
        `,
                changeType: 'modified'
            },
            {
                filePath: 'src/services/api.ts',
                fileContent: `
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export class ApiService {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await axios.get(\`\${this.baseURL}\${endpoint}\`);
    return response.data;
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await axios.post(\`\${this.baseURL}\${endpoint}\`, data);
    return response.data;
  }
  
  // 缺少错误处理
  async delete(endpoint: string): Promise<void> {
    await axios.delete(\`\${this.baseURL}\${endpoint}\`);
  }
}
        `,
                changeType: 'added'
            }
        ];
        // 批量分析文件
        console.log('   📋 开始批量分析...');
        for (const fileChange of sampleFiles) {
            const analysisResult = await analyzer.analyzeFiles([fileChange]);
            resultProcessor.addResult(analysisResult);
            console.log(`   ✅ 已分析: ${fileChange.filePath}`);
        }
        const summary = resultProcessor.getSummary();
        console.log(`   📋 批量分析完成`);
        console.log(`   📋 总文件数: ${summary.totalFiles}`);
        console.log(`   📋 总问题数: ${summary.totalIssues}`);
        console.log(`   📋 质量评分: ${summary.qualityScore}/100\n`);
        // 8. 生成详细报告
        console.log('8. 生成详细报告...');
        const customReport = resultProcessor.generateReport();
        console.log('   ✅ 自定义报告生成成功');
        // 使用内置报告生成器
        const reportPath = await reportGenerator.generateReport({
            results: resultProcessor.getResults(),
            summary,
            metadata: {
                timestamp: new Date().toISOString(),
                provider: config.ai.provider,
                processingTime: 0
            }
        }, 'markdown', 'typescript-analysis-report.md');
        console.log(`   ✅ 标准报告生成成功: ${reportPath}\n`);
        // 9. Git Hooks 集成测试
        console.log('9. 测试Git Hooks集成...');
        const gitHooks = new GitHooksIntegration();
        if (isGitRepo) {
            console.log('   ✅ Git Hooks集成可用');
            console.log('   💡 可以运行 "ai-cr install-hooks" 安装Git hooks');
        }
        else {
            console.log('   ⚠️  Git Hooks集成不可用（非Git仓库）');
        }
        console.log('');
        // 10. 显示分析结果摘要
        console.log('10. 分析结果摘要:');
        resultProcessor.getResults().forEach((result, index) => {
            console.log(`   📄 文件 ${index + 1}: ${result.filePath}`);
            if (result.issues && result.issues.length > 0) {
                result.issues.forEach((issue) => {
                    console.log(`      ⚠️  ${issue.severity}: ${issue.message}`);
                });
            }
            else {
                console.log('      ✅ 未发现问题');
            }
        });
        console.log('\n🎉 TypeScript 高级使用示例完成！');
        console.log('\n💡 高级功能展示:');
        console.log('   ✅ 类型安全的配置和API使用');
        console.log('   ✅ 批量文件分析');
        console.log('   ✅ 自定义结果处理器');
        console.log('   ✅ 多种报告生成方式');
        console.log('   ✅ Git Hooks集成');
        console.log('   ✅ 错误处理和类型检查');
    }
    catch (error) {
        console.error('❌ TypeScript 使用示例出错:', error);
        console.error('\n🔧 故障排除:');
        console.error('   1. 确保已正确配置AI API密钥');
        console.error('   2. 检查TypeScript编译配置');
        console.error('   3. 查看完整错误信息:', error);
    }
}
// 运行示例
typescriptUsageExample();
