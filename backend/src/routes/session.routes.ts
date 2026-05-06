import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "../middleware/auth";
import { ExchangeSessionModel, SESSION_STATUS } from "../models/ExchangeSession";

const router = Router();

const createSchema = z.object({
  partnerId: z.string().min(1),
  skillOffered: z.string().min(1),
  skillRequested: z.string().min(1),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  notes: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(SESSION_STATUS)
});

router.get("/", auth, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const sessions = await ExchangeSessionModel.find({
      $or: [{ userAId: userId }, { userBId: userId }]
    })
      .populate("userAId", "name")
      .populate("userBId", "name")
      .sort({ startAt: 1 })
      .lean();

    res.json(
      sessions.map((s) => ({
        id: s._id.toString(),
        userAId: (s.userAId as any)._id.toString(),
        userBId: (s.userBId as any)._id.toString(),
        skillOffered: s.skillOffered,
        skillRequested: s.skillRequested,
        startAt: s.startAt,
        endAt: s.endAt,
        notes: s.notes,
        status: s.status,
        userA: { id: (s.userAId as any)._id.toString(), name: (s.userAId as any).name },
        userB: { id: (s.userBId as any)._id.toString(), name: (s.userBId as any).name }
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const parsed = createSchema.parse(req.body);
    const userId = req.user!.userId;

    if (!mongoose.isValidObjectId(parsed.partnerId)) {
      res.status(400).json({ message: "Invalid partner id" });
      return;
    }

    const created = await ExchangeSessionModel.create({
      userAId: new mongoose.Types.ObjectId(userId),
      userBId: new mongoose.Types.ObjectId(parsed.partnerId),
      skillOffered: parsed.skillOffered,
      skillRequested: parsed.skillRequested,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      notes: parsed.notes ?? ""
    });

    res.status(201).json({ id: created._id.toString() });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const parsed = statusSchema.parse(req.body);

    const session = await ExchangeSessionModel.findById(id);
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    if (session.userAId.toString() !== userId && session.userBId.toString() !== userId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    session.status = parsed.status;
    await session.save();

    res.json({ message: "Session updated", status: session.status });
  } catch (error) {
    next(error);
  }
});

export default router;
