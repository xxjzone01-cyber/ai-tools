#!/bin/bash

# 智能时间管家 - Cloudflare Pages 快速部署脚本
# 使用方法: ./deploy-cloudflare.sh

set -e

echo "🚀 智能时间管家 - Cloudflare Pages 部署脚本"
echo "============================================="

# 检查必要工具
echo "📋 检查必要工具..."

if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Git 和 npm 已安装"

# 检查是否在正确的目录
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ 请在 smart-time-manager 项目根目录运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"

# 配置 GitHub Secrets
echo "🔐 配置 GitHub Secrets..."

read -p "请输入您的 GitHub 仓库名 (例如: xxjzone01-cyber/ai-tools): " REPO_NAME
read -p "请输入 Cloudflare API Token: " API_TOKEN
read -p "请输入 Cloudflare Account ID: " ACCOUNT_ID

# 验证输入
if [ -z "$REPO_NAME" ] || [ -z "$API_TOKEN" ] || [ -z "$ACCOUNT_ID" ]; then
    echo "❌ 所有字段都必须填写"
    exit 1
fi

echo "✅ 输入验证通过"

# 创建 GitHub Actions 配置文件
echo "📝 创建 GitHub Actions 配置文件..."

cat > .github/workflows/pages.yml << EOF
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - master
    paths:
      - 'frontend/**'
      - 'backend/**'
      - '.github/workflows/pages.yml'
  pull_request:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload frontend build
        uses: actions/upload-pages-artifact@v2
        with:
          path: './frontend/build'

      - name: Deploy to Cloudflare Pages
        id: deployment
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: smart-time-manager
          directory: './frontend/build'
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
EOF

echo "✅ GitHub Actions 配置文件已创建"

# 提交更改
echo "💾 提交配置更改..."

git add .github/workflows/pages.yml
git commit -m "feat: 添加Cloudflare Pages部署配置

- 创建GitHub Actions工作流
- 配置自动部署到Cloudflare Pages
- 支持自定义域名和HTTPS

🤖 Generated with [OpenClaw](https://github.com/openclaw/openclaw)"

echo "✅ 配置已提交"

# 推送到 GitHub
echo "📤 推送到 GitHub..."

git push origin master

echo "✅ 代码已推送到 GitHub"

# 显示下一步
echo ""
echo "🎉 部署配置完成！"
echo "============================================="
echo ""
echo "📋 下一步操作："
echo ""
echo "1️⃣ 在 GitHub 仓库中设置 Secrets:"
echo "   • 进入仓库 Settings → Secrets and variables → Actions"
echo "   • 添加两个 Repository secrets:"
echo "     - Name: CLOUDFLARE_API_TOKEN"
echo "       Value: $API_TOKEN"
echo "     - Name: CLOUDFLARE_ACCOUNT_ID"
echo "       Value: $ACCOUNT_ID"
echo ""
echo "2️⃣ 等待自动部署:"
echo "   • 进入仓库 Actions 选项卡"
echo "   • 查看 'Deploy to Cloudflare Pages' 工作流"
echo "   • 等待部署完成（2-5分钟）"
echo ""
echo "3️⃣ 访问部署的网站:"
echo "   • 部署完成后访问: https://smart-time-manager.pages.dev"
echo "   • 如果配置了自定义域名，使用您的域名访问"
echo ""
echo "📚 更多信息:"
echo "   • 查看详细文档: DEPLOYMENT_CLOUDFLARE.md"
echo "   • Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "   • GitHub Actions: https://github.com/$REPO_NAME/actions"
echo ""
echo "⚠️ 重要提醒:"
echo "   • 前端部署在 Cloudflare Pages"
echo "   • 后端需要单独部署（可以部署到 Vercel、Railway 等平台）"
echo "   • 前端需要配置正确的后端 API 地址"
echo ""
echo "🎯 快速命令:"
echo "   • 查看部署状态: https://github.com/$REPO_NAME/actions"
echo "   • Cloudflare 控制台: https://dash.cloudflare.com/pages"
echo "   • 部署网站: https://smart-time-manager.pages.dev"
echo ""
echo "🤖 Generated with [OpenClaw](https://github.com/openclaw/openclaw)"