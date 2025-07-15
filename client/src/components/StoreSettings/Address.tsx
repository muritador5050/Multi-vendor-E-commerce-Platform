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

const fields = [
  { name: 'name', label: 'Name', isRequired: false },
  { name: 'address', label: 'Address', isRequired: false },
  { name: 'country', label: 'Country', isRequired: true },
  { name: 'city', label: 'City/Town', isRequired: false },
  { name: 'postalCode', label: 'Postal/Code', isRequired: false },
];
export default function Address() {
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
          <Input flex='1' maxW={{ md: '60%' }} name={field.name} />
        </FormControl>
      ))}
    </Stack>
  );
}
