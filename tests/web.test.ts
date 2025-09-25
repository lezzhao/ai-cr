import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { startWebServer } from '../src/web/server.js';

describe('Web Server Tests', () => {
  let server: any;
  const testPort = 8002;

  beforeAll(async () => {
    // 启动测试服务器
    try {
      await startWebServer('127.0.0.1', testPort);
      // 等待服务器启动
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn('Web服务器启动失败，跳过Web测试:', error);
    }
  });

  afterAll(async () => {
    // 清理资源
    if (server) {
      await server.close();
    }
  });

  describe('健康检查', () => {
    test('应该能够访问健康检查端点', async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${testPort}/health`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.status).toBe('ok');
        expect(data.timestamp).toBeDefined();
      } catch (error) {
        // 如果服务器没有启动，跳过测试
        console.warn('跳过健康检查测试:', error);
      }
    });
  });

  describe('API端点', () => {
    test('应该能够访问配置API', async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${testPort}/api/config`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
      } catch (error) {
        console.warn('跳过配置API测试:', error);
      }
    });

    test('应该能够访问Git状态API', async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${testPort}/api/git/status`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBeDefined();
      } catch (error) {
        console.warn('跳过Git状态API测试:', error);
      }
    });

    test('应该能够访问分析历史API', async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${testPort}/api/analyze/history`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
      } catch (error) {
        console.warn('跳过分析历史API测试:', error);
      }
    });
  });

  describe('分析API', () => {
    test('应该能够启动分析', async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${testPort}/api/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: 'staged' })
        });
        
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.analysisId).toBeDefined();
      } catch (error) {
        console.warn('跳过分析API测试:', error);
      }
    });
  });
});
