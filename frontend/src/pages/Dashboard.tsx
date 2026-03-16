import React from 'react';
import { Row, Col, Card, Statistic, Progress, List, Tag, Button } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  TrendingUpOutlined,
  CalendarOutlined,
  TargetOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  // 模拟数据
  const todayStats = [
    { name: '9:00', value: 30 },
    { name: '12:00', value: 80 },
    { name: '15:00', value: 45 },
    { name: '18:00', value: 90 },
    { name: '21:00', value: 60 }
  ];

  const taskStats = [
    { title: '今日任务', value: 8, completed: 5, icon: <CheckCircleOutlined /> },
    { title: '本周任务', value: 25, completed: 18, icon: <TargetOutlined /> },
    { title: '专注时长', value: '4.5h', suffix: 'h', icon: <ClockCircleOutlined /> },
    { title: '完成率', value: 85, suffix: '%', icon: <TrendingUpOutlined /> }
  ];

  const recentTasks = [
    { title: '完成项目报告', status: '已完成', priority: '高', time: '2小时前' },
    { title: '客户会议准备', status: '进行中', priority: '中', time: '30分钟前' },
    { title: '代码审查', status: '待开始', priority: '低', time: '1小时前' },
    { title: '团队周会', status: '已完成', priority: '高', time: '3小时前' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'red';
      case '中': return 'orange';
      case '低': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return 'success';
      case '进行中': return 'processing';
      case '待开始': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="今日概览" size="small">
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
                        percent={(stat.completed / stat.value) * 100} 
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
        <Col xs={24} lg={8}>
          <Card title="最近任务" size="small">
            <List
              dataSource={recentTasks}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">查看</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.title}</span>
                        <Tag color={getPriorityColor(item.priority)}>{item.priority}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                        <span style={{ color: '#999' }}>{item.time}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
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