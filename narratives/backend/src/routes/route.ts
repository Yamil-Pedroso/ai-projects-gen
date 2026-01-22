import { Router } from "express";
import { getMessages, narrate } from "../controllers/messagesController";

const router = Router();

router.get("/messages", getMessages);
// Helper to wrap async route handlers and forward errors to Express
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/narrate", asyncHandler(narrate));

export default router;
