# Train Schedule Backend

Backend service for working with train schedules. Built with NestJS 11, TypeORM (PostgreSQL), authentication via JWT in an httpOnly cookie, user roles (admin, user), and global rate limiting.

- Base URL: http://localhost:4000/api/v1
- Health check: GET /api/v1/health

## Tech Stack
- Node.js + TypeScript
- NestJS 11 (@nestjs/*)
- TypeORM 0.3 + PostgreSQL
- Passport (local, JWT)
- @nestjs/throttler (rate limiting)
- class-validator / class-transformer

## Requirements
- Node.js 18+ (recommended)
- pnpm 9+ (you can use npm/yarn, but examples use pnpm)
- A running PostgreSQL instance

## Installation
1. Clone the repository and cd into the project directory.
2. Install dependencies:
   - pnpm install

## Environment Setup
There is an environment variables template file in the project root: .env.sapmle (note: the filename is misspelled in the repo on purpose — it is actually .env.sapmle). Copy it to .env and fill in the values:

- DB_HOST — PostgreSQL host
- DB_PORT — PostgreSQL port (e.g., 5432)
- DB_USER — database user
- DB_PASSWORD — database password
- DB_NAME — database name
- PORT — HTTP server port (defaults to 4000)
- FRONTEND_URL — frontend URL for CORS, e.g., http://localhost:3000
- JWT_SECRET — secret used to sign JWTs
- JWT_EXPIRES_IN — token lifetime (e.g., 7d)
- JWT_COOKIE_MAX_AGE — cookie lifetime in milliseconds (e.g., 604800000)
- ADMIN_EMAIL — email for the initial admin
- ADMIN_PASSWORD — password for the initial admin
- ADMIN_FIRST_NAME — admin first name (optional)
- ADMIN_LAST_NAME — admin last name (optional)

TypeORM connects to PostgreSQL with synchronize: true (auto create/update schema). For production, it is recommended to disable synchronize and use migrations.

CORS is enabled. Allowed origins: FRONTEND_URL, http://localhost:3000, http://localhost:4000. Cookies are issued as httpOnly; in production sameSite=none and secure=true.

## Running
- Development (watch):
  - pnpm start:dev
- Regular run (one-off):
  - pnpm start
- Production build and run:
  - pnpm build
  - pnpm start:prod

After start, the app listens on PORT (default 4000) and uses a global route prefix /api/v1.

## Seed initial admin
Create the initial admin using the script that reads values from .env:
- pnpm seed:admin

Be sure to set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running. If a user with the same email already exists, another one won’t be created.

## Authentication and Authorization
- Login sets an httpOnly cookie named auth-token.
- Frontend requests must send cookies (credentials: include).
- Admin routes require the admin role. Public GET endpoints are available without auth.
- Rate limits: 5 requests per second and 120 per minute per client (global).

## API Overview
Below are the main routes. All paths start with /api/v1.

- Health
  - GET /health — server health check.

- Auth
  - POST /auth/sign-up — registration. Body: { firstName, lastName, email, password }.
  - POST /auth/login — login. Body: { email, password }. Response sets the auth-token cookie.
  - GET /auth/profile — returns the current user (requires JWT cookie).
  - POST /auth/logout — logout, clears the cookie.

- Users
  - GET /users/me — current user data; roles: user or admin.
  - GET /users — list users; role: admin.
  - POST /users — create user; role: admin. Body: { firstName, lastName, email, password, role? }.

- Stations
  - GET /stations — list stations (public).
  - POST /stations — create station; role: admin. Body: { code, name }.
  - DELETE /stations/:id — delete station; role: admin.

- Trips
  - GET /trips — list trips with pagination and filters. Query params:
    - page (number, >=1, default 1)
    - pageSize (1..100, default 20)
    - details (boolean, default false — if true, includes stops)
    - trainNo (string)
    - stationCode (string)
    - activeOnDate (YYYY-MM-DD)
    - sort=trainNo
  - GET /trips/search — search trips. Params: from, to, date (YYYY-MM-DD), time (HH:mm), limit (>=1, default 50).
  - GET /trips/:id — trip details.
  - POST /trips — create trip; role: admin. Body: { trainNo?, days[1..7], startDate, endDate, stops[ { stationCode, seq?, arrival?, departure?, platform? } ] }.
  - PUT /trips/:id — replace trip; role: admin.
  - PATCH /trips/:id — partial update; role: admin. Supported ops:
    - updateCalendar (trainNo?, days?, startDate?, endDate?)
    - addStop (afterSeq, stationCode, arrival?, departure?, platform?)
    - removeStop (seq)
    - moveStop (fromSeq, toSeq)
    - updateStop (targetSeq, newArrival?, newDeparture?, newPlatform?)
  - DELETE /trips/:id — delete; role: admin.

## Request examples
- Register user:
  - curl -X POST http://localhost:4000/api/v1/auth/sign-up \
    -H "Content-Type: application/json" \
    -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"123456"}'

- Login (save cookie to a file):
  - curl -X POST http://localhost:4000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d '{"email":"john@example.com","password":"123456"}'

- Get my profile (use cookie):
  - curl http://localhost:4000/api/v1/auth/profile -b cookies.txt

- Create station (admin):
  - curl -X POST http://localhost:4000/api/v1/stations \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d '{"code":"LVIV","name":"Lviv"}'

## Project structure (short)
- src/app.module.ts — root module, TypeORM, Throttler config, modules import.
- src/main.ts — bootstrap, global prefix /api/v1, CORS, validation.
- src/auth — authentication (JWT in auth-token cookie), guards, Passport strategies.
- src/users — users, roles (admin/user), use-cases.
- src/stations — stations.
- src/trips — trips and stop times, search, filters, CRUD.

## Lint & format
- Lint: pnpm lint
- Format: pnpm format

## Deployment tips
- Set NODE_ENV=production.
- Ensure CORS is configured for the correct FRONTEND_URL.
- Use secure HTTPS (cookie secure=true in production).
- Consider enabling migrations instead of synchronize for the DB.

