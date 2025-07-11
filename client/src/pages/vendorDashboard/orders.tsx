import React, { useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  Stack,
  Center,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Ellipsis } from 'lucide-react';
import ExportButtons from '@/utils/File-format';

export default function Orders() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const sampleData = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
  ];
  return (
    <Box display='flex' flexDirection='column' gap={6}>
      <Box bg='white' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Orders Listing
        </Text>
      </Box>
      <Stack bg='white' borderRadius='2xl' p={3}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align='center'
          gap={{ base: 4, md: 10 }}
        >
          <ExportButtons
            exportRef={contentRef}
            exportData={sampleData}
            fileName='my-report'
          />
          <Stack>
            <Select placeholder='Select option'>
              <option value='option1'>Option 1</option>
              <option value='option2'>Option 2</option>
              <option value='option3'>Option 3</option>
            </Select>
          </Stack>
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
              Order
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Purchased
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Billing <br /> Address
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Shipping <br /> Address
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Gross <br />
              Sales
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Earning Date
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
