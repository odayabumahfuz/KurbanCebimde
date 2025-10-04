## KurbanCebimde Prod Runbooks

### Başlatma
```
cd /opt/kc
docker compose pull
docker compose up -d
docker compose ps
```

### Health
- https://api.kurbancebimde.com/healthz → {"status":"ok"}
- `docker compose logs -f --tail=200 api`

### Backup
- Cron: `0 3 * * * /bin/bash /opt/kc/deploy/backup/pg-backup.sh >> /var/log/kc-backup.log 2>&1`
- Dosyalar: `/opt/kc/backup/*.sql.gz` (7 gün tutulur)

### Sürüm Alma
```
docker compose pull api worker scheduler proxy
docker compose up -d api worker scheduler proxy
docker compose logs -f --tail=200 api
```

### Sertifika / TLS
- DNS Only: Caddy HTTP-01 otomatik
- Cloudflare Proxy: `CLOUDFLARE_API_TOKEN` ile DNS challenge

### Sorun Giderme
- Port çakışması: 80/443 başka servis mi dinliyor? `sudo lsof -i :80 -i :443`
- DB bağlantısı: `docker exec -it $(docker ps -qf name=_db_) psql -U $POSTGRES_USER -d $POSTGRES_DB -c 'SELECT 1'`
- Storage yetkileri: `PRESIGN_EXPIRE_SEC`, `S3_*` değişkenleri


