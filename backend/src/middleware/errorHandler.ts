import { Request, Response, NextFunction, Error as ExpressError } from 'express';
import { ZodError } from 'zod';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误代码枚举
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

// 错误消息映射
const errorMessages: Record<string, { message: string; statusCode: number }> = {
  [ErrorCodes.UNAUTHORIZED]: { message: '未授权访问', statusCode: 401 },
  [ErrorCodes.FORBIDDEN]: { message: '访问被拒绝', statusCode: 403 },
  [ErrorCodes.NOT_FOUND]: { message: '请求的资源不存在', statusCode: 404 },
  [ErrorCodes.VALIDATION_ERROR]: { message: '请求数据验证失败', statusCode: 400 },
  [ErrorCodes.INTERNAL_ERROR]: { message: '服务器内部错误', statusCode: 500 },
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: { message: '请求频率超过限制', statusCode: 429 },
  [ErrorCodes.EMAIL_SERVICE_ERROR]: { message: '邮件服务暂时不可用', statusCode: 503 },
  [ErrorCodes.AI_SERVICE_ERROR]: { message: 'AI服务暂时不可用', statusCode: 503 },
  [ErrorCodes.DATABASE_ERROR]: { message: '数据库操作失败', statusCode: 500 }
};

// 错误处理中间件
export const errorHandler = (
  err: Error | ExpressError | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });

  // Zod验证错误
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      code: ErrorCodes.VALIDATION_ERROR,
      message: '请求数据验证失败',
      details: err.errors
    });
  }

  // Prisma数据库错误
  if (err.code && err.code.startsWith('P')) {
    return res.status(500).json({
      error: 'database_error',
      code: ErrorCodes.DATABASE_ERROR,
      message: errorMessages[ErrorCodes.DATABASE_ERROR].message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // JWT认证错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'authentication_error',
      code: ErrorCodes.UNAUTHORIZED,
      message: '认证失败，请重新登录'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token_expired',
      code: ErrorCodes.UNAUTHORIZED,
      message: '登录已过期，请重新登录'
    });
  }

  // 自定义应用错误
  if (err instanceof AppError) {
    const errorInfo = errorMessages[err.statusCode as keyof typeof errorMessages] || {
      message: err.message,
      statusCode: err.statusCode
    };

    return res.status(err.statusCode).json({
      error: err.message,
      code: err.statusCode,
      message: errorInfo.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // 其他错误
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || errorMessages[ErrorCodes.INTERNAL_ERROR].message;

  res.status(statusCode).json({
    error: 'internal_error',
    code: ErrorCodes.INTERNAL_ERROR,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err })
  });
};

// 404错误处理
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'not_found',
    code: ErrorCodes.NOT_FOUND,
    message: '请求的端点不存在',
    path: req.originalUrl
  });
};

// 异步错误处理（用于未被捕获的Promise拒绝）
export const asyncErrorHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // 在生产环境中，你可能想要发送这个错误到监控系统
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // 在生产环境中，你可能想要优雅地关闭服务器
    process.exit(1);
  });
};

// 创建帮助函数
export const createError = (statusCode: number, message: string): AppError => {
  return new AppError(statusCode, message);
};

export const notFoundError = (message: string = '请求的资源不存在'): AppError => {
  return new AppError(404, message);
};

export const unauthorizedError = (message: string = '未授权访问'): AppError => {
  return new AppError(401, message);
};

export const forbiddenError = (message: string = '访问被拒绝'): AppError => {
  return new AppError(403, message);
};

export const validationError = (message: string = '请求数据验证失败'): AppError => {
  return new AppError(400, message);
};