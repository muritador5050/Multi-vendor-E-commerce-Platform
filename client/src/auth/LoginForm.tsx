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
} from '@chakra-ui/react';
import { useAuth } from '@/context/UseContext';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

type LoginProps = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [user, setUser] = useState<LoginProps>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error } = useAuth();

  //HandleChange
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //HandleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(user.email, user.password);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={7}>
      <Heading>Login</Heading>
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center'>
          <AlertCircle className='h-5 w-5 text-red-500 mr-2' />
          <span className='text-red-700 text-sm'>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Username or Email</FormLabel>
          <Input
            name='email'
            type='email'
            value={user.email}
            onChange={handleOnchange}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            name='password'
            type={showPassword ? 'text' : 'password'}
            value={user.password}
            onChange={handleOnchange}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </FormControl>
      </form>
      <Flex>
        <Button type='submit' disabled={isSubmitting}>
          {' '}
          {isSubmitting ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            'Login'
          )}
        </Button>
        <Spacer />
        <Checkbox>Remember me</Checkbox>
      </Flex>
    </Stack>
  );
}
