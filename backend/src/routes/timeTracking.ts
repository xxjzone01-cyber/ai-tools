import express from 'express';
import { 
  startTimeTracking, 
  stopTimeTracking, 
  getTimeRecords, 
  getActiveTimeTracking 
} from '../controllers/timeTrackingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 开始时间追踪
router.post('/start', authenticate, startTimeTracking);

// 停止时间追踪
router.post('/:id/stop', authenticate, stopTimeTracking);

// 获取时间记录
router.get('/', authenticate, getTimeRecords);

// 获取活跃的时间追踪
router.get('/active', authenticate, getActiveTimeTracking);

export default router;