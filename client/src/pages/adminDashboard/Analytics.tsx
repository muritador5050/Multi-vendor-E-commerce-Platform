import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { TrendingUp, ShoppingBag, Users } from 'lucide-react';

export const AnalyticsContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Box fontSize='xl' fontWeight='bold' mb={6}>
        Analytics & Reports
      </Box>

      <Box
        display='grid'
        gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        gap={6}
        mb={6}
      >
        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <Flex align='center' mb={4}>
            <Box p={2} bg='blue.100' borderRadius='md' mr={3}>
              <TrendingUp color='blue' />
            </Box>
            <Box fontWeight='bold'>Sales Growth</Box>
          </Flex>
          <Box fontSize='2xl' fontWeight='bold' mb={2}>
            +24.5%
          </Box>
          <Box fontSize='sm' color='gray.500'>
            vs last month
          </Box>
        </Box>

        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <Flex align='center' mb={4}>
            <Box p={2} bg='green.100' borderRadius='md' mr={3}>
              <ShoppingBag color='green' />
            </Box>
            <Box fontWeight='bold'>Conversion Rate</Box>
          </Flex>
          <Box fontSize='2xl' fontWeight='bold' mb={2}>
            3.2%
          </Box>
          <Box fontSize='sm' color='gray.500'>
            vs last month
          </Box>
        </Box>

        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <Flex align='center' mb={4}>
            <Box p={2} bg='purple.100' borderRadius='md' mr={3}>
              <Users color='purple' />
            </Box>
            <Box fontWeight='bold'>Active Vendors</Box>
          </Flex>
          <Box fontSize='2xl' fontWeight='bold' mb={2}>
            156
          </Box>
          <Box fontSize='sm' color='gray.500'>
            vs last month
          </Box>
        </Box>
      </Box>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <Box fontSize='lg' fontWeight='bold' mb={4}>
          Revenue Overview
        </Box>
        <Box
          h='300px'
          bg='gray.100'
          borderRadius='md'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Box color='gray.500'>Chart visualization would go here</Box>
        </Box>
      </Box>
    </Box>
  );
};
