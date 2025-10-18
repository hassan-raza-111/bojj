import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  fallbackPath = '/',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-300">
          Verifying access permissions...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
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

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/customer" replace />;
    } else if (user.role === 'VENDOR') {
      return <Navigate to="/vendor" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Allow access if user has required role
  return <Outlet />;
};

export default RoleBasedRoute;
