/**
 * AI Code Review - 基本使用示例
 * 
 * 这个示例展示了如何在 Node.js 项目中使用 @lezzhao/ai-cr 包
 * 
 * 运行方式:
 * 1. 确保已安装: npm install @lezzhao/ai-cr
 * 2. 配置环境变量或复制配置文件: cp examples/ai-cr.config.yaml.example ai-cr.config.yaml
 * 3. 运行: node examples/basic-usage.js
 */

import { 
  CodeAnalyzer, 
  AIProviderFactory, 
  ConfigManager,
  GitIntegration,
  ReportGenerator
} from '@lezzhao/ai-cr';

async function basicUsageExample() {
  try {
    console.log('🚀 AI Code Review 基本使用示例\n');

    // 1. 获取配置
    console.log('1. 加载配置...');
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();
    console.log(`   ✅ 配置加载成功，AI提供商: ${config.ai.provider}\n`);
    
    // 2. 创建 AI 提供者
    console.log('2. 创建AI提供者...');
    const aiProvider = AIProviderFactory.createProvider(
      config.ai.provider, 
      config.ai
    );
    console.log(`   ✅ AI提供者创建成功: ${config.ai.provider}\n`);
    
    // 3. 创建代码分析器
    console.log('3. 创建代码分析器...');
    const analyzer = new CodeAnalyzer(config);
    console.log('   ✅ 代码分析器创建成功\n');
    
    // 4. 创建报告生成器
    console.log('4. 创建报告生成器...');
    const reportGenerator = new ReportGenerator();
    console.log('   ✅ 报告生成器创建成功\n');
    
    // 5. 获取 Git 集成
    console.log('5. 检查Git集成...');
    const gitIntegration = new GitIntegration();
    const isGitRepo = await gitIntegration.isGitRepository();
    
    if (isGitRepo) {
      console.log('   ✅ 检测到Git仓库');
      const branch = await gitIntegration.getCurrentBranch();
      console.log(`   📋 当前分支: ${branch}`);
      
      const stagedChanges = await gitIntegration.getStagedChanges();
      console.log(`   📋 暂存区文件数: ${stagedChanges.length}`);
    } else {
      console.log('   ⚠️  未检测到Git仓库');
    }
    console.log('');
    
    // 6. 分析示例代码
    console.log('6. 分析示例代码...');
    const sampleCode = `
function calculateSum(a, b) {
  // 缺少类型检查
  return a + b;
}

const result = calculateSum("5", 10); // 可能导致意外结果
console.log(result);
`;
    
    const fileChanges = [{
      filePath: 'example.js',
      fileContent: sampleCode,
      changeType: 'added',
      size: 200
    }];
    
    const analysisResult = await analyzer.analyzeFiles(fileChanges);
    console.log('   ✅ 代码分析完成');
    console.log(`   📋 分析文件数: ${analysisResult.summary.totalFiles}`);
    console.log(`   📋 发现问题数: ${analysisResult.summary.totalIssues}`);
    console.log(`   📋 质量评分: ${analysisResult.summary.qualityScore}/100\n`);
    
    // 7. 生成报告
    console.log('7. 生成分析报告...');
    const reportPath = await reportGenerator.generateReport(
      analysisResult, 
      'markdown', 
      'example-analysis-report.md'
    );
    console.log(`   ✅ 报告生成成功: ${reportPath}\n`);
    
    // 8. 显示分析结果摘要
    console.log('8. 分析结果摘要:');
    if (analysisResult.results.length > 0) {
      analysisResult.results.forEach((result, index) => {
        console.log(`   📄 文件 ${index + 1}: ${result.filePath}`);
        if (result.issues && result.issues.length > 0) {
          result.issues.forEach(issue => {
            console.log(`      ⚠️  ${issue.severity}: ${issue.message}`);
          });
        } else {
          console.log('      ✅ 未发现问题');
        }
      });
    } else {
      console.log('   ✅ 所有文件都通过了分析');
    }
    
    console.log('\n🎉 基本使用示例完成！');
    console.log('\n💡 提示:');
    console.log('   - 查看生成的分析报告了解详细信息');
    console.log('   - 可以配置不同的AI提供商获得不同的分析结果');
    console.log('   - 支持多种输出格式: markdown, json, console');
    
  } catch (error) {
    console.error('❌ 使用示例出错:', error.message);
    console.error('\n🔧 故障排除:');
    console.error('   1. 确保已正确配置AI API密钥');
    console.error('   2. 检查网络连接');
    console.error('   3. 查看完整错误信息:', error);
  }
}

// 运行示例
basicUsageExample();