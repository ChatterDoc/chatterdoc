
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { LayoutDashboard, Settings, Sliders, GaugeCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { path: '/customize', label: 'Customize Widget', icon: <Sliders className="h-4 w-4 mr-2" /> },
    { path: '/analytics', label: 'Analytics', icon: <GaugeCircle className="h-4 w-4 mr-2" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <nav className="bg-secondary border-b border-border">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-bold flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
            <span className="text-white font-bold">CD</span>
          </div>
          ChatterDoc
        </Link>

        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md hover:bg-muted ${location.pathname === item.path ? 'bg-muted' : ''}`}
            >
              {item.icon}
              {!isMobile && <span>{item.label}</span>}
            </Link>
          ))}
          
          <Link
            to="/contact"
            className={`flex items-center px-3 py-2 rounded-md hover:bg-muted ${location.pathname === '/contact' ? 'bg-muted' : ''}`}
          >
            <Mail className="h-4 w-4 mr-2" />
            {!isMobile && <span>Contact</span>}
          </Link>

          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
