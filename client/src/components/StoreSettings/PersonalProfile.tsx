import GalleryFileUpload from '@/utils/GalleryFileUpload';
import RichTextEditor from '@/utils/RichTextEditor';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Box,
} from '@chakra-ui/react';
import React from 'react';

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function PersonalProfile() {
  return (
    <Stack spacing={4}>
      {/* Avatar Upload */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        gap={4}
      >
        <Text {...labelStyles}>Avatar</Text>
        <Box flex='1' maxW={{ md: '60%' }}>
          <GalleryFileUpload onFileChange={() => {}} />
        </Box>
      </Flex>

      {/* Name */}
      <FormControl
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={4}
      >
        <FormLabel {...labelStyles}>Name</FormLabel>
        <Input flex='1' maxW={{ md: '60%' }} />
      </FormControl>

      {/* Email */}
      <FormControl
        isRequired
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={4}
      >
        <FormLabel {...labelStyles}>Email</FormLabel>
        <Input flex='1' maxW={{ md: '60%' }} />
      </FormControl>

      {/* Password */}
      <FormControl
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={4}
      >
        <FormLabel {...labelStyles}>Password</FormLabel>
        <Input flex='1' maxW={{ md: '60%' }} />
      </FormControl>

      {/* About */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems={{ md: 'flex-start' }}
        gap={4}
      >
        <Text {...labelStyles}>About</Text>
        <Box flex='1' maxW={{ md: '60%' }}>
          <RichTextEditor />
        </Box>
      </Flex>
    </Stack>
  );
}
