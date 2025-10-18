import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-300">
          Verifying authentication...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
        replace
      />
    );
  }

  // Check if user account is suspended
  if (user.status === 'SUSPENDED') {
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

  // Check if user account is deleted
  if (user.status === 'DELETED') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Deleted
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your account has been deleted. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Allow access if authenticated and account is active
  return <Outlet />;
};

export default ProtectedRoute;
