import { useMemo } from 'react';
import { useProducts } from '@/context/ProductContextService';
import { calculateTrend } from '../Utils/Utils';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Package, TrendingDown, TrendingUp } from 'lucide-react';

export default function ProductsStats() {
  const cardBg = 'white';
  const { data } = useProducts();

  const stat = useMemo(() => {
    const totalProducts = data?.pagination.total;
    const productsTrend = calculateTrend(Number(totalProducts));
    return {
      label: 'Total Products',
      value: totalProducts?.toLocaleString(),
      change: productsTrend.change,
      trend: productsTrend.trend,
    };
  }, [data?.pagination.total]);

  return (
    <Box
      bg={cardBg}
      p={3} // Reduced from 4-6 to 3
      borderRadius='md' // Reduced from lg to md
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
        {' '}
        {/* Reduced from mb={4} to mb={2} */}
        <Box p={1.5} bg='teal.100' borderRadius='md' mr={2}>
          {' '}
          {/* Reduced padding and margin */}
          <Package size={18} color='teal' /> {/* Made icon smaller */}
        </Box>
        <Text fontSize='sm' fontWeight='semibold'>
          {stat.label}
        </Text>{' '}
        {/* Smaller font */}
      </Flex>
      <Text
        fontSize={{ base: 'lg', md: 'xl' }} // Reduced from xl/2xl/3xl to lg/xl
        fontWeight='bold'
        mb={1} // Reduced from mb={2} to mb={1}
      >
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
          {' '}
          {/* Consistent small font */}
          {stat.change}
        </Text>
      </Flex>
    </Box>
  );
}
