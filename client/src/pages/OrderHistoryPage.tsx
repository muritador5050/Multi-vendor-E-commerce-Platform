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

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!currentUser) {
          setError('Please log in to view your orders');
          return;
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock order data - in real app, this would come from your API
        const mockOrders = [
          {
            _id: '67890abcdef12345',
            orderStatus: 'delivered',
            paymentStatus: 'paid',
            totalPrice: 89.97,
            createdAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            products: [
              {
                product: {
                  name: 'Wireless Headphones',
                  image: '/api/placeholder/80/80',
                },
                quantity: 1,
                price: 79.99,
              },
              {
                product: {
                  name: 'Phone Case',
                  image: '/api/placeholder/80/80',
                },
                quantity: 1,
                price: 19.99,
              },
            ],
          },
          {
            _id: '12345abcdef67890',
            orderStatus: 'shipped',
            paymentStatus: 'paid',
            totalPrice: 159.98,
            createdAt: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            products: [
              {
                product: {
                  name: 'Smart Watch',
                  image: '/api/placeholder/80/80',
                },
                quantity: 1,
                price: 149.99,
              },
              {
                product: {
                  name: 'Watch Band',
                  image: '/api/placeholder/80/80',
                },
                quantity: 1,
                price: 19.99,
              },
            ],
          },
          {
            _id: 'abcdef1234567890',
            orderStatus: 'processing',
            paymentStatus: 'paid',
            totalPrice: 49.99,
            createdAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            products: [
              {
                product: {
                  name: 'Bluetooth Speaker',
                  image: '/api/placeholder/80/80',
                },
                quantity: 1,
                price: 39.99,
              },
            ],
          },
        ];

        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'confirmed':
        return 'purple';
      case 'cancelled':
        return 'red';
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
        <Button mt={4} onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Flex justify='space-between' align='center' mb={8}>
        <Heading as='h1' fontSize='3xl'>
          Order History
        </Heading>
        <Button colorScheme='blue' onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Flex>

      {orders.length === 0 ? (
        <Box textAlign='center' py={20}>
          <Text fontSize='xl' color='gray.600' mb={4}>
            No orders found
          </Text>
          <Text color='gray.500' mb={6}>
            You haven't placed any orders yet.
          </Text>
          <Button colorScheme='blue' onClick={() => navigate('/')}>
            Start Shopping
          </Button>
        </Box>
      ) : (
        <VStack spacing={6} align='stretch'>
          {orders.map((order) => (
            <Box
              key={order._id}
              bg='white'
              p={6}
              borderRadius='lg'
              boxShadow='sm'
              border='1px'
              borderColor='gray.200'
            >
              {/* Order Header */}
              <Flex justify='space-between' align='center' mb={4}>
                <Box>
                  <Text fontWeight='bold' fontSize='lg'>
                    Order #{order._id}
                  </Text>
                  <Text color='gray.600' fontSize='sm'>
                    Placed on {formatDate(order.createdAt)}
                  </Text>
                </Box>
                <VStack align='end' spacing={1}>
                  <Badge
                    colorScheme={getStatusColor(order.orderStatus)}
                    fontSize='sm'
                    px={2}
                    py={1}
                  >
                    {order.orderStatus?.toUpperCase()}
                  </Badge>
                  <Text fontWeight='bold' fontSize='lg'>
                    ${order.totalPrice.toFixed(2)}
                  </Text>
                </VStack>
              </Flex>

              {/* Products */}
              <Grid
                templateColumns={{ base: '1fr', md: '1fr auto' }}
                gap={6}
                mb={4}
              >
                <VStack spacing={3} align='stretch'>
                  {order.products.map((item: any, index: number) => (
                    <Flex key={index} align='center' gap={4}>
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        boxSize='60px'
                        objectFit='cover'
                        borderRadius='md'
                        bg='gray.100'
                      />
                      <Box flex='1'>
                        <Text fontWeight='medium'>{item.product.name}</Text>
                        <Text fontSize='sm' color='gray.600'>
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </Text>
                      </Box>
                      <Text fontWeight='bold'>
                        ${(item.quantity * item.price).toFixed(2)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Grid>

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
                  onClick={() => navigate(`/track-order?id=${order._id}`)}
                >
                  Track Order
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate(`/order-details/${order._id}`)}
                >
                  View Details
                </Button>
                {order.orderStatus === 'delivered' && (
                  <Button
                    colorScheme='blue'
                    size='sm'
                    onClick={() => {
                      /* Handle reorder */
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

export default OrderHistoryPage;
