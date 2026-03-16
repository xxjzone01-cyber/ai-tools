import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimeRecordRequest {
  taskId?: string;
  categoryId?: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export const startTimeTracking = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { taskId, categoryId } = req.body;

    // 创建时间记录开始
    const timeRecord = await prisma.timeRecord.create({
      data: {
        userId,
        taskId,
        categoryId,
        startTime: new Date(),
        endTime: new Date(), // 暂时设为相同时间，会在结束时更新
        duration: 0,
        createdAt: new Date()
      },
      include: {
        task: true,
        category: true
      }
    });

    res.status(201).json({
      message: '时间追踪已开始',
      timeRecord
    });
  } catch (error) {
    console.error('开始时间追踪错误:', error);
    res.status(500).json({ error: '开始时间追踪失败' });
  }
};

export const stopTimeTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const timeRecord = await prisma.timeRecord.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!timeRecord) {
      return res.status(404).json({ error: '时间记录不存在' });
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - new Date(timeRecord.startTime).getTime()) / 1000 / 60
    ); // 转换为分钟

    // 更新时间记录
    const updatedRecord = await prisma.timeRecord.update({
      where: { id },
      data: {
        endTime,
        duration
      },
      include: {
        task: true,
        category: true
      }
    });

    // 如果有关联任务，更新实际用时
    if (timeRecord.taskId) {
      await prisma.task.update({
        where: { id: timeRecord.taskId },
        data: {
          actualTime: duration
        }
      });
    }

    res.json({
      message: '时间追踪已停止',
      timeRecord: updatedRecord
    });
  } catch (error) {
    console.error('停止时间追踪错误:', error);
    res.status(500).json({ error: '停止时间追踪失败' });
  }
};

export const getTimeRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { taskId, categoryId, startDate, endDate } = req.query;

    const where: any = { userId };
    
    if (taskId) where.taskId = taskId;
    if (categoryId) where.categoryId = categoryId;
    if (startDate) where.startTime = { ...where.startTime, gte: new Date(startDate as string) };
    if (endDate) where.endTime = { ...where.endTime, lte: new Date(endDate as string) };

    const timeRecords = await prisma.timeRecord.findMany({
      where,
      include: {
        task: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(timeRecords);
  } catch (error) {
    console.error('获取时间记录错误:', error);
    res.status(500).json({ error: '获取时间记录失败' });
  }
};

export const getActiveTimeTracking = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    // 查找正在进行的时间追踪
    const activeRecord = await prisma.timeRecord.findFirst({
      where: {
        userId,
        // 假设开始时间和结束时间相同就是正在进行
        startTime: {
          equals: (prisma.timeRecord.fields.startTime as any)
        }
      },
      include: {
        task: true,
        category: true
      }
    });

    res.json({
      hasActiveTracking: !!activeRecord,
      activeRecord
    });
  } catch (error) {
    console.error('获取活跃时间追踪错误:', error);
    res.status(500).json({ error: '获取活跃时间追踪失败' });
  }
};