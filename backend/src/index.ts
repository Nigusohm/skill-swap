import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "./config/env";
import { connectMongo } from "./lib/mongo";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import skillRoutes from "./routes/skill.routes";
import matchRoutes from "./routes/match.routes";
import chatRoutes from "./routes/chat.routes";
import sessionRoutes from "./routes/session.routes";
import ratingRoutes from "./routes/rating.routes";
import { ChatModel } from "./models/Chat";
import { MessageModel } from "./models/Message";

const app = express();
app.use(cors({ origin: env.clientUrl === "*" ? true : env.clientUrl }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "skillswapp-backend", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ratings", ratingRoutes);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl === "*" ? true : env.clientUrl,
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    next(new Error("Unauthorized"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
    socket.data.userId = payload.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;

  socket.on("join_chat", (chatId: string) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on("send_message", async (payload: { chatId: string; content: string }) => {
    if (!payload?.chatId || !payload?.content?.trim()) {
      return;
    }

    const chat = await ChatModel.findById(payload.chatId).lean();
    if (!chat) {
      return;
    }

    const isParticipant = chat.participants.map((p) => p.toString()).includes(userId);
    if (!isParticipant) {
      return;
    }

    const message = await MessageModel.create({
      chatId: new mongoose.Types.ObjectId(payload.chatId),
      senderId: new mongoose.Types.ObjectId(userId),
      content: payload.content.trim()
    });

    io.to(`chat:${payload.chatId}`).emit("new_message", {
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      createdAt: message.createdAt
    });
  });
});

const boot = async () => {
  await connectMongo();
  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`SkillSwap backend running on http://localhost:${env.port}`);
  });
};

boot().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
