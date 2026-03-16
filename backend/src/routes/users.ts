import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取用户信息
router.get('/profile', authenticate, getUserProfile);

// 更新用户信息
router.put('/profile', authenticate, updateUserProfile);

export default router;