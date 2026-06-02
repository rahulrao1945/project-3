import express from 'express';
import { getChatHistory, getUserInbox } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history/:roomId', protect, getChatHistory);
router.get('/inbox', protect, getUserInbox);

export default router;
