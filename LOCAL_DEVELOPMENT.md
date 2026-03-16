# 本地开发指南

## 环境要求

### 软件要求
- Node.js 18+ (推荐使用nvm管理版本)
- PostgreSQL 12+ 或 Docker
- Git
- npm 或 yarn
- 代码编辑器（VS Code推荐）

### 推荐工具
- **VS Code**: 强大的IDE，支持TypeScript
- **Postman**: API测试工具
- **Docker Desktop**: 容器管理
- **pgAdmin**: PostgreSQL管理工具

## 数据库设置

### 选项A: Docker（推荐）

#### 1. 启动数据库
```bash
cd smart-time-manager
docker-compose -f docker-compose.dev.yml up -d db
```

#### 2. 验证数据库连接
```bash
# 进入数据库容器
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d smart_time_manager

# 或者使用psql命令
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -c "SELECT 1;"
```

### 选项B: 本地PostgreSQL

#### 1. 安装PostgreSQL
```bash
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# 下载PostgreSQL安装包
```

#### 2. 启动PostgreSQL服务
```bash
# macOS
brew services start postgresql@15

# Linux
sudo service postgresql start

# Windows
# 从服务管理器启动
```

#### 3. 创建数据库
```bash
# 登录PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE smart_time_manager;

# 退出
\q
```

### 选项C: 在线PostgreSQL（推荐用于开发）

#### 免费数据库服务
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

#### 连接数据库
```bash
# 获取连接字符串后，修改.env文件
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/smart_time_manager"
```

## 后端启动

### 1. 安装依赖
```bash
cd smart-time-manager/backend
npm install
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，配置必要的环境变量
nano .env
```

### 必须配置的变量
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_time_manager"
JWT_SECRET="your-secret-key-here-change-in-production"
OPENAI_API_KEY="sk-..."
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### 3. 运行数据库迁移
```bash
cd smart-time-manager/backend
npm run prisma:generate
npm run prisma:migrate
```

### 4. 启动开发服务器
```bash
cd smart-time-manager/backend
npm run dev
```

服务器将在 `http://localhost:3001` 启动

### 5. 验证服务器运行
```bash
# 健康检查
curl http://localhost:3001/health

# 查看日志
# 服务器会输出请求日志和性能指标
```

## 前端启动

### 1. 安装依赖
```bash
cd smart-time-manager/frontend
npm install
```

### 2. 配置API地址
```bash
# 如果后端在不同端口，需要配置
export REACT_APP_API_URL=http://localhost:3001
```

### 3. 启动开发服务器
```bash
cd smart-time-manager/frontend
npm start
```

应用将在 `http://localhost:3000` 启动

### 4. 访问应用
在浏览器中打开: `http://localhost:3000`

## 完整启动流程

### 一次性启动所有服务

#### 使用Docker Compose（推荐）
```bash
cd smart-time-manager
docker-compose -f docker-compose.dev.yml up
```

这将启动：
- 前端: http://localhost:3000
- 后端: http://localhost:8080
- 数据库: localhost:5432
- Redis: localhost:6379

#### 分别启动服务
```bash
# 终端1: 启动数据库
cd smart-time-manager
docker-compose -f docker-compose.dev.yml up -d db redis

# 终端2: 启动后端
cd smart-time-manager/backend
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 终端3: 启动前端
cd smart-time-manager/frontend
npm start
```

## 常见问题排查

### 后端启动失败

#### 问题1: 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3001
kill -9 [PID]

# 或者修改.env中的PORT
PORT=3002
```

#### 问题2: 数据库连接失败
```bash
# 检查数据库是否运行
docker ps | grep postgres
# 或
ps aux | grep postgres

# 测试数据库连接
psql -U postgres -d smart_time_manager -c "SELECT 1;"
```

#### 问题3: 依赖安装失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 前端启动失败

#### 问题1: 端口被占用
```bash
lsof -i :3000
kill -9 [PID]

# 或修改端口
PORT=3001 npm start
```

#### 问题2: API连接失败
```bash
# 检查后端是否运行
curl http://localhost:3001/health

# 检查CORS配置
# 查看后端控制台的错误信息
```

## 开发工具推荐

### VS Code扩展
- **ES7+ React/Redux/React-Native snippets**: React代码片段
- **TypeScript Importer**: 自动导入类型
- **Prettier**: 代码格式化
- **ESLint**: 代码检查
- **GitLens**: Git增强

### Chrome扩展
- **React Developer Tools**: React调试工具
- **Redux DevTools**: 状态管理调试
- **JSON Formatter**: JSON格式化
- **Allow CORS**: 允许跨域请求（开发环境）

### 终端工具
- **tmux**: 终端复用（推荐）
- **htop**: 系统资源监控
- **ngrok**: 内网穿透（临时分享本地服务）

## 测试工具

### API测试
```bash
# 安装httpie
npm install -g httpie

# 测试API
http GET http://localhost:3001/health
http POST http://localhost:3001/api/auth/register name=test@example.com password=test123
```

### 性能测试
```bash
# 使用Apache Bench
ab -n 100 -c 10 http://localhost:3001/health

# 使用wrk
wrk -t4 -c10 http://localhost:3001/api/tasks
```

## 监控和日志

### 查看服务器日志
```bash
# 后端日志在终端显示
# 包含：
# - 请求日志
# - 性能指标
# - 错误信息
# - 调度器状态
```

### 数据库监控
```bash
# 启动Prisma Studio
cd smart-time-manager/backend
npm run prisma:studio

# 在浏览器中打开: http://localhost:5555
# 可以可视化查看和编辑数据库
```

## 内网穿透（临时分享）

### 使用ngrok
```bash
# 安装ngrok
npm install -g ngrok

# 启动ngrok
ngrok http 3000

# 访问地址（会动态生成）
# https://xxxx-xx-xx-xx-xx.ngrok.io
```

### 使用localtunnel
```bash
npm install -g localtunnel
localtunnel --port 3000 --subdomain myapp
```

## 生产环境准备

### 1. 构建优化版本
```bash
cd smart-time-manager/frontend
npm run build
```

### 2. 后端生产构建
```bash
cd smart-time-manager/backend
npm run build
```

### 3. 环境变量
- 生产环境必须使用真实的环境变量
- 不要提交.env文件到Git
- 使用强密码和密钥

### 4. 数据库优化
- 配置连接池
- 启用查询缓存
- 设置适当的索引

## 部署检查清单

开发环境:
- [ ] 数据库连接正常
- [ ] 后端API运行正常
- [ ] 前端界面加载正常
- [ ] 前后端连接成功
- [ ] 用户注册和登录功能正常
- [ ] 任务创建和管理功能正常

生产环境:
- [ ] 所有环境变量已配置
- [ ] HTTPS证书已配置
- [ ] 数据库备份策略已设置
- [ ] 错误监控已启用
- [ ] 性能监控已启用
- [ ] 日志收集已配置
- [ ] 域名DNS已解析
- [ ] CDN配置已设置（可选）

## 下一步

完成本地开发环境设置后，可以：
1. 开始功能开发和测试
2. 使用Postman或类似工具测试API
3. 进行用户测试和反馈收集
4. 根据测试结果优化功能
5. 准备生产环境部署