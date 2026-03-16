import express from 'express';
import { getSmartReminders, getTimeManagementAdvice } from '../controllers/reminderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取智能提醒
router.get('/smart', authenticate, getSmartReminders);

// 获取时间管理建议
router.post('/advice', authenticate, getTimeManagementAdvice);

export default router;