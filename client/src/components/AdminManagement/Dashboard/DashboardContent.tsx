import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';
import { getStatusColor } from '../Utils';
import UserManagementDashboard from '@/components/AdminManagement/UserManagementDasboard/UserManagementDashboard';
import { useOrders } from '@/context/OrderContextService';
import { useVendors } from '@/context/VendorContextService';
import { useProducts } from '@/context/ProductContextService';

export const DashboardContent = () => {
  const cardBg = 'white';
  const textColor = 'gray.600';
  const { data: ordersData } = useOrders();
  const { data: vendorData } = useVendors();
  const { data: productsData } = useProducts();
  const orders = ordersData?.data?.order;
  const vendors = vendorData?.vendors;

  const stats = useMemo(() => {
    const totalRevenue = orders?.reduce((sum, order) => {
      const price = parseFloat(
        order.totalPrice?.toString().replace(/[^0-9.-]/g, '') || '0'
      );
      return sum + price;
    }, 0);

    // Get active vendors count
    const activeVendors = vendors?.filter(
      (vendor) => vendor.user.isActive === true
    ).length;

    const totalProducts = productsData?.pagination.total;

    const calculateTrend = (
      current: number | undefined,
      previous = current! * 0.9
    ) => {
      const change = ((current! - previous) / previous) * 100;
      return {
        change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
        trend: change > 0 ? 'up' : 'down',
      };
    };

    const revenueTrend = calculateTrend(totalRevenue);
    const ordersTrend = calculateTrend(ordersData?.data?.totalOrders);

    const vendorsTrend = calculateTrend(activeVendors);
    const productsTrend = calculateTrend(totalProducts);

    return [
      {
        label: 'Total Revenue',
        value: `$${totalRevenue?.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
        change: revenueTrend.change,
        trend: revenueTrend.trend,
      },
      {
        label: 'Total Orders',
        value: orders?.length.toLocaleString(),
        change: ordersTrend.change,
        trend: ordersTrend.trend,
      },
      {
        label: 'Active Vendors',
        value: activeVendors?.toString(),
        change: vendorsTrend.change,
        trend: vendorsTrend.trend,
      },
      {
        label: 'Total Products',
        value: totalProducts?.toLocaleString(),
        change: productsTrend.change,
        trend: productsTrend.trend,
      },
    ];
  }, [orders, vendors, ordersData?.data, productsData?.pagination]);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Box
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={{ base: 4, md: 6 }}
        mb={{ base: 6, md: 8 }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
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
              {stat.label}
            </Text>
            <Text
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              fontWeight='bold'
              mb={2}
            >
              {stat.value}
            </Text>
            <Flex
              align='center'
              color={stat.trend === 'up' ? 'green.500' : 'red.500'}
            >
              {stat.trend === 'up' ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <Text
                ml={1}
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight='medium'
              >
                {stat.change}
              </Text>
            </Flex>
          </Box>
        ))}
      </Box>

      {/* Rest of your component remains the same */}
      <Box
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          xl: '2fr 1fr',
        }}
        gap={{ base: 6, md: 8 }}
        mb={{ base: 6, md: 8 }}
      >
        <Box
          bg='red.500'
          p={{ base: 4, md: 6 }}
          borderRadius='lg'
          boxShadow='sm'
          border='1px'
          borderColor='white'
        >
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight='bold'
            mb={{ base: 3, md: 4 }}
          >
            Recent Orders
          </Text>

          {/* Desktop Table View */}
          <Box overflowX='auto' display={{ base: 'none', md: 'block' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 8px',
                      borderBottom: `1px solid blue.400`,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'gray',
                    }}
                  >
                    Order ID
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 8px',
                      borderBottom: `1px solid blue.400`,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'gray',
                    }}
                  >
                    Customer
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 8px',
                      borderBottom: `1px solid blue.400`,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'gray',
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 8px',
                      borderBottom: `1px solid blue.400`,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'gray',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders?.slice(0, 5).map((order, idx) => (
                  <tr key={order._id}>
                    <td
                      style={{
                        padding: '12px 8px',
                        borderBottom: idx < 4 ? `1px solid blue.400` : 'none',
                      }}
                    >
                      <Text fontSize='sm' fontWeight='medium'>
                        {order._id}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        borderBottom: idx < 4 ? `1px solid blue.400` : 'none',
                      }}
                    >
                      <Text fontSize='sm'>{order.user}</Text>
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        borderBottom: idx < 4 ? `1px solid blue.400` : 'none',
                      }}
                    >
                      <Text fontSize='sm' fontWeight='semibold'>
                        {order.totalPrice}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        borderBottom: idx < 4 ? `1px solid blue.400` : 'none',
                      }}
                    >
                      <Badge
                        px={3}
                        py={1}
                        borderRadius='full'
                        fontSize='xs'
                        colorScheme={getStatusColor(
                          order.orderStatus ?? 'Nill'
                        )}
                      >
                        {order.orderStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* Mobile Card View */}
          <Box display={{ base: 'block', md: 'none' }}>
            {orders?.slice(0, 5).map((order) => (
              <Box
                key={order._id}
                p={4}
                mb={3}
                bg='gray.50'
                borderRadius='md'
                border='1px'
                borderColor='blue.400'
              >
                <Flex justify='space-between' align='center' mb={2}>
                  <Text fontSize='sm' fontWeight='bold'>
                    {order._id}
                  </Text>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius='full'
                    fontSize='xs'
                    colorScheme={getStatusColor(order.orderStatus ?? 'Nill')}
                  >
                    {order.orderStatus}
                  </Badge>
                </Flex>
                <Text fontSize='sm' mb={1}>
                  <Text as='span' fontWeight='semibold' color={textColor}>
                    Customer:
                  </Text>{' '}
                  {order.user}
                </Text>
                <Text fontSize='sm' fontWeight='semibold'>
                  {order.totalPrice}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Top Vendors - Enhanced Responsive Design */}
        <Box
          bg='gray.50'
          p={{ base: 4, md: 6 }}
          borderRadius='lg'
          boxShadow='sm'
          border='1px'
          borderColor='blue.400'
        >
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight='bold'
            mb={{ base: 3, md: 4 }}
          >
            Top Vendors
          </Text>
          <Box>
            {vendors?.slice(0, 4).map((vendor, index) => (
              <Box
                key={vendor._id}
                py={3}
                borderBottom={index < 3 ? '1px' : 'none'}
                borderColor='blue.400'
              >
                <Flex
                  justify='space-between'
                  align='center'
                  direction={{ base: 'column', sm: 'row' }}
                  gap={{ base: 2, sm: 0 }}
                >
                  <Box textAlign={{ base: 'center', sm: 'left' }}>
                    <Text
                      fontWeight='semibold'
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      {vendor.user.name}
                    </Text>
                    <Text
                      fontSize={{ base: 'xs', md: 'sm' }}
                      color={textColor}
                      fontWeight='medium'
                    >
                      {vendor.rating}
                    </Text>
                  </Box>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius='full'
                    fontSize='xs'
                    colorScheme={getStatusColor(vendor.businessName)}
                    flexShrink={0}
                  >
                    {vendor.businessName}
                  </Badge>
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* User Management Dashboard - Full Width on Mobile */}
      <Box w='100%'>
        <UserManagementDashboard />
      </Box>
    </Box>
  );
};
