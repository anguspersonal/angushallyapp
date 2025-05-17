import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const checkAuth = () => {
    // Check localStorage first (for "Remember me")
    const token = localStorage.getItem('googleToken');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (token && expiration) {
      // Check if token has expired
      const expirationDate = new Date(expiration);
      if (expirationDate > new Date()) {
        return true;
      }
      // Clear expired token
      localStorage.removeItem('googleToken');
      localStorage.removeItem('tokenExpiration');
    }
    
    // Check sessionStorage (for regular session)
    const sessionToken = sessionStorage.getItem('googleToken');
    return !!sessionToken;
  };

  const isAuthenticated = checkAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 