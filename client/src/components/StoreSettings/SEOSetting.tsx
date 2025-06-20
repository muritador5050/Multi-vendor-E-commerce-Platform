import React from 'react';
import GalleryFileUpload from '@/utils/GalleryFileUpload';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Flex,
  Textarea,
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
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
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>SEO Title</FormLabel>
            <Input ml={{ md: 16 }} placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Meta Description</FormLabel>
            <Textarea placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Meta Keywords</FormLabel>
            <Textarea ml={{ md: 9 }} placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
      </Stack>

      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Facebook Setup
        </Text>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Facebook Title</FormLabel>
            <Input ml={{ md: 12 }} placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Facebook Description</FormLabel>
            <Textarea placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>

        <Stack ml={{ md: '370px' }} w={{ md: '55%' }}>
          <GalleryFileUpload onFileChange={handleFile} />
        </Stack>
      </Stack>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Twitter Setup
        </Text>
        <FormControl isRequired>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Twitter Title</FormLabel>
            <Input ml={{ md: 16 }} placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl isRequired>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel {...styles}>Twitter Description</FormLabel>
            <Textarea placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <Stack w={{ md: '55%' }} ml={{ md: '370px' }}>
          <GalleryFileUpload onFileChange={handleFile} />
        </Stack>
      </Stack>
    </Box>
  );
}
