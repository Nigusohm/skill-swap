import { Router } from "express";
import { UserModel } from "../models/User";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const users = await UserModel.find({}, { skillsToTeach: 1, skillsToLearn: 1 }).lean();

    const teachMap = new Map<string, number>();
    const learnMap = new Map<string, number>();

    for (const user of users) {
      for (const skill of user.skillsToTeach || []) {
        teachMap.set(skill, (teachMap.get(skill) ?? 0) + 1);
      }
      for (const skill of user.skillsToLearn || []) {
        learnMap.set(skill, (learnMap.get(skill) ?? 0) + 1);
      }
    }

    const toSorted = (map: Map<string, number>) =>
      [...map.entries()]
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count);

    res.json({
      topTeachSkills: toSorted(teachMap),
      topLearnSkills: toSorted(learnMap)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
