// PaymentsStats.js - Compact Version
import { useMemo } from 'react';
import { useGetAllPayments } from '@/context/PaymentContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';

export default function PaymentsStats() {
  const cardBg = 'white';
  const { data } = useGetAllPayments();

  const stat = useMemo(() => {
    if (!data?.data?.payments || !Array.isArray(data.data.payments)) {
      return {
        label: 'Total Payments',
        value: '0',
        change: '0%',
        trend: 'up' as const,
      };
    }

    const totalPayments = data.data.payments.filter(
      (payment) => payment.status === 'completed'
    ).length;

    const paymentTrends = calculateTrend(totalPayments);
    return {
      label: 'Total Payments',
      value: totalPayments?.toLocaleString(),
      change: paymentTrends.change,
      trend: paymentTrends.trend,
    };
  }, [data]);

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
        <Box p={1.5} bg='blue.100' borderRadius='md' mr={2}>
          <CreditCard size={18} color='blue' />
        </Box>
        <Text fontSize='sm' fontWeight='semibold'>
          {stat.label}
        </Text>
      </Flex>
      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold' mb={1}>
        {stat?.value}
      </Text>
      <Flex
        align='center'
        color={stat?.trend === 'up' ? 'green.500' : 'red.500'}
      >
        {stat?.trend === 'up' ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}
        <Text ml={1} fontSize='xs' fontWeight='medium'>
          {stat?.change}
        </Text>
      </Flex>
    </Box>
  );
}
