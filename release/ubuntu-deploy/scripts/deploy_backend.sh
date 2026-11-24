#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: sudo bash deploy_backend.sh /path/to/maintenance-system.jar /path/to/hpd-utilities-backend.env"
  exit 1
fi

JAR_FILE="$1"
ENV_FILE="$2"
APP_HOME="/opt/hpd-utilities"
APP_ETC="/etc/hpd-utilities"
APP_USER="hpdapp"
APP_GROUP="hpdapp"
TARGET_JAR="$APP_HOME/maintenance-system-0.0.1-SNAPSHOT.jar"

install -d -o "$APP_USER" -g "$APP_GROUP" "$APP_HOME"
install -d -o root -g root "$APP_ETC"
install -o "$APP_USER" -g "$APP_GROUP" -m 755 "$JAR_FILE" "$TARGET_JAR"
install -o root -g root -m 600 "$ENV_FILE" "$APP_ETC/hpd-utilities-backend.env"

systemctl daemon-reload
systemctl restart hpd-utilities-backend
systemctl status hpd-utilities-backend --no-pager

echo "Backend deployed to $TARGET_JAR"
