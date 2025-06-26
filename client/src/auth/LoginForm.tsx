import React, { useState } from 'react';
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
import { useAuth } from '@/context/UseContext';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LoginProps = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [user, setUser] = useState<LoginProps>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(user.email, user.password);
      navigate('/store-manager', { replace: true });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
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
                pl='2rem'
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
              />
              <InputRightElement>
                <IconButton
                  aria-label='Toggle Password'
                  icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Flex>
            <Button
              type='submit'
              colorScheme='teal'
              isLoading={isSubmitting}
              loadingText='Logging in'
            >
              Login
            </Button>
            <Spacer />
            <Checkbox>Remember me</Checkbox>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
