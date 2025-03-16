
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/services/authService';
import { toast } from 'sonner';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isLoggedIn = isAuthenticated();

  if (!isLoggedIn) {
    // Show a notification that authentication is required
    toast('Authentication required', {
      description: 'Please log in to access this page',
      duration: 3000
    });
    
    // Redirect to login page while preserving the intended destination
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
