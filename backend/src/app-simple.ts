import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '智能时间管家API运行中',
    timestamp: new Date().toISOString()
  });
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API正常工作',
    features: [
      '用户认证',
      '任务管理',
      '时间追踪',
      'AI智能助手',
      '数据分析',
      '智能提醒'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`
🚀 智能时间管家后端服务已启动
📡 端口: ${PORT}
🌐 地址: http://localhost:${PORT}
  `);
});
