import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';
import { getStatusColor } from '../Utils';
import UserManagementDashboard from '@/components/UserManagementDasboard/UserManagementDashboard';

type Stat = {
  label: string;
  value: number | string;
  trend: 'up' | 'down';
  change: string;
};

interface Order {
  id: string;
  customer: string;
  vendor: string;
  amount: number | string;
  status: string;
  date: string;
}

type Vendor = {
  id: string | number;
  name: string;
  email: string;
  status: string;
  revenue: number | string;
  rating: number;
};

type DashboardData = {
  stats: Stat[];
  orders: Order[];
  vendors: Vendor[];
};

export const DashboardContent = ({ data }: { data: DashboardData }) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      {/* Stats Grid */}
      <Box
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={6}
        mb={6}
      >
        {data.stats.map((stat, index) => (
          <Box key={index} bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
            <Box fontSize='sm' color='gray.500' mb={2}>
              {stat.label}
            </Box>
            <Box fontSize='2xl' fontWeight='bold' mb={2}>
              {stat.value}
            </Box>
            <Flex
              align='center'
              color={stat.trend === 'up' ? 'green.500' : 'red.500'}
            >
              <TrendingUp size={16} />
              <Box ml={1} fontSize='sm'>
                {stat.change}
              </Box>
            </Flex>
          </Box>
        ))}
      </Box>

      {/* Recent Orders and Top Vendors */}
      <Box
        display='grid'
        gridTemplateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gap={6}
      >
        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <Box fontSize='lg' fontWeight='bold' mb={4}>
            Recent Orders
          </Box>
          <Box overflowX='auto'>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    Order ID
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    Customer
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: '8px' }}>{order.id}</td>
                    <td style={{ padding: '8px' }}>{order.customer}</td>
                    <td style={{ padding: '8px' }}>{order.amount}</td>
                    <td style={{ padding: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor:
                            getStatusColor(order.status) === 'green'
                              ? '#c6f6d5'
                              : '#fed7d7',
                          color:
                            getStatusColor(order.status) === 'green'
                              ? '#2f855a'
                              : '#c53030',
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <Box fontSize='lg' fontWeight='bold' mb={4}>
            Top Vendors
          </Box>
          {data.vendors.slice(0, 4).map((vendor) => (
            <Flex key={vendor.id} justify='space-between' align='center' mb={4}>
              <Box>
                <Box fontWeight='medium'>{vendor.name}</Box>
                <Box fontSize='sm' color='gray.500'>
                  {vendor.revenue}
                </Box>
              </Box>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backgroundColor:
                    getStatusColor(vendor.status) === 'green'
                      ? '#c6f6d5'
                      : '#fed7d7',
                  color:
                    getStatusColor(vendor.status) === 'green'
                      ? '#2f855a'
                      : '#c53030',
                }}
              >
                {vendor.status}
              </span>
            </Flex>
          ))}
        </Box>
        <UserManagementDashboard />
      </Box>
    </Box>
  );
};
