#!/usr/bin/env bash
# SQLite 备份：保留最近 14 天
# 用法： bash backup.sh
# 定时： crontab -e  →  0 3 * * * /srv/tidyquest/dist-app/deploy/backup.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/tidyquest}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%F-%H%M)"
OUT="$BACKUP_DIR/jiawu-$STAMP.db"

docker run --rm -v "$APP_DIR/data:/data" -v "$BACKUP_DIR:/out" alpine \
  sh -c "cp /data/jiawu.db /out/jiawu-$STAMP.db" 2>/dev/null \
  || cp "$APP_DIR/data/jiawu.db" "$OUT"

find "$BACKUP_DIR" -name 'jiawu-*.db' -mtime +$KEEP_DAYS -delete
echo "备份完成：$OUT"
