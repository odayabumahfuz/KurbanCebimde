#!/usr/bin/env bash
set -euo pipefail

ENV_FILE_DIR="$(dirname "$0")/.."
if [ -f "$ENV_FILE_DIR/.env" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE_DIR/.env"
fi

STAMP=$(date +"%Y%m%d_%H%M%S")
OUTDIR="/opt/kc/backup"
mkdir -p "$OUTDIR"

DB_CONT=$(docker ps -qf name=_db_ | head -n1)
if [ -z "$DB_CONT" ]; then
  echo "Postgres container not found; ensure service name contains 'db'"
  exit 1
fi

docker exec -i "$DB_CONT" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${OUTDIR}/kc_${STAMP}.sql.gz"

# 7 günden eski yedekleri sil
find "$OUTDIR" -type f -name "*.sql.gz" -mtime +7 -delete


