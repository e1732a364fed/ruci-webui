#!/bin/bash

# 确保脚本在错误时退出
set -e

# 检查是否提供了版本号参数
if [ -z "$1" ]; then
  echo "错误: 请提供版本号 (例如: 1.0.0)"
  echo "用法: ./scripts/release.sh <version>"
  exit 1
fi

VERSION=$1

# 确保版本号格式正确
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "错误: 版本号格式不正确，应为 x.y.z 格式"
  exit 1
fi

# 更新 package.json 中的版本号
sed -i '' 's/"version": "[^"]*"/"version": "'$VERSION'"/' package.json

# 提交更改
git add package.json

git commit -m "chore: release v$VERSION"

# 创建标签
git tag -a "v$VERSION" -m "Release v$VERSION"

echo "已创建版本 v$VERSION"
echo "现在您可以推送更改和标签:"
echo "git push && git push --tags" 