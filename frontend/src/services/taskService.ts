import api from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  category?: {
    name: string;
    color: string;
  };
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  estimatedTime?: number;
  categoryId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

export const taskService = {
  // 获取任务列表
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    categoryId?: string;
  }): Promise<Task[]> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // 获取单个任务
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // 创建任务
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // 更新任务
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // 删除任务
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // AI任务分类
  categorizeTask: async (id: string): Promise<any> => {
    const response = await api.post(`/tasks/${id}/categorize`);
    return response.data;
  },

  // AI时间预测
  predictTaskTime: async (id: string): Promise<any> => {
    const response = await api.post(`/tasks/${id}/predict-time`);
    return response.data;
  }
};

export default taskService;