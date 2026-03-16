import express from 'express';
import { 
  sendTaskReminder, 
  sendDailySummary, 
  sendWeeklyReport 
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 发送任务提醒
router.post('/task-reminder', authenticate, sendTaskReminder);

// 发送每日总结
router.post('/daily-summary', authenticate, sendDailySummary);

// 发送每周报告
router.post('/weekly-report', authenticate, sendWeeklyReport);

export default router;