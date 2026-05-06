# Environment Variables

This document lists environment variables used by the backend and the mobile client.

## Backend (`backend/`)

From `render.yaml` (and expected `.env` usage in `backend/src/config/env.ts`).

- `PORT` (number) – server port. Default in Render blueprint: `4000`.
- `MONGODB_URI` (string) – MongoDB connection string.
- `JWT_SECRET` (string) – secret used to sign JWTs.
- `CLIENT_URL` (string, supports wildcard) – CORS origin.
- `NODE_ENV` – environment mode.
- `NODE_VERSION` – Render blueprint setting.

## Mobile (`mobile/`)

The mobile app reads API URL from its environment.

- `EXPO_PUBLIC_API_URL` (string)
  - Example (Render): `https://skillswapp-xz6d.onrender.com`
  - Example (local): `http://localhost:4000`

> If you test on a physical Android device with local backend, replace `localhost` with your machine’s LAN IP.

