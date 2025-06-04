
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserButton from './Auth/UserButton';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Palette
} from 'lucide-react';

const AuthNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">CD</span>
            </div>
            <h1 className="text-xl font-semibold">ChatterDoc</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                isActive('/dashboard') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            
            <Link 
              to="/customize" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                isActive('/customize') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Palette className="h-4 w-4" />
              Customize
            </Link>
            
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                isActive('/settings') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Link>
          </div>
          
          <div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthNav;
