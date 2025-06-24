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
import React from 'react';

export default function LoginForm() {
  return (
    <Stack spacing={7}>
      <Heading>Login</Heading>
      <FormControl isRequired>
        <FormLabel>Username or Email</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <Input />
      </FormControl>
      <Flex>
        <Button>Login</Button>
        <Spacer />
        <Checkbox>Remember me</Checkbox>
      </Flex>
    </Stack>
  );
}
