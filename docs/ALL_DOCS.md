# SkillSwap Documentation (Combined)

A single, professional documentation page combining architecture, schemas, API contracts, environment variables, and image paths.

---

## 1) Architecture (Runtime Overview)

SkillSwap is a mobile-first student skills exchange platform.

- **Mobile client** (React Native + Expo) provides onboarding, browsing, and realtime chat UI.
- **Backend** (Node.js + Express) exposes REST APIs for authentication, profiles, skills/matches, chat, sessions, and ratings.
- **Realtime**: Socket.IO is present in the project dependencies. The currently checked-in chat implementation uses REST for message history and sending; realtime events can be added later on top of the same authorization rules.
- **Database**: MongoDB accessed through **Mongoose** models.

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

### Data flow

#### 1. Authentication
1. Client calls:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
2. Backend validates inputs using **Zod**, hashes passwords with **bcryptjs**, and returns a **JWT**.

#### 2. Authenticated requests
1. Client attaches:
   - `Authorization: Bearer <token>`
2. Protected routes extract `req.user.userId` via `backend/src/middleware/auth.ts`.
3. Backend responds with JSON derived from Mongoose documents.

#### 3. Chat (current implementation)
Chat feature is implemented using REST endpoints:
- `GET /api/chats` (list chats + last message)
- `POST /api/chats/start` (create or find chat with a peer)
- `GET /api/chats/:chatId/messages` (message history)
- `POST /api/chats/:chatId/messages` (send message)

> Socket.IO is available, but the current implementation is REST-based for chat.

---

## 2) Security Model

### JWT authentication
- JWT signing secret: `JWT_SECRET`.
- Token payload includes `{ userId, email }`.
- Protected routes use `backend/src/middleware/auth.ts`.

### Password security
- Registration hashes passwords using bcrypt (salt factor `10`).
- Passwords are never stored in plaintext.

### Authorization checks
- Chat endpoints verify requester is a chat participant.
- Rating endpoint checks:
  - session must be `COMPLETED`
  - requester must be a participant

---

## 3) Data Schemas (Mongoose)

### User (`User` collection)
Model: `backend/src/models/User.ts`

Fields:
- `name: string` (required, trimmed)
- `email: string` (required, unique, lowercase, trimmed)
- `passwordHash: string` (required)
- `school: string` (default: `""`)
- `bio: string` (default: `""`)
- `availability: string` (default: `""`)
- `skillsToTeach: string[]` (default: `[]`)
- `skillsToLearn: string[]` (default: `[]`)
- `timestamps: createdAt, updatedAt`

### Chat (`Chat` collection)
Model: `backend/src/models/Chat.ts`

Fields:
- `chatKey: string` (required, unique)
- `participants: ObjectId[]` (required, ref `User`)
- `timestamps: createdAt, updatedAt`

Indexes:
- `participants: 1`

### ExchangeSession (`ExchangeSession` collection)
Model: `backend/src/models/ExchangeSession.ts`

Constants:
- `SESSION_STATUS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]`

Fields:
- `userAId: ObjectId` (required, ref `User`)
- `userBId: ObjectId` (required, ref `User`)
- `skillOffered: string` (required, trimmed)
- `skillRequested: string` (required, trimmed)
- `startAt: Date` (required)
- `endAt: Date` (required)
- `notes: string` (default: `""`)
- `status: enum` (default: `"PENDING"`)
- `timestamps: createdAt, updatedAt`

### Message (`Message` collection)
Model: `backend/src/models/Message.ts`

Fields:
- `chatId: ObjectId` (required, ref `Chat`, indexed)
- `senderId: ObjectId` (required, ref `User`)
- `content: string` (required, trimmed, `maxlength: 1000`)
- `timestamps: createdAt, updatedAt`

### Rating (`Rating` collection)
Model: `backend/src/models/Rating.ts`

Fields:
- `sessionId: ObjectId` (required, ref `ExchangeSession`)
- `fromUserId: ObjectId` (required, ref `User`)
- `toUserId: ObjectId` (required, ref `User`)
- `score: number` (required, min 1, max 5)
- `comment: string` (default `""`, trimmed)
- `timestamps: createdAt, updatedAt`

Indexes:
- Unique index on `(sessionId, fromUserId, toUserId)`

---

## 4) API Contracts (Express REST)

Base path by convention: `/api`

All endpoints accept/return JSON.

### Auth conventions
- Protected endpoints require:
  - `Authorization: Bearer <token>`

---

### 4.1 Authentication

#### Register
- **POST** `/api/auth/register`

Request (Zod):
- `name: string` (min 2)
- `email: string` (email)
- `password: string` (min 6)
- `school?: string`

Responses:
- `201`: `{ token, user: { id, name, email, school } }`
- `409`: `{ message: "Email already exists" }`

#### Login
- **POST** `/api/auth/login`

Request (Zod):
- `email: string`
- `password: string`

