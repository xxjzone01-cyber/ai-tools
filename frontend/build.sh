#!/bin/bash

# 简单的前端构建脚本
echo "🚀 开始构建智能时间管家前端..."

# 创建build目录
mkdir -p build

# 复制public目录到build
cp -r public/* build/

echo "✅ 构建完成！"
echo "📁 构建文件位于: $(pwd)/build"
echo "🌐 主页文件: $(pwd)/build/index.html"