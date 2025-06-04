
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("Auth callback initiated");
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        setError(error.message);
        return;
      }
      
      // Get the intended destination or default to dashboard
      const from = location.state?.from || '/dashboard';
      console.log("Redirecting after auth to:", from);
      
      // Redirect to the dashboard or home page
      navigate(from, { replace: true });
    };

    handleAuthCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/sign-in')}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Processing Your Sign In...</h1>
        <p className="mt-2 text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
