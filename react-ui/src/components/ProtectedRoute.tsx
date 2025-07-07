import React from 'react';
import { Navigate } from 'react-router-dom';
<<<<<<< HEAD:react-ui/src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
=======
import { useAuth } from '../contexts/AuthContext.tsx';
>>>>>>> 698ebc2e18cf88a6868ae5b9916112421594cb99:react-ui/src/components/ProtectedRoute.jsx
import { Loader } from '@mantine/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 