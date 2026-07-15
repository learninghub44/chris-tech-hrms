# Chris Tech HRMS

**Chris Tech HRMS** is a production-ready multi-tenant HR management platform built by Chris Tech / Zetu Business Solutions. It combines a modern Next.js frontend, a TypeScript + Express backend, and Prisma-powered PostgreSQL data persistence to deliver a scalable HR SaaS experience.

## 🚀 Project Summary

This repository contains a full-stack HRMS system designed for enterprise and mid-market customers. It is built to support:

- multi-tenant company isolation
- employee lifecycle management
- attendance tracking
- leave and payroll workflows
- recruitment and performance management
- dashboard reporting and notifications

The codebase is organized as a workspace with two primary packages:

- `frontend/` — Next.js 15 application with Tailwind CSS, React 19, and Framer Motion
- `backend/` — Express API with Prisma ORM, PostgreSQL, authentication, and tenant-aware middleware

## 🌟 Key Features

- Multi-tenant architecture with company-specific data boundaries
- Modern HR workflows for employees, attendance, leave, payroll, recruitment, and performance
- Full-stack TypeScript for consistent development experience
- Docker-friendly database orchestration using `docker compose`
- Separate backend and frontend workspaces for modular development
- Production-ready configuration for Render / Cloudflare deployment

## 🧱 Tech Stack

- Node.js 20+
- TypeScript
- Next.js 15
- React 19
- Tailwind CSS
- Express
- Prisma 6
- PostgreSQL
- Redis
- Socket.IO
- Zod

## 📁 Repository Layout

- `/frontend` — Next.js app, UI components, pages, styles, client-side logic
- `/backend` — Express API, Prisma schema, middleware, modules, services, scripts
- `/docs` — architecture and multi-tenant design documentation
- `/docker-compose.yml` — PostgreSQL service for local development
- `/render.yaml` — deployment configuration

## ✅ Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Docker Desktop or Docker Engine
- PostgreSQL via Docker Compose

### Clone the repository

```bash
git clone https://github.com/learninghub44/chris-tech-hrms.git
cd chris-tech-hrms
```

### Install dependencies

```bash
npm install
```

### Start required services

```bash
npm run db:up
```

### Configure environment variables

Create environment files for both backend and frontend as needed. Example configuration depends on your deployment target and local database credentials.

> The repository does not currently include a standardized `.env.example` file, so copy the relevant environment variables from your deployment or local setup.

## 🛠️ Development Commands

### Run full workspace locally

```bash
npm run dev
```

This runs both backend and frontend concurrently.

### Backend commands

```bash
npm run dev:backend
npm run build --workspace backend
npm run start --workspace backend
npm run typecheck --workspace backend
npm run test:smoke --workspace backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run db:seed
```

### Frontend commands

```bash
npm run dev:frontend
npm run build --workspace frontend
npm run start --workspace frontend
npm run lint --workspace frontend
npm run typecheck --workspace frontend
```

### Full verification

```bash
npm run verify
```

## 🗄️ Database Setup

Use Docker Compose to provision PostgreSQL locally:

```bash
npm run db:up
```

Once the database is available, run Prisma migrations and seeding:

```bash
npm run setup:db
```

To stop local database services:

```bash
npm run db:down
```

## 📘 Documentation

- `docs/multi-tenant-design.md` — multi-tenant strategy and architectural decisions
- `MULTI_TENANT_ROADMAP.md` — phased implementation plan for multi-tenant platform migration

## 🚧 Deployment

Deployment is configured for cloud environments. Refer to `render.yaml` for Render-specific deployment settings, and the frontend package for Cloudflare/OpenNext targets.

## 🤝 Contribution Guidelines

This project follows a workspace-first workflow with feature branches and pull requests.

Recommended process:

1. Create a branch from `main`
2. Implement changes in the relevant package (`frontend` or `backend`)
3. Run `npm run typecheck && npm run lint && npm run build && npm run test:smoke`
4. Open a PR with a clear description and testing notes

## 📌 Notes

- The repository is currently private/unlicensed and maintained by Chris Tech / Zetu Business Solutions.
- `package.json` declares the workspace packages and core scripts for coordinated development.
- The platform is designed to be extended with tenant-aware role-based access controls and cross-company isolation.

## 📄 License

This repository is proprietary. See `LICENSE` for full terms.

## 📫 Contact

Author: Chris Tech / Zetu Business Solutions
- Website: https://www.christech.co.ke
- Email: chrisodhiambo958@gmail.com
