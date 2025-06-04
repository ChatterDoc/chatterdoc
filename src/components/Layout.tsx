
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Navigation from './Navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading ? (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-2 border-primary opacity-70 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
        </div>
      ) : (
        <>
          <Navigation />
          <AnimatePresence mode="wait">
            <motion.main 
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex-grow ${!isHomePage ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}`}
            >
              {children}
            </motion.main>
          </AnimatePresence>
          <Toaster />
        </>
      )}
    </div>
  );
};

export default Layout;
