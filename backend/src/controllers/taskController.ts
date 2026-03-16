import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import aiService from '../services/aiService';

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

    // 如果启用了自动分类，使用AI分类
    let categoryId = taskData.categoryId;
    if (!categoryId) {
      try {
        const classification = await aiService.classifyTask({
          title: taskData.title,
          description: taskData.description,
          userId
        });

        // 查找或创建分类
        let category = await prisma.category.findFirst({
          where: {
            userId,
            name: classification.category
          }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              userId,
              name: classification.category,
              color: getRandomColor()
            }
          });
        }

        categoryId = category.id;
      } catch (error) {
        console.warn('AI分类失败，使用默认分类:', error);
      }
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        categoryId,
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

    // 使用AI进行任务分类
    const classification = await aiService.classifyTask({
      title: task.title,
      description: task.description,
      userId
    });

    // 查找或创建分类
    let category = await prisma.category.findFirst({
      where: {
        userId,
        name: classification.category
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId,
          name: classification.category,
          color: getRandomColor()
        }
      });
    }

    // 更新任务分类
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { categoryId: category.id },
      include: { category: true }
    });

    res.json({ 
      message: '任务分类完成',
      classification,
      task: updatedTask
    });
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
      where: { id, userId },
      include: { category: true }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 使用AI进行时间预测
    const prediction = await aiService.predictTaskTime({
      title: task.title,
      description: task.description,
      category: task.category?.name,
      userId
    });

    // 保存预测结果
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId,
        taskTitle: task.title,
        predictedTime: prediction.estimatedTime,
        confidence: prediction.confidence
      }
    });

    res.json({
      message: '时间预测完成',
      prediction,
      savedPrediction
    });
  } catch (error) {
    console.error('时间预测错误:', error);
    res.status(500).json({ error: '时间预测失败' });
  }
};

// 生成随机颜色
function getRandomColor(): string {
  const colors = [
    '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#096dd9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}