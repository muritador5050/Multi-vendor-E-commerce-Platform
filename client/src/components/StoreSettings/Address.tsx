import React from 'react';
import { FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

export default function Address() {
  return (
    <Stack>
      <Text fontSize='2xl' color='teal.700'>
        Billing
      </Text>
      <FormControl>
        <FormLabel {...styles}>Name</FormLabel>
        <Input />
      </FormControl>
      <FormControl>
        <FormLabel {...styles}>Address</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel {...styles}>Country</FormLabel>
        <Input />
      </FormControl>
      <FormControl>
        <FormLabel {...styles}>City/Town</FormLabel>
        <Input />
      </FormControl>
      <FormControl>
        <FormLabel {...styles}>Postal/Code</FormLabel>
        <Input />
      </FormControl>
    </Stack>
  );
}
