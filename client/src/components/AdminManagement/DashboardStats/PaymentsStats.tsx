import { useMemo } from 'react';
import { useGetAllPayments } from '@/context/PaymentContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function PaymentsStats() {
  const cardBg = 'white';
  const textColor = 'gray.600';
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
        {stat?.label}
      </Text>
      <Text
        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
        fontWeight='bold'
        mb={2}
      >
        {stat?.value}
      </Text>
      <Flex
        align='center'
        color={stat?.trend === 'up' ? 'green.500' : 'red.500'}
      >
        {stat?.trend === 'up' ? (
          <TrendingUp size={16} />
        ) : (
          <TrendingDown size={16} />
        )}
        <Text ml={1} fontSize={{ base: 'xs', md: 'sm' }} fontWeight='medium'>
          {stat?.change}
        </Text>
      </Flex>
    </Box>
  );
}
