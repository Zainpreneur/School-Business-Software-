# EduManage — School Management Business Software

A full-stack school management system covering academics, attendance, exams/grading,
fee & invoice management, expenses, staff/parent accounts, and a business dashboard.

## Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth (access + rotating refresh tokens), Zod validation
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router, Recharts, React Hot Toast
- **Auth**: Role-based access control — `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `ACCOUNTANT`, `STUDENT`, `PARENT`

## Features

- **Students**: enrollment, profiles, guardian linking, search & pagination
- **Teachers/Staff**: accounts, subject assignments, employee codes
- **Classes & Sections**: grades, sections, room/capacity, subject assignment
- **Attendance**: daily student attendance (present/absent/late/excused/half-day) with per-section bulk marking, and staff attendance
- **Timetable**: weekly class schedule slots with teacher clash prevention
- **Exams & Report Cards**: exam scheduling per section/subject, marks entry, auto-computed letter grades, aggregated report cards
- **Fees & Invoicing**: reusable fee structures, invoices with discount/tax, partial/multiple payments, auto status transitions (issued → partially paid → paid)
- **Expenses**: categorized operating expense log (salaries, utilities, maintenance, etc.)
- **Announcements**: role-targeted school-wide notices
- **Dashboard**: student/teacher/class counts, today's attendance breakdown, monthly revenue vs. expenses, outstanding dues, 6-month finance trend chart
- **User management**: admin can activate/deactivate accounts, create admin/accountant/parent users

## Project Structure

```
server/   Express + Prisma API (see server/README instructions below)
client/   React + Vite SPA
docker-compose.yml   Local PostgreSQL for development
```

## Getting Started

### 1. Database

```bash
docker compose up -d      # starts Postgres on localhost:5432
```

(Or point `DATABASE_URL` at any PostgreSQL 14+ instance you already have.)

### 2. Backend

```bash
cd server
cp .env.example .env      # adjust DATABASE_URL / JWT secrets as needed
npm install
npm run prisma:migrate    # creates tables
npm run seed              # creates a super admin + sample subjects/classes
npm run dev                # http://localhost:4000
```

Default super admin (created by the seed script): `admin@school.test` / `Admin@123`
— change this password immediately in a real deployment.

### 3. Frontend

```bash
cd client
npm install
npm run dev                # http://localhost:5173 (proxies /api to :4000)
```

Log in with the seeded admin account, then create teachers, classes/sections, and
students from the UI. Use the **Users** page to create additional Admin, Accountant,
or Parent accounts; teacher accounts are created from the **Teachers** page.

## API Overview

All endpoints are prefixed with `/api` and (except `/auth/login` and `/auth/refresh`)
require an `Authorization: Bearer <accessToken>` header. Refresh tokens are stored as
an httpOnly cookie and rotated on every refresh.

| Resource | Base path |
| --- | --- |
| Auth | `/api/auth` |
| Students | `/api/students` |
| Teachers | `/api/teachers` |
| Classes / Sections / Subjects | `/api/academics` |
| Attendance | `/api/attendance` |
| Timetable | `/api/timetable` |
| Exams & Results | `/api/exams` |
| Fee structures / Invoices / Payments / Expenses | `/api/finance` |
| Announcements | `/api/announcements` |
| Dashboard | `/api/dashboard` |
| Users | `/api/users` |

## Production Notes

- Set strong, unique `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` values and a real `DATABASE_URL`.
- Run `npm run build && npm start` in `server/` (compiles TypeScript to `dist/`).
- Run `npm run build` in `client/` and serve the generated `dist/` behind your web server / reverse proxy of choice, forwarding `/api` to the backend.
- Consider adding a background job to flag overdue invoices, and file storage (e.g. S3) for the `Document` model if you extend student document uploads.
