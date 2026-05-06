# Android Run Checklist (SkillSwap)

## 1) Prerequisites

- Node.js 22+
- Java 17+
- Android SDK + AVD
- AVD name available (example: `Pixel_8`)

Check quickly:

```bash
node -v
java -version
adb version
emulator -list-avds
```

## 2) Backend env

`backend/.env` must include:

```env
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=*
```

## 3) Mobile env for Android emulator

`mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

Use `10.0.2.2` because Android emulator maps it to your host machine localhost.

## 4) Start emulator and ADB

```bash
emulator @Pixel_8
adb start-server
adb devices -l
```

## 5) Run backend

```bash
npm --prefix backend run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

## 6) Run mobile app

Recommended dev flow:

```bash
npm --prefix mobile run start -- --android
```

This opens Expo Go on emulator and runs the app.

## 7) Optional full native build

```bash
npm --prefix mobile run android
```

If Gradle download fails, use step 6 (`expo start --android`) instead.
