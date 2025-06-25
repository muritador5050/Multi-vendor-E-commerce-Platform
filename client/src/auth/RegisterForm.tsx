import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Box,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { useAuth } from '@/context/UseContext';
import { AlertCircle, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, error } = useAuth();

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

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
      <Box
        maxW='md'
        mx='auto'
        bg='white'
        _dark={{ bg: 'gray.800' }}
        rounded='lg'
        shadow='md'
        p={6}
        textAlign='center'
      >
        <CheckCircle size={48} color='green' style={{ margin: '0 auto' }} />
        <Heading mt={4} fontSize='2xl'>
          Check Your Email
        </Heading>
        <Text mt={2}>
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </Text>
        <Button
          mt={4}
          colorScheme='blue'
          variant='link'
          onClick={() => setSuccess(false)}
        >
          Back to registration
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={7} as='form' onSubmit={handleSubmit}>
      <Heading>Sign Up</Heading>

      {error && (
        <Alert status='error' borderRadius='md'>
          <AlertIcon as={AlertCircle} />
          <AlertDescription fontSize='sm'>{error}</AlertDescription>
        </Alert>
      )}

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

      <FormControl isRequired>
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

      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            name='confirmPassword'
            value={user.confirmPassword}
            onChange={handleOnchange}
            pr='2.5rem'
          />
          <InputRightElement>
            <IconButton
              aria-label='Toggle Password'
              icon={
                showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />
              }
              size='sm'
              variant='ghost'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </InputRightElement>
        </InputGroup>
        {user.password !== user.confirmPassword && user.confirmPassword && (
          <Text mt={1} fontSize='sm' color='red.500'>
            Passwords do not match
          </Text>
        )}
      </FormControl>
      <Button
        type='submit'
        colorScheme='teal'
        isDisabled={isSubmitting || user.password !== user.confirmPassword}
        isLoading={isSubmitting}
        loadingText='Registering'
      >
        Register
      </Button>
    </Stack>
  );
}
