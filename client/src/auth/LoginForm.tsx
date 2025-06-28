import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';

export default function LoginForm() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Consume context - get loading state from AuthProvider
  const { login, error, loading } = useAuth();

  // Clear error when component unmounts or user starts typing
  useEffect(() => {
    // Optional: Clear error when user starts typing again
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle input changes
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!user.email.trim() || !user.password.trim()) {
      return;
    }

    try {
      await login(user.email.trim(), user.password);
      // Login success will be handled by AuthProvider (navigation, etc.)
    } catch (err) {
      // Error is already handled by AuthProvider and stored in context
      console.error('Login failed:', err);
    }
  };

  return (
    <Stack spacing={7} position='relative'>
      <Heading>Login</Heading>

      {error && (
        <Alert status='error' borderRadius='md'>
          <AlertIcon as={AlertCircle} />
          <AlertDescription fontSize='sm'>{error}</AlertDescription>
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
                disabled={loading}
                placeholder='Enter your email'
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
                disabled={loading}
                placeholder='Enter your password'
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Flex alignItems='center'>
            <Button
              type='submit'
              colorScheme='teal'
              isLoading={loading}
              loadingText='Logging in...'
              disabled={!user.email.trim() || !user.password.trim() || loading}
              minW='120px'
            >
              Login
            </Button>
            <Spacer />
            <Checkbox disabled={loading}>Remember me</Checkbox>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
