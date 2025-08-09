import React, { useMemo } from 'react';
import { useVendorsForAdmin } from '@/context/VendorContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function VendorStats() {
  const cardBg = 'white';
  const textColor = 'gray.600';

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
      p={{ base: 4, md: 6 }}
      borderRadius='lg'
      boxShadow='sm'
      border='1px'
      borderColor='blue.400'
      transition='transform 0.2s, box-shadow 0.2s'
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Text
        fontSize={{ base: 'xs', md: 'sm' }}
        color={textColor}
        mb={2}
        fontWeight='medium'
        textTransform='uppercase'
        letterSpacing='wide'
      >
        {stat.label}
      </Text>
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
