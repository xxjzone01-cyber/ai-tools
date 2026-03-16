import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Select, DatePicker } from 'antd';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  TrophyOutlined,
  CalendarOutlined,
  TargetOutlined,
  TrendingUpOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Analytics: React.FC = () => {
  // 时间分布数据
  const timeDistribution = [
    { name: '工作', value: 35, color: '#1890ff' },
    { name: '学习', value: 25, color: '#52c41a' },
    { name: '运动', value: 15, color: '#fa8c16' },
    { name: '娱乐', value: 15, color: '#f5222d' },
    { name: '其他', value: 10, color: '#722ed1' }
  ];

  // 每日专注时长
  const dailyFocus = [
    { date: '3/10', focus: 4.2, tasks: 8 },
    { date: '3/11', focus: 3.8, tasks: 6 },
    { date: '3/12', focus: 5.1, tasks: 9 },
    { date: '3/13', focus: 4.5, tasks: 7 },
    { date: '3/14', focus: 3.9, tasks: 8 },
    { date: '3/15', focus: 4.8, tasks: 10 },
    { date: '3/16', focus: 4.2, tasks: 8 }
  ];

  // 任务完成趋势
  const completionTrend = [
    { date: '3/10', completed: 6, total: 8 },
    { date: '3/11', completed: 5, total: 7 },
    { date: '3/12', completed: 8, total: 9 },
    { date: '3/13', completed: 6, total: 8 },
    { date: '3/14', completed: 7, total: 9 },
    { date: '3/15', completed: 9, total: 10 },
    { date: '3/16', completed: 8, total: 9 }
  ];

  // 优先级分布
  const priorityDistribution = [
    { name: '高优先级', value: 35, color: '#f5222d' },
    { name: '中优先级', value: 45, color: '#fa8c16' },
    { name: '低优先级', value: 20, color: '#52c41a' }
  ];

  // 统计卡片数据
  const stats = [
    { title: '本周专注时长', value: 28.5, suffix: 'h', icon: <ClockCircleOutlined /> },
    { title: '完成任务数', value: 49, suffix: '个', icon: <CheckCircleOutlined /> },
    { title: '平均完成率', value: 87, suffix: '%', icon: <TrophyOutlined /> },
    { title: '预测准确率', value: 92, suffix: '%', icon: <TargetOutlined /> }
  ];

  const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1'];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="数据分析" size="small">
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={6}>
                <Select defaultValue="week" style={{ width: '100%' }}>
                  <Option value="day">今日</Option>
                  <Option value="week">本周</Option>
                  <Option value="month">本月</Option>
                  <Option value="year">本年</Option>
                </Select>
              </Col>
              <Col span={12}>
                <RangePicker style={{ width: '100%' }} />
              </Col>
              <Col span={6}>
                <Button type="primary" icon={<TrendingUpOutlined />}>
                  导出报告
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card size="small">
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="时间分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="每日专注时长" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyFocus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="专注时长(小时)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="任务完成趋势" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#52c41a" name="已完成" />
                <Bar dataKey="total" fill="#d9d9d9" name="总任务数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="优先级分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="AI建议" size="small">
            <List
              dataSource={[
                {
                  title: '时间管理建议',
                  description: '您在下午2-4点的专注度较低，建议安排一些轻松的任务或休息时间。',
                  type: 'info'
                },
                {
                  title: '任务优化建议',
                  description: '高优先级任务较多，建议将部分任务委托或延后处理。',
                  type: 'warning'
                },
                {
                  title: '效率提升建议',
                  description: '您的任务完成率很高，继续保持！建议尝试番茄工作法提高专注度。',
                  type: 'success'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;