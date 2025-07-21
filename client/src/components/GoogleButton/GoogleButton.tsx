import React from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@/context/AuthContextService';

interface GoogleLoginButtonProps {
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid';
  children?: React.ReactNode;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  isLoading = false,
  size = 'md',
  variant = 'outline',
  children = 'Continue with Google',
}) => {
  const googleLogin = useGoogleLogin();

  const handleGoogleLogin = () => {
    googleLogin.mutate();
  };

  return (
    <Button
      leftIcon={<Icon as={FcGoogle} />}
      onClick={handleGoogleLogin}
      isLoading={isLoading || googleLogin.isPending}
      loadingText='Connecting...'
      size={size}
      variant={variant}
      width='full'
      my={3}
      borderColor='gray.300'
      _hover={{
        borderColor: 'gray.400',
        backgroundColor: 'gray.50',
      }}
    >
      {children}
    </Button>
  );
};
