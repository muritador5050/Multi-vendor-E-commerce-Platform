import { useMemo } from 'react';
import { useOrderStats } from '@/context/OrderContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

export default function OrderStats() {
  const cardBg = 'white';
  const { data: orderStats } = useOrderStats();
  console.log('Stats:', orderStats);

  const stat = useMemo(() => {
    const currentRevenue = orderStats?.overview?.totalRevenue || 0;
    const revenueTrend = calculateTrend(currentRevenue);

    return {
      label: 'Total Revenue',
      value: `$${currentRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: revenueTrend.change,
      trend: revenueTrend.trend,
    };
  }, [orderStats]);

  // Handle loading state
  if (!orderStats) {
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
        <Flex align='center' mb={4}>
          <Box p={2} bg='yellow.600' borderRadius='md' mr={3}>
            <DollarSign color='yellow' />
          </Box>
          <Box fontWeight='bold'>Total Revenue</Box>
        </Flex>
        <Text
          fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
          fontWeight='bold'
          mb={2}
        >
          Loading...
        </Text>
      </Box>
    );
  }

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
      <Flex align='center' mb={4}>
        <Box p={2} bg='yellow.600' borderRadius='md' mr={3}>
          <DollarSign color='yellow' />
        </Box>
        <Box fontWeight='bold'>{stat.label}</Box>
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
