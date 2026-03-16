import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import notificationController from '../controllers/notificationController';

const prisma = new PrismaClient();

export class SchedulerService {
  private dailySummaryJob: cron.ScheduledTask | null = null;
  private weeklyReportJob: cron.ScheduledTask | null = null;

  constructor() {
    this.setupScheduler();
  }

  private setupScheduler() {
    // 每日总结任务 - 每晚21点执行
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      const dailySummaryTime = process.env.DAILY_SUMMARY_TIME || '21:00';
      const [dailyHour, dailyMinute] = dailySummaryTime.split(':').map(Number);

      this.dailySummaryJob = cron.schedule(
        `${dailyMinute} ${dailyHour} * * *`,
        this.sendDailySummaries,
        {
          scheduled: true,
          timezone: 'Asia/Shanghai'
        }
      );

      console.log(`每日总结任务已设置，执行时间: ${dailySummaryTime}`);

      // 每周报告任务 - 每周一上午9点执行
      const weeklyReportDay = process.env.WEEKLY_REPORT_DAY || '1';
      const weeklyHour = 9;
      const weeklyMinute = 0;

      this.weeklyReportJob = cron.schedule(
        `${weeklyMinute} ${weeklyHour} * * ${weeklyReportDay}`,
        this.sendWeeklyReports,
        {
          scheduled: true,
          timezone: 'Asia/Shanghai'
        }
      );

      console.log(`每周报告任务已设置，执行时间: 周一 ${weeklyHour}:00`);
    }
  }

  // 发送每日总结
  private sendDailySummaries = async () => {
    try {
      console.log('开始发送每日总结邮件...');

      // 获取所有活跃用户
      const users = await prisma.user.findMany({
        where: {
          tasks: {
            some: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      console.log(`找到 ${users.length} 个活跃用户`);

      // 为每个用户发送每日总结
      for (const user of users) {
        try {
          await notificationController.sendDailySummary(
            { user: { userId: user.id } } as any,
            body: {}
          } as any);
          console.log(`已为用户 ${user.email} 发送每日总结`);
        } catch (error) {
          console.error(`为用户 ${user.email} 发送每日总结失败:`, error);
        }
      }

      console.log('每日总结邮件发送完成');
    } catch (error) {
      console.error('发送每日总结失败:', error);
    }
  };

  // 发送每周报告
  private sendWeeklyReports = async () => {
    try {
      console.log('开始发送每周报告邮件...');

      // 获取所有活跃用户
      const users = await prisma.user.findMany({
        where: {
          tasks: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      console.log(`找到 ${users.length} 个活跃用户`);

      // 为每个用户发送每周报告
      for (const user of users) {
        try {
          await notificationController.sendWeeklyReport(
            { user: { userId: user.id } } as any,
            body: {}
          } as any);
          console.log(`已为用户 ${user.email} 发送每周报告`);
        } catch (error) {
          console.error(`为用户 ${user.email} 发送每周报告失败:`, error);
        }
      }

      console.log('每周报告邮件发送完成');
    } catch (error) {
      console.error('发送每周报告失败:', error);
    }
  };

  // 停止调度器
  stop(): void {
    if (this.dailySummaryJob) {
      this.dailySummaryJob.stop();
      console.log('每日总结任务已停止');
    }
    if (this.weeklyReportJob) {
      this.weeklyReportJob.stop();
      console.log('每周报告任务已停止');
    }
  }
}

export default new SchedulerService();