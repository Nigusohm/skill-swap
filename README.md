# SkillSwap: Student Skills Exchange Platform

SkillSwap is a peer-to-peer mobile application designed for students or other people to exchange skills and knowledge without monetary transactions. This platform fosters a collaborative learning environment where users can teach what they know and learn what they need from their peers.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
  - [Backend Setup](#backend-setup)
  - [Mobile App Setup](#mobile-app-setup)
- [Running the Application](#running-the-application)
  - [Backend](#backend)
  - [Mobile App](#mobile-app)
    - [Using Expo Go (Recommended)](#using-expo-go-recommended)
    - [Running on Android Emulator/Device](#running-on-android-emulatordevice)
    - [Running on iOS Simulator/Device](#running-on-ios-simulatordevice)
    - [Running on Web](#running-on-web)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
  - [Backend on Render](#backend-on-render)
- [API Reference](#api-reference)
- [Security Note](#security-note)
- [Contributing](#contributing)
- [License](#license)

## Overview

SkillSwap enables students to:

- Register and create profiles highlighting their skills and learning goals
- Discover potential skill exchange partners based on matching interests
- Initiate chat conversations to coordinate skill exchange sessions
- Schedule and conduct skill exchange sessions (virtual or in-person)
- Provide feedback and ratings after each exchange

## Tech Stack

- **Mobile Application**: React Native (Expo) - Android-first approach
- **Backend Server**: Node.js + Express + MongoDB (Mongoose) + Socket.IO
- **Deployment**: Render (for backend services)
- **Real-time Communication**: Socket.IO for live chat functionality

## Project Structure

```
skillSwapp/
├── mobile/                 # React Native (Expo) application
│   ├── src/
│   │   ├── screens/       # Application screens
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── api/           # API service client
│   │   ├── types/         # TypeScript type definitions
│   │   ├── theme/         # Styling and theme configuration
│   │   └── ...            # Other source files
│   ├── App.tsx            # Root application component
│   ├── app.json           # Expo configuration
│   └── .env               # Environment variables (API URL)
├── backend/               # Node.js Express server
│   ├── src/
│   │   ├── models/        # MongoDB Mongoose models
│   │   ├── routes/        # REST API route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── sockets/       # Socket.IO event handlers
│   │   └── ...            # Other backend files
│   ├── .env               # Environment variables (MongoDB, JWT)
│   ├── render.yaml        # Render blueprint for deployment
│   └── server.js          # Entry point
├── render.yaml            # Render blueprint (root level)
└── README.md              # This file
```

## Prerequisites

Before setting up SkillSwap locally, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn**
- **Git** (for version control)
- **MongoDB** (for local backend development) OR access to MongoDB Atlas
- **Expo CLI** (globally installed: `npm install -g expo-cli`)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator) - optional for emulator testing
- **Physical Android/iOS device** (recommended for testing) with Expo Go app installed

## Local Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to include:
   - `MONGODB_URI`: Your MongoDB connection string (local or Atlas)
   - `JWT_SECRET`: A strong random string for JWT signing
   - `PORT`: (Optional) Port to run the server (default: 4000)
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:4000` by default.

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   By default, `.env` contains:
   ```env
   EXPO_PUBLIC_API_URL=https://skillswapp-xz6d.onrender.com
   ```
   For local backend testing, change this to:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:4000
   ```
   **Note**: If testing on a physical Android device with the local backend, replace `localhost` with your machine's LAN IP address (e.g., `http://192.168.1.100:4000`).
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend

To start the backend server in development mode:

```bash
cd backend
npm run dev
```

The server will restart automatically on file changes due to `nodemon`.

### Mobile App

There are several ways to run the mobile application:

#### Using Expo Go (Recommended for Physical Devices)

1. Start the Expo development server:
   ```bash
   cd mobile
   npm run start
   ```
   or for tunnel mode (useful when device and computer are on different network):
   ```bash
   npm run start:phone
   ```
2. Install the **Expo Go** app on your physical device from the App Store (iOS) or Play Store (Android).
3. Scan the QR code displayed in the terminal using the Expo Go app.
4. The application will load and connect to the backend specified in `mobile/.env`.

#### Running on Android Emulator/Device

1. Ensure an Android emulator is running (via Android Studio) or a physical device is connected via USB with USB debugging enabled.
2. Run:
   ```bash
   cd mobile
   npm run android
   ```
   This will build the debug APK and install it on the connected device/emulator.

#### Running on iOS Simulator/Device

1. Ensure you have Xcode installed (for simulator) or a physical iOS device connected.
2. Run:
   ```bash
   cd mobile
   npm run ios
   ```
   This will build and run the app on the iOS simulator or connected device.

#### Running on Web

1. Start the Expo development server:
   ```bash
   cd mobile
   npm run start
   ```
2. Press `w` in the terminal to open the application in a web browser.
   Alternatively, visit the URL shown in the terminal (usually `http://localhost:8082`).

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Description                            | Example                               |
| ------------- | -------------------------------------- | ------------------------------------- |
| `MONGODB_URI` | MongoDB connection string              | `mongodb://localhost:27017/skillswap` |
| `JWT_SECRET`  | Secret key for signing JSON Web Tokens | `your-strong-random-string-here`      |
| `PORT`        | Server port (optional)                 | `4000`                                |

### Mobile (`mobile/.env`)

| Variable              | Description                  | Example                                |
| --------------------- | ---------------------------- | -------------------------------------- |
| `EXPO_PUBLIC_API_URL` | Base URL for the backend API | `https://skillswapp-xz6d.onrender.com` |

## Troubleshooting

### Mobile App Issues

- **Red Screen on Startup**:
  1. Verify `mobile/.env` contains the correct API URL.
  2. Clear Expo cache: `npm run start:clear`
  3. If using local backend, ensure the backend is running and accessible from your device.
  4. For physical devices on local backend, use your LAN IP instead of `localhost`.

- **Backend Connection Errors**:
  1. Confirm the backend is running and reachable at the URL in `mobile/.env`.
  2. Check network connectivity between your device and the backend server.
  3. Verify CORS setting on the backend if running locally.

- **Expo Go QR Code Not Scanning**:
  1. Ensure your device and computer are on the same network (for LAN) or have internet access (for tunnel).
  2. Try manually entering the URL in Expo Go if scanning fails.

### Backend Issues

- **MongoDB Connection Errors**:
  1. Verify `MONGODB_URI` in `backend/.env` is correct.
  2. Ensure MongoDB service is running (for local) or Atlas cluster is accessible.
  3. Check network/firewall settings blocking MongoDB port.

- **Port Already in Use**:
  1. Change the `PORT` in `backend/.env` if another service is using the default port.
  2. Or stop the conflicting service.

## Deployment

### Backend on Render

1. Push this repository to GitHub.
2. In Render dashboard:
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
3. In the Render service environment variables, set:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string (can be auto-generated by Render if using blueprint)
4. Click **Deploy** to deploy the backend.
5. After deployment, note the backend URL (e.g., `https://your-service.onrender.com`)
6. Update `mobile/.env` with the new backend URL:
   ```env
   EXPO_PUBLIC_API_URL=https://your-service.onrender.com
   ```
7. Redeploy the mobile app (if using standalone builds) or update the URL in development.

#### Render Configuration Details

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Endpoint**: `/health`

#### If Encountering "Runtime Not Ready" Errors

1. Open your Render service dashboard.
2. Navigate to **Environment** and verify:
   - `MONGODB_URI` is set correctly
   - `JWT_SECRET` exists (for manually created services, add this manually)
3. Save changes and trigger a **Manual Deploy** → **Deploy latest commit**.
4. Wait for deployment to complete and check logs for startup success.
5. Test the health endpoint: `https://your-service.onrender.com/health`

## API Reference

All API endpoints are prefixed with `/api`.

## Combined Professional Docs

For a single consolidated documentation page, see:

- `docs/ALL_DOCS.md`

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/users/me` - Get current user profile (requires auth)
- `PATCH /api/users/me` - Update current user profile (requires auth)

### Skills

- `GET /api/skills` - Get list of all skills

### Matches

- `GET /api/matches` - Get skill exchange matches for current user (requires auth)

### Chats

- `GET /api/chats` - Get list of chats for current user (requires auth)
- `POST /api/chats/start` - Start a new chat with another user (requires auth)
- `GET /api/chats/:chatId/messages` - Get messages for a specific chat (requires auth)
- `POST /api/chats/:chatId/messages` - Send a message in a chat (requires auth)

### Sessions (Skill Exchange Meetings)

- `GET /api/sessions` - Get sessions for current user (requires auth)
- `POST /api/sessions` - Schedule a new skill exchange session (requires auth)
- `PATCH /api/sessions/:id` - Update a session (requires auth)

### Ratings

- `POST /api/ratings` - Submit a rating for a completed session (requires auth)

## Security Note

For security reasons, never commit sensitive information to version control:

- MongoDB connection strings (`MONGODB_URI`)
- JWT secrets (`JWT_SECRET`)
- Any other API keys or secrets

These values should only be stored in:

- Local `.env` files (which are listed in `.gitignore`)
- Render dashboard environment variables (for deployed services)

## Contributing

We welcome contributions to SkillSwap! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

\_Last updated: May 5 2026
