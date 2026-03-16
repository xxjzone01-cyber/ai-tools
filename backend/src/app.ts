import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import reminderRoutes from './routes/reminders';
import timeTrackingRoutes from './routes/timeTracking';
import notificationRoutes from './routes/notifications';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { cacheMiddleware } from './middleware/cache';
import { performanceMiddleware, getPerformanceStats, checkPerformanceWarnings } from './middleware/performance';
import schedulerService from './services/schedulerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 响应压缩
app.use(compression());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求频率超过限制，请稍后再试'
});
app.use('/api/', limiter);

// 性能监控
app.use(performanceMiddleware);

// 解析中间件
app.use(express.json({ 
  limit: '10mb',
  strict: true // 严格模式，只接受对象和数组
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// 日志中间件
app.use(morgan('combined'));

// 健康检查和性能监控端点
app.get('/health', (req, res) => {
  const perfStats = getPerformanceStats();
  const warnings = checkPerformanceWarnings();
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    scheduler: 'running',
    email: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' ? 'enabled' : 'disabled',
    performance: perfStats,
    warnings: warnings.length > 0 ? warnings : undefined
  });
});

// 缓存的统计分析端点
app.get('/api/stats/cache', cacheMiddleware(300), (req, res) => {
  // 这个端点会被缓存5分钟
  const stats = {
    message: '缓存统计信息',
    cacheInfo: '此端点被缓存以减少数据库负载'
  };
  res.json(stats);
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/notifications', notificationRoutes);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use(notFoundHandler);

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                               ║
    ║           🤖 智能时间管家 API Server                          ║
    ║                                                               ║
    ║           Version: 1.0.0                                       ║
    ║           Environment: ${process.env.NODE_ENV || 'development'}      ║
    ║           Port: ${PORT}                                         ║
    ║                                                               ║
    ║           🚀 Server is running...                           ║
    ║                                                               ║
    ║           Email: ${process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' ? 'enabled' : 'disabled'}    ║
    ║           Scheduler: ${process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' ? 'running' : 'stopped'}      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════╝
  `);

  // 定期检查性能
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const warnings = checkPerformanceWarnings();
      if (warnings.length > 0) {
        console.warn('性能警告:', warnings.join('\n'));
      }
    }, 300000); // 每5分钟检查一次
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received: gracefully shutting down...');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    schedulerService.stop();
    console.log('✅ Scheduler stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: gracefully shutting down...');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    schedulerService.stop();
    console.log('✅ Scheduler stopped');
    process.exit(0);
  });
});

export default app;