import { Request, Response } from 'express';
import emailService from '../services/emailService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendTaskReminder = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.userId;

    // 获取任务信息
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: { category: true }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 发送任务提醒邮件
    await emailService.sendTaskReminderEmail(user.email, user.name, [{
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString()
    }]);

    res.json({ message: '任务提醒邮件已发送' });
  } catch (error) {
    console.error('发送任务提醒失败:', error);
    res.status(500).json({ error: '发送任务提醒失败' });
  }
};

export const sendDailySummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取今日任务
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      }
    });

    // 获取今日时间记录
    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        }
      }
    });

    // 计算统计数据
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalFocusTime = timeRecords.reduce((sum, record) => sum + record.duration, 0);
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 发送每日总结邮件
    await emailService.sendDailySummaryEmail(user.email, user.name, {
      date: today.toISOString(),
      completedTasks,
      totalTasks,
      totalFocusTime,
      productivityScore
    });

    res.json({ message: '每日总结邮件已发送' });
  } catch (error) {
    console.error('发送每日总结失败:', error);
    res.status(500).json({ error: '发送每日总结失败' });
  }
};

export const sendWeeklyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // 计算本周的起止时间
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // 本周日
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 本周六
    weekEnd.setHours(23, 59, 59, 999);

    // 获取本周任务
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        category: true
      }
    });

    // 获取本周时间记录
    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        startTime: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    // 计算统计数据
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalFocusTime = timeRecords.reduce((sum, record) => sum + record.duration, 0);
    const avgDailyFocus = totalFocusTime / 7;

    // 找出时间最多的分类
    const categoryTime = tasks.reduce((acc, task) => {
      const categoryName = task.category?.name || '未分类';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName]++;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTime)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '无';

    // 生成改进建议
    const improvement = generateImprovement(completedTasks, totalTasks, avgDailyFocus);

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 发送周报邮件
    await emailService.sendWeeklyReportEmail(user.email, user.name, {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalTasks,
      completedTasks,
      avgDailyFocus,
      topCategory,
      improvement
    });

    res.json({ message: '每周报告邮件已发送' });
  } catch (error) {
    console.error('发送每周报告失败:', error);
    res.status(500).json({ error: '发送每周报告失败' });
  }
};

// 生成改进建议
function generateImprovement(
  completedTasks: number, 
  totalTasks: number, 
  avgDailyFocus: number
): string {
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  
  if (completionRate >= 0.8 && avgDailyFocus >= 120) {
    return '本周表现优秀！继续保持良好的时间管理习惯。建议尝试挑战更复杂的项目，进一步提升生产力。';
  } else if (completionRate >= 0.6 && avgDailyFocus >= 90) {
    return '本周表现良好。建议优化任务优先级，集中精力处理重要任务，可以进一步提升完成率。';
  } else if (completionRate < 0.6) {
    return '本周任务完成率较低。建议检查任务估时是否准确，将大任务分解为更小的子任务，并设置明确的截止时间。';
  } else if (avgDailyFocus < 60) {
    return '本周专注时间较少。建议减少时间碎片化，使用番茄工作法等技巧增加专注时段，提高时间使用效率。';
  } else {
    return '本周表现正常。建议回顾时间使用情况，找出可以改进的地方，继续优化时间管理策略。';
  }
}