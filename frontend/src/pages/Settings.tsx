import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider,
  message,
  Tabs,
  List,
  Tag,
  Space,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  BellOutlined, 
  SecurityScanOutlined,
  DatabaseOutlined,
  ApiOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const tabItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
      children: (
        <Card title="个人信息设置">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileSubmit}
          >
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入您的姓名" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: '请输入邮箱' }]}
            >
              <Input type="email" placeholder="请输入您的邮箱" />
            </Form.Item>
            
            <Form.Item
              name="bio"
              label个人简介"
            >
              <TextArea 
                rows={4} 
                placeholder="简单介绍一下自己..." 
                maxLength={200}
                showCount
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'notifications',
      label: '通知设置',
      icon: <BellOutlined />,
      children: (
        <Card title="通知偏好设置">
          <Form layout="vertical">
            <Form.Item label="任务提醒">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="taskReminders" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' });
                  任务开始前15分钟提醒
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item label="每日总结">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="dailySummary" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  每晚9点发送当日时间使用报告
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item label="周报提醒">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="weeklyReport" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  每周一上午发送周报
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary">保存设置</Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'security',
      label: '安全设置',
      icon: <SecurityScanOutlined />,
      children: (
        <Card title="安全与隐私">
          <Form layout="vertical">
            <Form.Item label="修改密码">
              <Button onClick={handleChangePassword}>修改密码</Button>
            </Form.Item>
            
            <Form.Item label="两步验证">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="twoFactorAuth" valuePropName="checked" noStyle>
                  <Switch checkedChildren="已开启" unCheckedChildren="未开启" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  增加账户安全性，建议开启
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item label="数据导出">
              <Button icon={<DatabaseOutlined />}>导出我的数据</Button>
            </Form.Item>
            
            <Form.Item label="账户管理">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="link" danger>删除账户</Button>
                <div style={{ color: '#f5222d', fontSize: '12px' }}>
                  删除账户后将无法恢复，请谨慎操作
                </div>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'ai',
      label: 'AI设置',
      icon: <ApiOutlined />,
      children: (
        <Card title="AI服务设置">
          <Form layout="vertical">
            <Form.Item label="AI服务提供商">
              <Select defaultValue="openai" style={{ width: '100%' }}>
                <Option value="openai">OpenAI GPT-4</Option>
                <Option value="anthropic">Anthropic Claude</Option>
                <Option value="local">本地模型</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="AI响应风格">
              <Select defaultValue="balanced" style={{ width: '100%' }}>
                <Option value="precise">精确模式</Option>
                <Option value="balanced">平衡模式</Option>
                <Option value="creative">创意模式</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="自动任务分类">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="autoCategorize" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  创建任务时自动进行AI分类
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item label="智能建议">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="smartSuggestions" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  基于您的使用习惯提供个性化建议
                </div>
              </Space>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary">保存设置</Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'help',
      label: '帮助中心',
      icon: <QuestionCircleOutlined />,
      children: (
        <Card title="帮助与支持">
          <List
            dataSource={[
              {
                title: '使用指南',
                description: '了解如何高效使用智能时间管家',
                tags: ['新手教程', '功能介绍']
              },
              {
                title: '常见问题',
                description: '查看用户最常遇到的问题和解决方案',
                tags: ['FAQ', '故障排除']
              },
              {
                title: '联系我们',
                description: '遇到问题？联系我们的技术支持团队',
                tags: ['客服', '技术支持']
              },
              {
                title: '更新日志',
                description: '查看最新的功能更新和改进',
                tags: ['更新', '新功能']
              }
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="view">查看详情</Button>
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
                <div>
                  {item.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )
    }
  ];

  const handleProfileSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    Modal.confirm({
      title: '修改密码',
      content: '密码修改功能即将上线，敬请期待！',
      okText: '我知道了'
    });
  };

  return (
    <div>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default Settings;