import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner, Center, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { permissionUtils } from '@/utils/Permission';
import { authKeys } from '@/context/AuthContextService';

function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('=== OAuth Callback Debug ===');
    console.log('Current URL:', window.location.href);
    console.log('URL params:', Object.fromEntries(params));

    const token = params.get('token');
    const refresh = params.get('refresh');
    const userParam = params.get('user');
    const error = params.get('error');

    console.log('Token exists:', !!token);
    console.log('Refresh exists:', !!refresh);
    console.log('User param:', userParam);
    console.log('Error param:', error);

    if (token && refresh) {
      try {
        // Clear any existing tokens
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Store tokens (OAuth users get "remembered" by default)
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('rememberMe', 'true');

        // Parse user data
        const userData = userParam
          ? JSON.parse(decodeURIComponent(userParam))
          : null;

        console.log('Parsed user data:', userData);

        if (userData) {
          // Store email for convenience
          localStorage.setItem('savedEmail', userData.email);

          // Invalidate profile query to refresh user data
          queryClient.invalidateQueries({ queryKey: authKeys.profile });

          // Navigate to appropriate dashboard based on role
          const defaultRoute = permissionUtils.getDefaultRoute(userData.role);
          console.log('User role:', userData.role);
          console.log('Default route:', defaultRoute);
          console.log('About to navigate to:', defaultRoute);
          navigate(defaultRoute, { replace: true });
        } else {
          // Fallback navigation if no user data
          navigate('/my-account', { replace: true });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/my-account?error=oauth_processing_failed', {
          replace: true,
        });
      }
    } else if (error === 'oauth_failed') {
      console.error('OAuth failed');
      navigate('/my-account?error=oauth_failed', { replace: true });
    } else {
      // No valid parameters, redirect to login
      navigate('/my-account', { replace: true });
    }
  }, [params, navigate, queryClient]);

  return (
    <Center h='100vh' flexDirection='column'>
      <Spinner size='lg' />
      <Text mt={4}>Processing your login...</Text>
    </Center>
  );
}

export default OAuthCallback;
