import { Router, type RequestHandler } from "express";
import { getMessages, nutritionPlan } from "../controllers/messagesController";
import { NutritionSession } from "../models/NutritionSession";

const router = Router();

router.get("/messages", getMessages);
router.post("/nutrition-chat", nutritionPlan);

router.get("/nutrition-plan/:userId", (async (req, res) => {
  try {
    const session = await NutritionSession.findOne(
      { userId: req.params.userId },
      { lastPlan: 1, _id: 0 }
    ).lean();

    if (!session?.lastPlan) {
      res.status(404).json({ error: "No plan found" });
      return;
    }

    res.json({ nutritionPlan: session.lastPlan });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nutrition plan." });
    return;
  }
}) as RequestHandler);

export default router;
