// Mock Web Server for testing
import Fastify from 'fastify';

export async function startWebServer(port: number = 8000): Promise<any> {
  const fastify = Fastify({
    logger: false
  });

  // 健康检查
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // 分析状态检查
  fastify.get('/api/analysis/:id', async (request: any) => {
    return {
      id: request.params.id,
      status: 'completed',
      progress: 100,
      result: { summary: { qualityScore: 85 } }
    };
  });

  // 启动分析
  fastify.post('/api/analyze', async () => {
    return {
      id: 'test-analysis-id',
      status: 'started',
      message: 'Analysis started'
    };
  });

  try {
    await fastify.listen({ port, host: '127.0.0.1' });
    return fastify;
  } catch (error) {
    throw new Error(`Failed to start web server: ${error}`);
  }
}
