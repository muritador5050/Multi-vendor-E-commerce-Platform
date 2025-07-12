import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useVerifyEmail } from '@/context/AuthContextService';
import { Box, Text } from '@chakra-ui/react';

export function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          alert('Email verified successfully!');
          navigate('/profile');
        },
        onError: (error) => {
          console.error('Email verification failed:', error);
          navigate('/login');
        },
      });
    }
  }, [token, navigate, verifyEmailMutation]);

  return (
    <Box>
      {verifyEmailMutation.isPending && <p>Verifying email...</p>}
      {verifyEmailMutation.error && (
        <Text>Verification failed: {verifyEmailMutation.error.message}</Text>
      )}
    </Box>
  );
}
