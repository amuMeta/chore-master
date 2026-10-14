#!/usr/bin/env bash
# TidyQuest 一键部署 / 更新
# 首次运行会 clone 代码并生成 .env；再次运行则是拉取最新代码并重建容器。
#
# 用法（root）：  bash deploy.sh
# 可选环境变量：
#   APP_DIR=/srv/tidyquest                                 部署目录
#   BRANCH=feat/tauri-desktop                              要部署的分支
#   REPO=https://github.com/amuMeta/chore-master.git        仓库地址
set -euo pipefail

REPO="${REPO:-https://github.com/amuMeta/chore-master.git}"
BRANCH="${BRANCH:-feat/tauri-desktop}"
APP_DIR="${APP_DIR:-/srv/tidyquest}"

echo "==> 部署目录: $APP_DIR"
echo "==> 分支:     $BRANCH"

echo
echo "==> [1/4] 拉取代码"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch --all --prune
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
  echo "    已更新到 $(git rev-parse --short HEAD)"
else
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
  echo "    已 clone 到 $(git rev-parse --short HEAD)"
fi

echo
echo "==> [2/4] 配置 .env"
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${SECRET}|" .env
  echo "    已生成随机 JWT_SECRET"
else
  echo "    .env 已存在，保留（JWT_SECRET 不变，否则已登录用户会被踢下线）"
fi

echo
echo "==> [3/4] 准备生产 compose 文件"
cp -f dist-app/deploy/docker-compose.prod.yml ./docker-compose.prod.yml
mkdir -p data

echo
echo "==> [4/4] 构建并启动容器（首次约 3-8 分钟）"
docker compose -f docker-compose.prod.yml up -d --build

echo
echo "==> 等待服务就绪"
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8080/api/auth/registration-status >/dev/null 2>&1; then
    echo "    服务已就绪"
    break
  fi
  sleep 2
done

echo
echo "==> 容器状态"
docker compose -f docker-compose.prod.yml ps

echo
echo "完成。验证命令："
echo "  curl http://127.0.0.1:8080/api/auth/registration-status"
echo "  curl http://$(curl -s ifconfig.me 2>/dev/null || echo '<公网IP>'):8080/api/auth/registration-status"
echo
echo "别忘了：安全组入方向放行 8080（不要放行 3000）"
