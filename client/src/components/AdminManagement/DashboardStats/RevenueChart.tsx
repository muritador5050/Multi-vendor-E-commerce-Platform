import { Box, Text, SimpleGrid, Card, CardBody } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useDailySalesReport,
  useOrderStats,
} from '@/context/OrderContextService';
export default function RevenueChart() {
  const { data: orderStats } = useOrderStats();
  const { data: salesByDateData } = useDailySalesReport();
  // Get total revenue from overview
  const totalRevenue = orderStats?.overview?.totalRevenue || 0;
  const totalOrders = orderStats?.overview?.totalOrders || 0;
  const avgOrderValue = orderStats?.overview?.averageOrderValue || 0;

  // Format daily sales data
  const dailyData =
    salesByDateData?.map((item) => ({
      date: new Date(item._id).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: item.totalSales,
      orders: item.orders,
    })) || [];

  return (
    <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
      <Box fontSize='lg' fontWeight='bold' mb={6}>
        Revenue Overview
      </Box>

      {/* Revenue Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card size='sm'>
          <CardBody>
            <Text fontSize='sm' color='gray.600'>
              Total Revenue
            </Text>
            <Text fontSize='2xl' fontWeight='bold' color='green.500'>
              ${totalRevenue.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card size='sm'>
          <CardBody>
            <Text fontSize='sm' color='gray.600'>
              Total Orders
            </Text>
            <Text fontSize='2xl' fontWeight='bold' color='blue.500'>
              {totalOrders.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card size='sm'>
          <CardBody>
            <Text fontSize='sm' color='gray.600'>
              Avg Order Value
            </Text>
            <Text fontSize='2xl' fontWeight='bold' color='purple.500'>
              ${avgOrderValue.toFixed(2)}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Daily Revenue Trend */}
      {dailyData.length > 0 ? (
        <Box>
          <Text fontSize='md' fontWeight='semibold' mb={4}>
            Daily Revenue Trend
          </Text>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders',
                ]}
              />
              <Line
                type='monotone'
                dataKey='revenue'
                stroke='#4299E1'
                strokeWidth={3}
                dot={{ fill: '#4299E1', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box
          h='300px'
          bg='gray.100'
          borderRadius='md'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Text color='gray.500'>No daily sales data available</Text>
        </Box>
      )}
    </Box>
  );
}
