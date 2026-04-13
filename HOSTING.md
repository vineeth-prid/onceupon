# Hosting & Deployment Guide

## Architecture: Everything on Hostinger VPS

```
User Browser
      |
      v
[ Nginx ] (ports 80/443, SSL via Let's Encrypt)
   |              |                |
   v              v                v
Static Files    /api/*           /uploads/*
/var/www/       proxy to         proxy to
frontend/       localhost:3000   localhost:3000
                    |
                    v
             NestJS Backend (PM2 managed)
                |           |
                v           v
          PostgreSQL     Redis 7
          (Docker)       (Docker)
          port 5432      port 6379
          localhost only  localhost only
```

**Single domain, single server. No external hosting services needed.**

---

## VPS Requirements

- **OS:** Ubuntu 22.04+ (recommended)
- **RAM:** 2 GB minimum, 4 GB recommended
- **Disk:** 20 GB minimum
- **Ports open:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Software Installed on VPS

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20 LTS | Run NestJS backend |
| pnpm | 10.x | Package manager |
| Docker + Compose | Latest | Run PostgreSQL & Redis |
| Nginx | Latest | Reverse proxy + serve frontend |
| PM2 | Latest | Process manager (auto-restart) |
| Certbot | Latest | Free SSL certificates |
| UFW | Built-in | Firewall |

---

## Directory Structure on VPS

```
/home/deploy/storybook/                 Project root (cloned from Git)
/home/deploy/storybook/.env             Production secrets (chmod 600)
/home/deploy/storybook/ecosystem.config.js  PM2 config
/home/deploy/storybook/apps/backend/dist/   Built backend
/home/deploy/docker-compose.prod.yml    PostgreSQL + Redis containers
/home/deploy/logs/                      PM2 log files

/var/www/frontend/          Built React static files (served by Nginx)
/var/data/postgres/         PostgreSQL persistent data volume
/var/data/redis/            Redis persistent data volume
/var/data/uploads/          User photos + generated images (persistent)
```

---

## Deployment Phases

### Phase 1: VPS Initial Setup

```bash
# SSH in
ssh root@VPS_IP

# Update system
apt update && apt upgrade -y

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm + PM2
npm install -g pnpm@10 pm2

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Install Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx

# Firewall
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable

# Data directories
mkdir -p /var/data/postgres /var/data/redis /var/data/uploads
mkdir -p /var/www/frontend /home/deploy/logs
chown -R deploy:deploy /var/data/uploads /var/www/frontend /home/deploy/logs
```

### Phase 2: Database & Redis

Switch to deploy user: `su - deploy`

Create `/home/deploy/docker-compose.prod.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: storybook
      POSTGRES_PASSWORD: STRONG_PASSWORD_HERE
      POSTGRES_DB: storybook_prod
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - /var/data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U storybook"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - /var/data/redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

```bash
docker compose -f docker-compose.prod.yml up -d
docker ps   # verify both running
```

### Phase 3: Backend Deployment

```bash
cd /home/deploy
git clone https://github.com/USER/REPO.git storybook
cd storybook

# Create .env (see Environment Variables section below)
nano .env
chmod 600 .env
cp .env apps/backend/.env

# Install, generate, migrate, build
pnpm install
cd apps/backend && npx prisma generate && npx prisma migrate deploy
cd /home/deploy/storybook && pnpm build

# Link uploads to persistent storage
rm -rf apps/backend/uploads
ln -s /var/data/uploads apps/backend/uploads
```

Create `/home/deploy/storybook/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: "storybook-api",
    cwd: "/home/deploy/storybook/apps/backend",
    script: "dist/main.js",
    instances: 1,
    node_args: "--max-old-space-size=512",
    max_memory_restart: "500M",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/home/deploy/logs/api-error.log",
    out_file: "/home/deploy/logs/api-out.log",
    merge_logs: true
  }]
};
```

```bash
# Start backend
set -a; source .env; set +a
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # run the printed sudo command

