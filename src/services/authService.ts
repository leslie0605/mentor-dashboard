
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'admin';
  avatar?: string;
}

interface AuthResponse {
  user: User | null;
  token: string | null;
  error?: string;
}

// This would typically come from environment variables
const API_URL = 'https://api.phdmentor.example/auth';

// Simulating the backend for now
// In a real app, this would be an actual API call
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Validate credentials before sending to API
  if (!email || !password) {
    return { user: null, token: null, error: 'Email and password are required' };
  }

  try {
    // In a real implementation, this would be a fetch to your backend
    // return await fetch(`${API_URL}/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // }).then(res => res.json());

    // Simulated API response for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hardcoded test credentials
    if (email === 'jane.smith@university.edu' && password === 'password123') {
      const user: User = {
        id: '1',
        name: 'Dr. Jane Smith',
        email: 'jane.smith@university.edu',
        role: 'mentor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974'
      };
      
      // In a real app, the token would come from the server
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicm9sZSI6Im1lbnRvciJ9';
      
      // Store auth data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { user, token };
    }
    
    return { user: null, token: null, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, token: null, error: 'An error occurred during login' };
  }
};

export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  toast('Logged out successfully');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
