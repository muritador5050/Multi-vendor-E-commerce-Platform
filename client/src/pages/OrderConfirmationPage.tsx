import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@chakra-ui/icons';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const state = location.state;
    if (!state?.order) {
      navigate('/');
      return;
    }
    setOrderData(state.order);
  }, [location.state, navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!orderData) {
    return (
      <Box maxW='md' mx='auto' mt={20} textAlign='center'>
        <Text>Loading order details...</Text>
      </Box>
    );
  }

  return (
    <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      {/* Success Header */}
      <Box textAlign='center' mb={8}>
        <CheckCircleIcon color='green.500' boxSize={16} mb={4} />
        <Heading as='h1' fontSize='3xl' mb={4} color='green.600'>
          Order Confirmed!
        </Heading>
        <Text fontSize='lg' color='gray.600' mb={2}>
          Thank you for your purchase. Your order has been successfully placed.
        </Text>
        <Text fontSize='md' color='gray.500'>
          Order ID:{' '}
          <Text as='span' fontWeight='bold'>
            {orderData._id}
          </Text>
        </Text>
      </Box>

      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Order Details */}
        <VStack spacing={6} align='stretch'>
          {/* Order Status */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h2' fontSize='xl' mb={4}>
              Order Status
            </Heading>
            <Flex justify='space-between' align='center' mb={4}>
              <Text>Current Status:</Text>
              <Badge
                colorScheme={getStatusColor(orderData.orderStatus)}
                fontSize='md'
                px={3}
                py={1}
              >
                {orderData.orderStatus?.toUpperCase()}
              </Badge>
            </Flex>
            <Flex justify='space-between' align='center' mb={4}>
              <Text>Payment Status:</Text>
              <Badge
                colorScheme={getStatusColor(orderData.paymentStatus)}
                fontSize='md'
                px={3}
                py={1}
              >
                {orderData.paymentStatus?.toUpperCase()}
              </Badge>
            </Flex>
            <Text fontSize='sm' color='gray.600'>
              Order placed: {formatDate(orderData.createdAt || new Date())}
            </Text>
          </Box>

          {/* Products */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h2' fontSize='xl' mb={6}>
              Order Items
            </Heading>
            <VStack spacing={4} align='stretch'>
              {orderData.products?.map((item: any, index: number) => (
                <Box key={index} p={4} bg='gray.50' borderRadius='md'>
                  <Flex justify='space-between' align='center'>
                    <Box>
                      <Text fontWeight='medium'>
                        {typeof item.product === 'object'
                          ? item.product.name
                          : `Product ${index + 1}`}
                      </Text>
                      <Text fontSize='sm' color='gray.600'>
                        Quantity: {item.quantity}
                      </Text>
                    </Box>
                    <Text fontWeight='bold'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Shipping Address */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h2' fontSize='xl' mb={4}>
              Shipping Address
            </Heading>
            <Text>{orderData.shippingAddress?.street}</Text>
            <Text>
              {orderData.shippingAddress?.city},{' '}
              {orderData.shippingAddress?.state}{' '}
              {orderData.shippingAddress?.zipCode}
            </Text>
            <Text>{orderData.shippingAddress?.country}</Text>
          </Box>
        </VStack>

        {/* Order Summary & Actions */}
        <VStack spacing={6} align='stretch'>
          {/* Order Summary */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h2' fontSize='xl' mb={6}>
              Order Summary
            </Heading>

            <VStack spacing={3} align='stretch' mb={4}>
              <Flex justify='space-between'>
                <Text>Subtotal:</Text>
                <Text>
                  $
                  {(
                    orderData.totalPrice - (orderData.shippingCost || 0)
                  ).toFixed(2)}
                </Text>
              </Flex>
              {orderData.shippingCost && (
                <Flex justify='space-between'>
                  <Text>Shipping:</Text>
                  <Text>${orderData.shippingCost.toFixed(2)}</Text>
                </Flex>
              )}
              <Divider />
              <Flex justify='space-between' fontWeight='bold' fontSize='lg'>
                <Text>Total:</Text>
                <Text>${orderData.totalPrice?.toFixed(2)}</Text>
              </Flex>
            </VStack>

            <Text fontSize='sm' color='gray.600'>
              Payment Method: {orderData.paymentMethod?.toUpperCase()}
            </Text>
          </Box>

          {/* What's Next */}
          <Box bg='blue.50' p={6} borderRadius='lg'>
            <Heading as='h3' fontSize='lg' mb={4} color='blue.800'>
              What's Next?
            </Heading>
            <VStack align='stretch' spacing={2} fontSize='sm' color='blue.700'>
              <Text>• You'll receive an email confirmation shortly</Text>
              <Text>
                • We'll send tracking information once your order ships
              </Text>
              <Text>• Estimated delivery: 3-5 business days</Text>
            </VStack>
          </Box>

          {/* Actions */}
          <VStack spacing={3}>
            <Button
              colorScheme='blue'
              size='lg'
              width='full'
              onClick={() => navigate('/orders')}
            >
              View Order History
            </Button>
            <Button
              variant='outline'
              width='full'
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </VStack>
        </VStack>
      </Grid>

      {/* Support Section */}
      <Alert status='info' mt={8}>
        <AlertIcon />
        <Box>
          <AlertTitle>Need Help?</AlertTitle>
          <AlertDescription>
            If you have any questions about your order, please contact our
            support team at{' '}
            <Text as='span' fontWeight='bold'>
              support@example.com
            </Text>{' '}
            or call{' '}
            <Text as='span' fontWeight='bold'>
              +1 (800) 123-4567
            </Text>
            .
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default OrderConfirmationPage;
