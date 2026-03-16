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
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Search } = Input;

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  category?: {
    name: string;
    color: string;
  };
  createdAt: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: '完成项目报告',
        description: '准备Q4季度项目总结报告',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: '2026-03-18',
        estimatedTime: 120,
        actualTime: 60,
        category: { name: '工作', color: '#1890ff' },
        createdAt: '2026-03-16T08:00:00Z'
      },
      {
        id: '2',
        title: '客户会议准备',
        description: '准备与ABC公司的会议材料',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: '2026-03-17',
        estimatedTime: 90,
        category: { name: '工作', color: '#1890ff' },
        createdAt: '2026-03-16T09:00:00Z'
      },
      {
        id: '3',
        title: '健身锻炼',
        description: '晚上7点健身房锻炼',
        priority: 'LOW',
        status: 'COMPLETED',
        dueDate: '2026-03-16',
        estimatedTime: 60,
        actualTime: 60,
        category: { name: '个人', color: '#52c41a' },
        createdAt: '2026-03-16T10:00:00Z'
      }
    ];
    setTasks(mockTasks);
  }, []);

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
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
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

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    message.success('任务删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTask) {
        // 编辑任务
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? { ...task, ...values } : task
        ));
        message.success('任务更新成功');
      } else {
        // 新建任务
        const newTask: Task = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setTasks([...tasks, newTask]);
        message.success('任务创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title="任务管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建任务
          </Button>
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
            showTotal: (total) => `共 ${total} 个任务`
          }}
        />
      </Card>

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
    </div>
  );
};

export default Tasks;