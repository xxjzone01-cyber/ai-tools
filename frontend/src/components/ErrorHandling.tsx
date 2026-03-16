import React from 'react';
import { Alert, Button, Result } from 'antd';
import { 
  CloseCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useError } from '../contexts/AppContext';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // 这里可以添加错误上报逻辑
    this.setState({ hasError: true, error });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="页面发生错误"
            subTitle="抱歉，应用遇到了一些问题。我们的团队已收到通知，正在修复中。"
            extra={[
              <Button type="primary" key="reset" onClick={this.handleReset}>
                刷新页面
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// 全局错误显示组件
export const GlobalErrorHandler: React.FC = () => {
  const { error, clearError } = useError();

  if (!error) return null;

  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'warning';
    } else if (message.includes('401') || message.includes('403')) {
      return 'error';
    } else if (message.includes('404')) {
      return 'info';
    } else {
      return 'error';
    }
  };

  const getErrorIcon = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return <WarningOutlined />;
    } else if (message.includes('401') || message.includes('403')) {
      return <CloseCircleOutlined />;
    } else if (message.includes('404')) {
      return <InfoCircleOutlined />;
    } else {
      return <CloseCircleOutlined />;
    }
  };

  return (
    <Alert
      message="发生错误"
      description={error.message}
      type={getErrorType(error) as any}
      showIcon
      icon={getErrorIcon(error)}
      closable
      onClose={clearError}
      style={{ marginBottom: '16px' }}
      action={
        <Button size="small" onClick={() => window.location.reload()}>
          <ReloadOutlined /> 刷新
        </Button>
      }
    />
  );
};

// 网络状态组件
export const NetworkStatus: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert
      message="网络连接已断开"
      description="请检查您的网络连接后重试"
      type="warning"
      showIcon
      style={{ position: 'fixed', top: 0, zIndex: 9999, margin: 0 }}
    />
  );
};

// 加载状态组件
export const LoadingOverlay: React.FC<{ 
  visible: boolean; 
  message?: string 
}> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px 60px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}>
          🤖
        </div>
        <h3 style={{ margin: '0 0 10px 0' }}>
          {message || '加载中...'}
        </h3>
        <p style={{ color: '#666' }}>
          请稍候，这不会花费太长时间
        </p>
      </div>
    </div>
  );
};

// 添加CSS动画
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}