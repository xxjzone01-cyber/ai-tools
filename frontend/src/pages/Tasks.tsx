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
import taskService from '../services/taskService';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../services/taskService';

const { Option } = Select;
const { Search } = Input;

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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

  const handleCategorize = async (id: string) => {
    try {
      const result = await taskService.categorizeTask(id);
      message.success('任务分类完成');
      loadTasks();
    } catch (error: any) {
      console.error('任务分类失败:', error);
      message.error('任务分类失败');
    }
  };

  const handlePredict = async (id: string) => {
    try {
      const result = await taskService.predictTaskTime(id);
      message.success('时间预测完成');
      loadTasks();
    } catch (error: any) {
      console.error('时间预测失败:', error);
      message.error('时间预测失败');
    }
  };

  return (
    <div>
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