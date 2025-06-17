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
  Button,
} from '@chakra-ui/react';
import { DollarSign, Ellipsis } from 'lucide-react';
import ExportButtons from '@/utils/File-format';

export default function Payments() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const sampleData = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
  ];
  return (
    <Box display='flex' flexDirection='column' gap={6}>
      <Flex bg='white' align='center' justify='space-between' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Transactions for: June 1, 2025 - June 30, 2025
        </Text>
        <Button
          leftIcon={<DollarSign />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Transactions
        </Button>
      </Flex>
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
              Invoice ID
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Order IDs
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Amount
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Charges
            </Text>
          </WrapItem>
          <WrapItem>
            <Text fontSize='lg' color='cyan.500'>
              Payment
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Mode
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Note
            </Text>
          </WrapItem>
          <WrapItem>
            {' '}
            <Text fontSize='lg' color='cyan.500'>
              Date
            </Text>
          </WrapItem>
        </Wrap>
      </Stack>
    </Box>
  );
}
