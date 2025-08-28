import { useMemo } from 'react';
import { useOrderStats } from '@/context/OrderContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

export default function OrderStats() {
  const cardBg = 'white';
  const { data: orderStats } = useOrderStats();

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

  if (!orderStats) {
    return (
      <Box
        bg={cardBg}
        p={3}
        borderRadius='md'
        boxShadow='sm'
        border='1px'
        borderColor='blue.400'
        transition='transform 0.2s, box-shadow 0.2s'
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }}
      >
        <Flex align='center' mb={2}>
          <Box p={1.5} bg='yellow.600' borderRadius='md' mr={2}>
            <DollarSign size={18} color='yellow' />
          </Box>
          <Text fontSize='sm' fontWeight='semibold'>
            Total Revenue
          </Text>
        </Flex>
        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold' mb={1}>
          Loading...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg={cardBg}
      p={3}
      borderRadius='md'
      boxShadow='sm'
      border='1px'
      borderColor='blue.400'
      transition='transform 0.2s, box-shadow 0.2s'
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Flex align='center' mb={2}>
        <Box p={1.5} bg='yellow.600' borderRadius='md' mr={2}>
          <DollarSign size={18} color='yellow' />
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
