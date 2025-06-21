import GalleryFileUpload from '@/utils/GalleryFileUpload';
import RichTextEditor from '@/utils/RichTextEditor';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import React from 'react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

export default function PersonalProfile() {
  return (
    <Stack>
      <Flex>
        <Text {...styles}>Avatar</Text>
        <GalleryFileUpload onFileChange={() => {}} />
      </Flex>
      <FormControl>
        <FormLabel {...styles}>Name</FormLabel>
        <Input />
      </FormControl>
      <FormControl isRequired>
        <FormLabel {...styles}>Email</FormLabel>
        <Input />
      </FormControl>
      <FormControl>
        <FormLabel {...styles}>Password</FormLabel>
        <Input />
      </FormControl>
      <Flex direction='column'>
        <Text {...styles}>About</Text>
        <RichTextEditor />
      </Flex>
    </Stack>
  );
}
