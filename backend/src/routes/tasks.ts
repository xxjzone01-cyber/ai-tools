import express from 'express';
import { body } from 'express-validator';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  categorizeTask,
  predictTaskTime
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取任务列表
router.get('/', authenticate, getTasks);

// 获取单个任务
router.get('/:id', authenticate, getTask);

// 创建任务
router.post('/', [
  body('title').notEmpty().withMessage('任务标题不能为空'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601(),
  body('estimatedTime').optional().isInt({ min: 1 })
], authenticate, createTask);

// 更新任务
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('description').optional().isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('dueDate').optional().isISO8601(),
  body('estimatedTime').optional().isInt({ min: 1 }),
  body('actualTime').optional().isInt({ min: 0 })
], authenticate, updateTask);

// 删除任务
router.delete('/:id', authenticate, deleteTask);

// AI任务分类
router.post('/:id/categorize', authenticate, categorizeTask);

// AI时间预测
router.post('/:id/predict-time', authenticate, predictTaskTime);

export default router;