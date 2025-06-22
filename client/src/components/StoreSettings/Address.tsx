import React from 'react';
import { FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react';

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function Address() {
  const fields = [
    { label: 'Name', isRequired: false },
    { label: 'Address', isRequired: false },
    { label: 'Country', isRequired: true },
    { label: 'City/Town', isRequired: false },
    { label: 'Postal/Code', isRequired: false },
  ];

  return (
    <Stack spacing={4}>
      <Text fontSize='2xl' color='teal.700'>
        Billing
      </Text>

      {fields.map((field, idx) => (
        <FormControl
          key={idx}
          isRequired={field.isRequired}
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={4}
        >
          <FormLabel {...labelStyles}>{field.label}</FormLabel>
          <Input flex='1' maxW={{ md: '60%' }} />
        </FormControl>
      ))}
    </Stack>
  );
}
