import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  setLoading: (loading: boolean, message?: string) => void;
}

interface ErrorState {
  error: Error | null;
  setError: (error: Error | null) => void;
}

interface AppState {
  loading: LoadingState;
  error: ErrorState;
  isOnline: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: undefined
  });

  const [error, setErrorState] = useState<ErrorState>({
    error: null
  });

  const [isOnline, setIsOnline] = useState(true);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setLoadingState({ isLoading, loadingMessage: message });
  }, []);

  const setError = useCallback((error: Error | null) => {
    setErrorState({ error });
    if (error) {
      console.error('应用错误:', error);
      // 在这里可以添加错误上报逻辑
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null });
  }, []);

  // 监听网络状态
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: AppState = {
    loading,
    error,
    isOnline,
    setLoading,
    setError,
    clearError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 自定义hooks
export const useLoading = () => {
  const { loading } = useApp();
  return loading;
};

export const useError = () => {
  const { error, setError, clearError } = useApp();
  return { error, setError, clearError };
};

export const useOnlineStatus = () => {
  const { isOnline } = useApp();
  return isOnline;
};