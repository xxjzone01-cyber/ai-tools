import { Request, Response } from 'express';
import aiService from '../services/aiService';

export const getSmartReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const reminders = await aiService.getSmartReminders(userId);

    res.json({
      message: '智能提醒获取成功',
      reminders
    });
  } catch (error) {
    console.error('获取智能提醒错误:', error);
    res.status(500).json({ error: '获取智能提醒失败' });
  }
};

export const getTimeManagementAdvice = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { taskTitle, priority, estimatedTime } = req.body;

    if (!taskTitle || !priority) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const advice = await aiService.getTimeManagementAdvice({
      userId,
      taskTitle,
      priority,
      estimatedTime: estimatedTime || 30
    });

    res.json({
      message: '时间管理建议获取成功',
      advice
    });
  } catch (error) {
    console.error('获取时间管理建议错误:', error);
    res.status(500).json({ error: '获取时间管理建议失败' });
  }
};