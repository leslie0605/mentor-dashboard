
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Gamepad2, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  
  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
    { label: 'Documents', icon: <FileText className="h-5 w-5" />, path: '/document-review' },
    { label: 'Game Design', icon: <Gamepad2 className="h-5 w-5" />, path: '/game-design' },
  ];

  const handleLogout = () => {
    toast('Successfully logged out');
    window.location.href = '/';
  };

  const clearNotifications = () => {
    setUnreadNotifications(0);
    toast('All notifications cleared');
  };

  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-blur-in">
              <span className="text-white font-bold">PM</span>
            </div>
            <span className="font-medium text-lg text-foreground">PhD Mentor</span>
          </Link>
        </div>
        
        <nav className="flex items-center justify-center">
          <ul className="flex items-center space-x-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-md mentor-transition mentor-focus-ring",
                    location.pathname === item.path 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-fade-in">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-auto">
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">Document Updated</span>
                    <span className="text-xs text-muted-foreground">Alex Chen submitted revised dissertation chapter</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">New Mentee Assigned</span>
                    <span className="text-xs text-muted-foreground">Sarah Johnson added to your mentee list</span>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">Game Module Completed</span>
                    <span className="text-xs text-muted-foreground">Research Methods module completed by Miguel Lopez</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={clearNotifications}>
                <span className="text-xs text-center w-full">Clear all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <UserAvatar 
                  name="Dr. Jane Smith" 
                  image="/placeholder.svg" 
                  size="md"
                  showStatus
                  status="online"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dr. Jane Smith</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
