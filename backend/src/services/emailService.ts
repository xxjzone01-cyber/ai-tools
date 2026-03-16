import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: any;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || 'noreply@smarttime.ai'
    };

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password
      }
    });
  }

  // 发送邮件
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@smarttime.ai',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw new Error('邮件发送失败');
    }
  }

  // 发送欢迎邮件
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = '欢迎使用智能时间管家';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1890ff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .button { background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 智能时间管家</h1>
          </div>
          <div class="content">
            <p>亲爱的 ${name}，</p>
            <p>欢迎加入智能时间管家！我们很高兴能够帮助您更好地管理时间，提升生产力。</p>
            
            <h2>🎯 核心功能</h2>
            <ul>
              <li>🤖 AI智能任务分类</li>
              <li>⏱️ 精确时间预测</li>
              <li>📊 详细时间分析</li>
              <li>💡 个性化时间建议</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">开始使用</a>
            </p>
            
            <p>如有任何问题，请随时联系我们。我们会在24小时内回复。</p>
            <p>祝您使用愉快！</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; 2026 Smart Time Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  // 发送任务提醒邮件
  async sendTaskReminderEmail(
    email: string, 
    name: string,
    tasks: Array<{
      title: string;
      priority: string;
      dueDate: string;
    }>
  ): Promise<void> {
    const subject = '📋 您有任务即将到期';
    const taskList = tasks.map(task => `
      <li>
        <strong>${task.title}</strong><br>
        <span style="color: ${task.priority === 'HIGH' ? '#f5222d' : task.priority === 'MEDIUM' ? '#fa8c16' : '#52c41a'}">
          ${task.priority === 'HIGH' ? '高优先级' : task.priority === 'MEDIUM' ? '中优先级' : '低优先级'}
        </span> - 
        截止：${new Date(task.dueDate).toLocaleDateString()}
      </li>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1890ff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .task-list { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ 任务提醒</h1>
          </div>
          <div class="content">
            <p>亲爱的 ${name}，</p>
            <p>您有 ${tasks.length} 个任务即将到期，请及时处理：</p>
            
            <div class="task-list">
              <ul style="list-style: none; padding: 0;">
                ${taskList}
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" class="button">查看所有任务</a>
            </p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; 2026 Smart Time Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  // 发送每日总结邮件
  async sendDailySummaryEmail(
    email: string,
    name: string,
    data: {
      date: string;
      completedTasks: number;
      totalTasks: number;
      totalFocusTime: number;
      productivityScore: number;
    }
  ): Promise<void> {
    const subject = `📊 ${new Date(data.date).toLocaleDateString()} - 您的每日时间总结`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 4px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 24px; font-weight: bold; color: #1890ff; }
          .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
          .button { background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 每日时间总结</h1>
            <p style="margin: 0; opacity: 0.9;">${new Date(data.date).toLocaleDateString()}</p>
          </div>
          <div class="content">
            <p>亲爱的 ${name}，</p>
            <p>以下是您今日的时间使用情况：</p>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${data.completedTasks}/${data.totalTasks}</div>
                <div class="stat-label">完成任务</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${Math.round(data.totalFocusTime / 60)}h</div>
                <div class="stat-label">专注时长</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.productivityScore}%</div>
                <div class="stat-label">生产力得分</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: ${data.productivityScore >= 80 ? '#52c41a' : data.productivityScore >= 60 ? '#fa8c16' : '#f5222d'}">
                  ${data.productivityScore >= 80 ? '优秀' : data.productivityScore >= 60 ? '良好' : '需提升'}
                </div>
                <div class="stat-label">今日评价</div>
              </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">💡 改进建议</h3>
              <ul>
                ${data.productivityScore < 60 ? '<li>建议增加专注时间，减少任务切换频率</li>' : ''}
                ${data.completedTasks / data.totalTasks < 0.7 ? '<li>尝试将大任务分解为更小的子任务</li>' : ''}
                ${data.totalFocusTime < 120 ? '<li>建议增加每日专注时间到至少2小时</li>' : ''}
                <li>定期回顾和调整时间管理策略</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics" class="button">查看详细分析</a>
            </p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; 2026 Smart Time Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  // 发送周报邮件
  async sendWeeklyReportEmail(
    email: string,
    name: string,
    data: {
      weekStart: string;
      weekEnd: string;
      totalTasks: number;
      completedTasks: number;
      avgDailyFocus: number;
      topCategory: string;
      improvement: string;
    }
  ): Promise<void> {
    const subject = '📈 您的每周时间管理报告';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #52c41a 0%, #13c2c2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .button { background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 每周报告</h1>
            <p style="margin: 0; opacity: 0.9;">${new Date(data.weekStart).toLocaleDateString()} - ${new Date(data.weekEnd).toLocaleDateString()}</p>
          </div>
          <div class="content">
            <p>亲爱的 ${name}，</p>
            <p>以下是您本周的时间管理表现：</p>
            
            <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                  <strong>完成任务：</strong>
                  <span style="font-size: 24px; color: #52c41a;">${data.completedTasks}/${data.totalTasks}</span>
                </div>
                <div>
                  <strong>完成率：</strong>
                  <span style="font-size: 24px; color: #52c41a;">${Math.round((data.completedTasks / data.totalTasks) * 100)}%</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <strong>日均专注：</strong>
                  <span style="font-size: 24px; color: #1890ff;">${Math.round(data.avgDailyFocus / 60)}h</span>
                </div>
                <div>
                  <strong>最多类别：</strong>
                  <span style="font-size: 24px; color: #fa8c16;">${data.topCategory}</span>
                </div>
              </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0;">🎯 改进建议</h3>
              <p>${data.improvement}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics" class="button">查看详细报告</a>
            </p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; 2026 Smart Time Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

export default new EmailService();