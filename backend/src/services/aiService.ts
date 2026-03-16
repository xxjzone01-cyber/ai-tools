import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaskClassificationRequest {
  title: string;
  description?: string;
  userId: string;
}

interface TaskTimePredictionRequest {
  title: string;
  description?: string;
  category?: string;
  userId: string;
}

interface TimeManagementAdviceRequest {
  userId: string;
  taskTitle: string;
  priority: string;
  estimatedTime: number;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // AI任务分类
  async classifyTask(request: TaskClassificationRequest): Promise<{
    category: string;
    confidence: number;
    reasoning: string;
  }> {
    try {
      // 获取用户的历史分类
      const userCategories = await prisma.category.findMany({
        where: { userId: request.userId }
      });

      const categoryList = userCategories.map(c => c.name).join(', ');

      const prompt = `作为一个智能时间管理助手，请分析以下任务并分类：
任务标题：${request.title}
任务描述：${request.description || '无'}
用户现有分类：${categoryList || '工作、学习、运动、娱乐、其他'}

请返回JSON格式的分类结果，包括：
1. category: 最合适的分类名称
2. confidence: 置信度(0-1)
3. reasoning: 分类理由

如果没有合适的现有分类，请根据任务内容创建一个新的分类。`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个专业的任务分类助手，擅长根据任务内容进行智能分类。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // 保存预测结果
      await prisma.prediction.create({
        data: {
          userId: request.userId,
          taskTitle: request.title,
          predictedTime: 30, // 默认30分钟，后续可以更精确
          confidence: result.confidence
        }
      });

      return result;

    } catch (error) {
      console.error('AI分类失败:', error);
      throw new Error('AI分类服务暂时不可用');
    }
  }

  // AI时间预测
  async predictTaskTime(request: TaskTimePredictionRequest): Promise<{
    estimatedTime: number;
    confidence: number;
    reasoning: string;
  }> {
    try {
      // 获取用户的历史任务数据
      const userTasks = await prisma.task.findMany({
        where: {
          userId: request.userId,
          category: request.category ? {
            name: request.category
          } : undefined
        },
        take: 20
      });

      // 计算历史平均用时
      const averageTime = userTasks.length > 0
        ? userTasks.reduce((sum, task) => sum + (task.actualTime || task.estimatedTime || 30), 0) / userTasks.length
        : 30;

      const prompt = `作为一个时间管理专家，请预测以下任务的完成时间：
任务标题：${request.title}
任务描述：${request.description || '无'}
任务分类：${request.category || '未分类'}
用户历史平均用时：${Math.round(averageTime)}分钟

请返回JSON格式的预测结果，包括：
1. estimatedTime: 预估完成时间（分钟）
2. confidence: 置信度(0-1)
3. reasoning: 预测理由`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个专业的时间预测专家，擅长根据任务复杂度和历史数据进行精确预测。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      // 保存预测结果
      await prisma.prediction.create({
        data: {
          userId: request.userId,
          taskTitle: request.title,
          predictedTime: result.estimatedTime,
          confidence: result.confidence
        }
      });

      return result;

    } catch (error) {
      console.error('AI时间预测失败:', error);
      throw new Error('AI时间预测服务暂时不可用');
    }
  }

  // 时间管理建议
  async getTimeManagementAdvice(request: TimeManagementAdviceRequest): Promise<{
    advice: string[];
    suggestions: string[];
    priority: string;
  }> {
    try {
      // 获取用户的时间记录
      const timeRecords = await prisma.timeRecord.findMany({
        where: { userId: request.userId },
        orderBy: { startTime: 'desc' },
        take: 50
      });

      // 分析用户的时间使用模式
      const timePattern = this.analyzeTimePattern(timeRecords);

      const prompt = `作为一个时间管理顾问，请根据以下信息提供个性化建议：
任务标题：${request.taskTitle}
任务优先级：${request.priority}
预估时间：${request.estimatedTime}分钟
用户时间模式：${timePattern}

请返回JSON格式的建议，包括：
1. advice: 时间管理建议数组(3-5条)
2. suggestions: 执行建议数组(2-3条)
3. priority: 建议的优先级调整`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个专业的时间管理顾问，擅长提供个性化的时间管理建议。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('AI建议失败:', error);
      throw new Error('AI建议服务暂时不可用');
    }
  }

  // 分析时间模式
  private analyzeTimePattern(timeRecords: any[]): string {
    if (timeRecords.length === 0) return '暂无时间记录';

    // 计算不同时段的使用情况
    const hourlyUsage = new Array(24).fill(0);
    timeRecords.forEach(record => {
      const hour = new Date(record.startTime).getHours();
      hourlyUsage[hour] += record.duration;
    });

    // 找出最活跃的时间段
    const peakHours = hourlyUsage
      .map((time, hour) => ({ hour, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 3)
      .map(item => `${item.hour}:00`)
      .join(', ');

    return `高峰时段：${peakHours}`;
  }

  // 智能提醒建议
  async getSmartReminders(userId: string): Promise<{
    reminders: Array<{
      taskTitle: string;
      reminderTime: string;
      reason: string;
    }>;
  }> {
    try {
      // 获取用户的待办任务
      const pendingTasks = await prisma.task.findMany({
        where: {
          userId,
          status: 'TODO'
        },
        include: {
          category: true
        }
      });

      const reminders = [];

      // 为每个任务生成智能提醒
      for (const task of pendingTasks) {
        if (!task.dueDate) continue;

        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const timeUntilDue = dueDate.getTime() - now.getTime();
        const daysUntilDue = timeUntilDue / (1000 * 60 * 60 * 24);

        let reminderTime: string;
        let reason: string;

        // 根据任务优先级和截止时间生成提醒
        if (task.priority === 'HIGH' && daysUntilDue <= 1) {
          reminderTime = '立即';
          reason = '高优先级任务即将到期';
        } else if (task.priority === 'HIGH' && daysUntilDue <= 3) {
          reminderTime = '今天';
          reason = '高优先级任务即将到期';
        } else if (task.priority === 'MEDIUM' && daysUntilDue <= 2) {
          reminderTime = '明天';
          reason = '中等优先级任务即将到期';
        } else if (daysUntilDue <= 1) {
          reminderTime = '今天';
          reason = '任务即将到期';
        } else if (daysUntilDue <= 3) {
          reminderTime = '本周内';
          reason = '建议提前规划';
        } else {
          continue;
        }

        reminders.push({
          taskTitle: task.title,
          reminderTime,
          reason
        });
      }

      return { reminders: reminders.slice(0, 5) };

    } catch (error) {
      console.error('智能提醒失败:', error);
      throw new Error('智能提醒服务暂时不可用');
    }
  }
}

export default new AIService();