import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 注册
router.post('/register', [
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('name').notEmpty().withMessage('姓名不能为空')
], register);

// 登录
router.post('/login', [
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password').notEmpty().withMessage('密码不能为空')
], login);

// 登出
router.post('/logout', logout);

// 获取当前用户信息
router.get('/me', authenticate, getCurrentUser);

export default router;