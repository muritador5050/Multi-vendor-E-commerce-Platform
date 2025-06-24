import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useAuth } from '@/context/UseContext';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
} from 'lucide-react';

type RegisterProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const [user, setUser] = useState<RegisterProps>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, error } = useAuth();

  //Handlechange
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  //HandleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(user.name, user.email, user.password);
      setSuccess(true);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
        <div className='text-center'>
          <CheckCircle className='mx-auto h-12 w-12 text-green-500' />
          <h2 className='mt-2 text-2xl font-bold text-gray-900'>
            Check Your Email
          </h2>
          <p className='mt-2 text-gray-600'>
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className='mt-4 text-blue-600 hover:text-blue-800'
          >
            Back to registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <Stack spacing={7}>
      <Heading>Sign Up</Heading>
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center'>
          <AlertCircle className='h-5 w-5 text-red-500 mr-2' />
          <span className='text-red-700 text-sm'>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            type='text'
            name='name'
            value={user.name}
            onChange={handleOnchange}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Mail className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
          <Input
            type='email'
            name='email'
            value={user.email}
            onChange={handleOnchange}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            name='password'
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
        <FormControl isRequired>
          <FormLabel>Confirm-Password</FormLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            name='confirmPassword'
            value={user.confirmPassword}
            onChange={handleOnchange}
          />
          {user.password !== user.confirmPassword && user.confirmPassword && (
            <p className='mt-1 text-sm text-red-600'>Passwords do not match</p>
          )}
        </FormControl>
      </form>
      <Button
        type='submit'
        disabled={isSubmitting || user.password !== user.confirmPassword}
      >
        {isSubmitting ? (
          <Loader2 className='h-5 w-5 animate-spin' />
        ) : (
          'Register'
        )}
      </Button>
    </Stack>
  );
}
