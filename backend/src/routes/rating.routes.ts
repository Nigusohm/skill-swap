import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "../middleware/auth";
import { ExchangeSessionModel } from "../models/ExchangeSession";
import { RatingModel } from "../models/Rating";

const router = Router();

const ratingSchema = z.object({
  sessionId: z.string().min(1),
  toUserId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

router.post("/", auth, async (req, res, next) => {
  try {
    const parsed = ratingSchema.parse(req.body);
    const fromUserId = req.user!.userId;

    if (!mongoose.isValidObjectId(parsed.sessionId) || !mongoose.isValidObjectId(parsed.toUserId)) {
      res.status(400).json({ message: "Invalid ids" });
      return;
    }

    const session = await ExchangeSessionModel.findById(parsed.sessionId).lean();
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    if (session.status !== "COMPLETED") {
      res.status(400).json({ message: "You can only rate completed sessions" });
      return;
    }

    const participants = [session.userAId.toString(), session.userBId.toString()];
    if (!participants.includes(fromUserId) || !participants.includes(parsed.toUserId)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const rating = await RatingModel.create({
      sessionId: new mongoose.Types.ObjectId(parsed.sessionId),
      fromUserId: new mongoose.Types.ObjectId(fromUserId),
      toUserId: new mongoose.Types.ObjectId(parsed.toUserId),
      score: parsed.score,
      comment: parsed.comment ?? ""
    });

    res.status(201).json({ id: rating._id.toString() });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "You already rated this user for this session" });
      return;
    }

    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    const ratings = await RatingModel.find({ toUserId: userId })
      .populate("fromUserId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const average = ratings.length ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length : 0;

    res.json({
      average: Number(average.toFixed(2)),
      count: ratings.length,
      ratings: ratings.map((r) => ({
        id: r._id.toString(),
        score: r.score,
        comment: r.comment,
        createdAt: r.createdAt,
        fromUser: {
          id: (r.fromUserId as any)._id.toString(),
          name: (r.fromUserId as any).name
        }
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
