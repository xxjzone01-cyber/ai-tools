# GitHub Pages 部署指南

## 前端部署到GitHub Pages

### 1. 构建前端项目
```bash
cd smart-time-manager/frontend
npm run build
```

### 2. 配置GitHub Pages
- 进入仓库Settings → Pages
- Source选择: 
  - Branch: master
  - Folder: frontend/build
- 点击Save

### 3. 等待部署完成
- GitHub会自动部署
- 通常需要1-3分钟
- 部署完成后会收到邮件通知

### 4. 访问地址
```
https://xxjzone01-cyber.github.io/ai-tools/
```

## 注意事项

- GitHub Pages只支持静态网站（前端）
- 后端API需要单独部署
- 需要在前端代码中配置正确的API地址
- 免费额度：每月100GB流量

## 环境变量配置

在部署前，需要修改前端代码中的API地址：

```javascript
// frontend/src/services/api.ts
const API_BASE_URL = 'https://your-backend-api.com/api'; // 修改为实际的后端地址
```