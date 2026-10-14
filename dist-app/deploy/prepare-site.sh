#!/usr/bin/env bash
# 准备 qmuse（WorkBuddy 发布应用）用的发布目录：dist-app/site/
#
# 只带构建所需的源码，不带 Rust 工程 / Docker 文件 / 打包产物，
# 避免被发布前检查误判成「依赖外部服务的不可发布项目」。
#
# 用法：  bash dist-app/deploy/prepare-site.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
SITE="$REPO/dist-app/site"

# 重新发布时保留原来的 .env，否则 JWT_SECRET 变了会把已注册用户全踢下线
if [ -f "$SITE/.env" ]; then
  cp "$SITE/.env" /tmp/tq-site.env.bak
fi

echo "==> 清空并重建 $SITE"
rm -rf "$SITE"
mkdir -p "$SITE/server" "$SITE/client"

echo "==> 拷贝 server 源码"
cp "$REPO/server/package.json" "$REPO/server/package-lock.json" "$REPO/server/tsconfig.json" "$SITE/server/"
cp -r "$REPO/server/src" "$SITE/server/src"

echo "==> 拷贝 client 源码（排除 src-tauri / dist / node_modules）"
cp "$REPO/client/package.json" "$REPO/client/package-lock.json" "$SITE/client/"
cp "$REPO/client/index.html" "$REPO/client/vite.config.ts" "$SITE/client/"
cp "$REPO/client/tsconfig.json" "$REPO/client/tsconfig.app.json" "$REPO/client/tsconfig.node.json" "$SITE/client/"
cp -r "$REPO/client/src" "$SITE/client/src"
[ -d "$REPO/client/public" ] && cp -r "$REPO/client/public" "$SITE/client/public"

echo "==> 写入 .env"
if [ -f /tmp/tq-site.env.bak ]; then
  cp /tmp/tq-site.env.bak "$SITE/.env"
  rm -f /tmp/tq-site.env.bak
  echo "    沿用已有的 JWT_SECRET"
else
  cat > "$SITE/.env" <<EOF
NODE_ENV=production
PORT=3000
TZ=Asia/Shanghai
JWT_SECRET=$(openssl rand -base64 32)
EOF
  echo "    已生成随机 JWT_SECRET"
fi

echo "==> 写入根 package.json"
cat > "$SITE/package.json" <<'EOF'
{
  "name": "tidyquest-site",
  "version": "0.6.3",
  "private": true,
  "scripts": {
    "start": "cd server && npm start"
  }
}
EOF

echo
echo "完成：$SITE"
echo "  server 监听 process.env.PORT，前端由 express.static(../../client/dist) 托管"
echo "  数据落在 <site>/data/（SQLite），头像上传落在 <site>/data/avatars/"
echo
echo "检查：确认没有 src-tauri / node_modules / dist 混进来"
find "$SITE" -maxdepth 2 -name "src-tauri" -o -maxdepth 2 -name "node_modules" -o -maxdepth 2 -name "dist" | head
