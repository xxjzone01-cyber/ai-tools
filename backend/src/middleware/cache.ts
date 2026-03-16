import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// 创建内存缓存实例
const cache = new NodeCache({
  stdTTL: 600, // 默认缓存时间 10分钟
  checkperiod: 120, // 每2分钟清理过期缓存
  useClones: false
});

// 缓存中间件
export const cacheMiddleware = (duration: number = 600) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl || req.url;
    
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    // 检查缓存
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // 存储原始的res.json方法
    const originalJson = res.json;
    res.json = (body: any) => {
      cache.set(key, body, duration);
      res.setHeader('X-Cache', 'MISS');
      return originalJson.call(res, body);
    };

    next();
  };
};

// 清除缓存中间件
export const clearCache = (req: Request, res: Response, next: NextFunction) => {
  const key = req.originalUrl || req.url;
  cache.del(key);
  next();
};

// 清除所有缓存
export const clearAllCache = (): void => {
  cache.flushAll();
  console.log('所有缓存已清除');
};

// 获取缓存统计
export const getCacheStats = () => {
  const stats = cache.getStats();
  return {
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits / (stats.hits + stats.misses || 1) * 100
  };
};

// 清除特定模式的缓存
export const clearCachePattern = (pattern: string): void => {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
  console.log(`已清除匹配 "${pattern}" 的缓存`);
};

export default cache;