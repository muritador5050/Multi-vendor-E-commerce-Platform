import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Grid,
  Image,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/context/AuthContextService';
import { useOrders } from '@/context/OrderContextService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'paid':
      return 'green';
    case 'processing':
      return 'blue';
    case 'shipped':
      return 'teal';
    case 'delivered':
      return 'green';
    case 'cancelled':
      return 'red';
    case 'returned':
      return 'purple';
    case 'on_hold':
      return 'orange';
    default:
      return 'gray';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const OrdersPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { data: orders, isLoading, error: ordersError } = useOrders();

  const userOrders = orders?.orders.filter(
    (order) => order.userId._id === currentUser?._id
  );

  // Handle orders API error
  useEffect(() => {
    if (ordersError) {
      setError('Failed to load orders. Please try again.');
    }
  }, [ordersError]);

  if (isLoading) {
    return (
      <Box
        maxW='6xl'
        mx='auto'
        px={{ base: 4, md: 8 }}
        py={12}
        textAlign='center'
      >
        <Spinner size='xl' />
        <Text mt={4}>Loading your orders...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW='md' mx='auto' px={{ base: 4, md: 8 }} py={12}>
        <Alert status='error'>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {!currentUser && (
          <Button mt={4} onClick={() => navigate('/my-account')}>
            Go to Login
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify='space-between'
        align='center'
        mb={8}
      >
        <Heading as='h1' fontSize='3xl' mb={{ base: 3, md: 0 }}>
          Order History
        </Heading>
        <Button colorScheme='teal' onClick={() => navigate('/shop')}>
          Continue Shopping
        </Button>
      </Flex>

      {!userOrders || userOrders.length === 0 ? (
        <Box textAlign='center' py={20}>
          <Text fontSize='xl' color='gray.600' mb={4}>
            No orders found
          </Text>
          <Text color='gray.500' mb={6}>
            You haven't placed any orders yet.
          </Text>
          <Button colorScheme='teal' onClick={() => navigate('/shop')}>
            Start Shopping
          </Button>
        </Box>
      ) : (
        <VStack spacing={6} align='stretch'>
          {userOrders.map((order) => (
            <Box
              key={order._id}
              bg='teal.900'
              color='white'
              p={6}
              borderRadius='lg'
              boxShadow='sm'
              border='1px'
              borderColor='gray.200'
            >
              {/* Order Header */}
              <Flex justify='space-between' align='center' mb={4}>
                <Box>
                  <Text fontWeight='semibold' fontSize='lg'>
                    Order #{order._id}
                  </Text>
                  <Text color='gray.300' fontSize='sm'>
                    Placed on {formatDate(order.createdAt)}
                  </Text>
                </Box>
                <VStack
                  align='end'
                  spacing={1}
                  display={{ base: 'none', md: 'flex' }}
                >
                  <Badge
                    colorScheme={getStatusColor(order.orderStatus)}
                    fontSize='sm'
                    px={2}
                    py={1}
                  >
                    {order.orderStatus?.toUpperCase()}
                  </Badge>
                </VStack>
              </Flex>

              <Grid
                templateColumns={{ base: '1fr', md: '1fr auto' }}
                gap={6}
                mb={4}
              >
                <VStack spacing={3} align='stretch'>
                  {order.products.map((item, index) => (
                    <Flex key={index} align='center' gap={4}>
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || 'Product'}
                        boxSize='60px'
                        objectFit='cover'
                        borderRadius='md'
                        bg='gray.100'
                      />
                      <Box flex='1'>
                        <Text fontWeight='medium'>
                          {item.product?.name || 'Unknown Product'}
                        </Text>
                        <Text fontSize='sm' color='gray.300'>
                          Quantity: {item.quantity} × $
                          {item.price?.toFixed(2) || '0.00'}
                        </Text>
                      </Box>
                      <Text fontWeight='bold'>
                        ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Grid>

              {/* Order Summary */}
              <Box
                mb={4}
                p={4}
                bg='gray.300'
                color='gray.600'
                borderRadius='md'
              >
                <Grid templateColumns={'1fr 1fr'} gap={2} fontSize='sm'>
                  <Text>Subtotal:</Text>
                  <Text textAlign='right'>
                    ${(order.totalPrice - order.shippingCost).toFixed(2)}
                  </Text>
                  <Text>Shipping:</Text>
                  <Text textAlign='right'>
                    ${order.shippingCost.toFixed(2)}
                  </Text>
                  <Text fontWeight='bold'>Total:</Text>
                  <Text fontWeight='bold' textAlign='right'>
                    ${order.totalPrice.toFixed(2)}
                  </Text>
                </Grid>
              </Box>

              {/* Order Actions */}
              <Flex
                justify='flex-end'
                gap={3}
                pt={4}
                borderTop='1px'
                borderColor='gray.200'
              >
                <Button
                  variant='outline'
                  size='sm'
                  colorScheme='white'
                  onClick={() => navigate(`/orders/${order._id}/track`)}
                >
                  Track Order
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  colorScheme='white'
                  onClick={() => navigate(`/orders/${order._id}/details`)}
                >
                  View Details
                </Button>
                {order.orderStatus === 'delivered' && (
                  <Button
                    colorScheme='blue'
                    size='sm'
                    onClick={() => {
                      /* Handle reorder logic */
                      console.log('Reordering:', order._id);
                    }}
                  >
                    Reorder
                  </Button>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      )}

      {/* Help Section */}
      <Box mt={12}>
        <Alert status='info'>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Need Help with an Order?</Text>
            <Text fontSize='sm'>
              Contact our support team at support@example.com or +1 (800)
              123-4567 for assistance with any order-related questions.
            </Text>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
};

export default OrdersPage;