# Verify
curl http://localhost:3000/api
pm2 logs storybook-api --lines 20
```

### Phase 4: Frontend Deployment

```bash
cd /home/deploy/storybook

VITE_RAZORPAY_KEY_ID=your_key \
VITE_GOOGLE_CLIENT_ID=your_client_id \
pnpm --filter frontend build

cp -r apps/frontend/dist/* /var/www/frontend/
```

> **Note:** VITE_ variables are baked into JS at build time. Rebuild frontend if you change them.

### Phase 5: Nginx + SSL

Create `/etc/nginx/sites-available/storybook`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React SPA)
    root /var/www/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        expires 7d;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|webp|mp4)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/storybook /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# After DNS points to VPS:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Phase 6: DNS Setup

Add these DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | VPS_IP_ADDRESS |
| A | www | VPS_IP_ADDRESS |

Verify: `dig +short yourdomain.com`

---

## Environment Variables

### Backend `.env` (on VPS)

```env
# Database
DATABASE_URL=postgresql://storybook:DB_PASSWORD@localhost:5432/storybook_prod

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Services
GEMINI_API_KEY=
REPLICATE_API_TOKEN=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# App
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=           # generate with: openssl rand -hex 32

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=            # Gmail App Password, not regular password
SMTP_FROM_NAME=Once Upon a Time
SMTP_FROM_EMAIL=
```

### Frontend (build-time only)

```env
VITE_RAZORPAY_KEY_ID=       # public Razorpay key
VITE_GOOGLE_CLIENT_ID=      # Google OAuth client ID
```

---

## Common Operations

### Deploy New Code
```bash
cd /home/deploy/storybook
git pull origin main
pnpm install
cp .env apps/backend/.env
cd apps/backend && npx prisma generate && npx prisma migrate deploy
cd /home/deploy/storybook && pnpm build
pm2 restart storybook-api

# If frontend changed:
VITE_RAZORPAY_KEY_ID=xxx VITE_GOOGLE_CLIENT_ID=xxx pnpm --filter frontend build
cp -r apps/frontend/dist/* /var/www/frontend/
```

### View Logs
```bash
pm2 logs storybook-api              # Backend (live)
pm2 logs storybook-api --lines 100  # Last 100 lines
docker logs deploy-postgres-1       # Database
docker logs deploy-redis-1          # Redis
sudo tail -f /var/log/nginx/error.log  # Nginx
```

### Restart Services
```bash
pm2 restart storybook-api
docker compose -f ~/docker-compose.prod.yml restart
sudo systemctl reload nginx
```

### Backup Database
```bash
docker exec deploy-postgres-1 \
  pg_dump -U storybook storybook_prod > ~/backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat ~/backup_YYYYMMDD.sql | docker exec -i deploy-postgres-1 \
  psql -U storybook storybook_prod
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| 502 Bad Gateway | Backend not running | `pm2 status`, `pm2 restart storybook-api` |
| CORS error | Wrong FRONTEND_URL | Set `FRONTEND_URL=https://yourdomain.com` in .env |
| Images not loading | Uploads symlink broken | `ls -la apps/backend/uploads` - relink if needed |
| DB connection error | Password mismatch | Check .env DATABASE_URL matches docker-compose password |
| Blank page | Frontend not built/copied | Rebuild and copy to /var/www/frontend/ |
| SSL error | DNS not propagated | Wait, check with `dig +short yourdomain.com`, rerun certbot |
| Google login fails | Wrong client ID | Check VITE_GOOGLE_CLIENT_ID, rebuild frontend |
| Payment fails | Test vs live key mismatch | Ensure Razorpay key type matches environment |

## Security Notes

- PostgreSQL and Redis bound to 127.0.0.1 only (not internet-accessible)
- `.env` file permissions: `chmod 600` (only deploy user reads it)
- Firewall allows only ports 22, 80, 443
- SSL auto-renews via Certbot systemd timer
- Generate secrets with `openssl rand -hex 32` (JWT) and `openssl rand -base64 24` (DB password)
- Run app as `deploy` user, not root
