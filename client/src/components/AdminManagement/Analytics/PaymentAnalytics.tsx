import { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGetPaymentAnalytics } from '@/context/PaymentContextService';

type PeriodType = '7days' | '30days' | '3months' | '6months' | '12months';

interface PaymentOverview {
  totalSpent: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  largestTransaction: number;
  smallestTransaction: number;
  successRate: string;
}

interface PaymentCounts {
  successful: number;
  failed: number;
  pending: number;
}

interface StatusBreakdown {
  _id: string;
  count: number;
  totalAmount: number;
}

interface MonthlyTrend {
  totalAmount: number;
  transactionCount: number;
  year: number;
  month: number;
  monthName: string;
  avgAmount: number;
}

interface PaymentMethodBreakdown {
  count: number;
  totalAmount: number;
  paymentProvider: string;
  avgAmount: number;
}

interface RecentTransaction {
  _id: string;
  orderId: {
    _id: string;
  };
  paymentProvider: string;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface PaymentAnalytics {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overview: PaymentOverview;
  paymentCounts: PaymentCounts;
  statusBreakdown: StatusBreakdown[];
  monthlyTrends: MonthlyTrend[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  recentTransactions: RecentTransaction[];
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color: string;
}

export default function PaymentAnalytics() {
  const [period, setPeriod] = useState<PeriodType>('12months');

  const { data: response, isLoading } = useGetPaymentAnalytics(period);
  const analytics = response?.data;

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Format currency with better formatting
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Colors for pie chart
  const pieColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Box p={{ base: 4, md: 6 }} minH='100vh'>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify='space-between'
        align={{ base: 'stretch', sm: 'center' }}
        mb={6}
        gap={{ base: 4, sm: 0 }}
      >
        <Heading size='lg' color={textColor}>
          Payment Analytics
        </Heading>

        {/* Period Selector */}
        <Select
          w={{ base: '100%', sm: '200px' }}
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodType)}
          bg={cardBg}
        >
          <option value='7days'>Last 7 Days</option>
          <option value='30days'>Last 30 Days</option>
          <option value='3months'>Last 3 Months</option>
          <option value='6months'>Last 6 Months</option>
          <option value='12months'>Last 12 Months</option>
        </Select>
      </Flex>

