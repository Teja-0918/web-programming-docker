# 🐳 Docker Deployment Guide for MERNexus E-Commerce & Admin Platform

This project is fully containerized using **Docker** and **Docker Compose**. It spins up 3 coordinated services with a single command:
1. **`mongo`** (MongoDB 7.0 database with persistent named volume)
2. **`backend`** (Node.js 20 Express API server with automatic seeding and connection retries)
3. **`frontend`** (Production-grade React/Vite SPA served with ultra-fast Nginx)

---

## ⚡ Quick Start (1 Command)

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running, then execute in the root directory:

```bash
docker compose up --build -d
```

### 🌐 Access Your Application

| Service | URL | Container Port | Host Port |
| :--- | :--- | :--- | :--- |
| **Frontend Storefront & Admin** | **http://localhost:5173** | 80 (Nginx) | 5173 |
| **Backend REST API** | **http://localhost:4000** | 4000 | 4000 |
| **MongoDB Database** | `mongodb://localhost:27017/mernexus` | 27017 | 27017 |

---

## 🛠️ Common Docker Commands

### View Running Containers & Health
```bash
docker compose ps
```

### Stream Live Logs from All Services
```bash
docker compose logs -f
```

### Stream Logs from Specific Service
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### Stop All Containers (Preserves Database Data)
```bash
docker compose down
```

### Stop All Containers and Reset Database (Deletes Volume)
```bash
docker compose down -v
```

### Rebuild and Restart After Code Changes
```bash
docker compose up -d --build
```

---

## 📁 Docker Files Structure

```
├── docker-compose.yml       # Multi-container orchestration (Mongo, Backend, Frontend)
├── .dockerignore            # Root ignore file
├── backend/
│   ├── Dockerfile           # Node 20 LTS production API image
│   ├── .dockerignore        # Excludes node_modules and local .env
│   └── src/seed.js          # Auto-seeds default products & users on clean boot
└── frontend/
    ├── Dockerfile           # Multi-stage build (Node builder -> Nginx runner)
    ├── nginx.conf           # SPA client routing and gzip compression config
    └── .dockerignore        # Excludes node_modules and local dist
```

---

## 💡 Notes for Windows Users

If `docker` command is not recognized in your terminal:
1. Download and install **[Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)**.
2. Make sure the WSL 2 backend is selected during installation.
3. Start Docker Desktop from the Start menu and wait for the status indicator to turn green.
4. Run `docker compose up --build -d`.
