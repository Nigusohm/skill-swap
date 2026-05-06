import { Router } from "express";
import { auth } from "../middleware/auth";
import { UserModel } from "../models/User";
import { buildMatches } from "../utils/match";

const router = Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const me = await UserModel.findById(req.user!.userId).lean();
    if (!me) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const others = await UserModel.find({ _id: { $ne: me._id } }).lean();

    const matches = buildMatches(
      {
        id: me._id.toString(),
        name: me.name,
        school: me.school,
        teaches: me.skillsToTeach || [],
        learns: me.skillsToLearn || []
      },
      others.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        school: user.school,
        teaches: user.skillsToTeach || [],
        learns: user.skillsToLearn || []
      }))
    );

    res.json(matches);
  } catch (error) {
    next(error);
  }
});

export default router;
