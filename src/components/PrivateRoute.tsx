
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Log authentication state for debugging
    console.log('PrivateRoute - Auth State:', { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);
  
  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isSignedIn) {
    // Pass the current location for proper redirect after login
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
