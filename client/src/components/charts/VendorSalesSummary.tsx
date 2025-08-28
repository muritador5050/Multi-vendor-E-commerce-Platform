import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';

interface VendorSalesSummaryProps {
  data: {
    totalSales: number;
    totalProductsSold: number;
    totalOrders: number;
  } | null;
}

export function VendorSalesSummary({ data }: VendorSalesSummaryProps) {
  if (!data) {
    return (
      <Card>
        <CardBody>
          <Text color='gray.500' textAlign='center'>
            No sales data available
          </Text>
        </CardBody>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Sales',
      value: `$${data.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'green.500',
    },
    {
      label: 'Products Sold',
      value: data.totalProductsSold.toLocaleString(),
      icon: Package,
      color: 'blue.500',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'purple.500',
    },
  ];

  return (
    <SimpleGrid columns={1} spacing={4}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardBody>
            <Flex align='center' gap={3}>
              <Box p={2} borderRadius='md' bg={stat.color} color='white'>
                <Icon as={stat.icon} boxSize={5} />
              </Box>
              <Stat>
                <StatLabel fontSize='sm' color='gray.600'>
                  {stat.label}
                </StatLabel>
                <StatNumber fontSize='xl' fontWeight='bold'>
                  {stat.value}
                </StatNumber>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
      ))}

      {/* Additional calculated metrics */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel fontSize='sm' color='gray.600'>
              Average Order Value
            </StatLabel>
            <StatNumber fontSize='xl' fontWeight='bold' color='teal.500'>
              $
              {data.totalOrders > 0
                ? (data.totalSales / data.totalOrders).toFixed(2)
                : '0.00'}
            </StatNumber>
            <StatHelpText>Revenue per order</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
}
