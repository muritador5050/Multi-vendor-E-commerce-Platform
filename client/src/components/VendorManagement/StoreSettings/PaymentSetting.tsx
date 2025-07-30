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
import type { BankDetails } from '@/type/vendor';

interface BankDetailsProps {
  data: BankDetails;
  onChange: (update: Partial<BankDetails>) => void;
}

type BankFormField = {
  name: string;
  label: string;
  placeholder: string;
};

const bankFields: BankFormField[] = [
  {
    name: 'accountName',
    label: 'Account Name',
    placeholder: 'Your bank account name',
  },
  {
    name: 'accountNumber',
    label: 'Account Number',
    placeholder: 'Your bank account number',
  },
  { name: 'bankName', label: 'Bank Name', placeholder: 'Name of Bank' },
  {
    name: 'accountType',
    label: 'Account Type',
    placeholder: 'Type odf the account',
  },
  {
    name: 'routingNumber',
    label: 'Routing Number',
    placeholder: 'Routing Number',
  },
  { name: 'swiftCode', label: 'Swift Code', placeholder: 'Swift code' },
];

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function PaymentSetting({ data, onChange }: BankDetailsProps) {
  const [bannerType, setBannerType] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

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

            {bankFields.map((field) => (
              <FormControl
                key={field.name}
                display={{ base: 'block', md: 'flex' }}
                alignItems={{ md: 'center' }}
                gap={{ base: 4, md: 44 }}
              >
                <FormLabel {...styles}>{field.label}</FormLabel>
                <Input
                  name={field.name}
                  placeholder={field.placeholder}
                  value={data[field.name as keyof BankDetails] || ''}
                  onChange={handleInputChange}
                  flex='1'
                  maxW={{ md: '60%' }}
                />
              </FormControl>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
