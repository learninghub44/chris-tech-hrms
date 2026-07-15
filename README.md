# HRMS - Full-Stack Human Resource Management System

HRMS is a full-stack human resource management platform built with Next.js, Express, Prisma, PostgreSQL, Socket.IO, and Groq AI. It brings core HR workflows into one role-based web application: employee records, attendance, leave, payroll, recruitment, performance management, announcements, notifications, reports, and an AI HR assistant.

The project is designed as a portfolio-grade HR product. It demonstrates typed API development, relational data modeling, role-based access control, real-time event delivery, LLM tool use, responsive frontend work, and practical validation tooling.

## Dashboard Screen

![Dashboard screen](frontend/src/assets/dashboard.png)

## Current Feature Set

### Authentication And Permissions

- Login, registration, logout, forgot password, and reset password
- JWT-based API sessions
- Role and permission support for Super Admin, HR Admin, Manager, and Employee
- Backend authorization middleware and frontend protected pages
- Role-aware sidebar navigation and route access

### Employee Operations

- Employee CRUD with employee code, status, contact details, joining and exit dates
- Department and designation management
- Manager/reporting relationships
- Employee profile self-service
- Emergency contacts and employee document metadata

### Attendance And Time

- Clock in and clock out
- Work mode support for office and work-from-home
- Attendance history and HR attendance reports
- Shift settings with late and half-day thresholds
- Holiday management

### Leave Management

- Leave type setup
- Employee leave applications
- Manager/HR approval and rejection workflows
- Leave balance tracking by employee, leave type, and year
- Automatic balance updates for pending, approved, and rejected leave
- Real-time leave notifications

### Payroll

- Salary setup with base salary, allowances, deductions, and effective dates
- Monthly payroll generation
- Payroll items and employee payslip records
- Payslip download response support
- Payroll reports
- Real-time payslip notifications

### Recruitment

- Job opening management
- Candidate profiles
- Job applications
- Interview scheduling
- Offer tracking
- Real-time interviewer notifications when interviews are scheduled

### Performance Management

- Goals
- Performance reviews
- Feedback
- Appraisal history
- Employee and manager scoped performance views

### Dashboard, Reports, Notifications, And Announcements

- Role-aware dashboard summary
- Employee, attendance, leave, and payroll reports
- In-app notifications with read state
- Published announcements by audience
- Socket.IO real-time notification delivery per user
- TanStack Query cache updates without page refresh
- Optional Redis dashboard caching

### AI HR Assistant

- Floating HR assistant chat widget
- Groq API integration (OpenAI-compatible chat completions)
- Tool-calling style HR functions backed by real data:
  - `get_leave_balance`
  - `get_next_payroll`
  - `get_manager`
- Answers are scoped to the authenticated employee
- If Groq is not configured, the API returns a clear setup hint

### Frontend Experience

- Responsive App Router frontend
- Mobile-friendly navbar and sidebar
- Compact glossy AI chat widget
- Route prefetching and data prefetching for faster navigation
- Text wrapping and responsive layout improvements across pages

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
| Realtime | Socket.IO |
| AI | Groq API with function/tool orchestration |
| Validation | Zod |
| Security | JWT, Helmet, CORS, password hashing |
| Cache | Optional Redis cache |
| Tooling | npm workspaces, Docker Compose, ESLint, TypeScript |

## Architecture

