import {
  Box,
  Flex,
  Text,
  VStack,
  Badge,
  Divider,
  Image,
  Grid,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderById } from '@/context/OrderContextService';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderById(orderId || '');

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

  if (isLoading) {
    return (
      <Box textAlign='center' py={20}>
        <Spinner size='xl' />
        <Text mt={4}>Loading order details...</Text>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box maxW='4xl' mx='auto' p={6}>
        <Alert status='error'>
          <AlertIcon />
          <Text>
            Error loading order details: {error?.message || 'Order not found'}
          </Text>
        </Alert>
        <Button
          mt={4}
          onClick={() => navigate(-1)}
          leftIcon={<ArrowBackIcon />}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' px={{ base: 4, md: 8 }} py={8}>
      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
        {/* Left Column - Order Items */}
        <Box bg='teal.900' color='white' p={6} borderRadius='lg' boxShadow='sm'>
          <Flex justify='space-between' alignItems='baseline'>
            <Heading as='h2' size='md' mb={4}>
              Order Items ({order.products.length})
            </Heading>
            <Badge
              colorScheme={getStatusColor(order.orderStatus)}
              fontSize='md'
              px={3}
              py={1}
              borderRadius='full'
            >
              {order.orderStatus.toUpperCase()}
            </Badge>
          </Flex>

          <VStack spacing={4} divider={<Divider />}>
            {order.products.map((item, index) => (
              <Flex key={index} w='100%' align='center'>
                <Image
                  src={item.product?.images[0]}
                  alt={item.product?.name}
                  boxSize='80px'
                  objectFit='cover'
                  borderRadius='md'
                  mr={4}
                />
                <Box flex='1'>
                  <Text fontWeight='medium'>{item.product?.name}</Text>
                </Box>
                <Box textAlign='right'>
                  <Text>
                    ${item.price.toFixed(2)} × {item.quantity}
                  </Text>
                  <Text fontWeight='bold'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Right Column - Order Summary */}
        <VStack spacing={6} align='stretch'>
          {/* Shipping Information */}
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
          >
            <Heading as='h3' size='sm' mb={4}>
              Shipping Information
            </Heading>
            <VStack align='start' spacing={2}>
              <Text fontWeight='medium'>
                Recipient Name: {order.userId.name || 'No name provided'}
              </Text>
              <Text>{order.shippingAddress?.street}</Text>
              <Text>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.zipCode}
              </Text>
              <Text>{order.shippingAddress?.country}</Text>
              {order.trackingNumber && (
                <>
                  <Divider my={2} />
                  <Text>
                    <strong>Tracking #:</strong> {order.trackingNumber}
                  </Text>
                  <Button
                    size='sm'
                    colorScheme='blue'
                    variant='outline'
                    onClick={() => window.open('#', '_blank')}
                  >
                    Track Package
                  </Button>
                </>
              )}
            </VStack>
          </Box>

          {/* Order Summary */}
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
          >
            <Heading as='h3' size='sm' mb={4}>
              Order Summary
            </Heading>
            <VStack spacing={3} align='stretch'>
              <Flex justify='space-between'>
                <Text>Subtotal:</Text>
                <Text>
                  ${(order.totalPrice - order.shippingCost).toFixed(2)}
                </Text>
              </Flex>
              <Flex justify='space-between'>
                <Text>Shipping:</Text>
                <Text>${order.shippingCost.toFixed(2)}</Text>
              </Flex>

              <Divider />
              <Flex justify='space-between' fontWeight='bold'>
                <Text>Total:</Text>
                <Text>${order.totalPrice.toFixed(2)}</Text>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Payment Information */}
      <Box
        bg='teal.900'
        color='white'
        p={6}
        borderRadius='lg'
        boxShadow='sm'
        mt={8}
      >
        <Heading as='h3' size='md' mb={4}>
          Payment Information
        </Heading>
        <Stack spacing={5}>
          <Flex align='center' gap={9}>
            <Text>Payment Method:</Text>
            <Text fontFamily='cursive' color='orange'>
              {order.paymentMethod || 'Not specified'}
            </Text>
          </Flex>
          <Flex align='center' gap={9}>
            <Text>Shipping Cost:</Text>
            <Badge colorScheme={'blue'} fontSize='md' px={3} py={1}>
              ${order.shippingCost}
            </Badge>
          </Flex>
        </Stack>
      </Box>

      {/* Order Actions */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify='flex-end'
        mt={8}
        gap={4}
      >
        <Button variant='outline' onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
        {order.orderStatus === 'delivered' && (
          <Button colorScheme='blue'>Buy Again</Button>
        )}
        <Button colorScheme='blue' variant='outline'>
          Contact Support
        </Button>
      </Flex>
    </Box>
  );
};

export default OrderDetailsPage;
