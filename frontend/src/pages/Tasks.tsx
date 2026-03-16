import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Select, 
  Modal, 
  Form, 
  message,
  Space,
  Popconfirm,
  Badge,
  Row,
  Col,
  Statistic,
  List
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  RobotOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import taskService from '../services/taskService';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../services/taskService';
import aiService from '../services/aiService';
import TimeTracker from '../components/TimeTracker';

const { Option } = Select;
const { Search } = Input;

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error('加载任务列表失败:', error);
      message.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          HIGH: 'red',
          MEDIUM: 'orange',
          LOW: 'green'
        };
        const labels = {
          HIGH: '高',
          MEDIUM: '中',
          LOW: '低'
        };
        return <Tag color={colors[priority]}>{labels[priority]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          TODO: 'default',
          IN_PROGRESS: 'processing',
          COMPLETED: 'success',
          CANCELLED: 'error'
        };
        const labels = {
          TODO: '待开始',
          IN_PROGRESS: '进行中',
          COMPLETED: '已完成',
          CANCELLED: '已取消'
        };
        return <Badge status={colors[status]} text={labels[status]} />;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category ? (
        <Tag color={category.color}>{category.name}</Tag>
      ) : <Tag color="default">未分类</Tag>
    },
    {
      title: '截止时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '用时',
      key: 'time',
      render: (_, record) => {
        if (record.estimatedTime && record.actualTime) {
          return `${record.actualTime}/${record.estimatedTime}分钟`;
        } else if (record.estimatedTime) {
          return `预估${record.estimatedTime}分钟`;
        } else if (record.actualTime) {
          return `实际${record.actualTime}分钟`;
        }
        return '-';
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<RobotOutlined />}
            onClick={() => handleAIClassify(record)}
          >
            AI分类
          </Button>
          <Button 
            type="link" 
            icon={<ThunderboltOutlined />}
            onClick={() => handleAIPredict(record)}
          >
            AI预测
          </Button>
          <Button 
            type="link" 
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleAIAdvice(record)}
          >
            AI建议
          </Button>
          <Popconfirm
            title="确定要删除这个任务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      message.success('任务删除成功');
      loadTasks();
    } catch (error: any) {
      console.error('删除任务失败:', error);
      message.error('删除任务失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTask) {
        // 编辑任务
        await taskService.updateTask(editingTask.id, values as UpdateTaskRequest);
        message.success('任务更新成功');
      } else {
        // 新建任务
        await taskService.createTask(values as CreateTaskRequest);
        message.success('任务创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadTasks();
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('操作失败，请重试');
    }
  };

  const handleAIClassify = async (task: Task) => {
    try {
      const result = await aiService.classifyTask(task.id);
      message.success(`AI分类完成：${result.classification.category}`);
      loadTasks();
    } catch (error: any) {
      console.error('AI分类失败:', error);
      message.error('AI分类失败');
    }
  };

  const handleAIPredict = async (task: Task) => {
    try {
      const result = await aiService.predictTaskTime(task.id);
      message.success(`AI预测完成：${result.prediction.estimatedTime}分钟，置信度：${Math.round(result.prediction.confidence * 100)}%`);
      loadTasks();
    } catch (error: any) {
      console.error('AI预测失败:', error);
      message.error('AI预测失败');
    }
  };

  const handleAIAdvice = async (task: Task) => {
    try {
      setAiLoading(true);
      setSelectedTask(task);
      const advice = await aiService.getTimeManagementAdvice({
        taskTitle: task.title,
        priority: task.priority,
        estimatedTime: task.estimatedTime || 30
      });
      setAiAdvice(advice);
      setAiModalVisible(true);
    } catch (error: any) {
      console.error('获取AI建议失败:', error);
      message.error('获取AI建议失败');
    } finally {
      setAiLoading(false);
    }
  };

  // 计算统计信息
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic 
            title="总任务" 
            value={totalTasks} 
            prefix={<CheckCircleOutlined />} 
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic 
            title="已完成" 
            value={completedTasks} 
            prefix={<ClockCircleOutlined />} 
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic 
            title="完成率" 
            value={completionRate} 
            suffix="%" 
            prefix={<ExclamationCircleOutlined />} 
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={16}>
          <Card 
            title="任务管理" 
            extra={
              <Space>
                <Button 
                  onClick={() => loadTasks()} 
                  icon={<SearchOutlined />}
                >
                  刷新
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新建任务
                </Button>
              </Space>
            }
          >
            <div style={{ marginBottom: '16px' }}>
              <Search
                placeholder="搜索任务..."
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
            </div>
            
            <Table
              columns={columns}
              dataSource={tasks}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个任务`,
                pageSize: 10
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <TimeTracker />
        </Col>
      </Row>

      {/* 任务编辑/创建弹窗 */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {editingTask ? '更新' : '创建'}
          </Button>
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="输入任务标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea placeholder="输入任务描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="选择优先级">
              <Option value="HIGH">高</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="LOW">低</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value="TODO">待开始</Option>
              <Option value="IN_PROGRESS">进行中</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="截止时间"
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="estimatedTime"
            label="预估时间（分钟）"
          >
            <Input type="number" placeholder="输入预估时间" />
          </Form.Item>
          
          <Form.Item
            name="actualTime"
            label="实际时间（分钟）"
          >
            <Input type="number" placeholder="输入实际时间" />
          </Form.Item>
        </Form>
      </Modal>

      {/* AI建议弹窗 */}
      <Modal
        title="AI 时间管理建议"
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAiModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {aiAdvice && (
          <div>
            <Card title="时间管理建议" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={aiAdvice.advice || []}
                renderItem={(item: string) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            <Card title="执行建议" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={aiAdvice.suggestions || []}
                renderItem={(item: string) => (
                  <List.Item>
                    <ThunderboltOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            {aiAdvice.priority && (
              <Card title="优先级建议" size="small">
                <Statistic
                  title="建议优先级"
                  value={aiAdvice.priority === 'HIGH' ? '高' : aiAdvice.priority === 'MEDIUM' ? '中' : '低'}
                  valueStyle={{ color: aiAdvice.priority === 'HIGH' ? '#f5222d' : aiAdvice.priority === 'MEDIUM' ? '#fa8c16' : '#52c41a' }}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;