import api from './api';

export interface TimeStats {
  totalTime: number;
  dailyStats: Record<string, number>;
  categoryStats: Record<string, number>;
  period: string;
  recordCount: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  _count: {
    timeRecords: number;
  };
}

export interface ProductivityReport {
  period: string;
  totalTasks: number;
  completedTasks: number;
  totalTime: number;
  avgTaskTime: number;
  completionRate: number;
  predictionAccuracy: number;
  taskCompletionTrend: number[];
  timeUsageTrend: number[];
}

export const analyticsService = {
  // 获取时间统计
  getTimeStats: async (period: string = 'week'): Promise<TimeStats> => {
    const response = await api.get('/analytics/time-stats', { params: { period } });
    return response.data;
  },

  // 获取分类统计
  getCategoryStats: async (): Promise<CategoryStat[]> => {
    const response = await api.get('/analytics/category-stats');
    return response.data;
  },

  // 获取生产力报告
  getProductivityReport: async (period: string = 'week'): Promise<ProductivityReport> => {
    const response = await api.get('/analytics/productivity-report', { params: { period } });
    return response.data;
  }
};

export default analyticsService;