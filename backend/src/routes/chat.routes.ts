import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "../middleware/auth";
import { ChatModel } from "../models/Chat";
import { MessageModel } from "../models/Message";
import { UserModel } from "../models/User";

const router = Router();

const startSchema = z.object({
  peerId: z.string().min(1)
});

const messageSchema = z.object({
  content: z.string().min(1).max(1000)
});

const chatKeyFor = (a: string, b: string): string => (a < b ? `${a}_${b}` : `${b}_${a}`);

router.get("/", auth, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const chats = await ChatModel.find({ participants: userId }).sort({ updatedAt: -1 }).lean();

    const payload = await Promise.all(
      chats.map(async (chat) => {
        const peerId = chat.participants.map((p) => p.toString()).find((id) => id !== userId);
        const peer = peerId ? await UserModel.findById(peerId, { name: 1 }).lean() : null;
        const lastMessage = await MessageModel.findOne({ chatId: chat._id }).sort({ createdAt: -1 }).lean();

        return {
          id: chat._id.toString(),
          peer: { id: peerId, name: peer?.name ?? "Student" },
          lastMessage: lastMessage
            ? {
                id: lastMessage._id.toString(),
                senderId: lastMessage.senderId.toString(),
                content: lastMessage.content,
                createdAt: lastMessage.createdAt
              }
            : null
        };
      })
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/start", auth, async (req, res, next) => {
  try {
    const parsed = startSchema.parse(req.body);
    const userId = req.user!.userId;

    if (!mongoose.isValidObjectId(parsed.peerId) || parsed.peerId === userId) {
      res.status(400).json({ message: "Invalid peer" });
      return;
    }

    const chatKey = chatKeyFor(userId, parsed.peerId);

    const chat = await ChatModel.findOneAndUpdate(
      { chatKey },
      {
        $setOnInsert: {
          chatKey,
          participants: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(parsed.peerId)]
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ id: chat._id.toString() });
  } catch (error) {
    next(error);
  }
});

router.get("/:chatId/messages", auth, async (req, res, next) => {
  try {
    const chatId = String(req.params.chatId);
    const userId = req.user!.userId;

    if (!mongoose.isValidObjectId(chatId)) {
      res.status(400).json({ message: "Invalid chat id" });
      return;
    }

    const chat = await ChatModel.findById(chatId).lean();
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const isParticipant = chat.participants.map((p) => p.toString()).includes(userId);
    if (!isParticipant) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const messages = await MessageModel.find({ chatId }).sort({ createdAt: 1 }).lean();

    res.json(
      messages.map((msg) => ({
        id: msg._id.toString(),
        chatId: msg.chatId.toString(),
        senderId: msg.senderId.toString(),
        content: msg.content,
        createdAt: msg.createdAt
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/:chatId/messages", auth, async (req, res, next) => {
  try {
    const chatId = String(req.params.chatId);
    const userId = req.user!.userId;
    const parsed = messageSchema.parse(req.body);

    const chat = await ChatModel.findById(chatId).lean();
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const isParticipant = chat.participants.map((p) => p.toString()).includes(userId);
    if (!isParticipant) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const message = await MessageModel.create({
      chatId: new mongoose.Types.ObjectId(chatId),
      senderId: new mongoose.Types.ObjectId(userId),
      content: parsed.content
    });

    res.status(201).json({
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      createdAt: message.createdAt
    });
  } catch (error) {
    next(error);
  }
});

export default router;
