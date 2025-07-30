import React from 'react';
import { FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react';
import type { StoreAddress } from '@/type/vendor';

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

interface AddressProps {
  data: StoreAddress;
  onChange: (updates: Partial<StoreAddress>) => void;
}

export default function Address({ data, onChange }: AddressProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

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
          <Input
            flex='1'
            maxW={{ md: '60%' }}
            name={field.name}
            value={data[field.name as keyof StoreAddress] || ''}
            onChange={handleInputChange}
          />
        </FormControl>
      ))}
    </Stack>
  );
}
