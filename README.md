# Assignment Project

This is a full-stack task management app with:
- `frontend`: React (Create React App)
- `backend`: Express + TypeScript + Prisma + PostgreSQL

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database

## Project Setup

1. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Create environment variables for the backend in `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
PORT=5000
```

3. Initialize Prisma and run migrations (from `backend`):

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

## Run the Project (Development)

1. Start backend server:

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

2. Start frontend app in a second terminal:

```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`.
API calls are proxied to backend through the frontend `proxy` setting.

## Production Build

Backend build:

```bash
cd backend
npm run build
```

Frontend build:

```bash
cd frontend
npm run build
```

## Notes

- If you get `DATABASE_URL is not set`, confirm `backend/.env` exists and includes a valid `DATABASE_URL`.
- Default backend port is `5000` if `PORT` is not set.
