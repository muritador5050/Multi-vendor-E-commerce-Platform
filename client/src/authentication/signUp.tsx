import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';
function SignUp() {
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
        <FormLabel>Re-Password</FormLabel>
        <Input />
      </FormControl>
      <Button>Register</Button>
    </Stack>
  );
}

export default SignUp;
