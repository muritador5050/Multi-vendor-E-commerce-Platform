import RichTextEditor from '@/utils/RichTextEditor';
import { Flex, Stack, Text } from '@chakra-ui/react';
import type { StorePolicies } from '@/type/vendor';

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
  return (
    <Stack spacing={5}>
      <Text fontSize='2xl' color='teal.700'>
        Policies Setting
      </Text>

      <Flex direction='column' gap={6} mt={6}>
        <Text {...styles}>Refund Policy</Text>
        <RichTextEditor
          value={data.refundPolicy || ''}
          onChange={(content: string) => onChange({ refundPolicy: content })}
        />
      </Flex>
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
