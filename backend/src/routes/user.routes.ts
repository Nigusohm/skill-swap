import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "../middleware/auth";
import { RatingModel } from "../models/Rating";
import { UserModel } from "../models/User";

const router = Router();

const profileSchema = z.object({
  bio: z.string().max(300).optional(),
  availability: z.string().max(300).optional(),
  skillsToTeach: z.array(z.string().min(1)).optional(),
  skillsToLearn: z.array(z.string().min(1)).optional()
});

const normalizeSkills = (skills: string[]): string[] =>
  [...new Set(skills.map((s) => s.trim()).filter(Boolean))];

router.get("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    if (!mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const ratings = await RatingModel.find({ toUserId: user._id }).lean();
    const avg = ratings.length ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length : 0;

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      school: user.school,
      bio: user.bio,
      availability: user.availability,
      skillsToTeach: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
      rating: Number(avg.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const parsed = profileSchema.parse(req.body);

    await UserModel.findByIdAndUpdate(userId, {
      ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      ...(parsed.availability !== undefined ? { availability: parsed.availability } : {}),
      ...(parsed.skillsToTeach ? { skillsToTeach: normalizeSkills(parsed.skillsToTeach) } : {}),
      ...(parsed.skillsToLearn ? { skillsToLearn: normalizeSkills(parsed.skillsToLearn) } : {})
    });

    res.json({ message: "Profile updated" });
  } catch (error) {
    next(error);
  }
});

export default router;
