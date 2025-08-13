import { useOrderById } from '@/context/OrderContextService';
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
  useSteps,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

// Type for order status
type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

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
  switch (status?.toLowerCase() as OrderStatus) {
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
  switch (status?.toLowerCase() as OrderStatus) {
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

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const navigate = useNavigate();

  // Fetch order data - only when we have an orderId and search was triggered
  const {
    data: order,
    isLoading,
    error,
  } = useOrderById(searchTriggered ? orderId : '');

  const { activeStep } = useSteps({
    index: order ? Math.max(0, getActiveStep(order.orderStatus)) : 0,
    count: steps.length,
  });

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      return; // Let the required validation handle this
    }

    setSearchTriggered(true);
  };

  const handleTrackAnotherOrder = () => {
    setOrderId('');
    setSearchTriggered(false);
  };

  // Special component for cancelled/returned orders
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state when searching
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
      <Heading as='h1' fontSize='3xl' mb={8} textAlign='center'>
        Track Your Order
      </Heading>

      {/* Order ID Input - show when no order is found or not searched yet */}
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

      {/* Order Tracking Results */}
      {order && !error && (
        <VStack spacing={8} align='stretch'>
          {/* Order Header */}
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

          {/* Progress Stepper - only show for active orders */}
          {getActiveStep(order.orderStatus) >= 0 ? (
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
          ) : (
            <CancelledOrderStatus status={order.orderStatus} />
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
              <Heading as='h3' fontSize='lg' mb={4}>
                Order Items
              </Heading>
              <VStack spacing={3} align='stretch'>
                {order.items.map((item: any, index: number) => (
                  <Flex
                    key={index}
                    justify='space-between'
                    align='center'
                    p={3}
                    bg='gray.50'
                    borderRadius='md'
                  >
                    <Box>
                      <Text fontWeight='medium'>{item.name || item.title}</Text>
                      <Text fontSize='sm' color='gray.600'>
                        Quantity: {item.quantity}
                      </Text>
                    </Box>
                    <Text fontWeight='bold'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Flex>
                ))}

                {order.totalAmount && (
                  <Flex
                    justify='space-between'
                    align='center'
                    pt={3}
                    borderTop='1px'
                    borderColor='gray.200'
                  >
                    <Text fontWeight='bold' fontSize='lg'>
                      Total:
                    </Text>
                    <Text fontWeight='bold' fontSize='lg'>
                      ${order.totalAmount.toFixed(2)}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>
          )}

          {/* Delivery Info - only show for non-cancelled orders */}
          {getActiveStep(order.orderStatus) >= 0 && order.shippingAddress && (
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

          {/* Actions */}
          <Flex gap={4} justify='center' flexWrap='wrap'>
            <Button variant='outline' onClick={handleTrackAnotherOrder}>
              Track Another Order
            </Button>
            <Button
              colorScheme='blue'
              onClick={() => navigate('/orders-history')}
            >
              View All Orders
            </Button>
            <Button variant='outline' onClick={() => navigate('/shop')}>
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
