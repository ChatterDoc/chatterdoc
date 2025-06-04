
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoaded: false,
  isSignedIn: false,
});

export const useAuth = () => useContext(AuthContext);

// Helper function to clean up any lingering auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // First set up auth state listener to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoaded(true);
        
        // If user signs out, clean up any lingering auth state
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        console.log('Initial session check:', data.session ? 'Logged in' : 'Not logged in');
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoaded,
        isSignedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
