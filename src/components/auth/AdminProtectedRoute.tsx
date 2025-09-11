import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if user is not admin
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Allow access if user is authenticated and is admin
  return <Outlet />;
};

export default AdminProtectedRoute;
