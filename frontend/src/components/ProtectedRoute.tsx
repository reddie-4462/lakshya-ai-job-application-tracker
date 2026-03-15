import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  // While checking authentication state, show nothing or a loader
  if (loading) {
    return null;
  }

  // Require both an authenticated user context AND a valid token
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children or the nested route
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
