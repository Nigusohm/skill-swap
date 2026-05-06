# SkillSwap API (Express)

Base path (by convention): `/api`

All endpoints accept/return JSON.

## Auth conventions

Protected endpoints require a JWT:
- Header: `Authorization: Bearer <token>`

## 1) Authentication

### Register
- **POST** `/api/auth/register`

Request (Zod):
- `name: string` (min 2)
- `email: string` (email)
- `password: string` (min 6)
- `school?: string`

Responses:
- `201`:
  - `token: string`
  - `user: { id, name, email, school }`
- `409`: `{ message: "Email already exists" }`

### Login
- **POST** `/api/auth/login`

Request (Zod):
- `email: string` (email)
- `password: string` (min 6)

Responses:
- `200`:
  - `token: string`
  - `user: { id, name, email, school }`
- `401`: `{ message: "Invalid credentials" }`

## 2) Users

### Get current profile
- **GET** `/api/users/me`

Auth: required

Response:
- `200`:
  - `id: string`
  - `name: string`
  - `email: string`
  - `school: string`
  - `bio: string`
  - `availability: string`
  - `skillsToTeach: string[]`
  - `skillsToLearn: string[]`
  - `rating: number` (average score from `Rating` where `toUserId = userId`)

### Update current profile
- **PATCH** `/api/users/me`

Auth: required

Request (Zod): all optional:
- `bio?: string` (max 300)
- `availability?: string` (max 300)
- `skillsToTeach?: string[]` (each min length 1)
- `skillsToLearn?: string[]` (each min length 1)

Response:
- `200`: `{ message: "Profile updated" }`

## 3) Skills discovery

### Skills popularity
- **GET** `/api/skills`

Auth: public (no auth middleware)

Response:
- `200`:
  - `topTeachSkills: Array<{ skill: string, count: number }>`
  - `topLearnSkills: Array<{ skill: string, count: number }>`

## 4) Matches

### Get matches for current user
- **GET** `/api/matches`

Auth: required

Response:
- `200`: JSON returned by `buildMatches(...)` from `backend/src/utils/match.ts`

> This endpoint’s exact shape depends on `buildMatches`. See code in `backend/src/utils/match.ts`.

## 5) Chats

### List chats
- **GET** `/api/chats`

Auth: required

Response:
- `200`: array of:
  - `id: string` (chat id)
  - `peer: { id: string|null, name: string }`
  - `lastMessage: null | { id, senderId, content, createdAt }`

### Start / create chat
- **POST** `/api/chats/start`

Auth: required

Request (Zod):
- `peerId: string`

Rules:
- `peerId` must be a valid ObjectId and must not equal the current user.

Response:
- `201`: `{ id: string }`

### List messages in a chat
- **GET** `/api/chats/:chatId/messages`

Auth: required

Response:
- `200`: array of:
  - `id: string`
  - `chatId: string`
  - `senderId: string`
  - `content: string`
  - `createdAt: date`

Errors:
- `400` invalid chat id
- `404` chat not found
- `403` forbidden (not a participant)

### Send message
- **POST** `/api/chats/:chatId/messages`

Auth: required

Request (Zod):
- `content: string` (1..1000)

Response:
- `201`: message object with `id/chatId/senderId/content/createdAt`

Errors:
- `400/404/403` same as above

## 6) Exchange sessions

### List sessions
- **GET** `/api/sessions`

Auth: required

Response:
- `200`: array of:
  - `id`
  - `userAId`, `userBId`
  - `skillOffered`, `skillRequested`
  - `startAt`, `endAt`
  - `notes`
  - `status`
  - `userA: { id, name }`
  - `userB: { id, name }`

### Create session
- **POST** `/api/sessions`

Auth: required

Request (Zod):
- `partnerId: string`
- `skillOffered: string`
- `skillRequested: string`
- `startAt: Date` (coerced)
- `endAt: Date` (coerced)
- `notes?: string`

Response:
- `201`: `{ id: string }`

Errors:
- `400` invalid partner id

### Update session status
- **PATCH** `/api/sessions/:id`

Auth: required

Request (Zod):
- `status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED"`

Response:
- `200`: `{ message: "Session updated", status }`

Errors:
- `404` session not found
- `403` forbidden (not userAId/userBId)

## 7) Ratings

### Rate a user after completion
- **POST** `/api/ratings`

Auth: required

Request (Zod):
- `sessionId: string`
- `toUserId: string`
- `score: number` (int 1..5)
- `comment?: string`

Rules:
- `session.status` must be `"COMPLETED"`
- requester must be a participant of the session
- unique constraint: `(sessionId, fromUserId, toUserId)`

Response:
- `201`: `{ id: string }`

Errors:
- `400` invalid ids or session not completed
- `403` forbidden
- `404` session not found
- `409` already rated (duplicate key)

### Get ratings for a user (public)
- **GET** `/api/ratings/:userId`

Auth: not required

Response:
- `200`:
  - `average: number`
  - `count: number`
  - `ratings: Array<{ id, score, comment, createdAt, fromUser: { id, name } }>`

Errors:
- `400` invalid user id


