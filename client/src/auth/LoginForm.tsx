import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Flex,
  FormControl,
  Checkbox,
  FormLabel,
  Input,
  Stack,
  Spacer,
  Heading,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider,
  Text,
  Box,
} from '@chakra-ui/react';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useLogin } from '@/context/AuthContextService';
import { GoogleLoginButton } from '@/components/GoogleButton/GoogleButton';

export default function LoginForm() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const loginMutation = useLogin();

  // Load saved email and remember me preference on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail) {
      setUser((prev) => ({
        ...prev,
        email: savedEmail,
      }));
      if (savedRememberMe) {
        setRememberMe(true);
      }
    }
  }, []);

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle remember me checkbox
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!user.email.trim() || !user.password.trim()) {
      console.log('Validation failed: Email or password is empty');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: user.email.trim(),
        password: user.password,
        rememberMe: rememberMe,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // // Handle Google login
  // const handleGoogleLogin = async () => {
  //   googleLogin.mutate();
  // };

  return (
    <Stack spacing={7} position='relative'>
      <Heading>Login</Heading>

      {loginMutation.error && (
        <Alert status='error' borderRadius='md'>
          <AlertIcon as={AlertCircle} />
          <AlertDescription fontSize='sm'>
            {loginMutation.error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={5} position='relative'>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Mail size={18} />
              </InputLeftElement>
              <Input
                type='email'
                name='email'
                value={user.email}
                onChange={handleOnchange}
                pl='2.5rem'
                disabled={loginMutation.isPending}
                placeholder='Enter your email'
                autoComplete='username'
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired position='relative'>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={user.password}
                onChange={handleOnchange}
                pr='2.5rem'
                disabled={loginMutation.isPending}
                placeholder='Enter your password'
                autoComplete='current-password'
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            as={RouterLink}
            to='/auth/forgot-password'
            variant='link'
            size='sm'
            colorScheme='teal'
          >
            Forgot password?
          </Button>

          <Button
            type='submit'
            colorScheme='teal'
            isLoading={loginMutation.isPending}
            loadingText='Logging in...'
            disabled={
              !user.email.trim() ||
              !user.password.trim() ||
              loginMutation.isPending
            }
            minW='120px'
          >
            LOGIN
          </Button>
          <Box py={2}>
            <Flex align='center'>
              <Divider />
              <Text px={3} fontSize='sm' color='gray.500'>
                or
              </Text>
              <Divider />
            </Flex>
            <GoogleLoginButton />
          </Box>
          {/* <Button
            onClick={handleGoogleLogin}
            variant='outline'
            colorScheme='gray'
            disabled={loginMutation.isPending}
            leftIcon={
              <svg width='18' height='18' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
            }
          >
            Continue with Google
          </Button> */}

          <Flex alignItems='center'>
            <Spacer />
            <Checkbox
              isChecked={rememberMe}
              onChange={handleRememberMeChange}
              disabled={loginMutation.isPending}
            >
              Remember me
            </Checkbox>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
