import React from 'react';
import RichTextEditor from '@/utils/RichTextEditor';
import { Flex, Input, Stack, Text } from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};
export default function StorePolicies() {
  return (
    <Stack spacing={5}>
      <Text fontSize='2xl' color='teal.700'>
        Policies Setting
      </Text>

      <Flex gap={32}>
        <Text {...styles}>Policy Tab Label</Text>
        <Input width='55%' />
      </Flex>
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
