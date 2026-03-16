import api from './api';

export interface TimeRecord {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  createdAt: string;
  task?: {
    id: string;
    title: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface StartTimeTrackingRequest {
  taskId?: string;
  categoryId?: string;
}

export interface ActiveTrackingResponse {
  hasActiveTracking: boolean;
  activeRecord?: TimeRecord;
}

export const timeTrackingService = {
  // 开始时间追踪
  startTimeTracking: async (data: StartTimeTrackingRequest): Promise<TimeRecord> => {
    const response = await api.post('/time-tracking/start', data);
    return response.data.timeRecord;
  },

  // 停止时间追踪
  stopTimeTracking: async (id: string): Promise<TimeRecord> => {
    const response = await api.post(`/time-tracking/${id}/stop`);
    return response.data.timeRecord;
  },

  // 获取时间记录
  getTimeRecords: async (params?: {
    taskId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeRecord[]> => {
    const response = await api.get('/time-tracking', { params });
    return response.data;
  },

  // 获取活跃的时间追踪
  getActiveTimeTracking: async (): Promise<ActiveTrackingResponse> => {
    const response = await api.get('/time-tracking/active');
    return response.data;
  }
};

export default timeTrackingService;