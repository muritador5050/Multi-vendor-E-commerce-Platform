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
import type { StorePolicies } from '@/type/vendor';

// export interface StorePolicies {
//   returnPolicy?: string;
//   shippingPolicy?: string;
//   privacyPolicy?: string;
//   termsOfService?: string;
//   refundPolicy?: string;
// }
interface StorePoliciesProps {
  data: StorePolicies;
  onChange: (update: Partial<StorePolicies>) => void;
}

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};
export default function StorePoliciesSettings({
  data,
  onChange,
}: StorePoliciesProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };
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
        <FormLabel {...styles}>Refund Policy</FormLabel>
        <Input
          flex='1'
          maxW={{ md: '60%' }}
          value={data.refundPolicy || ''}
          onChange={handleInputChange}
        />
      </FormControl>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Shipping Policy</Text>
        <RichTextEditor
          value={data.shippingPolicy || ''}
          onChange={(content: string) => onChange({ shippingPolicy: content })}
        />
      </Flex>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Return Policy</Text>
        <RichTextEditor
          value={data.returnPolicy || ''}
          onChange={(content: string) => onChange({ returnPolicy: content })}
        />
      </Flex>
      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Terms of Service Policy</Text>
        <RichTextEditor
          value={data.termsOfService || ''}
          onChange={(content: string) => onChange({ termsOfService: content })}
        />
      </Flex>
    </Stack>
  );
}
