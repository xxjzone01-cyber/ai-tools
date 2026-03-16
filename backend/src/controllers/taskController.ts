import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  categoryId?: string;
}

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { status, priority, categoryId } = req.query;

    const where: any = { userId };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        timeRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('获取任务列表错误:', error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        category: true,
        timeRecords: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    res.json(task);
  } catch (error) {
    console.error('获取任务详情错误:', error);
    res.status(500).json({ error: '获取任务详情失败' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const taskData: TaskRequest = req.body;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
      },
      include: {
        category: true
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const taskData: Partial<TaskRequest> = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    res.json(task);
  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({ error: '更新任务失败' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({ message: '任务删除成功' });
  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
};

export const categorizeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 这里应该集成AI服务进行任务分类
    // 现在返回一个模拟的分类结果
    const categories = await prisma.category.findMany({
      where: { userId }
    });

    if (categories.length === 0) {
      // 如果没有分类，创建一个默认分类
      const defaultCategory = await prisma.category.create({
        data: {
          name: '未分类',
          color: '#808080',
          userId
        }
      });

      await prisma.task.update({
        where: { id },
        data: { categoryId: defaultCategory.id }
      });

      res.json({ 
        message: '任务分类完成',
        category: defaultCategory 
      });
    } else {
      // 简单的规则分类（实际应该用AI）
      const category = categories[0];
      await prisma.task.update({
        where: { id },
        data: { categoryId: category.id }
      });

      res.json({ 
        message: '任务分类完成',
        category 
      });
    }
  } catch (error) {
    console.error('任务分类错误:', error);
    res.status(500).json({ error: '任务分类失败' });
  }
};

export const predictTaskTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 这里应该集成AI服务进行时间预测
    // 现在返回一个模拟的预测结果
    const estimatedTime = task.estimatedTime || 60; // 默认60分钟
    const confidence = 0.75; // 模拟置信度

    const prediction = await prisma.prediction.create({
      data: {
        userId,
        taskTitle: task.title,
        predictedTime: estimatedTime,
        confidence
      }
    });

    res.json({
      message: '时间预测完成',
      prediction
    });
  } catch (error) {
    console.error('时间预测错误:', error);
    res.status(500).json({ error: '时间预测失败' });
  }
};