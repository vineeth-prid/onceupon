# Deployment Guide — Hostinger VPS

## Quick Reference

| Item | Value |
|------|-------|
| **Server** | `srv654778` (Hostinger VPS) |
| **Domain** | `onceuponatym.theprid.com` |
| **SSH** | `ssh root@srv654778` |
| **Backend URL** | `https://onceuponatym.theprid.com/api/` |
| **Frontend URL** | `https://onceuponatym.theprid.com` |
| **Git remote on server** | `origin` → `vineeth-prid/onceupon` (manager repo) |

---

## Server Directory Structure

```
/var/www/onceuponatym/
├── deploy.sh                  # Auto-deploy script (triggered by webhook)
├── webhook.js                 # GitHub webhook listener (port 9005)
├── frontend/                  # Built React static files (served by Nginx)
│   ├── index.html
│   ├── assets/
│   └── ...
└── onceuponatym/              # Git repo clone (vineeth-prid/onceupon)
    ├── apps/
    │   ├── backend/           # NestJS backend (PM2 managed, port 3000)
    │   │   ├── dist/          # Built backend output
    │   │   ├── prisma/        # Database schema & migrations
    │   │   └── .env           # Production environment variables
    │   └── frontend/          # React frontend source
    │       └── dist/          # Built frontend (copied to ../../../frontend/)
    ├── packages/
    │   └── shared/            # @bookmagic/shared TypeScript package
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    └── turbo.json
```

---

## PM2 Processes

| ID | Name | Purpose |
|----|------|---------|
| 8 | `onceuponatym-api` | NestJS backend on port 3000 |
| 9 | `onceuponatym-webhook` | GitHub webhook listener on port 9005 |

**Common PM2 commands:**
```bash
pm2 list                              # See all processes
pm2 logs onceuponatym-api --lines 50  # Backend logs
pm2 logs onceuponatym-webhook --lines 20  # Webhook logs
pm2 restart onceuponatym-api          # Restart backend
pm2 restart onceuponatym-webhook      # Restart webhook listener
```

---

## Auto-Deployment Flow

```
Local Machine                    GitHub                         Hostinger VPS
─────────────                    ──────                         ─────────────
git push manager main  ───→  vineeth-prid/onceupon  ───→  Webhook (POST /deploy)
                              (GitHub Webhook)              │
                                                            ▼
                                                      webhook.js (port 9005)
                                                            │
                                                            ▼
                                                      deploy.sh
                                                            │
                                                      1. git reset --hard HEAD
                                                      2. git pull origin main
                                                      3. pnpm install
                                                      4. prisma generate + migrate
                                                      5. pnpm build (backend + frontend)
                                                      6. Copy frontend dist → /var/www/onceuponatym/frontend/
                                                      7. pm2 restart onceuponatym-api
```

### How to deploy (from local machine)

```bash
# 1. Push to your repo
git push origin main

# 2. Push to manager repo (triggers auto-deploy)
git push manager main

# 3. Monitor deploy on server (optional)
ssh root@srv654778 "tail -f /var/log/onceuponatym-deploy.log"
```

### GitHub Webhook Config

- **Repo**: `vineeth-prid/onceupon` → Settings → Webhooks
- **Payload URL**: `https://onceuponatym.theprid.com/webhook/deploy`
- **Content type**: `application/json`
- **Secret**: `onceuponatym-webhook-secret-2026`
- **Events**: Just the `push` event
- **Branch filter**: webhook.js only deploys on `refs/heads/main`

---

## Nginx Configuration

**Config file**: `/etc/nginx/sites-enabled/onceuponatym.theprid.com`

| Route | Target | Purpose |
|-------|--------|---------|
| `/` | `/var/www/onceuponatym/frontend/` | React SPA (static files) |
| `/api/*` | `proxy → localhost:3000` | NestJS backend |
| `/webhook/*` | `proxy → localhost:9005` | GitHub deploy webhook |
| `*.js,*.css,*.png,...` | Static files | 30-day cache with immutable header |