Responses:
- `200`: `{ token, user: { id, name, email, school } }`
- `401`: `{ message: "Invalid credentials" }`

---

### 4.2 Users

#### Get current profile
- **GET** `/api/users/me`

Auth: required

Response (`200`):
- `id`, `name`, `email`, `school`, `bio`, `availability`,
- `skillsToTeach: string[]`, `skillsToLearn: string[]`,
- `rating: number` (average score where `toUserId = userId`)

#### Update current profile
- **PATCH** `/api/users/me`

Auth: required

Request (all optional):
- `bio?: string` (max 300)
- `availability?: string` (max 300)
- `skillsToTeach?: string[]`
- `skillsToLearn?: string[]`

Response (`200`):
- `{ message: "Profile updated" }`

---

### 4.3 Skills

#### Skills popularity
- **GET** `/api/skills`

Auth: public

Response (`200`):
- `topTeachSkills: Array<{ skill: string, count: number }>`
- `topLearnSkills: Array<{ skill: string, count: number }>`

---

### 4.4 Matches

#### Get matches
- **GET** `/api/matches`

Auth: required

Response (`200`):
- JSON returned by `buildMatches(...)` from `backend/src/utils/match.ts`

---

### 4.5 Chats

#### List chats
- **GET** `/api/chats`

Auth: required

Response (`200`): array items:
- `id: string`
- `peer: { id: string|null, name: string }`
- `lastMessage: null | { id, senderId, content, createdAt }`

#### Start/create chat
- **POST** `/api/chats/start`

Auth: required

Request (Zod):
- `peerId: string`

Response (`201`): `{ id: string }`

#### List messages in a chat
- **GET** `/api/chats/:chatId/messages`

Auth: required

Errors:
- `400` invalid chat id
- `404` chat not found
- `403` forbidden (not participant)

#### Send message
- **POST** `/api/chats/:chatId/messages`

Auth: required

Request (Zod):
- `content: string` (1..1000)

Response (`201`):
- `{ id, chatId, senderId, content, createdAt }`

---

### 4.6 Exchange sessions

#### List sessions
- **GET** `/api/sessions`

Auth: required

Response (`200`): array of sessions:
- `id`, `userAId`, `userBId`,
- `skillOffered`, `skillRequested`,
- `startAt`, `endAt`, `notes`, `status`,
- `userA: { id, name }`, `userB: { id, name }`

#### Create session
- **POST** `/api/sessions`

Auth: required

Request (Zod):
- `partnerId: string`
- `skillOffered: string`
- `skillRequested: string`
- `startAt: Date` (coerced)
- `endAt: Date` (coerced)
- `notes?: string`

Response (`201`): `{ id: string }`

#### Update status
- **PATCH** `/api/sessions/:id`

Auth: required

Request (Zod):
- `status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED"`

Response (`200`): `{ message: "Session updated", status }`

Errors:
- `404` not found
- `403` forbidden

---

### 4.7 Ratings

#### Create rating
- **POST** `/api/ratings`

Auth: required

Request (Zod):
- `sessionId: string`
- `toUserId: string`
- `score: number` (int 1..5)
- `comment?: string`

Rules:
- `session.status` must be `COMPLETED`
- rater must be a participant
- unique constraint on `(sessionId, fromUserId, toUserId)`

Errors:
- `409` duplicate rating

#### Get ratings (for a user)
- **GET** `/api/ratings/:userId`

Auth: not required

Response (`200`):
- `average`, `count`, `ratings[]` with `fromUser` info

---

## 5) Environment Variables

### Backend (`backend/`)
Used by Render blueprint (`render.yaml`) and backend env loader.

- `PORT` (number) – default `4000`
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – JWT signing secret
- `CLIENT_URL` – CORS origin (supports wildcard)
- `NODE_ENV`
- `NODE_VERSION`

### Mobile (`mobile/`)
- `EXPO_PUBLIC_API_URL`
  - Render example: `https://skillswapp-xz6d.onrender.com`
  - Local example: `http://localhost:4000`

---

## 6) Image Paths (Documentation)

All documentation images are located under `img/`.

### Photos
- `img/photo_1_2026-05-06_23-11-23.jpg`
- `img/photo_2_2026-05-06_23-11-23.jpg`
- `img/photo_3_2026-05-06_23-11-23.jpg`
- `img/photo_4_2026-05-06_23-11-23.jpg`
- `img/photo_5_2026-05-06_23-11-23.jpg`
- `img/photo_6_2026-05-06_23-11-23.jpg`
- `img/photo_7_2026-05-06_23-11-23.jpg`

### App icons
- `img/adaptive-icon.png`
- `img/icon.png`

---

## References (separate files)
- `docs/ARCHITECTURE.md`
- `docs/SCHEMAS.md`
- `docs/API.md`
- `docs/ENVIRONMENT.md`
- `docs/IMAGES.md`

