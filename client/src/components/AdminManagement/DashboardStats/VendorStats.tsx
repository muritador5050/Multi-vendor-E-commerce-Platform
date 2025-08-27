import { useMemo } from 'react';
import { useVendorsForAdmin } from '@/context/VendorContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';

export default function VendorStats() {
  const cardBg = 'white';

  //Hook
  const { data } = useVendorsForAdmin();
  //Memo
  const stat = useMemo(() => {
    const activeVendors = data?.vendors?.filter(
      (v) => v.verificationStatus == 'approved'
    ).length;

    const vendorsTrend = calculateTrend(activeVendors!);
    return {
      label: 'Active Vendors',
      value: activeVendors?.toString(),
      change: vendorsTrend.change,
      trend: vendorsTrend.trend,
    };
  }, [data]);

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius='lg'
      boxShadow='sm'
      border='1px'
      borderColor='gray'
      transition='transform 0.2s, box-shadow 0.2s'
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Flex align='center' mb={4}>
        <Box p={2} bg='purple.100' borderRadius='md' mr={3}>
          <Users color='purple' />
        </Box>
        <Box fontWeight='bold'> {stat.label}</Box>
      </Flex>
      <Text
        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
        fontWeight='bold'
        mb={2}
      >
        {stat.value}
      </Text>
      <Flex
        align='center'
        color={stat.trend === 'up' ? 'green.500' : 'red.500'}
      >
        {stat.trend === 'up' ? (
          <TrendingUp size={16} />
        ) : (
          <TrendingDown size={16} />
        )}
        <Text ml={1} fontSize={{ base: 'xs', md: 'sm' }} fontWeight='medium'>
          {stat.change}
        </Text>
      </Flex>
    </Box>
  );
}
