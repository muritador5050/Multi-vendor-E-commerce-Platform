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
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepNumber,
  StepSeparator,
  StepTitle,
  StepDescription,
  Spinner,
  useSteps,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  StepIcon,
} from '@chakra-ui/react';
import { ChevronRightIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderById } from '@/context/OrderContextService';

const statusSteps = [
  { title: 'Order Placed', status: 'pending' },
  { title: 'Processing', status: 'processing' },
  { title: 'Shipped', status: 'shipped' },
  { title: 'Delivered', status: 'delivered' },
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderById(orderId || '');

  const { activeStep } = useSteps({
    index: statusSteps.findIndex((step) => step.status === order?.orderStatus),
    count: statusSteps.length,
  });

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
      <Box maxW='4xl' mx='auto' p-6>
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
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        spacing='8px'
        separator={<ChevronRightIcon color='gray.500' />}
        mb={6}
      >
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/orders')}>
            Orders
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Order #{order._id}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header with Back Button */}
      <Flex align='center' mb={6}>
        <Button
          variant='ghost'
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          mr={4}
        >
          Back
        </Button>
        <Heading as='h1' size='lg'>
          Order Details
        </Heading>
      </Flex>

      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
        {/* Left Column - Order Items */}
        <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
          <Heading as='h2' size='md' mb={4}>
            Order Items ({order.products.length})
          </Heading>

          <VStack spacing={4} divider={<Divider />}>
            {order.products.map((item, index) => (
              <Flex key={index} w='100%' align='center'>
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  boxSize='80px'
                  objectFit='cover'
                  borderRadius='md'
                  mr={4}
                />
                <Box flex='1'>
                  <Text fontWeight='medium'>{item.product.name}</Text>
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
          {/* Order Status Card */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb={4}>
              <Text fontWeight='bold'>Order Status</Text>
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

            <Stepper
              index={activeStep}
              orientation='vertical'
              height='200px'
              gap='0'
            >
              {statusSteps.map((step, index) => (
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
                    {index === activeStep && (
                      <StepDescription>
                        {order.orderStatus === 'delivered'
                          ? 'Delivered on ' + formatDate(order.updatedAt)
                          : 'Current status'}
                      </StepDescription>
                    )}
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Shipping Information */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
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
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm'>
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
      <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mt={8}>
        <Heading as='h3' size='md' mb={4}>
          Payment Information
        </Heading>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          <Box>
            <Text fontWeight='medium' mb={2}>
              Payment Method
            </Text>
            <Text>{order.paymentMethod || 'Not specified'}</Text>
          </Box>
          <Box>
            <Text fontWeight='medium' mb={2}>
              Shipping Cost
            </Text>
            <Badge colorScheme={'blue'} fontSize='md' px={3} py={1}>
              ${order.shippingCost}
            </Badge>
          </Box>
        </Grid>
      </Box>

      {/* Order Actions */}
      <Flex justify='flex-end' mt={8} gap={4}>
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
