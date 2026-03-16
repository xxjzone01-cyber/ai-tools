# Cloudflare Pages 部署指南

## 🚀 快速部署到 Cloudflare Pages

### 前置要求
- Cloudflare 账号
- GitHub 仓库
- API Token 和 Account ID

### 1. 配置 Cloudflare API Token

#### 获取 API Token
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "API Tokens" 页面
3. 点击 "Create Token"
4. 选择 "Edit zone DNS" 模板
5. 配置以下权限：
   - Zone: Zone:DNS - Edit
   - Zone:Zone - Read
6. 点击 "Continue to summary"
7. 输入 Token 名称: "Smart Time Manager Pages"
8. 点击 "Create token"

#### 复制 Token
```
API Token: Dabs02bW9BwZwCpu3kmMAR5iD48yRwk9HtSAsy9X
```

### 2. 获取 Account ID

#### 找到 Account ID
1. 在 Cloudflare Dashboard 顶部，点击账号名称
2. Account ID 显示在页面顶部
3. 复制 Account ID
```
Account ID: 5cbfc2dac9b0828eb60202bcb1315e46
```

### 3. 配置 GitHub Secrets

#### 在 GitHub 仓库中设置 Secrets
1. 进入 GitHub 仓库页面
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. 添加以下 Secrets：
   - **CLOUDFLARE_API_TOKEN**: `Dabs02bW9BwZwCpu3kmMAR5iD48yRwk9HtSAsy9X`
   - **CLOUDFLARE_ACCOUNT_ID**: `5cbfc2dac9b0828eb60202bcb1315e46`

#### 设置步骤
```bash
# 1. 进入 GitHub 仓库
# 2. Settings → Secrets and variables → Actions
# 3. 添加 Repository secrets:
#    - Name: CLOUDFLARE_API_TOKEN
#      Value: Dabs02bW9BwZwCpu3kmMAR5iD48yRwk9HtSAsy9X
#    - Name: CLOUDFLARE_ACCOUNT_ID
#      Value: 5cbfc2dac9b0828eb60202bcb1315e46
```

### 4. 推送代码触发部署

#### 推送代码到 GitHub
```bash
cd smart-time-manager

# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 添加Cloudflare Pages部署配置

- 添加wrangler.toml配置文件
- 创建GitHub Actions工作流
- 配置自动部署到Cloudflare Pages
- 更新部署文档

🤖 Generated with [OpenClaw](https://github.com/openclaw/openclaw)"

# 推送到GitHub
git push origin master
```

### 5. 验证部署

#### 检查部署状态
1. 进入 GitHub 仓库的 "Actions" 选项卡
2. 查看名为 "Deploy to Cloudflare Pages" 的工作流
3. 等待部署完成（通常需要2-5分钟）

#### 访问部署的网站
部署完成后，访问地址：
```
https://smart-time-manager.pages.dev
```

### 6. 配置自定义域名（可选）

#### 设置自定义域名
1. 在 Cloudflare Dashboard 中进入 "Pages" 项目
2. 点击 "Custom domains"
3. 添加您的域名（例如: smarttime.ai）
4. 配置 DNS 记录：
   - Type: CNAME
   - Name: @
   - Target: smart-time-manager.pages.dev
   - Proxy status: Proxied

### 7. 配置环境变量

#### 设置生产环境变量
在 Cloudflare Pages 项目设置中添加环境变量：

```env
# 前端环境变量
NODE_ENV=production
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_VERSION=1.0.0

# 注意：前端无法直接访问后端API，需要单独部署后端
```

### 8. 后端部署（可选）

#### 使用 Cloudflare Workers 部署后端
```bash
# 1. 创建 workers 目录
mkdir smart-time-manager/backend/functions

# 2. 创建 worker 入口文件
# backend/functions/index.ts
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // 后端API逻辑
    return new Response('Hello from Cloudflare Worker!');
  }
}

# 3. 修改 wrangler.toml 配置
[build]
command = "npm install && npm run build"

[build.environment]
NODE_VERSION = "18"

[env.production]
NODE_ENV = "production"
```

#### 部署 Workers
```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Worker
wrangler deploy
```

### 9. 监控和分析

#### Cloudflare Analytics
1. 进入 Cloudflare Pages 项目
2. 点击 "Analytics" 选项卡
3. 查看访问量、性能数据
4. 配置 Web Analytics

#### 性能优化
```bash
# 启用 CDN 缓存
# 在 wrangler.toml 中添加
[build]
command = "npm install && npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 配置缓存策略
[build.upload]
  format = "directory"
  index = "index.html"
```

### 10. 常见问题排查

#### 部署失败
1. **检查 API Token 权限**
   - 确保有 "Edit zone DNS" 权限
   - Token 未过期

2. **检查 GitHub Secrets**
   - 确保名称正确
   - 值未包含多余空格

3. **检查代码推送**
   - 确保推送到正确的分支
   - 工作流文件路径正确

#### 访问问题
1. **网站无法访问**
   - 检查 Pages 项目状态
   - 查看 Analytics 数据
   - 检查自定义域名配置

2. **样式丢失**
   - 检查路径配置
   - 确保资源文件正确上传

3. **API 连接失败**
   - 后端需要单独部署
   - 检查 CORS 配置

### 11. 成本估算

#### Cloudflare Pages 免费额度
- **静态网站托管**: 免费
- **带宽**: 每天 100GB
- **构建时间**: 每天 10 分钟
- **自定义域名**: 免费

#### 升级计划
- **Pro**: $5/月
  - 更多带宽
  - 更多构建时间
  - 高级功能

### 12. 备份和迁移

#### 备份部署
```bash
# 下载部署日志
wrangler pages deployments list

# 下载构建产物
wrangler pages project download smart-time-manager
```

#### 迁移到其他平台
```bash
# 导出配置
wrangler pages project export smart-time-manager

# 重新导入到新平台
wrangler pages project import smart-time-manager
```

### 13. 下一步

#### 功能扩展
1. **添加评论系统**: 使用 Cloudflare D1 数据库
2. **实现用户认证**: Cloudflare Access
3. **添加实时功能**: Cloudflare Durable Objects
4. **配置 CDN 缓存**: Cloudflare Workers

#### 监控和优化
1. **性能监控**: Cloudflare Analytics
2. **错误追踪**: Sentry 集成
3. **A/B 测试**: Cloudflare Experiment
4. **安全防护**: Cloudflare Security

---

**快速启动命令**:
```bash
# 1. 配置 Secrets
# 2. 推送代码
git push origin master

# 3. 等待部署
# 4. 访问: https://smart-time-manager.pages.dev
```

**支持**:
- Cloudflare 文档: https://developers.cloudflare.com/pages
- GitHub Actions: https://docs.github.com/en/actions
- 问题反馈: GitHub Issues