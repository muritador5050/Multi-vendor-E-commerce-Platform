import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner, Center, Text } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';

interface DecodedUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
}

function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    const error = params.get('error');

    if (token && refresh) {
      try {
        const decoded: DecodedUser = jwtDecode(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(decoded));

        // Optional: log the user data
        console.log('OAuth login success:', decoded);

        navigate('auth/profile');
      } catch (err) {
        console.error('Invalid token received:', err);
        navigate('/my-account');
      }
    } else if (error === 'oauth_failed') {
      console.error('OAuth failed');
      navigate('/my-account');
    }
  }, [params, navigate]);

  return (
    <Center h='100vh' flexDirection='column'>
      <Spinner size='lg' />
      <Text mt={4}>Processing your login...</Text>
    </Center>
  );
}

export default OAuthCallback;
