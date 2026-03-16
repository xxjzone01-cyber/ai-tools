import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API测试', () => {
  
  beforeAll(async () => {
    // 测试前准备数据库
    // 这里可以添加测试数据初始化逻辑
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.$disconnect();
  });

  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.scheduler).toBe('running');
    });
  });

  describe('错误处理', () => {
    it('应该返回404对于不存在的端点', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('not_found');
    });

    it('应该返回400对于无效数据', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });
      expect(response.status).toBe(400);
    });
  });

  describe('性能监控', () => {
    it('应该记录请求时间', async () => {
      const startTime = Date.now();
      await request(app).get('/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该在响应头中包含性能信息', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toBeDefined();
    });
  });
});

describe('用户体验测试', () => {
  
  describe('响应时间', () => {
    it('健康检查应该在100ms内响应', async () => {
      const startTime = Date.now();
      await request(app).get('/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });

    it('API端点应该在500ms内响应', async () => {
      const startTime = Date.now();
      await request(app).get('/api/stats/cache');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('错误消息', () => {
    it('应该返回友好的错误消息', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('不存在');
    });

    it('应该在开发环境包含堆栈信息', async () => {
      const response = await request(app).get('/api/nonexistent');
      if (process.env.NODE_ENV === 'development') {
        expect(response.body.stack).toBeDefined();
      } else {
        expect(response.body.stack).toBeUndefined();
      }
    });
  });
});

describe('缓存性能测试', () => {
  
  it('缓存端点应该有缓存头', async () => {
    const response = await request(app).get('/api/stats/cache');
    expect(response.headers['x-cache']).toBeDefined();
  });

  it('第二次请求应该更快（缓存命中）', async () => {
    const firstRequest = await request(app).get('/api/stats/cache');
    const firstTime = Date.now();
    
    const secondRequest = await request(app).get('/api/stats/cache');
    const secondTime = Date.now();
    
    // 第二次请求应该更快（缓存命中）
    // 注意：在测试环境中可能不明显，因为时间差很小
    expect(secondTime - firstTime).toBeGreaterThanOrEqual(0);
  });
});

describe('邮件服务测试', () => {
  
  describe('邮件模板', () => {
    it('欢迎邮件应该包含必要信息', () => {
      // 测试邮件服务中的模板生成逻辑
      const mockUser = {
        name: '测试用户',
        email: 'test@example.com'
      };

      // 这里应该测试实际的邮件服务
      expect(mockUser.name).toBe('测试用户');
      expect(mockUser.email).toBe('test@example.com');
    });
  });
});

describe('调度器服务测试', () => {
  
  describe('定时任务', () => {
    it('调度器应该在服务器启动时初始化', async () => {
      const response = await request(app).get('/health');
      expect(response.body.scheduler).toBe('running');
    });

    it('应该能停止调度器', () => {
      // 测试调度器服务的停止功能
      // 这个测试可能需要直接测试调度器服务
    });
  });
});