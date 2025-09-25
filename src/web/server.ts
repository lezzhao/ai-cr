import Fastify from 'fastify';
import { configManager } from '../config/index.js';
import { CodeAnalyzer } from '../core/analyzer.js';
import { ReportGenerator } from '../core/report-generator.js';
import { GitIntegration } from '../integrations/git.js';
import { WebAPIResponse, AnalysisStatus } from '../types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 存储分析状态
const analysisStatuses = new Map<string, AnalysisStatus>();

// 启动Web服务器
export async function startWebServer(host: string = '127.0.0.1', port: number = 8000) {
  try {
    const fastify = Fastify({
      logger: true
    });

    // 注册CORS插件
    const cors = (await import('@fastify/cors')).default;
    await fastify.register(cors, {
      origin: true
    });

    // 注册静态文件服务
    const staticPlugin = (await import('@fastify/static')).default;
    await fastify.register(staticPlugin, {
      root: join(__dirname, 'public'),
      prefix: '/static/'
    });

    // 健康检查
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // 获取配置信息
    fastify.get('/api/config', async () => {
      const config = configManager.getConfig();
      const response: WebAPIResponse = {
        success: true,
        data: {
          ai: {
            provider: config.ai.provider,
            model: config.ai.model,
            // 不返回敏感信息
          },
          analysis: config.analysis,
          output: config.output
        }
      };
      return response;
    });

    // 获取Git状态
    fastify.get('/api/git/status', async () => {
      try {
        const gitIntegration = new GitIntegration();
        
        if (!await gitIntegration.isGitRepository()) {
          return {
            success: false,
            error: 'Not a Git repository'
          } as WebAPIResponse;
        }
        
        const stagedFiles = await gitIntegration.getStagedChanges();
        const workingFiles = await gitIntegration.getWorkingChanges();
        const currentBranch = await gitIntegration.getCurrentBranch();
        const remoteInfo = await gitIntegration.getRemoteInfo();
        
        const response: WebAPIResponse = {
          success: true,
          data: {
            isGitRepo: true,
            currentBranch,
            remoteInfo,
            stagedFiles: stagedFiles.length,
            workingFiles: workingFiles.length,
            stagedFileList: stagedFiles.map(f => ({
              path: f.filePath,
              status: f.status,
              size: f.size
            })),
            workingFileList: workingFiles.map(f => ({
              path: f.filePath,
              status: f.status,
              size: f.size
            }))
          }
        };
        
        return response;
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        } as WebAPIResponse;
      }
    });

    // 开始分析
    fastify.post('/api/analyze', async (request) => {
      try {
        const { type, commitHash } = request.body as { type: string; commitHash?: string };
        const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 创建分析状态
        const status: AnalysisStatus = {
          id: analysisId,
          status: 'pending',
          progress: 0,
          startTime: new Date()
        };
        
        analysisStatuses.set(analysisId, status);
        
        // 异步执行分析
        performAnalysis(analysisId, type, commitHash).catch(error => {
          const currentStatus = analysisStatuses.get(analysisId);
          if (currentStatus) {
            currentStatus.status = 'failed';
            currentStatus.error = (error as Error).message;
            currentStatus.endTime = new Date();
            analysisStatuses.set(analysisId, currentStatus);
          }
        });
        
        const response: WebAPIResponse = {
          success: true,
          data: { analysisId }
        };
        
        return response;
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        } as WebAPIResponse;
      }
    });

    // 获取分析状态
    fastify.get('/api/analyze/:id/status', async (request) => {
      const { id } = request.params as { id: string };
      const status = analysisStatuses.get(id);
      
      if (!status) {
        return {
          success: false,
          error: 'Analysis not found'
        } as WebAPIResponse;
      }
      
      const response: WebAPIResponse = {
        success: true,
        data: status
      };
      
      return response;
    });

    // 获取分析结果
    fastify.get('/api/analyze/:id/result', async (request) => {
      const { id } = request.params as { id: string };
      const status = analysisStatuses.get(id);
      
      if (!status) {
        return {
          success: false,
          error: 'Analysis not found'
        } as WebAPIResponse;
      }
      
      if (status.status !== 'completed') {
        return {
          success: false,
          error: 'Analysis not completed'
        } as WebAPIResponse;
      }
      
      const response: WebAPIResponse = {
        success: true,
        data: status.results
      };
      
      return response;
    });

    // 下载报告
    fastify.get('/api/analyze/:id/report', async (request, reply) => {
      const { id } = request.params as { id: string };
      const { format = 'markdown' } = request.query as { format: string };
      const status = analysisStatuses.get(id);
      
      if (!status || !status.results) {
        return {
          success: false,
          error: 'Analysis not found or not completed'
        } as WebAPIResponse;
      }
      
      try {
        const reportGenerator = new ReportGenerator();
        const reportPath = await reportGenerator.generateReport(
          status.results,
          format as any,
          `report_${id}.${format === 'html' ? 'html' : format === 'json' ? 'json' : 'md'}`
        );
        
        reply.type('application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="ai-code-review-report.${format === 'html' ? 'html' : format === 'json' ? 'json' : 'md'}"`);
        
        return (await import('fs')).createReadStream(reportPath);
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        } as WebAPIResponse;
      }
    });

    // 获取分析历史
    fastify.get('/api/analyze/history', async () => {
      const history = Array.from(analysisStatuses.values())
        .filter(status => status.status === 'completed')
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 20) // 只返回最近20个
        .map(status => ({
          id: status.id,
          startTime: status.startTime,
          endTime: status.endTime,
          summary: status.results?.summary
        }));
      
      const response: WebAPIResponse = {
        success: true,
        data: history
      };
      
      return response;
    });

    // 清理旧的分析状态
    setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      for (const [id, status] of analysisStatuses.entries()) {
        if (now - status.startTime.getTime() > oneHour) {
          analysisStatuses.delete(id);
        }
      }
    }, 5 * 60 * 1000); // 每5分钟清理一次

    await fastify.listen({ host, port });
    console.log(`🚀 Web服务已启动: http://${host}:${port}`);
  } catch (error) {
    console.error('Web服务启动失败:', error);
    process.exit(1);
  }
}

// 执行分析的异步函数
async function performAnalysis(analysisId: string, type: string, commitHash?: string) {
  const status = analysisStatuses.get(analysisId);
  if (!status) return;
  
  try {
    status.status = 'processing';
    status.progress = 10;
    analysisStatuses.set(analysisId, status);
    
    const config = configManager.getConfig();
    const analyzer = new CodeAnalyzer(config);
    
    status.progress = 30;
    analysisStatuses.set(analysisId, status);
    
    let response;
    
    switch (type) {
      case 'staged':
        response = await analyzer.analyzeStagedFiles();
        break;
      case 'working':
        response = await analyzer.analyzeWorkingFiles();
        break;
      case 'commit':
        if (!commitHash) {
          throw new Error('Commit hash is required for commit analysis');
        }
        response = await analyzer.analyzeCommit(commitHash);
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
    
    status.progress = 90;
    analysisStatuses.set(analysisId, status);
    
    status.status = 'completed';
    status.results = response;
    status.progress = 100;
    status.endTime = new Date();
    analysisStatuses.set(analysisId, status);
    
  } catch (error) {
    status.status = 'failed';
    status.error = (error as Error).message;
    status.endTime = new Date();
    analysisStatuses.set(analysisId, status);
  }
}

// 如果直接运行此文件，启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  startWebServer();
}