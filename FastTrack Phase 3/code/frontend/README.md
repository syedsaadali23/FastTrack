# FastTrack — FAST-NUCES × FSS Sports Management (Frontend)

React + Vite + TypeScript frontend for the Spring Boot backend (`/api/*`).

## Quick Start

```bash
npm install
cp .env.example .env   # edit if your backend isn't on http://localhost:8080
npm run dev
```

Open <http://localhost:5173>.

## Backend

This frontend talks to the Spring Boot backend that ships in the same repository (port `8080`). Start it with `mvn spring-boot:run` from `backend/`.

The backend seeds an admin: **username `Admin` / password `12345678`**.
The organizer registration code is **`yeagerist`**.

## Stack

React 18 · Vite 5 · TypeScript · TailwindCSS · React Router · React Hook Form + Zod · Axios · Sonner · Framer Motion · Recharts · Lucide.

## Auth Model

The backend has **no JWT/sessions**. On login, the response `{role, name}` is stored in `localStorage` along with the username; subsequent requests pass `username` as a query/body param exactly as each endpoint expects.

## Roles

- **PLAYER** — browse/register events, manage teams, notifications, profile
- **ORGANIZER** — create/manage events, send notification requests (admin approves), profile
- **ADMIN** — everything + approve/reject notification requests, broadcast directly, delete events
