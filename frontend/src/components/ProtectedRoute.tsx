import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Require an authenticated user context 
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render children or the nested route
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
