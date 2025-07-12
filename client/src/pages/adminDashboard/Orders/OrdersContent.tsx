import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Filter, Download } from 'lucide-react';
import { getStatusColor } from '../Utils';

interface Order {
  id: string;
  customer: string;
  vendor: string;
  amount: number | string;
  status: string;
  date: string;
}

interface OrdersContentProps {
  data: {
    orders: Order[];
  };
  onAction: (orderId: string | number) => void;
}

export const OrdersContent = ({ data, onAction }: OrdersContentProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');

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
              {data.orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: '12px' }}>{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.customer}</td>
                  <td style={{ padding: '12px' }}>{order.vendor}</td>
                  <td style={{ padding: '12px' }}>{order.amount}</td>
                  <td style={{ padding: '12px' }}>
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
                  <td style={{ padding: '12px' }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
};
