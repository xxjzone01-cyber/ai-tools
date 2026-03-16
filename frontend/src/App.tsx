import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理'
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>时间管家</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <h1 style={{ margin: 0, fontSize: '20px' }}>
              {menuItems.find(item => item.key === location.pathname)?.label || '智能时间管家'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>欢迎回来，用户</span>
              <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            </div>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px', 
          padding: '24px', 
          background: '#fff',
          borderRadius: '8px'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;