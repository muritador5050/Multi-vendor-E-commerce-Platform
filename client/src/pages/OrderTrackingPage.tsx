import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mock order tracking steps
  const steps = [
    { title: 'Order Placed', description: 'Your order has been confirmed' },
    { title: 'Processing', description: 'We are preparing your items' },
    { title: 'Shipped', description: 'Your order is on its way' },
    { title: 'Out for Delivery', description: 'Package is out for delivery' },
    { title: 'Delivered', description: 'Package has been delivered' },
  ];

  const getActiveStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  const { activeStep } = useSteps({
    index: orderData ? getActiveStep(orderData.orderStatus) - 1 : 0,
    count: steps.length,
  });

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!orderId.trim()) {
        throw new Error('Please enter an order ID');
      }

      // Mock order data - in real app, this would come from your API
      const mockOrderData = {
        _id: orderId,
        orderStatus: 'shipped',
        paymentStatus: 'paid',
        totalPrice: 89.97,
        shippingCost: 9.99,
        trackingNumber:
          'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        estimatedDelivery: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toDateString(),
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          { product: { name: 'Sample Product' }, quantity: 2, price: 39.99 },
        ],
      };

      setOrderData(mockOrderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'green';
      case 'shipped':
      case 'out_for_delivery':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'confirmed':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Heading as='h1' fontSize='3xl' mb={8} textAlign='center'>
        Track Your Order
      </Heading>

      {/* Order ID Input */}
      {!orderData && (
        <Box maxW='md' mx='auto' mb={8}>
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <form onSubmit={handleTrackOrder}>
              <FormControl mb={4}>
                <FormLabel>Order ID</FormLabel>
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder='Enter your order ID (e.g., 67890abcdef)'
                />
              </FormControl>

              {error && (
                <Alert status='error' mb={4}>
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type='submit'
                colorScheme='blue'
                width='full'
                isLoading={isLoading}
                loadingText='Tracking...'
              >
                Track Order
              </Button>
            </form>
          </Box>

          <Text textAlign='center' mt={4} fontSize='sm' color='gray.600'>
            You can find your Order ID in your confirmation email or receipt
          </Text>
        </Box>
      )}

      {/* Order Tracking Results */}
      {orderData && (
        <VStack spacing={8} align='stretch'>
          {/* Order Header */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb={4}>
              <Box>
                <Heading as='h2' fontSize='xl'>
                  Order #{orderData._id}
                </Heading>
                <Text color='gray.600' fontSize='sm'>
                  Placed on {formatDate(orderData.createdAt)}
                </Text>
              </Box>
              <Badge
                colorScheme={getStatusColor(orderData.orderStatus)}
                fontSize='md'
                px={3}
                py={1}
              >
                {orderData.orderStatus?.replace('_', ' ').toUpperCase()}
              </Badge>
            </Flex>

            {orderData.trackingNumber && (
              <Box>
                <Text fontSize='sm' color='gray.600'>
                  Tracking Number:
                </Text>
                <Text fontWeight='bold'>{orderData.trackingNumber}</Text>
              </Box>
            )}
          </Box>

          {/* Progress Stepper */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h3' fontSize='lg' mb={6}>
              Order Progress
            </Heading>

            <Stepper
              index={activeStep}
              orientation='vertical'
              height='400px'
              gap='0'
            >
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>

                  <Box flexShrink='0'>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Delivery Info */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Heading as='h3' fontSize='lg' mb={4}>
              Delivery Information
            </Heading>

            <VStack align='stretch' spacing={3}>
              <Box>
                <Text fontSize='sm' color='gray.600'>
                  Estimated Delivery:
                </Text>
                <Text fontWeight='medium'>{orderData.estimatedDelivery}</Text>
              </Box>

              <Box>
                <Text fontSize='sm' color='gray.600'>
                  Shipping Address:
                </Text>
                <Text>{orderData.shippingAddress.street}</Text>
                <Text>
                  {orderData.shippingAddress.city},{' '}
                  {orderData.shippingAddress.state}{' '}
                  {orderData.shippingAddress.zipCode}
                </Text>
                <Text>{orderData.shippingAddress.country}</Text>
              </Box>
            </VStack>
          </Box>

          {/* Actions */}
          <Flex gap={4} justify='center'>
            <Button variant='outline' onClick={() => setOrderData(null)}>
              Track Another Order
            </Button>
            <Button colorScheme='blue' onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
            <Button variant='outline' onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </Flex>
        </VStack>
      )}

      {/* Help Section */}
      <Box mt={12}>
        <Alert status='info'>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Need Help?</Text>
            <Text fontSize='sm'>
              Contact our support team at support@example.com or +1 (800)
              123-4567 if you have any questions about your order.
            </Text>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
};

export default OrderTrackingPage;
