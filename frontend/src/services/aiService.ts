import api from './api';

export interface AIRequest {
  taskTitle: string;
  priority: string;
  estimatedTime: number;
}

export interface AIAdvice {
  advice: string[];
  suggestions: string[];
  priority: string;
}

export interface SmartReminder {
  taskTitle: string;
  reminderTime: string;
  reason: string;
}

export const aiService = {
  // 获取时间管理建议
  getTimeManagementAdvice: async (request: AIRequest): Promise<AIAdvice> => {
    const response = await api.post('/reminders/advice', request);
    return response.data.advice;
  },

  // 获取智能提醒
  getSmartReminders: async (): Promise<{ reminders: SmartReminder[] }> => {
    const response = await api.get('/reminders/smart');
    return response.data;
  },

  // AI任务分类
  classifyTask: async (taskId: string): Promise<any> => {
    const response = await api.post(`/tasks/${taskId}/categorize`);
    return response.data;
  },

  // AI时间预测
  predictTaskTime: async (taskId: string): Promise<any> => {
    const response = await api.post(`/tasks/${taskId}/predict-time`);
    return response.data;
  }
};

export default aiService;