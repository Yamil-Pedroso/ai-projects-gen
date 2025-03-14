import { Router } from 'express';
import { getMessages, translate } from '../controllers/messagesController';

const router = Router();

router.get("/messages", getMessages);
router.post("/translate", translate);

export default router;
