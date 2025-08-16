import { useOrderById } from '@/context/OrderContextService';
import { ArrowBackIcon } from '@chakra-ui/icons';
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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

const steps = [
  {
    title: 'Order Pending',
    description: 'Your order has been placed and is awaiting confirmation',
  },
  {
    title: 'Processing',
    description: 'We are preparing your items for shipment',
  },
  { title: 'Shipped', description: 'Your order is on its way to you' },
  {
    title: 'Delivered',
    description: 'Package has been delivered successfully',
  },
];

const getActiveStep = (status: string) => {
  const normalizedStatus = status?.toLowerCase().trim();
  switch (normalizedStatus) {
    case ORDER_STATUSES.PENDING:
      return 0;
    case ORDER_STATUSES.PROCESSING:
      return 1;
    case ORDER_STATUSES.SHIPPED:
      return 2;
    case ORDER_STATUSES.DELIVERED:
      return 3;
    case ORDER_STATUSES.CANCELLED:
    case ORDER_STATUSES.RETURNED:
      return -1;
    default:
      return 0;
  }
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase().trim();
  switch (normalizedStatus) {
    case ORDER_STATUSES.DELIVERED:
      return 'green';
    case ORDER_STATUSES.SHIPPED:
      return 'blue';
    case ORDER_STATUSES.PROCESSING:
      return 'yellow';
    case ORDER_STATUSES.PENDING:
      return 'purple';
    case ORDER_STATUSES.CANCELLED:
      return 'red';
    case ORDER_STATUSES.RETURNED:
      return 'orange';
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

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
  } = useOrderById(searchTriggered ? orderId : '');

  const activeStepIndex = order ? getActiveStep(order.orderStatus) : 0;

  useEffect(() => {
    if (order) {
      console.log('Order Status:', order.orderStatus);
      console.log('Mapped Step:', getActiveStep(order.orderStatus));
    }
  }, [order]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      return;
    }

    setSearchTriggered(true);
  };

  const handleTrackAnotherOrder = () => {
    setOrderId('');
    setSearchTriggered(false);
  };

  const CancelledOrderStatus = ({ status }: { status: string }) => {
    const isReturned = status?.toLowerCase() === ORDER_STATUSES.RETURNED;

    return (
      <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
        <Alert status={isReturned ? 'warning' : 'error'} mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>
              Order {isReturned ? 'Returned' : 'Cancelled'}
            </Text>
            <Text fontSize='sm'>
              {isReturned
                ? 'This order has been returned. Please contact support for refund details.'
                : 'This order has been cancelled. If you have any questions, please contact support.'}
            </Text>
          </Box>
        </Alert>
      </Box>
    );
  };

  if (isLoading && searchTriggered) {
    return (
      <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
        <Heading as='h1' fontSize='3xl' mb={8} textAlign='center'>
          Track Your Order
        </Heading>
        <Center>
          <VStack spacing={4}>
            <Spinner size='xl' color='blue.500' />
            <Text>Loading order information...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Flex justify='space-between' align='center' mb={8}>
        <Button
          variant='ghost'
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Heading as='h1' fontSize='3xl' textAlign='center' flex='1'>
          Track Your Order
        </Heading>
        <Box width='80px' />
      </Flex>

      {(!order || error) && (
        <Box maxW='md' mx='auto' mb={8}>
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <form onSubmit={handleTrackOrder}>
              <FormControl mb={4} isRequired>
                <FormLabel>Order ID</FormLabel>
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder='Enter your order ID (e.g., 67890abcdef)'
                />
              </FormControl>

              {error && searchTriggered && (
                <Alert status='error' mb={4}>
                  <AlertIcon />
                  <AlertDescription>
                    {error?.message ||
                      'Order not found. Please check your order ID and try again.'}
                  </AlertDescription>
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

      {order && !error && (
        <VStack spacing={8} align='stretch'>
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb={4}>
              <Box>
                <Heading as='h2' fontSize='xl'>
                  Order #{order._id}
                </Heading>
                <Text color='gray.600' fontSize='sm'>
                  Placed on {formatDate(order.createdAt)}
                </Text>
              </Box>
              <Badge
                colorScheme={getStatusColor(order.orderStatus)}
                fontSize='md'
                px={3}
                py={1}
              >
                {order.orderStatus?.replace('_', ' ').toUpperCase()}
              </Badge>
            </Flex>

            {order.trackingNumber && (
              <Box>
                <Text fontSize='sm' color='gray.600'>
                  Tracking Number:
                </Text>
                <Text fontWeight='bold'>{order.trackingNumber}</Text>
              </Box>
            )}
          </Box>

          {activeStepIndex >= 0 ? (
            <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
              <Heading as='h3' fontSize='lg' mb={6}>
                Order Progress
              </Heading>

              <Stepper
                index={activeStepIndex}
                orientation='vertical'
                height='400px'
                gap='0'
              >
                {steps.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isComplete = index < activeStepIndex;

                  return (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>

                      <Box flexShrink='0'>
                        <StepTitle
                          fontSize={isActive ? 'lg' : 'md'}
                          fontWeight={isActive ? 'bold' : 'normal'}
                          color={
                            isActive
                              ? 'blue.600'
                              : isComplete
                              ? 'gray.600'
                              : 'gray.700'
                          }
                        >
                          {step.title}
                          {isActive && (
                            <Badge ml={2} colorScheme='blue' variant='subtle'>
                              Current
                            </Badge>
                          )}
                        </StepTitle>
                        <StepDescription
                          fontSize={isActive ? 'md' : 'sm'}
                          color={
                            isActive
                              ? 'blue.500'
                              : isComplete
                              ? 'gray.500'
                              : 'gray.600'
                          }
                        >
                          {step.description}
                          {isActive && (
                            <Box
                              as='span'
                              display='block'
                              mt={1}
                              fontSize='sm'
                              color='blue.400'
                              fontStyle='italic'
                            >
                              We're working on this right now!
                            </Box>
                          )}
                        </StepDescription>
                      </Box>

                      <StepSeparator />
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          ) : (
            <CancelledOrderStatus status={order.orderStatus} />
          )}

          {activeStepIndex >= 0 && order.shippingAddress && (
            <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
              <Heading as='h3' fontSize='lg' mb={4}>
                Delivery Information
              </Heading>

              <VStack align='stretch' spacing={3}>
                {order.estimatedDelivery && (
                  <Box>
                    <Text fontSize='sm' color='gray.600'>
                      Estimated Delivery:
                    </Text>
                    <Text fontWeight='medium'>{order.estimatedDelivery}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontSize='sm' color='gray.600'>
                    Shipping Address:
                  </Text>
                  <Text>{order.shippingAddress.street}</Text>
                  <Text>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </Text>
                  <Text>{order.shippingAddress.country}</Text>
                </Box>
              </VStack>
            </Box>
          )}

          <Flex gap={4} justify='center' flexWrap='wrap'>
            <Button variant='outline' onClick={handleTrackAnotherOrder}>
              Track Another Order
            </Button>
            <Button colorScheme='blue' onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
            <Button variant='outline' onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </Flex>
        </VStack>
      )}

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
