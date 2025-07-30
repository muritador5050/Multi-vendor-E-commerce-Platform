import React from 'react';
import { Stack, FormControl, FormLabel, Input } from '@chakra-ui/react';
import type { SocialMedia } from '@/type/vendor';

interface SocialMediaProps {
  data: SocialMedia;
  onChange: (update: Partial<SocialMedia>) => void;
}

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

const socialFields = [
  { name: 'twitter', label: 'Twitter', placeholder: 'Twitter Handle' },
  { name: 'facebook', label: 'Facebook', placeholder: 'Facebook Handle' },
  { name: 'instagram', label: 'Instagram', placeholder: 'Instagram Username' },
  { name: 'youtube', label: 'YouTube', placeholder: 'YouTube Channel Name' },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'LinkedIn Username' },
  { name: 'tiktok', label: 'Snapchat', placeholder: 'Snapchat ID' },
  {
    name: 'website',
    label: 'Website',
    placeholder: 'Google Plus Profile ID',
  },
];
export default function SocialProfile({ data, onChange }: SocialMediaProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

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
            value={data[field.name as keyof SocialMedia]}
            onChange={handleInputChange}
          />
        </FormControl>
      ))}
    </Stack>
  );
}
