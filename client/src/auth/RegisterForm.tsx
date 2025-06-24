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

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const [registerUser, setRegisterUser] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, error } = useAuth();

  return (
    <Stack spacing={7}>
      <Heading>Sign Up</Heading>
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Confirm-Password</FormLabel>
        <Input />
      </FormControl>
      <Button>Register</Button>
    </Stack>
  );
}
