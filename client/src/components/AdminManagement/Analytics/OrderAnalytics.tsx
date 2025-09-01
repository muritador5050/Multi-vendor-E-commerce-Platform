import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Progress,
  Icon,
  Flex,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import {
  useDailySalesReport,
  useOrderStats,
} from '@/context/OrderContextService';

// TypeScript interfaces
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helpText?: string;
  color: string;
  badge?: {
    text: string;
    colorScheme: string;
  };
}

interface OrderStatusCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  total: number;
  color: string;
}

const OrderAnalytics = () => {
  const { data: salesByDateData } = useDailySalesReport();
  const { data: orderStats } = useOrderStats();
  // Format data for charts
  const chartData = salesByDateData?.map((item) => ({
    date: new Date(item._id).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    sales: item.totalSales,
    orders: item.orders,
  }));

  // Order status data for pie chart
  const statusData = [
    { name: 'Paid', value: orderStats?.overview.paidOrders, color: '#48BB78' },
    {
      name: 'Pending',
      value: orderStats?.overview.pendingOrders,
      color: '#ED8936',
    },
    {
      name: 'Processing',
      value: orderStats?.overview.processingOrders,
      color: '#4299E1',
    },
    {
      name: 'Shipped',
      value: orderStats?.overview.shippedOrders,
      color: '#9F7AEA',
    },
    {
      name: 'Returned',
      value: orderStats?.overview.returnedOrders,
      color: '#F56565',
    },
  ].filter((item) => (item?.value || 0) > 0);

  const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    helpText,
    color,
    badge,
  }) => (
    <Card>
      <CardBody>
        <Flex align='center' justify='space-between'>
          <Box>
            <Stat>
              <StatLabel color='gray.600' fontSize='sm'>
                {label}
              </StatLabel>
              <StatNumber color={color} fontSize='2xl'>
                {value}
              </StatNumber>
              {helpText && (
                <StatHelpText fontSize='xs'>{helpText}</StatHelpText>
              )}
            </Stat>
          </Box>
          <Box>
            <Icon as={icon} w={8} h={8} color={color} />
            {badge && (
              <Badge colorScheme={badge.colorScheme} ml={2}>
                {badge.text}
              </Badge>
            )}
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
    icon,
    label,
    count,
    total,
    color,
  }) => {
    const percentage = (count / total) * 100;
    return (
      <Box p={4} borderWidth='1px' borderRadius='lg' bg='white'>
        <HStack justify='space-between' mb={2}>
          <HStack>
            <Icon as={icon} color={color} />
            <Text fontSize='sm' fontWeight='medium'>
              {label}
            </Text>
          </HStack>
          <Badge
            colorScheme={
              color === '#48BB78'
                ? 'green'
                : color === '#ED8936'
                ? 'orange'
                : color === '#4299E1'
                ? 'blue'
                : color === '#9F7AEA'
                ? 'purple'
                : 'red'
            }
          >
            {count}
          </Badge>
        </HStack>
        <Progress
          value={percentage}
          colorScheme={
            color === '#48BB78'
              ? 'green'
              : color === '#ED8936'
              ? 'orange'
              : color === '#4299E1'
              ? 'blue'
              : color === '#9F7AEA'
              ? 'purple'
              : 'red'
          }
          size='sm'
        />
        <Text fontSize='xs' color='gray.500' mt={1}>
          {percentage.toFixed(1)}%
        </Text>
      </Box>
    );
  };

  return (
    <Box p={6} bg='gray.50' minH='100vh'>
      <VStack spacing={6} align='stretch'>
        {/* Header */}
        <Box>
          <Text fontSize='2xl' fontWeight='bold' color='gray.800' mb={2}>
            Order Analytics Dashboard
          </Text>
          <Text color='gray.600'>
            Overview of your order performance and statistics
          </Text>
        </Box>

        {/* Key Metrics Row */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            icon={DollarSign}
            label='Total Revenue'
            value={`$${
              orderStats?.overview.totalRevenue.toLocaleString() || '0'
            }`}
            helpText='All time revenue'
            color='green.500'
          />
          <StatCard
            icon={ShoppingBag}
            label='Total Orders'
            value={orderStats?.overview.totalOrders.toLocaleString() || '0'}
            helpText='All orders placed'
            color='blue.500'
          />
          <StatCard
            icon={TrendingUp}
            label='Average Order Value'
            value={`$${orderStats?.overview.averageOrderValue.toFixed(2)}`}
            helpText='Per order average'
            color='purple.500'
          />
          <StatCard
            icon={Clock}
            label='Pending Orders'
            value={orderStats?.overview.pendingOrders || 0}
            helpText='Awaiting processing'
            color='orange.500'
            badge={{ text: 'Action Needed', colorScheme: 'orange' }}
          />
        </SimpleGrid>

        {/* Charts Row */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <Text fontSize='lg' fontWeight='semibold'>
                Daily Sales Trend
              </Text>
              <Text fontSize='sm' color='gray.600'>
                Revenue and order count over time
              </Text>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis yAxisId='sales' orientation='left' />
                  <YAxis yAxisId='orders' orientation='right' />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'sales' ? `$${value}` : value,
                      name === 'sales' ? 'Revenue' : 'Orders',
                    ]}
                  />
                  <Line
                    yAxisId='sales'
                    type='monotone'
                    dataKey='sales'
                    stroke='#4299E1'
                    strokeWidth={3}
                    dot={{ fill: '#4299E1', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId='orders'
                    type='monotone'
                    dataKey='orders'
                    stroke='#48BB78'
                    strokeWidth={3}
                    dot={{ fill: '#48BB78', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <Text fontSize='lg' fontWeight='semibold'>
                Order Status Distribution
              </Text>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <VStack spacing={2} mt={4}>
                {statusData.map((item, index) => (
                  <HStack key={index} justify='space-between' w='100%'>
                    <HStack>
                      <Box w={3} h={3} bg={item.color} borderRadius='full' />
                      <Text fontSize='sm'>{item.name}</Text>
                    </HStack>
                    <Text fontSize='sm' fontWeight='medium'>
                      {item.value}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Order Status Details */}
        <Card>
          <CardHeader>
            <Text fontSize='lg' fontWeight='semibold'>
              Order Status Breakdown
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Detailed view of all order statuses
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <OrderStatusCard
                icon={CheckCircle}
                label='Paid Orders'
                count={orderStats?.overview.paidOrders || 0}
                total={orderStats?.overview.totalOrders || 0}
                color='#48BB78'
              />
              <OrderStatusCard
                icon={Clock}
                label='Pending Orders'
                count={orderStats?.overview.pendingOrders || 0}
                total={orderStats?.overview.totalOrders || 0}
                color='#ED8936'
              />
              <OrderStatusCard
                icon={Package}
                label='Processing'
                count={orderStats?.overview.processingOrders || 0}
                total={orderStats?.overview.totalOrders || 0}
                color='#4299E1'
              />
              <OrderStatusCard
                icon={Truck}
                label='Shipped'
                count={orderStats?.overview.shippedOrders || 0}
                total={orderStats?.overview.totalOrders || 0}
                color='#9F7AEA'
              />
              {(orderStats?.overview.returnedOrders || 0) > 0 && (
                <OrderStatusCard
                  icon={RotateCcw}
                  label='Returned'
                  count={orderStats?.overview.returnedOrders || 0}
                  total={orderStats?.overview.totalOrders || 0}
                  color='#F56565'
                />
              )}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Daily Orders Bar Chart */}
        <Card>
          <CardHeader>
            <Text fontSize='lg' fontWeight='semibold'>
              Daily Order Volume
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Number of orders per day
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Bar dataKey='orders' fill='#4299E1' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default OrderAnalytics;
