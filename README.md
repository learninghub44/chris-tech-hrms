# HRMS - Full-Stack Human Resource Management System

HRMS is a production-style human resource management platform built with Next.js, Express, Prisma, and PostgreSQL. It combines core HR workflows into one role-based web application: employees, attendance, leave, payroll, recruitment, performance management, notifications, announcements, and reports.

This project is designed as a portfolio-grade full-stack application. It demonstrates product thinking, scalable data modeling, permission-aware UX, typed API development, database migrations, and practical validation tooling.

## Dashboard Screen

![Dashboard screen](frontend/src/assets/dashboard.png)

## Key Features

### Authentication and Authorization

- Login, registration, logout, forgot password, and reset password flows
- JWT-based sessions
- Role and permission support for Super Admin, HR Admin, Manager, and Employee
- Protected pages on the frontend and authorization middleware on the backend

### Employee Operations

- Employee records with departments, designations, managers, status, joining dates, and contact details
- Department and designation management
- Employee profile and self-service access
- Emergency contact and document metadata support

### Attendance and Leave

- Clock in and clock out workflows
- Attendance history, filters, shift settings, and holiday management
- Leave application, approvals, rejection, balances, and leave type configuration

### Payroll

- Salary setup with allowances and deductions
- Payroll generation
- Payslip records and download response support
- Payroll reports

### Recruitment

- Job opening management
- Candidate tracking
- Applications, interviews, and offers
- Candidate and job detail views

### Performance Management

- Goals
- Performance reviews
- Feedback
- Appraisal history

### Dashboard, Reports, and Notifications

- Role-aware dashboard summary
- Notifications and announcements
- Employee, attendance, leave, and payroll reports
- Cached and prefetched navigation data for faster tab switching

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| Client State | TanStack Query |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Security | JWT, Helmet, CORS, password hashing |
| Performance | React Query caching, route prefetching, optional Redis cache, Prisma indexes |
| Tooling | npm workspaces, Docker Compose, ESLint |

## Architecture

```text
Browser
  |
  v
Next.js App Router frontend
  |
  v
Express REST API
  |
  +-- Authentication middleware
  +-- Authorization middleware
  +-- Domain route modules
  +-- Shared pagination/cache utilities
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

## Repository Structure

```text
HRMS/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- scripts/
|   |   `-- smoke-test.ts
|   |-- src/
|   |   |-- config/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- modules/
|   |   |-- types/
|   |   `-- utils/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- providers/
|   |   `-- types/
|   `-- package.json
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Local Demo Accounts

After seeding the database, use these local-only accounts:

```text
Super Admin
Email: admin@hrms.local
Password: Admin@12345

HR Admin
Email: hr@hrms.local
Password: Hr@12345

Manager
Email: manager@hrms.local
Password: Manager@12345

Employee
Email: employee@hrms.local
Password: Employee@12345

Employee - Ankit Kumar
Email: ankit@hrms.local
Password: Employee@12345
```

Suggested demo flow:

1. Sign in as `admin@hrms.local`.
2. Open the dashboard and switch between sidebar modules to review the role-aware HR workspace.
3. Review employee management, attendance, leave approvals, payroll, recruitment, performance, and reports.
4. Sign in as `manager@hrms.local` to review team-level permissions.
5. Sign in as `employee@hrms.local` or `ankit@hrms.local` to compare the limited self-service experience.

These credentials are for local development only. Replace demo users and secrets before any production deployment.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop, or a local PostgreSQL instance

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Files

Windows:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Review the copied files before starting the app:

- `backend/.env` controls the API port, CORS origin, database URL, JWT settings, optional Redis cache, and seeded demo passwords.
- `frontend/.env.local` points the Next.js app at the backend API through `NEXT_PUBLIC_API_URL`.
- For local development, you can keep `REDIS_URL` empty.
- Before deploying anywhere outside local development, replace `JWT_SECRET` and all demo seed passwords.

Default local services:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api
Database: postgresql://postgres:postgres@localhost:5432/hrms?schema=public
```

### 3. Start PostgreSQL

With Docker Desktop running:

```bash
npm run db:up
```

If you use your own PostgreSQL instance, create a database named `hrms` and update `DATABASE_URL` in `backend/.env`.

### 4. Prepare the Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

For a fresh Docker-based setup, this shortcut starts PostgreSQL, runs migrations, and seeds data:

```bash
npm run setup:db
```

### 5. Start the Application

```bash
npm run dev
```

Open:

```text
Frontend: http://localhost:3000
Backend health: http://localhost:5000/api/health
```

Use the demo accounts listed above after the seed step completes.

### 6. Validate the Setup

Run these checks from the repository root:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:smoke
```

For the full validation sequence:

```bash
npm run verify
```

The smoke test starts the backend on a temporary port, connects to the configured database, and verifies core authentication, employee, attendance, leave, payroll, dashboard, reporting, recruitment, and performance flows.

### Useful Local Commands

```bash
npm run dev:frontend
npm run dev:backend
npm run db:status
npm run db:down
```

Stop the development servers with `Ctrl+C`. Use `npm run db:down` to stop the Docker PostgreSQL container without deleting the database volume.

### Troubleshooting

- If `npm run db:up` fails, make sure Docker Desktop is running and port `5432` is available.
- If Prisma cannot connect, confirm `DATABASE_URL` in `backend/.env` matches the database you started.
- If login fails for the demo accounts, rerun `npm run db:seed` after migrations finish.
- If the frontend cannot reach the API, confirm `NEXT_PUBLIC_API_URL` is `http://localhost:5000/api` and the backend is running.



## Future Improvements

- Add hosted demo URL and screenshots
- Add chart visualizations for reports
- Add audit logs for HR and payroll-sensitive actions
- Add production email delivery for password reset and notifications
- Add file storage integration for employee documents
- Add CI workflow for typecheck, lint, build, and smoke tests

## Author

Ankit Kumar
