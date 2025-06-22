import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
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
  minWidth: { md: '150px' },
};

export default function PaymentSetting() {
  const [bannerType, setBannerType] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBannerType(e.target.value);
  };
  return (
    <Box>
      <FormControl
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={{ base: 4, md: '85px' }}
      >
        <FormLabel {...styles}>Preferred Payment Method</FormLabel>
        <Select
          flex='1'
          maxW='60%'
          placeholder='Choose Withdrawal Payment Method'
          value={bannerType}
          onChange={handleSelectChange}
        >
          <option value='Paypal'>Paypal</option>
          <option value='Bank Transfer'>Bank Transfer</option>
        </Select>
      </FormControl>
      <Box w='full' my={4}>
        {bannerType === 'Paypal' && (
          <FormControl
            display={{ base: 'block', md: 'flex' }}
            alignItems={{ md: 'center' }}
            gap={{ base: 4, md: 44 }}
          >
            <FormLabel {...styles}>Paypal Email</FormLabel>
            <Input flex='1' placeholder='text...' maxW={{ md: '60%' }} />
          </FormControl>
        )}
        {bannerType === 'Bank Transfer' && (
          <Stack spacing={3}>
            <Text fontSize='2xl' color='teal.700'>
              Bank Details
            </Text>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Account Name</FormLabel>
              <Input
                flex='1'
                placeholder='Your bank account name'
                maxW={{ md: '60%' }}
              />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Account Number</FormLabel>
              <Input
                flex='1'
                placeholder='Your bank account number'
                maxW={{ md: '60%' }}
              />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Bank Name</FormLabel>
              <Input flex='1' placeholder='Name of Bank' maxW={{ md: '60%' }} />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Bank address</FormLabel>
              <Input
                flex='1'
                placeholder='Address of your bank'
                maxW={{ md: '60%' }}
              />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Routing Number</FormLabel>
              <Input
                flex='1'
                placeholder='Routing Number'
                maxW={{ md: '60%' }}
              />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>IBAN</FormLabel>
              <Input flex='1' placeholder='IBAN' maxW={{ md: '60%' }} />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>Swift Code</FormLabel>
              <Input flex='1' placeholder='Swift code' maxW={{ md: '60%' }} />
            </FormControl>
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...styles}>IFSC Code</FormLabel>
              <Input flex='1' placeholder='IFSC code' maxW={{ md: '60%' }} />
            </FormControl>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
