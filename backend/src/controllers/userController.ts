import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json({
      message: '用户信息更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
};