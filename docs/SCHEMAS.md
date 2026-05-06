# SkillSwap Data Schemas (Mongoose)

This document describes the MongoDB collections and field shapes based on the Mongoose models in `backend/src/models`.

## 1. User (`User` collection)

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

## 2. Chat (`Chat` collection)

Model: `backend/src/models/Chat.ts`

Fields:
- `chatKey: string` (required, unique)
- `participants: ObjectId[]` (required, references `User`)
- `timestamps: createdAt, updatedAt`

Indexes:
- `participants: 1`

## 3. ExchangeSession (`ExchangeSession` collection)

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
- `status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED"` (default: `"PENDING"`)
- `timestamps: createdAt, updatedAt`

## 4. Message (`Message` collection)

Model: `backend/src/models/Message.ts`

Fields:
- `chatId: ObjectId` (required, ref `Chat`, indexed)
- `senderId: ObjectId` (required, ref `User`)
- `content: string` (required, trimmed, `maxlength: 1000`)
- `timestamps: createdAt, updatedAt`

## 5. Rating (`Rating` collection)

Model: `backend/src/models/Rating.ts`

Fields:
- `sessionId: ObjectId` (required, ref `ExchangeSession`)
- `fromUserId: ObjectId` (required, ref `User`)
- `toUserId: ObjectId` (required, ref `User`)
- `score: number` (required, `min: 1`, `max: 5`)
- `comment: string` (default: `""`, trimmed)
- `timestamps: createdAt, updatedAt`

Indexes:
- Unique index on `(sessionId, fromUserId, toUserId)`

## 6. Notes on reference integrity

- Mongoose schemas define references via `ref`.
- Additional referential integrity constraints (e.g., cascading deletes) are not implemented in the checked-in schemas.


