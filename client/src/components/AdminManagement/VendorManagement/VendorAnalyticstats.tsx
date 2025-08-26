import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Card,
  CardBody,
  Circle,
} from '@chakra-ui/react';
import {
  Users,
  CheckCircle,
  Clock,
  Ban,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useAdminStats } from '@/context/VendorContextService';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function VendorAnalyticsStats() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const { data: adminStats } = useAdminStats();
  const stats = [
    {
      label: 'Total Vendors',
      value: adminStats?.totalVendors,
      icon: Users,
      color: 'blue',
      iconBg: 'blue.500',
    },
    {
      label: 'Approved Vendors',
      value: adminStats?.verifiedVendors,
      icon: CheckCircle,
      color: 'green',
      iconBg: 'green.500',
    },
    {
      label: 'Pending Vendors',
      value: adminStats?.pendingVendors,
      icon: Clock,
      color: 'yellow',
      iconBg: 'yellow.500',
    },
    {
      label: 'Suspended Vendors',
      value: adminStats?.suspendedVendors,
      icon: Ban,
      color: 'orange',
      iconBg: 'orange.500',
    },
    {
      label: 'Rejected Vendors',
      value: adminStats?.rejectedVendors,
      icon: XCircle,
      color: 'red',
      iconBg: 'red.500',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(adminStats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'purple',
      iconBg: 'purple.500',
    },
  ];

  const statusItems = [
    {
      label: 'Approved',
      count: adminStats?.verifiedVendors,
      color: 'green.500',
    },
    {
      label: 'Pending',
      count: adminStats?.pendingVendors,
      color: 'yellow.500',
    },
    {
      label: 'Suspended',
      count: adminStats?.suspendedVendors,
      color: 'orange.500',
    },
    { label: 'Rejected', count: adminStats?.rejectedVendors, color: 'red.500' },
  ];

  return (
    <Box bg={bgColor} p={6}>
      <VStack spacing={8} align='stretch'>
        {/* Status Distribution */}
        <Card bg={cardBg} shadow='sm'>
          <CardBody>
            <VStack align='stretch' spacing={4}>
              <Heading size='lg' color={'gray.900'}>
                Vendor Status Distribution
              </Heading>
              <Flex wrap='wrap' gap={4}>
                {statusItems.map((item, index) => (
                  <HStack key={index} spacing={3}>
                    <Circle size='4' bg={item.color} />
                    <Text fontSize='sm' color={'gray.700'}>
                      {item.label} ({item.count})
                    </Text>
                  </HStack>
                ))}
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {stats.map((stat, index) => (
            <Card
              key={index}
              bg={cardBg}
              shadow='sm'
              _hover={{ shadow: 'lg' }}
              transition='shadow 0.2s'
            >
              <CardBody>
                <Flex justify='space-between' align='center'>
                  <Stat>
                    <StatLabel
                      color={'gray.600'}
                      fontSize='sm'
                      fontWeight='medium'
                    >
                      {stat.label}
                    </StatLabel>
                    <StatNumber
                      fontSize='3xl'
                      fontWeight='bold'
                      color={`${stat.color}.600`}
                    >
                      {stat.value}
                    </StatNumber>
                  </Stat>
                  <Circle size='12' bg={stat.iconBg}>
                    <Icon as={stat.icon} w={6} h={6} color='white' />
                  </Circle>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
