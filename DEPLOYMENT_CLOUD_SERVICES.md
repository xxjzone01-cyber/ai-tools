# 免费云服务部署指南

## 方案A: Vercel（推荐，免费且稳定）

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录并部署后端
```bash
cd smart-time-manager/backend
vercel login
vercel --prod
```

### 3. 部署前端
```bash
cd smart-time-manager/frontend
vercel --prod
```

### 4. 获取访问地址
部署完成后，Vercel会提供：
- 前端地址: https://your-project.vercel.app
- 后端API地址: https://your-api.vercel.app
- 实时日志: Vercel Dashboard

### 5. 环境变量配置
在Vercel Dashboard中配置以下环境变量：
- `DATABASE_URL`: PostgreSQL连接字符串
- `JWT_SECRET`: 任意随机字符串
- `OPENAI_API_KEY`: OpenAI API密钥
- `SMTP_*`: 邮件服务配置

## 方案B: Render（免费套餐）

### 1. 创建PostgreSQL数据库
- 在Render Dashboard中创建PostgreSQL实例
- 免费套餐：256MB存储，90天保留

### 2. 部署后端
```bash
# 安装Render CLI
npm install -g render-cli

# 登录并部署
cd smart-time-manager/backend
render login
render deploy
```

### 3. 部署前端
```bash
cd smart-time-manager/frontend
render deploy
```

## 方案C: Railway（免费套餐）

### 1. 创建Railway项目
- 访问 railway.app
- 选择"Deploy from GitHub repo"
- 选择我们的仓库：xxjzone01-cyber/ai-tools

### 2. 配置服务
Railway会自动检测项目结构，创建：
- PostgreSQL数据库（免费512MB）
- Node.js后端
- 静态前端托管

### 3. 获取访问地址
部署完成后会提供：
- 前端地址: https://your-app.railway.app
- API地址: https://your-api.railway.app
- 数据库连接字符串

## 方案D: 阿里云/腾讯云（国内推荐）

### 阿里云
- 免费试用3个月
- ECS云服务器
- RDS数据库
- 对象存储OSS

### 腾讯云
- 轻量应用服务器（免费额度）
- 云数据库
- 对象存储COS

## 推荐选择

1. **开发测试**: Vercel（部署快，性能好）
2. **国内访问**: 阿里云/腾讯云（网络稳定）
3. **生产环境**: 付费云服务（稳定性好）

## 数据库配置

### 获取免费PostgreSQL
- **Supabase**: 免费PostgreSQL，500MB存储
- **Neon**: Serverless PostgreSQL，免费套餐
- **Railway**: PostgreSQL免费套餐
- **PlanetScale**: 免费PostgreSQL数据库

### 数据库连接字符串格式
```
postgresql://postgres:[password]@[host]:[port]/[database]?sslmode=require
```

## 环境变量必需

### 必须配置的变量
- `DATABASE_URL`: 数据库连接字符串
- `JWT_SECRET`: JWT签名密钥
- `OPENAI_API_KEY`: OpenAI API密钥
- `FRONTEND_URL`: 前端地址（用于CORS）
- `SMTP_*`: 邮件服务配置（可选）
- `ENABLE_EMAIL_NOTIFICATIONS`: 是否启用邮件通知

### AI服务配置
- 需要OpenAI API Key
- GPT-4模型需要付费API
- 可以先使用GPT-3.5-turbo降低成本

## 域名配置（可选）

### 购买域名
- 域名提供商：阿里云、腾讯云、Namecheap等
- 价格：通常¥50-100/年

### 域名解析
- 前端：A记录指向Vercel/Railway地址
- 后端：A记录指向后端API地址

## 成本估算

### 免费方案
- Vercel: 完全免费
- Railway: $5/月起（可以免费使用）
- Render: 有免费套餐，但有限制
- PostgreSQL: Supabase免费500MB

### 付费方案
- 阿里云ECS: 约¥30-100/月
- 腾讯云轻量: 约¥30-80/月
- RDS PostgreSQL: 约¥100-300/月

## 部署检查清单

- [ ] 购买域名（可选）
- [ ] 创建数据库实例
- [ ] 配置环境变量
- [ ] 部署前端
- [ ] 部署后端
- [ ] 配置CORS设置
- [ ] 测试前后端连接
- [ ] 配置邮件服务（可选）
- [ ] 启用HTTPS（通常免费）
- [ ] 设置监控和日志