import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import type { SeoSettings } from '@/type/vendor';

interface SeoSettingsProps {
  data: SeoSettings;
  onChange: (update: Partial<SeoSettings>) => void;
}

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function SEOSetting({ data, onChange }: SeoSettingsProps) {
  //Onchange
  const handleSeoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSeoTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <Box>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          General Setup
        </Text>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '182px' }}
        >
          <FormLabel {...styles}>SEO Title</FormLabel>
          <Input
            name='metaTitle'
            placeholder='text...'
            flex='1'
            maxW={{ md: '60%' }}
            value={data.metaTitle || ''}
            onChange={handleSeoInputChange}
          />
        </FormControl>

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...styles}>Meta Description</FormLabel>
          <Textarea
            name='metaDescription'
            placeholder='text...'
            flex='1'
            maxW={{ md: '60%' }}
            value={data.metaDescription || ''}
            onChange={handleSeoTextareaChange}
          />
        </FormControl>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '185px' }}
        >
          <FormLabel {...styles}>Meta Keywords</FormLabel>
          <Textarea
            name='keywords'
            placeholder='text...'
            flex='1'
            maxW={{ md: '60%' }}
            value={data.keywords || ''}
            onChange={handleSeoTextareaChange}
          />
        </FormControl>
      </Stack>
    </Box>
  );
}
