import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { UserModel } from "../models/User";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  school: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signToken = (userId: string, email: string): string =>
  jwt.sign({ userId, email }, env.jwtSecret, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const email = parsed.email.trim().toLowerCase();
    const name = parsed.name.trim();
    const school = parsed.school?.trim();

    const exists = await UserModel.findOne({ email }).lean();
    if (exists) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const user = await UserModel.create({
      name,
      email,
      school: school ?? "",
      passwordHash,
      skillsToTeach: [],
      skillsToLearn: []
    });

    const token = signToken(user._id.toString(), user.email);

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        school: user.school
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const email = parsed.email.trim().toLowerCase();

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user._id.toString(), user.email);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        school: user.school
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
