// VendorStats.js - Compact Version
import { useMemo } from 'react';
import { useVendorsForAdmin } from '@/context/VendorContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';

export default function VendorStats() {
  const cardBg = 'white';
  const { data } = useVendorsForAdmin();

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
      p={3}
      borderRadius='md'
      boxShadow='sm'
      border='1px'
      borderColor='blue.400' // Changed from gray to match others
      transition='transform 0.2s, box-shadow 0.2s'
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Flex align='center' mb={2}>
        <Box p={1.5} bg='purple.100' borderRadius='md' mr={2}>
          <Users size={18} color='purple' />
        </Box>
        <Text fontSize='sm' fontWeight='semibold'>
          {stat.label}
        </Text>
      </Flex>
      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold' mb={1}>
        {stat.value}
      </Text>
      <Flex
        align='center'
        color={stat.trend === 'up' ? 'green.500' : 'red.500'}
      >
        {stat.trend === 'up' ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}
        <Text ml={1} fontSize='xs' fontWeight='medium'>
          {stat.change}
        </Text>
      </Flex>
    </Box>
  );
}
