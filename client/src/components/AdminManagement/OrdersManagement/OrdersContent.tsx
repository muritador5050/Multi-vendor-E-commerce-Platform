import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Filter, Download } from 'lucide-react';
import { getStatusColor } from '../Utils/Utils';
import { useOrders } from '@/context/OrderContextService';

export const OrdersContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const { data: ordersData } = useOrders();
  const orders = ordersData?.data?.order || [];
  return (
    <Box>
      <Flex justify='space-between' align='center' mb={6}>
        <Box fontSize='xl' fontWeight='bold'>
          Orders Management
        </Box>
        <Flex gap={4}>
          <button
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Filter size={16} />
          </button>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
          </button>
        </Flex>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <Box overflowX='auto'>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Vendor</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: '12px' }}>{order._id}</td>
                  <td style={{ padding: '12px' }}>{order.user}</td>
                  <td style={{ padding: '12px' }}>{order.trackingNumber}</td>
                  <td style={{ padding: '12px' }}>{order.totalPrice}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor:
                          getStatusColor(order.orderStatus ?? '') === 'green'
                            ? '#c6f6d5'
                            : '#fed7d7',
                        color:
                          getStatusColor(order.orderStatus ?? '') === 'green'
                            ? '#2f855a'
                            : '#c53030',
                      }}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{order.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
};
