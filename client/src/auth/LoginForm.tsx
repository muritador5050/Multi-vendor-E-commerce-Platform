import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useLogin } from '@/context/AuthContextService';

export default function LoginForm() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  // Handle input changes
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission with enhanced debugging
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
      });
    } catch (err) {
      console.log(err);
    }
  };

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
                autoComplete='email'
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
          <Flex alignItems='center'>
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
            <Spacer />
            <Checkbox disabled={loginMutation.isPending}>Remember me</Checkbox>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
