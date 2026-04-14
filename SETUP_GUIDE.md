# Once Upon a Time - Hosting & Setup Guide

## Project Overview
Personalized children's storybook platform. A child's photo is used to generate AI-illustrated story pages in Disney/Pixar style.

**Tech Stack:** NestJS (backend) + React 19/Vite (frontend) + PostgreSQL 16 + Redis 7 + Turborepo monorepo

**Repo:** https://github.com/vineeth-prid/onceupon
**Developer:** Nikhil PN (nikhilpn725@gmail.com)

---

## Prerequisites

| Tool       | Version   | Install                              |
|------------|-----------|--------------------------------------|
| Node.js    | >= 20.x   | https://nodejs.org                   |
| pnpm       | >= 9.x    | `npm install -g pnpm`               |
| Docker     | Latest    | https://docs.docker.com/get-docker/  |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/vineeth-prid/onceupon.git
cd onceupon
```

---

## Step 2: Install Dependencies

```bash
pnpm install
```

---

## Step 3: Start Database & Redis (Docker)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5433` (mapped to container's 5432)
- **Redis 7** on port `6379`

---

## Step 4: Create the `.env` Files

Each app has its own `.env.example`. Copy and fill in the values:

```bash
# Backend env (API keys, database, Redis, payments, email)
cp apps/backend/.env.example apps/backend/.env

# Frontend env (Razorpay public key, Google OAuth)
cp apps/frontend/.env.example apps/frontend/.env
```

### ENV File Locations
```
apps/backend/.env.example   --> apps/backend/.env
apps/frontend/.env.example  --> apps/frontend/.env
```

Open each `.env` file and fill in the blank values. Each file has comments explaining where to get the keys.

> **NOTE:** The DATABASE_URL port is `5433` (not 5432) because docker-compose maps 5433 on host to 5432 in the container.

---

## Step 5: Build Shared Package & Generate Prisma Client

```bash
pnpm --filter @bookmagic/shared build
pnpm --filter backend exec prisma generate
```

---

## Step 6: Run Database Migrations

```bash
pnpm db:migrate
```

---

## Step 7: Start Development Server

```bash
pnpm dev
```

This starts:
- **Backend** at `http://localhost:3000`
- **Frontend** at `http://localhost:5173`

---

## Project Structure

```
onceupon/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── prisma/       # Database schema & migrations
│   │   └── src/          # API source code
│   └── frontend/         # React + Vite app
│       └── src/          # Frontend source code
├── packages/
│   └── shared/           # Shared types, constants, validation
├── docker-compose.yml    # PostgreSQL + Redis
├── .env.example          # Template for environment variables
├── package.json          # Root monorepo config
└── turbo.json            # Turborepo pipeline config
```

---

## For Production Hosting

### What You Need on the Server
1. **VPS/Cloud Instance** (e.g., AWS EC2, DigitalOcean, Hetzner)
2. **Docker** installed (for PostgreSQL + Redis, or use managed services)
3. **Node.js 20+** and **pnpm**
4. **Domain name** with SSL certificate (Let's Encrypt / Certbot)
5. **Nginx** as reverse proxy

### Production Environment Changes
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:password@your-db-host:5432/storybook_prod
```

### Build for Production
```bash
pnpm build
```

### Key Production Considerations
- Use **managed PostgreSQL** (e.g., AWS RDS, Supabase) instead of Docker for reliability
- Use **managed Redis** (e.g., AWS ElastiCache, Upstash) for the job queue
- Set up **Nginx** to serve frontend static files and proxy `/api` to backend
- Configure **Razorpay webhooks** to point to `https://yourdomain.com/api/payments/webhook`
- Set up **SSL** with Certbot for HTTPS

---

## What to Get from Nikhil (Developer)

Send Nikhil a message to get these API keys:

1. **GEMINI_API_KEY** - Or create your own at https://aistudio.google.com/apikey
2. **REPLICATE_API_TOKEN** - Or create your own at https://replicate.com (paid, ~$0.05/image)
3. **RAZORPAY credentials** - Use your own Razorpay business account for production
4. **GOOGLE_CLIENT_ID** - For Google OAuth login (Google Cloud Console > Credentials)

---

## Troubleshooting

| Problem                         | Solution                                           |
|---------------------------------|----------------------------------------------------|
| `pnpm: command not found`       | Run `npm install -g pnpm`                          |
| Docker containers won't start   | Run `docker compose down -v` then `docker compose up -d` |
| Prisma migration fails          | Check DATABASE_URL port is `5433` for local Docker |
| Frontend can't reach backend    | Vite proxies `/api` to port 3000 automatically     |
| Image generation fails          | Check REPLICATE_API_TOKEN is valid and has credits  |
