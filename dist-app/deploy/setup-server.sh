#!/usr/bin/env bash
# TidyQuest 服务器初始化：装 Docker + Compose，加 swap，准备目录
# 用法（root）：  bash setup-server.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/tidyquest}"
SWAP_GB="${SWAP_GB:-2}"

echo "==> 检测系统"
if [ -f /etc/os-release ]; then . /etc/os-release; else echo "未知系统"; exit 1; fi
echo "    $PRETTY_NAME"

echo "==> 安装 Docker"
if ! command -v docker >/dev/null 2>&1; then
  # 注意：大陆机器访问 get.docker.com 会被 reset，这里直接用阿里云镜像源
  if command -v apt-get >/dev/null 2>&1; then
    . /etc/os-release
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg openssl sqlite3
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://mirrors.aliyun.com/docker-ce/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -y
  else
    echo "    !! 非 Debian/Ubuntu 系统，请先手动安装 Docker"
    exit 1
  fi
  systemctl enable --now docker
else
  echo "    Docker 已安装，跳过"
fi

echo "==> 安装 docker compose 插件"
if ! docker compose version >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y && apt-get install -y docker-compose-plugin
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y docker-compose-plugin
  elif command -v yum >/dev/null 2>&1; then
    yum install -y docker-compose-plugin
  else
    echo "    !! 请手动安装 docker-compose-plugin"
  fi
else
  echo "    已有 docker compose，跳过"
fi

echo "==> 加 ${SWAP_GB}G swap（小内存机器构建前端时防 OOM）"
if [ ! -f /swapfile ]; then
  fallocate -l "${SWAP_GB}G" /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=$((SWAP_GB*1024))
  chmod 600 /swapfile
  mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  echo "    swap 已存在"
fi

echo "==> 准备应用目录 $APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo
echo "完成。接下来："
echo "  1) 测试 GitHub 连通性（大陆服务器可能超时，超时就改走本地打包上传）"
echo "     timeout 20 git ls-remote https://github.com/amuMeta/chore-master.git HEAD"
echo "  2) 拉代码并用一键脚本部署："
echo "     git clone -b feat/tauri-desktop https://github.com/amuMeta/chore-master.git $APP_DIR"
echo "     cd $APP_DIR && bash dist-app/deploy/deploy.sh"
echo "  3) 安全组放行 8080（不要放行 3000）"
echo
echo "注意：务必用 feat/tauri-desktop 分支，main 分支还没有「可配置服务器地址」，"
echo "      桌面 App 会连不上后端。"
