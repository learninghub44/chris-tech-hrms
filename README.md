# HRMS - Full-Stack Human Resource Management System

HRMS is a production-style human resource management platform built with Next.js, Express, Prisma, and PostgreSQL. It combines core HR workflows into one role-based web application: employees, attendance, leave, payroll, recruitment, performance management, notifications, announcements, and reports.

This project is designed as a portfolio-grade full-stack application. It demonstrates product thinking, scalable data modeling, permission-aware UX, typed API development, database migrations, and practical validation tooling.

## Recruiter Snapshot

| Area | What This Project Shows |
| --- | --- |
| Product engineering | Multi-module HR platform with real admin, manager, and employee workflows |
| Full-stack depth | Next.js frontend, Express REST API, Prisma ORM, PostgreSQL, Docker setup |
| Security mindset | JWT authentication, protected frontend routes, backend authorization middleware |
| Data modeling | Employees, departments, attendance, leave, payroll, hiring, reviews, goals, and notifications |
| Performance | React Query caching, route/data prefetching, pagination, optional Redis-backed caching, Prisma indexing |
| Code quality | TypeScript across the stack, reusable helpers, validation, structured API responses, smoke tests |

## Resume Highlights

- Built a role-based HRMS covering employee operations, attendance, leave, payroll, recruitment, and performance workflows.
- Implemented JWT authentication with server-side permission checks and protected client-side routes.
- Designed a relational PostgreSQL schema with Prisma migrations and seeded demo data.
- Added reusable pagination, API response utilities, async handlers, and modular route organization.
- Improved frontend responsiveness with route prefetching, data prefetching, React Query cache tuning, and faster sidebar navigation.
- Added a light-only public auth experience while keeping dark mode available after login.
- Included smoke-test coverage for critical backend workflows and npm workspace scripts for repeatable validation.

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

Default local services:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api
Database: postgresql://postgres:postgres@localhost:5432/hrms?schema=public
```

Redis is optional. Leave `REDIS_URL` empty for local development without Redis.

### 3. Start PostgreSQL

```bash
npm run db:up
```

### 4. Prepare the Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
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

## Useful Commands

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run typecheck
npm run lint
npm run build
npm run test:smoke
npm run verify
npm run db:up
npm run db:down
npm run db:status
npm run setup:db
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run test:smoke
```

The backend smoke test covers core flows such as health checks, login, current user, unauthenticated rejection, employee RBAC, employee details, attendance clock in/out, leave approval, salary update, payroll generation, dashboard summary, notifications, announcements, reports, password reset response, recruitment endpoints, performance endpoints, and API validation.

## API Surface

```text
/api/auth
/api/employees
/api/departments
/api/designations
/api/attendance
/api/shifts
/api/holidays
/api/leaves
/api/leave-types
/api/payroll
/api/reports
/api/notifications
/api/announcements
/api/jobs
/api/candidates
/api/applications
/api/interviews
/api/offers
/api/goals
/api/performance-reviews
/api/feedback
```

## Why This Project Is Interview-Relevant

- It is larger than a CRUD demo and models several connected business domains.
- The UI changes based on user permissions instead of exposing the same dashboard to every user.
- Backend authorization is enforced server-side, not only hidden in the frontend.
- The database can be recreated from migrations and seeded for repeatable demos.
- Performance work is practical: cached queries, route prefetching, pagination, and database indexes.
- The repository includes real local setup and validation commands a reviewer can run.

## Future Improvements

- Add hosted demo URL and screenshots
- Add chart visualizations for reports
- Add audit logs for HR and payroll-sensitive actions
- Add production email delivery for password reset and notifications
- Add file storage integration for employee documents
- Add CI workflow for typecheck, lint, build, and smoke tests

## Author

Ankit Kumar
