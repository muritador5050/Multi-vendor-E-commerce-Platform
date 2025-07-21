import React, { useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Stack,
  Center,
  Wrap,
  WrapItem,
  Button,
} from '@chakra-ui/react';
import { Ellipsis } from 'lucide-react';
import ExportButtons from '@/utils/File-format';
import { FiGift } from 'react-icons/fi';

export default function Customers() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const sampleData = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
  ];
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
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Manage Customers
        </Text>
        <Button
          leftIcon={<FiGift />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Add New
        </Button>
      </Flex>
      <Stack bg='white' borderRadius='2xl' p={3}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align='center'
          justify='space-between'
        >
          <ExportButtons
            exportRef={contentRef}
            exportData={sampleData}
            fileName='my-report'
          />

          <Stack ml='auto'>
            <Input placeholder='Search...' />
          </Stack>
        </Flex>
        <Wrap ref={contentRef} spacing='50px' align='center'>
          <WrapItem>
            {' '}
            <Center bg='cyan.500' borderRadius='full'>
              <Ellipsis />
            </Center>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Name
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Email
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Location
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Orders
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Money Spent
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Last Orders
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
