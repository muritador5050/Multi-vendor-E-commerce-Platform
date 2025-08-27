import { useOrderById } from '@/context/OrderContextService';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
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
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { data: order, isLoading, error } = useOrderById(orderId || '');

  const activeStepIndex = order ? getActiveStep(order.orderStatus) : 0;

  useEffect(() => {
    // If no order ID in params, redirect to orders page or show error
    if (!orderId) {
      navigate('/orders', { replace: true });
      return;
    }

    if (order) {
      console.log('Order Status:', order.orderStatus);
      console.log('Mapped Step:', getActiveStep(order.orderStatus));
    }
  }, [orderId, order, navigate]);

  const CancelledOrderStatus = ({ status }: { status: string }) => {
    const isReturned = status?.toLowerCase() === ORDER_STATUSES.RETURNED;

    return (
      <Box bg='teal.800' color='white' p={6} borderRadius='lg' boxShadow='sm'>
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

  // Show loading state
  if (isLoading) {
    return (
      <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
        <Heading as='h1' fontSize='3xl' textAlign='center' flex='1'>
          Track Your Order
        </Heading>
        <Box width='80px' />
        <Center>
          <VStack spacing={4}>
            <Spinner size='xl' color='blue.500' />
            <Text>Loading order information...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Show error state
  if (error || !order) {
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

        <Box maxW='md' mx='auto'>
          <Alert status='error' mb={6}>
            <AlertIcon />
            <Box>
              <Text fontWeight='bold'>Order Not Found</Text>
              <AlertDescription>
                {error?.message ||
                  `Order with ID "${orderId}" could not be found. Please check the order ID or contact support if you believe this is an error.`}
              </AlertDescription>
            </Box>
          </Alert>

          <VStack spacing={4}>
            <Button
              colorScheme='teal'
              onClick={() => navigate('/orders')}
              width='full'
            >
              View All Orders
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate('/shop')}
              width='full'
            >
              Continue Shopping
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Show order details
  return (
    <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <VStack spacing={8} align='stretch'>
        <Box bg='teal.900' color='white' p={6} borderRadius='lg' boxShadow='sm'>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify='space-between'
            align='center'
            mb={4}
          >
            <Box>
              <Heading as='h2' fontSize={{ base: 'sm', md: 'large' }}>
                Order #{order._id}
              </Heading>
              <Text color='gray.300' fontSize='sm'>
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
              <Text fontSize='sm' color='gray.300'>
                Tracking Number:
              </Text>
              <Text fontWeight='bold'>{order.trackingNumber}</Text>
            </Box>
          )}
        </Box>

        {activeStepIndex >= 0 ? (
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
          >
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

                    <Box>
                      <StepTitle
                        fontSize={isActive ? 'lg' : 'md'}
                        fontWeight={isActive ? 'bold' : 'normal'}
                        color={
                          isActive
                            ? 'orange'
                            : isComplete
                            ? 'gray.300'
                            : 'gray.400'
                        }
                      >
                        {step.title}
                        {isActive && (
                          <Badge ml={2} colorScheme='gray' variant='subtle'>
                            Current
                          </Badge>
                        )}
                      </StepTitle>
                      <StepDescription
                        fontSize={isActive ? 'md' : 'sm'}
                        color={
                          isActive
                            ? 'gray.300'
                            : isComplete
                            ? 'gray.300'
                            : 'gray.300'
                        }
                      >
                        {step.description}
                        {isActive && (
                          <Box
                            as='span'
                            display='block'
                            mt={1}
                            fontSize='sm'
                            color='gray.300'
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
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
          >
            <Heading as='h3' fontSize='lg' mb={4}>
              Delivery Information
            </Heading>

            <VStack align='stretch' spacing={3}>
              {order.estimatedDelivery && (
                <Box>
                  <Text fontSize='sm' color='gray.300'>
                    Estimated Delivery:
                  </Text>
                  <Text fontWeight='medium'>{order.estimatedDelivery}</Text>
                </Box>
              )}

              <Box>
                <Text fontSize='sm' color='gray.300'>
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
          <Button colorScheme='teal' onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
          <Button variant='outline' onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </Flex>
      </VStack>

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
