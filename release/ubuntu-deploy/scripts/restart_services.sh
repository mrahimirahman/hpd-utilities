#!/usr/bin/env bash
set -euo pipefail

systemctl restart hpd-utilities-backend
systemctl reload nginx
systemctl status hpd-utilities-backend --no-pager
nginx -t
