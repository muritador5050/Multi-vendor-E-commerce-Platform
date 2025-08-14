import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
  Center,
  Icon,
} from '@chakra-ui/react';
import { useOrders } from '@/context/OrderContextService';
import { formatCurrency } from '../Utils/Utils';
import { FiPackage } from 'react-icons/fi';
import { SkeletonUtil } from '../Utils/Skeleton';

export default function RecentOrdersStats() {
  const { data, isLoading } = useOrders({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 3,
  });

  const formatOrderId = (id: string) => {
    if (!id) return 'N/A';
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  return (
    <Box
      bg='white'
      p={{ base: 4, md: 6 }}
      borderRadius='lg'
      boxShadow='md'
      border='1px'
      borderColor='gray.100'
    >
      <Text
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight='bold'
        mb={{ base: 3, md: 4 }}
        color='gray.700'
      >
        Recent Orders
      </Text>
      {isLoading ? (
        <Center h='150px'>
          <SkeletonUtil
            variant='table'
            width='inherit'
            contentHeight={{ base: '150px ', md: '150px' }}
          />
        </Center>
      ) : data?.orders.length === 0 ? (
        <Center flexDirection='column' h='150px' color='gray.500'>
          <Icon as={FiPackage} boxSize={8} mb={3} />
          <Text fontSize='md' fontWeight='medium'>
            No orders found
          </Text>
          <Text fontSize='sm' mt={1}>
            Your recent orders will appear here
          </Text>
        </Center>
      ) : (
        <>
          {/* Desktop Table View */}
          <TableContainer display={{ base: 'none', md: 'block' }}>
            <Table variant='simple' size='md'>
              <Thead bg='blue.50'>
                <Tr>
                  <Th
                    textAlign='left'
                    py={4}
                    px={4}
                    borderBottom='1px'
                    borderColor='gray.200'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.600'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Order ID
                  </Th>
                  <Th
                    textAlign='left'
                    py={4}
                    px={4}
                    borderBottom='1px'
                    borderColor='gray.200'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.600'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Customer
                  </Th>
                  <Th
                    textAlign='right'
                    py={4}
                    px={4}
                    borderBottom='1px'
                    borderColor='gray.200'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.600'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Amount
                  </Th>
                  <Th
                    textAlign='center'
                    py={4}
                    px={4}
                    borderBottom='1px'
                    borderColor='gray.200'
                    fontSize='sm'
                    fontWeight='semibold'
                    color='gray.600'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Status
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.orders?.map((order, idx) => (
                  <Tr
                    key={order._id}
                    _hover={{ bg: 'gray.50' }}
                    transition='background-color 0.2s'
                  >
                    <Td
                      py={3}
                      px={4}
                      borderBottom={
                        idx < (data.orders?.length ?? 0) - 1 ? '1px' : 'none'
                      }
                      borderColor='gray.200'
                    >
                      <Tooltip label={order._id} placement='top' hasArrow>
                        <Text
                          fontSize='sm'
                          fontWeight='medium'
                          color='blue.600'
                          cursor='pointer'
                        >
                          {formatOrderId(order._id)}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td
                      py={3}
                      px={4}
                      borderBottom={
                        idx < (data?.orders?.length ?? 0) - 1 ? '1px' : 'none'
                      }
                      borderColor='gray.200'
                    >
                      <Flex align='center'>
                        <Text as='span' fontSize='sm' fontWeight='medium'>
                          {order.userId.name}
                        </Text>
                      </Flex>
                    </Td>
                    <Td
                      py={3}
                      px={4}
                      borderBottom={
                        idx < (data?.orders?.length ?? 0) - 1 ? '1px' : 'none'
                      }
                      borderColor='gray.200'
                      textAlign='right'
                    >
                      <Text
                        fontSize='sm'
                        fontWeight='semibold'
                        color='green.600'
                      >
                        {formatCurrency(order.totalPrice)}
                      </Text>
                    </Td>
                    <Td
                      py={3}
                      px={4}
                      borderBottom={
                        idx < (data?.orders?.length ?? 0) - 1 ? '1px' : 'none'
                      }
                      borderColor='gray.200'
                      textAlign='center'
                    >
                      <Badge
                        px={3}
                        py={1.5}
                        borderRadius='md'
                        fontSize='xs'
                        fontWeight='bold'
                        textTransform='uppercase'
                        colorScheme={getStatusColor(
                          order.orderStatus ?? 'Nill'
                        )}
                      >
                        {order.orderStatus}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}
      {/* Mobile Card View */}
      <Box display={{ base: 'block', md: 'none' }}>
        {data?.orders?.map((order) => (
          <Box
            key={order._id}
            p={4}
            mb={3}
            bg='white'
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            boxShadow='sm'
            _hover={{ boxShadow: 'md' }}
            transition='box-shadow 0.2s'
          >
            <Flex justify='space-between' align='center' mb={2}>
              <Tooltip label={order._id} placement='top' hasArrow>
                <Text
                  fontSize='sm'
                  fontWeight='bold'
                  color='blue.600'
                  cursor='pointer'
                >
                  {formatOrderId(order._id)}
                </Text>
              </Tooltip>
              <Badge
                px={3}
                py={1}
                borderRadius='md'
                fontSize='xs'
                fontWeight='bold'
                textTransform='uppercase'
                colorScheme={getStatusColor(order.orderStatus ?? 'Nill')}
              >
                {order.orderStatus}
              </Badge>
            </Flex>
            <Text fontSize='sm' mb={1}>
              <Text as='span' fontWeight='semibold' color='gray.600'>
                Customer:
              </Text>{' '}
              <Text as='span' fontWeight='medium'>
                {order.userId.name}
              </Text>
            </Text>
            <Text fontSize='sm' fontWeight='semibold' color='green.600'>
              {formatCurrency(order.totalPrice)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Helper function for status colors
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'cancelled':
      return 'red';
    case 'processing':
      return 'blue';
    case 'shipped':
      return 'purple';
    default:
      return 'gray';
  }
}
