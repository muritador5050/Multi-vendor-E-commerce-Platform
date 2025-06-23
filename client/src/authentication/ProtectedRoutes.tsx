import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to='/unauthorized' replace />;
  }

  return children;
}
function useAuth(): { user: any; isAuthenticated: any } {
  throw new Error('Function not implemented.');
}
