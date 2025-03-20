import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { login } from '@/services/authService';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Get the path the user was trying to access before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.email || !formState.password) {
      toast('Please fill in all fields', {
        description: 'Email and password are required',
        duration: 3000
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await login(formState.email, formState.password);
      
      if (response.error) {
        toast('Login failed', {
          description: response.error,
          duration: 3000
        });
        setIsLoading(false);
        return;
      }
      
      if (response.user) {
        toast('Login successful', {
          description: `Welcome back, ${response.user.name}`,
        });
        
        // Navigate to the dashboard or the page the user was trying to access
        navigate(from);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast('Login failed', {
        description: 'An unexpected error occurred',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 w-full max-w-md space-y-6 animate-scale-in">
      <div className="text-center mb-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Sign in to your Mentor account</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane.smith@university.edu"
            autoComplete="email"
            value={formState.email}
            onChange={handleInputChange}
            className="mentor-focus-ring"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={formState.password}
              onChange={handleInputChange}
              className="mentor-focus-ring"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember-me" 
            checked={formState.rememberMe}
            onCheckedChange={handleCheckboxChange}
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm font-normal cursor-pointer"
          >
            Remember me for 30 days
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        className={cn(
          "w-full transition-all duration-200 font-medium",
          isLoading && "opacity-70"
        )}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <span>Don't have an account? </span>
        <a href="#" className="text-primary hover:underline">
          Contact your administrator
        </a>
      </div>
      
      {/* Demo credentials */}
      <div className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Demo Credentials</p>
        <p className="text-xs font-medium">Email: jane.smith@university.edu</p>
        <p className="text-xs font-medium">Password: PMpwd0605</p>
      </div>
    </form>
  );
};