- **SSL**: Let's Encrypt via Certbot (auto-renews)
- **HTTP → HTTPS**: Auto-redirect
- **Upload limit**: 20MB (`client_max_body_size`)

```bash
# Test config after changes
sudo nginx -t

# Reload after changes
sudo systemctl reload nginx

# Renew SSL manually (usually auto)
sudo certbot renew
```

---

## Deploy Script (`/var/www/onceuponatym/deploy.sh`)

```bash
#!/bin/bash
set -e

cd /var/www/onceuponatym/onceuponatym

# Reset build artifacts that block git pull
git reset --hard HEAD
git clean -fd

# Pull, install, build
git pull origin main
pnpm install

# Database
cd apps/backend
npx prisma generate
npx prisma migrate deploy

# Build everything
cd /var/www/onceuponatym/onceuponatym
VITE_RAZORPAY_KEY_ID=<key> \
VITE_GOOGLE_CLIENT_ID=<client-id> \
pnpm build

# Deploy frontend
cp -r apps/frontend/dist/* /var/www/onceuponatym/frontend/

# Restart backend
pm2 restart onceuponatym-api
```

---

## Webhook Listener (`/var/www/onceuponatym/webhook.js`)

- Runs on `127.0.0.1:9005` (only accessible via Nginx proxy)
- Validates `x-hub-signature-256` header with HMAC secret
- Only deploys on `refs/heads/main` pushes
- Logs deploy output to `/var/log/onceuponatym-deploy.log`

---

## Manual Deploy (if webhook fails)

SSH into the server and run:

```bash
ssh root@srv654778
bash /var/www/onceuponatym/deploy.sh 2>&1 | tail -30
```

---

## Git Remotes

### On local machine
| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `github.com/nikhil-pn/once-upon-a-time` | Your repo |
| `manager` | `github.com/vineeth-prid/onceupon` | Manager repo (triggers deploy) |

### On server
| Remote | URL |
|--------|-----|
| `origin` | `github.com/vineeth-prid/onceupon` (manager repo) |

---

## Logs & Debugging

```bash
# Deploy log (most useful for debugging failed deploys)
tail -100 /var/log/onceuponatym-deploy.log

# Backend application logs
pm2 logs onceuponatym-api --lines 100

# Webhook listener logs
pm2 logs onceuponatym-webhook --lines 20

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Deploy triggered but fails | Build artifacts block `git pull` | Fixed: `deploy.sh` now runs `git reset --hard HEAD` before pull |
| 502 Bad Gateway | Backend crashed or not running | `pm2 restart onceuponatym-api` |
| Webhook not triggering | GitHub webhook misconfigured or secret mismatch | Check webhook deliveries in GitHub repo settings |
| Frontend shows old version | Build succeeded but files not copied | `cp -r /var/www/onceuponatym/onceuponatym/apps/frontend/dist/* /var/www/onceuponatym/frontend/` |
| TypeScript build errors | Code has type errors | Fix locally, push again — deploy will retry on next push |
| `Invalid signature - rejected` in webhook logs | Webhook secret mismatch between GitHub and `webhook.js` | Ensure both use `onceuponatym-webhook-secret-2026` |
| Images/uploads not loading | Check backend serves `/api/uploads/` | Verify symlink or uploads directory in backend |
| SSL certificate expired | Certbot renewal failed | `sudo certbot renew` |
| PM2 process not auto-starting on reboot | PM2 startup not configured | `pm2 save && pm2 startup` (run the printed sudo command) |

---

## Environment Variables (Backend `.env`)

Located at `/var/www/onceuponatym/onceuponatym/apps/backend/.env`:

```env
DATABASE_URL=postgresql://...@localhost:5432/...
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=...
REPLICATE_API_TOKEN=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://onceuponatym.theprid.com
JWT_SECRET=...
```

> Never commit `.env` to git. Edit directly on the server.

## Frontend Build-Time Variables

These are baked into the JS bundle at build time (set in `deploy.sh`):

```
VITE_RAZORPAY_KEY_ID=...
VITE_GOOGLE_CLIENT_ID=...
```

If you change these, you must rebuild the frontend.
