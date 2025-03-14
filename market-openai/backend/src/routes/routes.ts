import { Router } from 'express';
import { getMessages, businessChatbot } from '../controllers/businessChatController';

const router = Router();

router.get("/messages", getMessages);
router.post("/chatbot", businessChatbot as any);

export default router;