```text
Browser
  |
  |-- REST requests with JWT
  |-- Socket.IO connection with JWT auth
  v
Next.js App Router frontend
  |
  |-- TanStack Query cache
  |-- Realtime notification subscriber
  |-- HR assistant widget
  v
Express API
  |
  |-- Authentication middleware
  |-- Authorization middleware
  |-- Domain route modules
  |-- Socket.IO user rooms
  |-- Groq HR assistant tool calls
  |-- Optional Redis cache
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
|   |   |   |-- cache.ts
|   |   |   |-- prisma.ts
|   |   |   `-- realtime.ts
|   |   |-- middleware/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- attendance/
|   |   |   |-- dashboard/
|   |   |   |-- employees/
|   |   |   |-- hr-assistant/
|   |   |   |-- leaves/
|   |   |   |-- notifications/
|   |   |   |-- payroll/
|   |   |   |-- performance/
|   |   |   |-- recruitment/
|   |   |   `-- reports/
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
2. Review the dashboard, employees, attendance, leave approvals, payroll, recruitment, performance, reports, notifications, and announcements.
3. Generate or approve a workflow item and watch notifications update without refresh.
4. Sign in as `manager@hrms.local` to review team-level access.
5. Sign in as `employee@hrms.local` or `ankit@hrms.local` to compare self-service access and test the HR assistant.

These credentials are for local development only. Replace demo users and secrets before any production deployment.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop, or a local PostgreSQL instance
- Optional: Groq API key for the HR assistant

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

- `backend/.env` controls the API port, CORS origin, database URL, JWT settings, optional Redis cache, Groq settings, Prisma settings, and seeded demo passwords.
- `frontend/.env.local` points the Next.js app at the backend API through `NEXT_PUBLIC_API_URL`.
- Add `GROQ_API_KEY=<your-groq-key>` to `backend/.env` if you want the HR assistant to answer with Groq.
- Keep real API keys out of `.env.example` and out of commits.
- For local development, leave `REDIS_URL` empty unless you are running Redis.
- Before production, replace `JWT_SECRET` and all demo seed passwords.

Default local services:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api
Socket.IO: http://localhost:5000
Database: postgresql://postgres:postgres@localhost:5432/hrms?schema=public
```

### 3. Start PostgreSQL

With Docker Desktop running:

```bash
npm run db:up
```

If you use your own PostgreSQL instance, create a database named `hrms` and update `DATABASE_URL` in `backend/.env`.

### 4. Prepare The Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

For a fresh Docker-based setup, this shortcut starts PostgreSQL, runs migrations, and seeds data:

```bash
npm run setup:db
```

### 5. Start The Application

Run both backend and frontend:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Open:

```text
Frontend: http://localhost:3000
Backend health: http://localhost:5000/api/health
```

Use the demo accounts listed above after the seed step completes.

### 6. Validate The Setup

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

The smoke test starts the backend on a temporary port, connects to the configured database, and verifies authentication, RBAC, employee, attendance, leave, payroll, dashboard, notifications, announcements, reports, recruitment, and performance endpoints.

## Where Saved Data Lives

All application data is saved in PostgreSQL through Prisma. The default Docker database is:

```text
Host: localhost
Port: 5432
Database: hrms
User: postgres
Password: postgres
Schema: public
```

Ways to inspect saved data:

- Use pgAdmin, DBeaver, TablePlus, or any PostgreSQL client with the connection above.
- Run Prisma Studio:

```bash
cd backend
npx prisma studio
```

- Use `psql` if it is installed:

```bash
psql "postgresql://postgres:postgres@localhost:5432/hrms?schema=public"
```

Important tables include `users`, `employees`, `attendance`, `leave_requests`, `leave_balances`, `payrolls`, `payslips`, `jobs`, `candidates`, `interviews`, `goals`, `performance_reviews`, `feedback`, `notifications`, and `announcements`.

## Realtime Notifications

Socket.IO is attached to the same backend server as Express.

