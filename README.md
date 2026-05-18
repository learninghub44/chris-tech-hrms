# HR Management System

A full-stack HR Management System for managing employees, attendance, leave, payroll, recruitment, performance, notifications, and reports from one web application.

## Project Status

Phase 3 employee core code is implemented. The repository contains a Next.js frontend, an Express backend, Prisma setup, JWT authentication, password reset tokens, role-based pages, employee CRUD, departments, designations, emergency contacts, and local employee document uploads from [plan.md](./plan.md).

## Table Of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [User Roles](#user-roles)
- [Recommended Tech Stack](#recommended-tech-stack)
- [Architecture](#architecture)
- [Core Modules](#core-modules)
- [Suggested Project Structure](#suggested-project-structure)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [API Overview](#api-overview)
- [Database Entities](#database-entities)
- [Development Roadmap](#development-roadmap)
- [MVP Scope](#mvp-scope)
- [Testing Plan](#testing-plan)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is planned as a role-based HRMS for companies. It gives HR teams one place to manage employee data and gives employees a self-service portal for attendance, leave, documents, and payslips.

Detailed implementation phases are available in [plan.md](./plan.md).

## Main Features

- Authentication and role-based access control
- Employee management
- Department and designation management
- Employee document uploads
- Attendance clock in and clock out
- Shift and holiday management
- Leave requests and approvals
- Leave balance tracking
- Basic payroll generation
- Payslip download
- Dashboards and reports
- In-app notifications
- Email notifications
- Recruitment management
- Performance reviews

## User Roles

| Role | Access |
| --- | --- |
| Super Admin | Full system access, company settings, HR users, roles, permissions |
| HR Admin | Employees, attendance, leave, payroll, documents, recruitment |
| Manager | Team members, leave approvals, performance reviews |
| Employee | Own profile, attendance, leave requests, documents, payslips |

## Recommended Tech Stack

| Layer | Tool |
| --- | --- |
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| API State | TanStack Query |
| Charts | Recharts |
| Backend | Node.js with Express.js or NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Cache | Redis |
| File Storage | Cloudinary or S3 |
| Email | Nodemailer |
| Background Jobs | Cron jobs |

## Architecture

```mermaid
flowchart TD
    Web["Web App"] --> Frontend["Frontend UI"]
    Frontend --> API["Backend REST API"]
    API --> Auth["JWT Auth"]
    API --> RBAC["Role-Based Access"]
    RBAC --> Modules["HRMS Modules"]
    Modules --> DB[("PostgreSQL")]
    Modules --> Cache[("Redis")]
    API --> Files[("Cloudinary or S3")]
    Jobs["Cron Jobs"] --> Modules
    Modules --> Email["Email Notifications"]
```

## Core Modules

| Module | Description |
| --- | --- |
| Authentication | Login, register, forgot password, reset password, protected routes |
| Employee Management | Employees, departments, designations, emergency contacts, documents |
| Attendance | Clock in, clock out, daily records, shifts, holidays, reports |
| Leave | Leave types, leave requests, approvals, balances, history |
| Payroll | Salaries, allowances, deductions, payroll generation, payslips |
| Dashboard and Reports | HR summaries, charts, employee reports, attendance reports, payroll reports |
| Notifications | In-app alerts, email alerts, announcements |
| Recruitment | Jobs, candidates, applications, interviews, offers |
| Performance | Goals, reviews, ratings, feedback, appraisals |

## Suggested Project Structure

```text
HRMS/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- config/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- modules/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   |-- providers/
|   |   `-- types/
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- docker-compose.yml
|-- package.json
|-- plan.md
`-- README.md
```

## Environment Variables

Create environment files for the frontend and backend when the application is implemented.

Backend environment variables:

```env
NODE_ENV="development"
PORT="5000"
CORS_ORIGIN="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms?schema=public"
JWT_SECRET="replace-with-a-random-secret-at-least-32-characters"
JWT_EXPIRES_IN_SECONDS="86400"
PASSWORD_RESET_EXPIRES_IN_MINUTES="30"
SEED_ADMIN_PASSWORD="Admin@12345"
REDIS_URL="redis://localhost:6379"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

Frontend environment variables:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

## Local Setup

Run these commands from the repository root.

1. Install dependencies.

```bash
npm install
```

2. Generate the Prisma client.

```bash
npm run prisma:generate
```

3. Start PostgreSQL.

Use an existing local PostgreSQL server, or use the included compose file if Docker is installed:

```bash
npm run db:up
```

If `docker` is not recognized, install Docker Desktop or start a local PostgreSQL service manually. It must match `backend/.env`:

```text
postgresql://postgres:postgres@localhost:5432/hrms?schema=public
```

4. Create and migrate the PostgreSQL database.

```bash
npm run prisma:migrate
```

5. Seed base roles, permissions, departments, designations, and the phase 3 admin employee.

```bash
npm run db:seed
```

6. Start frontend and backend together.

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/api/health`
- Backend current user: `http://localhost:5000/api/auth/me`

## Useful Scripts

Recommended scripts once the frontend and backend are implemented:

Root:

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run db:up
npm run db:status
npm run db:down
npm run setup:db
npm run build
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Frontend workspace:

```bash
npm run dev
npm run build
npm run lint
```

Backend workspace:

```bash
npm run dev
npm run build
npm run typecheck
npx prisma migrate dev
npx prisma studio
```

## API Overview

Main API groups:

```text
/api/auth
/api/employees
/api/departments
/api/designations
/api/attendance
/api/leaves
/api/payroll
/api/reports
/api/notifications
/api/jobs
/api/candidates
/api/performance-reviews
```

Example routes:

```text
POST /api/auth/login
GET  /api/auth/me
GET  /api/employees
POST /api/employees
GET  /api/employees/:id
PUT  /api/employees/:id
DELETE /api/employees/:id
POST /api/employees/:id/documents
GET  /api/departments
POST /api/departments
GET  /api/designations
POST /api/designations
POST /api/attendance/clock-in
POST /api/attendance/clock-out
POST /api/leaves
PUT  /api/leaves/:id/approve
POST /api/payroll/generate
GET  /api/reports/attendance
```

## Database Entities

Main entities:

```text
User
Role
Permission
Employee
Department
Designation
Attendance
Shift
Holiday
LeaveRequest
LeaveType
LeaveBalance
Payroll
Salary
Payslip
Document
Job
Candidate
Application
Interview
Offer
PerformanceReview
Goal
Feedback
Notification
Announcement
```

## Development Roadmap

| Phase | Focus |
| --- | --- |
| Phase 0 | Requirements and project decisions |
| Phase 1 | Project foundation |
| Phase 2 | Authentication and role-based access |
| Phase 3 | Employee core |
| Phase 4 | Attendance management |
| Phase 5 | Leave management |
| Phase 6 | Basic payroll |
| Phase 7 | Dashboard, reports, and notifications |
| Phase 8 | Recruitment |
| Phase 9 | Performance management |
| Phase 10 | Testing, polish, and deployment |

## MVP Scope

The first usable version should include:

- Authentication
- Role-based access
- Employee management
- Departments and designations
- Attendance
- Leave management
- Basic payroll
- Basic dashboards
- Basic reports
- Notifications

Recruitment, performance management, advanced reports, mobile app support, and advanced automation can be added after the MVP.

## Testing Plan

Recommended tests:

- Authentication tests
- Role permission tests
- Employee CRUD tests
- Attendance workflow tests
- Leave approval tests
- Payroll calculation tests
- Report data tests
- API validation tests

## Deployment

Recommended deployment setup:

- Frontend on Vercel or Netlify
- Backend on Render, Railway, AWS, or DigitalOcean
- PostgreSQL on Supabase, Neon, RDS, or Railway
- Files on Cloudinary or S3
- Redis on Upstash, Railway, or a managed Redis provider

## Security Notes

- Hash passwords before storing them.
- Use JWT secrets from environment variables.
- Validate every API request.
- Check role permissions on the backend.
- Do not trust frontend-only authorization.
- Store uploaded files in a controlled storage service.
- Restrict document access by employee and role.
- Log important HR and payroll actions.

## Contributing

Before adding features, check [plan.md](./plan.md) and follow the phase order. Keep each pull request focused on one module or workflow.

## License

Add a license before publishing this project publicly.

## Authon
- Ankit Kumar Singh
