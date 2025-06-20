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
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...styles}>Preferred Payment Method</FormLabel>

          <Stack w={{ md: '55%' }}>
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
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Paypal Email</FormLabel>
                <Input
                  ml={{ md: 32 }}
                  placeholder='text...'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
          </Stack>
        )}
        {bannerType === 'Bank Transfer' && (
          <Stack ml={{ md: 6 }} spacing={3} mb={6}>
            <Text fontSize='2xl' color='teal.700'>
              Bank Details
            </Text>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Account Name</FormLabel>
                <Input
                  ml={{ md: 6 }}
                  placeholder='Your bank account name'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Account Number</FormLabel>
                <Input
                  ml={{ md: 4 }}
                  placeholder='Your bank account number'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Bank Name</FormLabel>
                <Input
                  ml={{ md: 16 }}
                  placeholder='Name of Bank'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Bank address</FormLabel>
                <Input
                  ml={{ md: 10 }}
                  placeholder='Address of your bank'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Routing Number</FormLabel>
                <Input
                  ml={{ md: 6 }}
                  placeholder='Routing Number'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>IBAN</FormLabel>
                <Input ml={{ md: 32 }} placeholder='IBAN' w={{ md: '55%' }} />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>Swift Code</FormLabel>
                <Input
                  ml={{ md: 16 }}
                  placeholder='Swift code'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'center' }}
                justify={{ md: 'space-around' }}
              >
                <FormLabel {...styles}>IFSC Code</FormLabel>
                <Input
                  ml={{ md: 20 }}
                  placeholder='IFSC code'
                  w={{ md: '55%' }}
                />
              </Flex>
            </FormControl>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
