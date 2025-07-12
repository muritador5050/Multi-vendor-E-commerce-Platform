import { useIsAuthenticated } from '@/context/AuthContextService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackPath?: string;
}

const AuthGuard = ({
  children,
  requireAuth = true,
  fallbackPath = '/login',
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate(fallbackPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate, fallbackPath]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'>
          Loading... watch
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
