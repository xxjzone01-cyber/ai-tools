import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Tag, Button, message, Alert } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  TrendingUpOutlined,
  CalendarOutlined,
  TargetOutlined,
  BellOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import taskService from '../services/taskService';
import analyticsService from '../services/analyticsService';
import aiService from '../services/aiService';
import type { Task } from '../services/taskService';
import type { TimeStats } from '../services/analyticsService';
import type { SmartReminder } from '../services/aiService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TimeStats | null>(null);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 加载任务列表
      const tasksData = await taskService.getTasks();
      setTasks(tasksData.slice(0, 4)); // 只显示最近4个任务
      
      // 加载统计数据
      const statsData = await analyticsService.getTimeStats('day');
      setStats(statsData);

      // 加载智能提醒
      await loadSmartReminders();
      
    } catch (error: any) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSmartReminders = async () => {
    try {
      setRemindersLoading(true);
      const response = await aiService.getSmartReminders();
      setReminders(response.reminders);
    } catch (error: any) {
      console.error('加载智能提醒失败:', error);
      // 不显示错误，智能提醒失败不影响其他功能
    } finally {
      setRemindersLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'processing';
      case 'TODO': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 模拟今日时间分布数据
  const todayStats = [
    { name: '9:00', value: 30 },
    { name: '12:00', value: 45 },
    { name: '15:00', value: 60 },
    { name: '18:00', value: 30 },
    { name: '21:00', value: 45 }
  ];

  const taskStats = [
    { title: '今日任务', value: totalTasks, completed: completedTasks, icon: <CheckCircleOutlined /> },
    { title: '专注时长', value: Math.round((stats?.totalTime || 0) / 60), suffix: 'h', icon: <ClockCircleOutlined /> },
    { title: '完成率', value: completionRate, suffix: '%', icon: <TrendingUpOutlined /> },
    { title: '总时长', value: Math.round((stats?.totalTime || 0) / 60), suffix: 'min', icon: <TargetOutlined /> }
  ];

  const getReminderColor = (reminderTime: string) => {
    switch (reminderTime) {
      case '立即': return 'error';
      case '今天': return 'warning';
      case '明天': return 'processing';
      default: return 'default';
    }
  };

  return (
    <div>
      {/* 智能提醒区域 */}
      {reminders.length > 0 && (
        <Alert
          message="智能提醒"
          description={<RobotOutlined style={{ marginRight: '8px' }} AI为您生成了{reminders.length}条智能提醒}
          type="info"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="今日概览" size="small" loading={loading}>
            <Row gutter={[16, 16]}>
              {taskStats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card size="small">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.icon}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    {stat.title === '今日任务' && (
                      <Progress 
                        percent={completionRate} 
                        size="small" 
                        showInfo={false}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={8}>
          {/* 智能提醒卡片 */}
          {reminders.length > 0 && (
            <Card title={<><BellOutlined /> 智能提醒</Card>} size="small" loading={remindersLoading}>
              <List
                dataSource={reminders}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{item.taskTitle}</span>
                          <Tag color={getReminderColor(item.reminderTime)}>{item.reminderTime}</Tag>
                        </div>
                      }
                      description={item.reason}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
        <Col xs={24} lg={16}>
          <Card title="今日时间分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={todayStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={8}>
          <Card title="最近任务" size="small" loading={loading}>
            <List
              dataSource={tasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.title}</span>
                        <Tag color={getPriorityColor(item.priority)}>{item.priority === 'HIGH' ? '高' : item.priority === 'MEDIUM' ? '中' : '低'}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={getStatusColor(item.status)}>{item.status === 'COMPLETED' ? '已完成' : item.status === 'IN_PROGRESS' ? '进行中' : item.status === 'TODO' ? '待开始' : '已取消'}</Tag>
                        <span style={{ color: '#999' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card 
            title="快速操作" 
            size="small"
            extra={
              <Button type="primary" icon={<CalendarOutlined />}>
                查看日历
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Button 
                  type="primary" 
                  block 
                  icon={<TargetOutlined />}
                  style={{ marginBottom: '8px' }}
                >
                  新建任务
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button 
                  type="default" 
                  block 
                  icon={<ClockCircleOutlined />}
                  style={{ marginBottom: '8px' }}
                >
                  开始计时
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button 
                  type="default" 
                  block 
                  icon={<TrendingUpOutlined />}
                  style={{ marginBottom: '8px' }}
                >
                  查看报告
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button 
                  type="default" 
                  block 
                  icon={<ExclamationCircleOutlined />}
                  style={{ marginBottom: '8px' }}
                >
                  AI建议
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;