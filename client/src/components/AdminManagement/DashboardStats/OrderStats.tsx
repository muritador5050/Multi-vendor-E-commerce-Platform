import React, { useMemo } from 'react';
import { useOrders } from '@/context/OrderContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function OrderStats() {
  const cardBg = 'white';
  const textColor = 'gray.600';
  const { data } = useOrders();

  // Memoize orders extraction
  const orders = useMemo(() => data?.orders || [], [data?.orders]);

  //Memo for stats calculation
  const stat = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      let price = 0;
      if (typeof order.totalPrice === 'number') {
        price = order.totalPrice;
      } else if (typeof order.totalPrice === 'string') {
        price = parseFloat(order.totalPrice) || 0;
      }
      return sum + price;
    }, 0);

    const revenueTrend = calculateTrend(totalRevenue);
    return {
      label: 'Total Revenue',
      value: `$${totalRevenue?.toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })}`,
      change: revenueTrend.change,
      trend: revenueTrend.trend,
    };
  }, [orders]);

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
