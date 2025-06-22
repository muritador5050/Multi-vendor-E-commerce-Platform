import React from 'react';
import { Stack, FormControl, FormLabel, Input } from '@chakra-ui/react';

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function SocialProfile() {
  const socialFields = [
    { label: 'Twitter', placeholder: 'Twitter Handle' },
    { label: 'Facebook', placeholder: 'Facebook Handle' },
    { label: 'Instagram', placeholder: 'Instagram Username' },
    { label: 'YouTube', placeholder: 'YouTube Channel Name' },
    { label: 'LinkedIn', placeholder: 'LinkedIn Username' },
    { label: 'Snapchat', placeholder: 'Snapchat ID' },
    { label: 'Google Plus', placeholder: 'Google Plus Profile ID' },
  ];

  return (
    <Stack spacing={4}>
      {socialFields.map((field, idx) => (
        <FormControl
          key={idx}
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={4}
        >
          <FormLabel {...labelStyles}>{field.label}</FormLabel>
          <Input
            placeholder={field.placeholder}
            flex='1'
            maxW={{ md: '60%' }}
          />
        </FormControl>
      ))}
    </Stack>
  );
}
