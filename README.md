# Smart Time Manager

AI驱动的个人时间管理与任务优化平台

## 项目简介

一个智能化的时间管理工具，帮助用户更好地规划时间、管理任务、提高工作效率。

## 核心功能

- 🎯 **智能任务分类**: AI自动识别和分类任务
- ⏰ **时间预测**: 基于历史数据预测任务完成时间
- 🔔 **智能提醒**: 根据优先级和时间窗口智能提醒
- 📊 **数据可视化**: 直观展示时间使用情况
- 🚀 **高效协作**: 支持团队协作和任务分配

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design + Tailwindwind CSS
- Zustand (状态管理)
- React Router 6

### 后端
- Node.js 18 + Express + TypeScript
- Prisma (ORM)
- PostgreSQL + Redis
- OpenAI GPT-4 API

### 部署
- Docker + Docker Compose
- 阿里云/腾讯云

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/xxjzone/smart-time-manager.git
cd smart-time-manager
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和API密钥
```

4. 初始化数据库
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. 启动开发服务器
```bash
npm run dev
```

## 项目结构

```
smart-time-manager/
├── frontend/          # React前端
├── backend/           # Node.js后端
├── database/          # 数据库相关
├── docs/             # 文档
├── scripts/          # 脚本
└── tests/            # 测试
```

## 开发指南

### 开发环境启动

```bash
# 同时启动前端和后端
npm run dev

# 单独启动前端
npm run dev:frontend

# 单独启动后端
npm run dev:backend
```

### 代码规范

- 使用ESLint + Prettier进行代码格式化
- 遵循TypeScript类型定义
- 编写单元测试

## 部署

### 生产环境部署

```bash
# 构建项目
npm run build

# 使用Docker部署
npm run docker:prod
```

## 贡献指南

1. Fork本仓库
2. 创建功能分支
3. 提交代码
4. 发起Pull Request

## 许可证

MIT License

## 联系方式

- 项目负责人: xxjzone01@gmail.com
- 项目地址: https://github.com/xxjzone/smart-time-manager