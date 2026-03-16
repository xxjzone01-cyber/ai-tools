import express from 'express';
import { 
  getTimeStats, 
  getCategoryStats, 
  getProductivityReport 
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取时间统计
router.get('/time-stats', authenticate, getTimeStats);

// 获取分类统计
router.get('/category-stats', authenticate, getCategoryStats);

// 获取生产力报告
router.get('/productivity-report', authenticate, getProductivityReport);

export default router;