import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Flex,
  Stack,
  Select,
  Text,
  Input,
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

export default function PaymentSetting() {
  const [bannerType, setBannerType] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBannerType(e.target.value);
  };
  return (
    <Box>
      <FormControl>
        <Flex align='center' justify='space-around'>
          <FormLabel {...styles}>Preferred Payment Method</FormLabel>

          <Stack w='55%'>
            <Select
              placeholder='Choose Withdrawal Payment Method'
              value={bannerType}
              onChange={handleSelectChange}
            >
              <option value='Paypal'>Paypal</option>
              <option value='Bank Transfer'>Bank Transfer</option>
            </Select>
          </Stack>
        </Flex>
      </FormControl>
      <Box w='full' my={4}>
        {bannerType === 'Paypal' && (
          <Stack>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Paypal Email</FormLabel>
                <Input ml={16} placeholder='text...' w='55%' />
              </Flex>
            </FormControl>
          </Stack>
        )}
        {bannerType === 'Bank Transfer' && (
          <Stack ml={6} spacing={3} mb={6}>
            <Text fontSize='2xl' color='teal.700'>
              Bank Details
            </Text>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Account Name</FormLabel>
                <Input ml={6} placeholder='Your bank account name' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Account Number</FormLabel>
                <Input ml={4} placeholder='Your bank account number' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Bank Name</FormLabel>
                <Input ml={16} placeholder='Name of Bank' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Bank address</FormLabel>
                <Input ml={10} placeholder='Address of your bank' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Routing Number</FormLabel>
                <Input ml={6} placeholder='Routing Number' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>IBAN</FormLabel>
                <Input ml={32} placeholder='IBAN' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>Swift Code</FormLabel>
                <Input ml={16} placeholder='Swift code' w='55%' />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex align='center' justify='space-around'>
                <FormLabel {...styles}>IFSC Code</FormLabel>
                <Input ml={20} placeholder='IFSC code' w='55%' />
              </Flex>
            </FormControl>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
