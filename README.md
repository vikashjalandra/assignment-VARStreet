# Assignment Project

## Project Description

This is a full-stack task management application with:
- A backend API for projects, tasks, comments, and dashboard summaries
- A frontend web app for managing projects and task workflows
- A PostgreSQL database managed through Prisma migrations

Workspace structure:
- `backend`: Express + TypeScript + Prisma
- `frontend`: React (Create React App)

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL (local or remote)
- A valid PostgreSQL connection string

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Create `backend/.env` with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
PORT=5000
```

## Apply Migrations

From the backend folder:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

## Run Backend and Frontend

1. Start backend (Terminal 1):

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

2. Start frontend (Terminal 2):

```bash
cd frontend
npm start
```

Frontend runs at `http://localhost:3000`.
The frontend proxy forwards API requests to backend port `5000`.

## Assumptions and Design Decisions

- PostgreSQL is the source of truth for application data.
- Prisma schema defines three core entities: `Project`, `Task`, and `Comment`.
- `Priority` and `Status` enums enforce consistent task values.
- Cascade delete behavior is intentional:
	- Deleting a project also deletes its tasks.
	- Deleting a task also deletes its comments.
- Backend validates database connectivity before serving requests.
- API routes are grouped by domain:
	- `/api/projects`
	- `/api/tasks`
	- `/api/comments`
	- `/api/dashboard`
- Frontend and backend run as separate apps in development, connected by proxy.
- Authentication is not implemented in the current version.
