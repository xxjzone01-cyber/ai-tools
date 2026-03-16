import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AppProvider, useLoading, useError } from './contexts/AppContext';
import { ErrorBoundary, GlobalErrorHandler, NetworkStatus, LoadingOverlay } from './components/ErrorHandling';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { loading } = useApp();
  const { error } = useError();

  useEffect(() => {
    // 检查认证状态
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <GlobalErrorHandler />
        <NetworkStatus />
        <LoadingOverlay visible={loading.isLoading} message={loading.loadingMessage} />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;