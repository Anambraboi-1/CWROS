# CWROS System

Operations dashboard MVP with a React client and Express API. It includes JWT authentication, role-aware API authorization, PostgreSQL operation records, live Socket.IO metrics, Dockerized PostgreSQL/Redis, and a simulated operation executor.

## Run locally

1. Copy `.env.example` to `.env` and set a secure `JWT_SECRET`.
2. Run `docker compose up -d db redis`.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:5173` and sign in with `admin@cwros.com` / `password`.

The seeded password is deliberately for local development only. Change or remove it before deployment.