- The frontend connects to `http://localhost:5000` when `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
- The socket handshake uses the logged-in user's JWT.
- The backend joins each connection to a private `user:<userId>` room.
- Workflow events emit only to the affected user.
- The frontend updates TanStack Query cache for notifications and dashboard summary.

Realtime events are currently emitted for:

- Leave request auto-approval
- Leave approval and rejection
- Payslip generation
- Interview scheduling
- Published announcements
- Marking notifications as read

## HR Assistant

The HR assistant is available as a floating chat widget after login. It uses Groq and server-side HR tools to answer employee questions from real data.

Example questions:

```text
How many leaves do I have left?
When is my next payroll?
Who is my manager?
```

Setup:

1. Add `GROQ_API_KEY=<your-groq-key>` to `backend/.env`.
2. Keep `GROQ_MODEL` and `GROQ_MAX_OUTPUT_TOKENS` from `.env.example`, or adjust them.
3. Restart the backend after changing `.env`.

If the key is missing, the assistant API returns `GROQ_NOT_CONFIGURED` with a setup hint.

## Useful Local Commands

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run db:status
npm run db:down
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Stop development servers with `Ctrl+C`. Use `npm run db:down` to stop the Docker PostgreSQL container without deleting the database volume.

## Troubleshooting

- If `npm run db:up` fails, make sure Docker Desktop is running and port `5432` is available.
- If Prisma cannot connect, confirm `DATABASE_URL` in `backend/.env` matches the database you started.
- If login fails for demo accounts, rerun `npm run db:seed` after migrations finish.
- If the frontend cannot reach the API, confirm `NEXT_PUBLIC_API_URL` is `http://localhost:5000/api` and the backend is running.
- If `npm run dev:frontend` fails with `EADDRINUSE` on port `3000`, another Next.js process is already running. Stop it or use the already-running `http://localhost:3000`.
- If `npm run dev:backend` fails with `EADDRINUSE` on port `5000`, another backend process is already running. Stop it or update `PORT` in `backend/.env`.
- If the HR assistant says it is not configured, set `GROQ_API_KEY` in `backend/.env` and restart the backend.
- If realtime notifications do not update, verify the backend is running on the same origin implied by `NEXT_PUBLIC_API_URL` and that the user is logged in with a valid token.

## Deployment

This repo is set up for a split deployment:

```text
Backend: Render web service
Database: Neon PostgreSQL
Frontend: Vercel Next.js project
```

### Backend On Render

The root `render.yaml` creates:

- `hrms-backend`: Node web service

In Render, create a new Blueprint from this repository. Render will read `render.yaml` from the repo root.

When Render prompts for environment variables, set:

```text
CORS_ORIGIN=https://<your-vercel-project>.vercel.app
DATABASE_URL=<your-neon-postgres-connection-string>
```

If you have production, preview, or custom frontend domains, set them as a comma-separated list:

```text
CORS_ORIGIN=https://<your-vercel-project>.vercel.app,https://<your-custom-domain>
```

If you do not know the Vercel URL yet, use the expected project URL first, deploy Vercel, then update `CORS_ORIGIN` in Render and redeploy the backend.

Render manages these automatically from `render.yaml`:

```text
JWT_SECRET=<generated by Render>
NODE_VERSION=20
```

Optional backend environment variables:

```text
GROQ_API_KEY=<your-groq-key>
REDIS_URL=<render-key-value-or-redis-url>
```

The Render backend commands are:

```bash
npm ci && npm run prisma:generate --workspace backend && npm run build --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run start --workspace backend
```

After the backend deploys, verify:

```text
https://<your-render-service>.onrender.com/api/health
```

Do not run the demo seed against production unless you intentionally want the local demo users and employees. If you need to seed a local development database, run:

```bash
npm run db:seed --workspace backend
```

For production, use your Neon data as the source of truth and manage records through the app or Neon dashboard.

### Frontend On Vercel

In Vercel, import the same repository and configure the project:

```text
Root Directory: frontend
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

Add this environment variable in Vercel Project Settings:

```text
NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api
```

Deploy the frontend. After deployment, copy the production Vercel URL and make sure Render's backend has the exact same origin in `CORS_ORIGIN`, without a trailing slash:

```text
CORS_ORIGIN=https://<your-vercel-project>.vercel.app
```

If you later add custom domains, update both sides:

```text
Vercel NEXT_PUBLIC_API_URL=https://<api-domain>/api
Render CORS_ORIGIN=https://<frontend-domain>
```

## Future Improvements

- Hosted demo URL and updated screenshots
- Production email delivery for password reset and HR notifications
- File storage integration for employee documents and generated files
- Audit logs for HR, payroll, and permission-sensitive actions
- Charts and exports for reports
- CI workflow for typecheck, lint, build, and smoke tests
- WebSocket scaling with a Socket.IO Redis adapter
- Rate limiting and observability for production API usage

## Author

Ankit Kumar
