import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string | string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the current location for redirect after login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Check for required role(s) if specified
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // If user doesn't have any of the required roles, redirect to unauthorized
    if (!user.role || !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 