      {isLoading ? (
        <Flex justify='center' align='center' h='300px'>
          <Spinner size='xl' color='blue.500' />
        </Flex>
      ) : !analytics ? (
        <Box textAlign='center' p={8} bg={cardBg} rounded='xl' shadow='md'>
          <Heading size='md' color={textColor} mb={2}>
            No Data Available
          </Heading>
          <Text color='gray.500'>
            Try selecting a different time period or check back later.
          </Text>
        </Box>
      ) : (
        <>
          {/* Stats Cards - Using actual API data */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
            <StatCard
              title='Total Spent'
              value={formatCurrency(analytics.overview.totalSpent)}
              change='📈 Total Revenue'
              color='green.500'
            />
            <StatCard
              title='Total Transactions'
              value={analytics.overview.totalTransactions.toLocaleString()}
              change='💳 All Payments'
              color='blue.500'
            />
            <StatCard
              title='Average Amount'
              value={formatCurrency(
                analytics.overview.averageTransactionAmount
              )}
              change='💰 Per Transaction'
              color='purple.500'
            />
            <StatCard
              title='Success Rate'
              value={analytics.overview.successRate}
              change='✅ Completion Rate'
              color='teal.500'
            />
          </SimpleGrid>

          {/* Additional Stats Row */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={8}>
            <StatCard
              title='Successful Payments'
              value={analytics.paymentCounts.successful.toLocaleString()}
              change='✅ Completed'
              color='green.500'
            />
            <StatCard
              title='Pending Payments'
              value={analytics.paymentCounts.pending.toLocaleString()}
              change='⏳ In Progress'
              color='yellow.500'
            />
            <StatCard
              title='Failed Payments'
              value={analytics.paymentCounts.failed.toLocaleString()}
              change='❌ Failed'
              color='red.500'
            />
          </SimpleGrid>

          {/* Charts Section */}
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} mb={8}>
            {/* Monthly Trends Bar Chart */}
            <Box
              bg={cardBg}
              p={{ base: 4, md: 6 }}
              rounded='xl'
              shadow='md'
              minH='400px'
            >
              <Heading size='md' mb={4} color={textColor}>
                Monthly Trends
              </Heading>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart
                  data={analytics.monthlyTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                  <XAxis dataKey='monthName' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Total Amount',
                    ]}
                  />
                  <Bar
                    dataKey='totalAmount'
                    fill='#3182CE'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Status Breakdown Pie Chart */}
            <Box
              bg={cardBg}
              p={{ base: 4, md: 6 }}
              rounded='xl'
              shadow='md'
              minH='400px'
            >
              <Heading size='md' mb={4} color={textColor}>
                Payment Status Breakdown
              </Heading>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {analytics.statusBreakdown.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SimpleGrid>

          {/* Payment Method Breakdown */}
          <Box
            bg={cardBg}
            p={{ base: 4, md: 6 }}
            rounded='xl'
            shadow='md'
            mb={8}
          >
            <Heading size='md' mb={4} color={textColor}>
              Payment Method Performance
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {analytics.paymentMethodBreakdown.map((method) => (
                <Box
                  key={method.paymentProvider}
                  p={4}
                  border='1px solid'
                  borderColor={borderColor}
                  rounded='lg'
                >
                  <Flex justify='space-between' align='center' mb={2}>
                    <Text fontWeight='bold' textTransform='capitalize'>
                      {method.paymentProvider}
                    </Text>
                    <Badge
                      colorScheme={
                        method.paymentProvider === 'paystack' ? 'blue' : 'green'
                      }
                    >
                      {method.count} transactions
                    </Badge>
                  </Flex>
                  <Text fontSize='sm' color='gray.500' mb={1}>
                    Total: {formatCurrency(method.totalAmount)}
                  </Text>
                  <Text fontSize='sm' color='gray.500'>
                    Average: {formatCurrency(method.avgAmount)}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Recent Transactions Table */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} rounded='xl' shadow='md'>
            <Heading size='md' mb={4} color={textColor}>
              Recent Transactions
            </Heading>
            <TableContainer>
              <Table variant='simple' size='sm'>
                <Thead>
                  <Tr>
                    <Th>Payment ID</Th>
                    <Th>Provider</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {analytics.recentTransactions
                    .slice(0, 10)
                    .map((transaction) => (
                      <Tr key={transaction._id}>
                        <Td fontSize='xs'>
                          {transaction.paymentId.substring(0, 20)}...
                        </Td>
                        <Td textTransform='capitalize'>
                          {transaction.paymentProvider}
                        </Td>
                        <Td isNumeric fontWeight='semibold'>
                          {formatCurrency(transaction.amount)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(transaction.status)}
                          >
                            {transaction.status}
                          </Badge>
                        </Td>
                        <Td fontSize='xs'>
                          {formatDate(transaction.createdAt)}
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
}

// 🔹 Reusable StatCard Component
function StatCard({ title, value, change, color }: StatCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const helpTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      p={{ base: 4, md: 6 }}
      rounded='xl'
      shadow='md'
      bg={cardBg}
      borderLeft='4px solid'
      borderColor={color}
      transition='all 0.2s'
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)',
        borderLeftWidth: '6px',
      }}
      minH='120px'
    >
      <Stat>
        <StatLabel fontSize='sm' color={helpTextColor} fontWeight='medium'>
          {title}
        </StatLabel>
        <StatNumber
          fontSize={{ base: 'xl', md: '2xl' }}
          color={textColor}
          fontWeight='bold'
        >
          {value}
        </StatNumber>
        <StatHelpText fontSize='xs' color={helpTextColor} mt={2}>
          {change}
        </StatHelpText>
      </Stat>
    </Box>
  );
}
