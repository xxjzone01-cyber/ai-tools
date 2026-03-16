import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTimeStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { period = 'week' } = req.query; // day, week, month, year

    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate
        }
      },
      include: {
        task: true,
        category: true
      }
    });

    // 计算总时间
    const totalTime = timeRecords.reduce((sum, record) => sum + record.duration, 0);

    // 按日期分组
    const dailyStats = timeRecords.reduce((acc, record) => {
      const date = record.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += record.duration;
      return acc;
    }, {} as Record<string, number>);

    // 按分类统计
    const categoryStats = timeRecords.reduce((acc, record) => {
      const categoryName = record.category?.name || '未分类';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += record.duration;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalTime,
      dailyStats,
      categoryStats,
      period,
      recordCount: timeRecords.length
    });
  } catch (error) {
    console.error('获取时间统计错误:', error);
    res.status(500).json({ error: '获取时间统计失败' });
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            timeRecords: true
          }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('获取分类统计错误:', error);
    res.status(500).json({ error: '获取分类统计失败' });
  }
};

export const getProductivityReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { period = 'week' } = req.query;

    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // 获取任务完成情况
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: startDate
        }
      }
    });

    // 获取时间记录
    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate
        }
      }
    });

    // 计算生产力指标
    const totalTasks = completedTasks.length;
    const totalTime = timeRecords.reduce((sum, record) => sum + record.duration, 0);
    const avgTaskTime = totalTasks > 0 ? totalTime / totalTasks : 0;
    const completionRate = totalTasks / (totalTasks + await prisma.task.count({
      where: {
        userId,
        status: { in: ['TODO', 'IN_PROGRESS'] }
      }
    })) || 0;

    // 获取预测准确度
    const predictions = await prisma.prediction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      }
    });

    const accuratePredictions = predictions.filter(pred => {
      // 这里应该有更复杂的逻辑来计算预测准确度
      return pred.confidence > 0.7;
    });

    const predictionAccuracy = predictions.length > 0 ? accuratePredictions.length / predictions.length : 0;

    res.json({
      period,
      totalTasks,
      completedTasks,
      totalTime,
      avgTaskTime,
      completionRate,
      predictionAccuracy,
      taskCompletionTrend: calculateTrend(completedTasks, period),
      timeUsageTrend: calculateTrend(timeRecords, period)
    });
  } catch (error) {
    console.error('获取生产力报告错误:', error);
    res.status(500).json({ error: '获取生产力报告失败' });
  }
};

function calculateTrend(data: any[], period: string): number[] {
  // 简化的趋势计算
  const trend = [];
  const dataPoints = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12;
  
  for (let i = 0; i < dataPoints; i++) {
    trend.push(Math.floor(Math.random() * 100)); // 模拟数据
  }
  
  return trend;
}