import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-300">
          Verifying admin access...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    const redirectUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
        replace
      />
    );
  }

  // Check if user account is suspended or deleted
  if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Suspended
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your account has been suspended. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to appropriate dashboard if user is not admin
  if (user?.role !== 'ADMIN') {
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/customer" replace />;
    } else if (user.role === 'VENDOR') {
      return <Navigate to="/vendor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Allow access if user is authenticated and is admin
  return <Outlet />;
};

export default AdminProtectedRoute;
