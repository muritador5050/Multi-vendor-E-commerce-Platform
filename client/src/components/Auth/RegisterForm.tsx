import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useRegister } from '@/context/AuthContextService';

type RegisterProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const toast = useToast();
  const [user, setUser] = useState<RegisterProps>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister({
    onSuccess: () => {
      toast({
        title: 'Registration successful!',
        description: 'Check your email for a verification link.',
        status: 'success',
        position: 'top',
        duration: 6000,
        isClosable: true,
      });
      setUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    },
  });

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      return;
    }
    try {
      await registerMutation.mutateAsync({
        name: user.name,
        email: user.email,
        password: user.password,
        confirmPassword: user.confirmPassword,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={7}>
        <Heading>Sign Up</Heading>

        {registerMutation.error && (
          <Alert status='error' borderRadius='md'>
            <AlertIcon as={AlertCircle} />
            <AlertDescription fontSize='sm'>
              {registerMutation.error.message}
            </AlertDescription>
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
          isDisabled={
            registerMutation.isPending || user.password !== user.confirmPassword
          }
          isLoading={registerMutation.isPending}
          loadingText='Registering'
        >
          REGISTER
        </Button>
      </Stack>
    </form>
  );
}
