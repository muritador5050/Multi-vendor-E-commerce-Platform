import React from 'react';
import {
  Box,
  Flex,
  Text,
  Stack,
  Center,
  Wrap,
  WrapItem,
  Button,
} from '@chakra-ui/react';
import { Ellipsis } from 'lucide-react';
import { FiBox } from 'react-icons/fi';

export default function Review() {
  return (
    <Box display='flex' flexDirection='column' gap={6}>
      <Flex
        bg='white'
        align='center'
        justify='space-between'
        h={20}
        mb={6}
        p={3}
      >
        <Text>All (0) | Approved (0) | Pending (0)</Text>
        <Button
          leftIcon={<FiBox />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Product Review
        </Button>
      </Flex>
      <Stack bg='white' borderRadius='2xl' p={3}>
        <Wrap spacing='50px' align='center'>
          <WrapItem>
            {' '}
            <Center bg='cyan.500' borderRadius='full'>
              <Ellipsis />
            </Center>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Author
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Comment
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Rating
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Dated
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Actions
            </Text>
          </WrapItem>
        </Wrap>
      </Stack>
    </Box>
  );
}
