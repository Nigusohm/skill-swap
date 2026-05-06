# SkillSwap Architecture

## 1. High-level overview

SkillSwap is a mobile-first student skills exchange platform.

- **Mobile client** (React Native + Expo) provides onboarding, browsing, and realtime chat UI.
- **Backend** (Node.js + Express) exposes REST APIs for authentication, profiles, skills/matches, chat, sessions, and ratings.
- **Realtime**: Socket.IO is present in the project dependencies. The currently checked-in chat implementation uses REST for message history and sending; realtime events can be added later on top of the same authorization rules.
- **Database**: MongoDB accessed through **Mongoose** models.

## 2. Components

### Client (`mobile/`)
- `mobile/src/api/client.ts` – API client configuration (axios).
- `mobile/src/context/AuthContext.tsx` – JWT storage and auth session lifecycle.
- `mobile/src/screens/*` – UI screens (Landing, Auth, Home/Matches, Chat, Profile, etc.).

### Server (`backend/`)
- `backend/src/index.ts` – app bootstrap (Express, middleware, route registration).
- `backend/src/routes/*` – REST endpoints grouped by domain.
- `backend/src/models/*` – Mongoose schemas.
- `backend/src/middleware/*` – authentication + error handling.
- `backend/src/utils/*` – domain utilities (e.g., matching logic).

## 3. Data flow

### 3.1 Authentication
1. Client calls:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
2. Backend validates inputs using **Zod**, hashes passwords with **bcryptjs**, and returns a **JWT**.

### 3.2 Authenticated requests
1. Client attaches:
   - `Authorization: Bearer <token>`
2. Protected routes extract `req.user.userId` via `backend/src/middleware/auth.ts`.
3. Backend responds with JSON derived from Mongoose documents.

### 3.3 Chat (current implementation)
The chat feature is implemented via REST endpoints:
- `GET /api/chats` (list chats + last message)
- `POST /api/chats/start` (create or find chat with a peer)
- `GET /api/chats/:chatId/messages` (message history)
- `POST /api/chats/:chatId/messages` (send message)

> Notes:
> - Socket.IO is available in dependencies, but the checked-in code uses REST for chat data.
> - Any future realtime events should mirror the same participant authorization checks used by the REST endpoints.

## 4. Security model

### JWT authentication
- JWT signing secret: `JWT_SECRET`.
- Token payload includes `{ userId, email }`.
- Protected routes use `backend/src/middleware/auth.ts`.

### Password security
- Passwords are never stored in plaintext.
- Registration hashes passwords with bcrypt (salt factor `10`).

### Authorization checks
- Chat endpoints verify the requester is a participant of the chat.
- Ratings enforce:
  - the session must be `COMPLETED`
  - the rater must be a session participant

## 5. Deployment

- Backend is deployed on **Render** using `render.yaml`.
- Health check endpoint: `/health`.
- Required secrets:
  - `MONGODB_URI`
  - `JWT_SECRET`

## 6. Contract-first documentation

This repository uses:
- **Mongoose schemas** as the source of truth for persisted data.
- **Zod** schemas inside route handlers for request validation.

Detailed references:
- `docs/SCHEMAS.md`
- `docs/API.md`
- `docs/IMAGES.md` (all repo images paths for documentation)

