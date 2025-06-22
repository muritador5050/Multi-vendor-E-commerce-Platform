import React from 'react';
import GalleryFileUpload from '@/utils/GalleryFileUpload';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function SEOSetting() {
  //HandleFile
  const handleFile = (file: File) => {
    console.log('Selected file:', file.name);
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
          <Input placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...styles}>Meta Description</FormLabel>
          <Textarea placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '185px' }}
        >
          <FormLabel {...styles}>Meta Keywords</FormLabel>
          <Textarea placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>
      </Stack>

      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Facebook Setup
        </Text>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 48 }}
        >
          <FormLabel {...styles}>Facebook Title</FormLabel>
          <Input placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '145px' }}
        >
          <FormLabel {...styles}>Facebook Description</FormLabel>
          <Textarea placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>

        <Box ml={{ md: '360px' }} maxW={{ md: '60%' }}>
          <GalleryFileUpload onFileChange={handleFile} />
        </Box>
      </Stack>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Twitter Setup
        </Text>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '200px' }}
        >
          <FormLabel {...styles}>Twitter Title</FormLabel>
          <Input placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '150px' }}
        >
          <FormLabel {...styles}>Twitter Description</FormLabel>
          <Textarea placeholder='text...' flex='1' maxW={{ md: '60%' }} />
        </FormControl>
        <Box maxW={{ md: '60%' }} ml={{ md: '370px' }}>
          <GalleryFileUpload onFileChange={handleFile} />
        </Box>
      </Stack>
    </Box>
  );
}
