# HR Management System

A full-stack, role-based HR Management System built with Next.js, Express, Prisma, and PostgreSQL. The project brings core HR workflows into one web application: employee records, attendance, leave, payroll, recruitment, performance management, notifications, announcements, and reporting.

This repository is designed to show practical product engineering: a real data model, protected workflows, role-aware UI, reusable API patterns, and an end-to-end local setup.

## Why This Project Stands Out

- Built as a production-style HR operations platform, not a static dashboard.
- Uses JWT authentication and permission-based access control across frontend and backend.
- Covers multiple business domains: employees, attendance, leave, payroll, recruitment, performance, and reports.
- Includes Prisma migrations and seed data for a repeatable local demo.
- Uses typed frontend and backend code with validation, protected routes, and reusable API helpers.
- Includes smoke-test coverage for critical backend workflows.

## Recruiter-Friendly Summary

| Area | What It Demonstrates |
| --- | --- |
| Full-stack engineering | Next.js frontend, Express API, PostgreSQL database, Prisma ORM |
| Product thinking | HR workflows organized around real users: HR admins, managers, and employees |
| Authorization | Role and permission checks for protected pages and API endpoints |
| Data modeling | Employees, departments, payroll, leaves, attendance, jobs, candidates, reviews, and more |
| Frontend craft | Responsive dashboard, protected app shell, forms, API state caching, polished login/signup UI |
| Backend craft | Modular routes, middleware, async handlers, API response utilities, validation, smoke tests |

## Features

### Authentication and Access

- Login, registration, logout, forgot password, and reset password flows
- JWT-based session handling
- Role-based permissions for Super Admin, HR Admin, Manager, and Employee
- Protected frontend routes and backend authorization middleware

### Employee Management

- Employee records with departments, designations, managers, status, joining date, and contact details
- Department and designation management
- Emergency contact and employee document metadata support
- Employee profile and self-service access

### Attendance and Time

- Clock in and clock out workflows
- Attendance records by employee and date
- Shift configuration
- Holiday management
- Attendance reports and filters

### Leave Management

- Leave type configuration
- Leave application flow
- Manager/HR approval and rejection flow
- Leave balances and leave history

### Payroll

- Salary setup with allowances and deductions
- Payroll generation
- Payslip records and download response support
- Payroll reports

### Dashboard, Notifications, and Reports

- Role-aware dashboard summary
- Notifications and announcements
- Employee, attendance, leave, and payroll reports
- Optimized frontend data caching for faster navigation

### Recruitment

- Job opening management
- Candidate tracking
- Applications, interviews, and offers
- Candidate detail pages

### Performance Management

- Goals
- Performance reviews
- Feedback
- Appraisal history

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| API State | TanStack Query |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Security | JWT, Helmet, CORS, password hashing |
| Tooling | npm workspaces, Docker Compose, ESLint |

## Architecture

```text
Browser
  |
  v
Next.js Frontend
  |
  v
Express REST API
  |
  +-- Auth middleware
  +-- Permission middleware
  +-- Domain route modules
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
|   |   |-- lib/
|   |   |-- providers/
|   |   `-- types/
|   `-- package.json
|-- docker-compose.yml
|-- package.json
|-- plan.md
`-- README.md
```

## Local Demo Account

After running the seed command, the local demo account is:

```text
Email: admin@hrms.local
Password: Admin@12345
```

This is for local development only. Change seeded credentials and secrets before any production deployment.

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

Create the backend environment file from the example:

```bash
copy backend\.env.example backend\.env
```

Create the frontend environment file from the example:

```bash
copy frontend\.env.example frontend\.env.local
```

Default local values are configured for:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api
Database: postgresql://postgres:postgres@localhost:5432/hrms?schema=public
```

### 3. Start PostgreSQL

```bash
npm run db:up
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Migrations

```bash
npm run prisma:migrate
```

### 6. Seed Demo Data

```bash
npm run db:seed
```

### 7. Start the App

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

The project includes practical validation commands:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:smoke
```

The backend smoke test verifies key workflows including health checks, login, current user, unauthenticated rejection, employee RBAC, employee details, document metadata upload, attendance clock in/out, leave approval, salary update, payroll generation, dashboard summary, notifications, announcements, reports, password reset response, recruitment endpoints, performance endpoints, and API validation.

## API Modules

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
/api/jobs
/api/candidates
/api/applications
/api/interviews
/api/offers
/api/goals
/api/performance-reviews
/api/feedback
```

## Database Coverage

The Prisma schema models the main HRMS domain:

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
Salary
Payroll
Payslip
EmployeeDocument
Notification
Announcement
Job
Candidate
JobApplication
Interview
Offer
Goal
PerformanceReview
Feedback
```

## Engineering Notes

- Frontend routes are protected by session and permission checks.
- Backend routes enforce authentication and authorization server-side.
- API responses use a consistent success/error shape.
- React Query caches API responses to reduce repeated network work and improve navigation speed.
- Prisma migrations keep the database schema reproducible.
- Generated folders such as `.next/`, `dist/`, and `node_modules/` are intentionally ignored.

## Future Improvements

- Add hosted demo URL and screenshots
- Add chart visualizations for reports
- Add audit logs for HR/payroll-sensitive actions
- Add email delivery for production password reset and notifications
- Add file storage integration for employee documents
- Add CI workflow for typecheck, lint, build, and smoke tests

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).

## Author

Ankit Kumar
