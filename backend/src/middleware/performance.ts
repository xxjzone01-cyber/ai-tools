import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface PerformanceData {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
}

const performanceMetrics: PerformanceData[] = [];
const MAX_METRICS = 1000; // 最多保存1000条性能数据

// 性能监控中间件
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();

  // 监听响应完成
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // 记录性能数据
    const metric: PerformanceData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: Date.now()
    };

    performanceMetrics.push(metric);

    // 保持数组大小限制
    if (performanceMetrics.length > MAX_METRICS) {
      performanceMetrics.shift();
    }

    // 慢请求警告
    if (responseTime > 3000) { // 超过3秒
      console.warn(`Slow request detected: ${req.method} ${req.url} - ${responseTime}ms`);
    }
  });

  next();
};

// 获取性能统计
export const getPerformanceStats = () => {
  if (performanceMetrics.length === 0) {
    return null;
  }

  const responseTimes = performanceMetrics.map(m => m.responseTime);
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);
  const minResponseTime = Math.min(...responseTimes);

  // 计算百分位数
  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

  // 计算错误率
  const errorCount = performanceMetrics.filter(m => m.statusCode >= 400).length;
  const errorRate = (errorCount / performanceMetrics.length) * 100;

  // 按端点分组统计
  const endpointStats = performanceMetrics.reduce((acc, metric) => {
    const key = metric.url;
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        totalTime: 0,
        errors: 0
      };
    }
    acc[key].count++;
    acc[key].totalTime += metric.responseTime;
    if (metric.statusCode >= 400) {
      acc[key].errors++;
    }
    return acc;
  }, {} as Record<string, { count: number; totalTime: number; errors: number }>);

  return {
    totalRequests: performanceMetrics.length,
    avgResponseTime: Math.round(avgResponseTime),
    maxResponseTime: Math.round(maxResponseTime),
    minResponseTime: Math.round(minResponseTime),
    p50ResponseTime: Math.round(p50),
    p95ResponseTime: Math.round(p95),
    p99ResponseTime: Math.round(p99),
    errorRate: Math.round(errorRate * 100) / 100,
    slowRequests: performanceMetrics.filter(m => m.responseTime > 3000).length,
    endpointStats: Object.entries(endpointStats).map(([url, stats]) => ({
      url,
      count: stats.count,
      avgTime: Math.round(stats.totalTime / stats.count),
      errorRate: Math.round((stats.errors / stats.count) * 100) / 100
    }))
  };
};

// 清除性能数据
export const clearPerformanceMetrics = (): void => {
  performanceMetrics.length = 0;
  console.log('性能指标已清除');
};

// 性能警告检查
export const checkPerformanceWarnings = (): string[] => {
  const warnings: string[] = [];
  const stats = getPerformanceStats();

  if (!stats) return warnings;

  // 检查平均响应时间
  if (stats.avgResponseTime > 1000) {
    warnings.push('⚠️ 平均响应时间超过1秒，建议优化数据库查询');
  }

  // 检查错误率
  if (stats.errorRate > 5) {
    warnings.push(`⚠️ 错误率较高(${stats.errorRate}%)，建议检查错误处理逻辑`);
  }

  // 检查慢请求比例
  const slowRequestRate = (stats.slowRequests / stats.totalRequests) * 100;
  if (slowRequestRate > 10) {
    warnings.push(`⚠️ 慢请求比例较高(${Math.round(slowRequestRate)}%)，建议检查性能瓶颈`);
  }

  return warnings;
};