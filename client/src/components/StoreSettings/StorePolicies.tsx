import React from 'react';
import RichTextEditor from '@/utils/RichTextEditor';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};
export default function StorePolicies() {
  return (
    <Stack spacing={5}>
      <Text fontSize='2xl' color='teal.700'>
        Policies Setting
      </Text>
      <FormControl
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={{ base: 4, md: 44 }}
      >
        <FormLabel {...styles}>Policy Tab Label</FormLabel>
        <Input flex='1' maxW={{ md: '60%' }} />
      </FormControl>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Shipping Policy</Text>
        <RichTextEditor />
      </Flex>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Refund Policy</Text>
        <RichTextEditor />
      </Flex>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Cancellation/Return/Exchange Policy</Text>
        <RichTextEditor />
      </Flex>
    </Stack>
  );
}
