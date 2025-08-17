import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Card,
  CardBody,
  Flex,
} from '@chakra-ui/react';
import { CheckCircle, ShoppingBag, FileText } from 'lucide-react';
import { useGetPaymentById } from '@/context/PaymentContextService';
import { useClearCart, useCart } from '@/context/CartContextService';

const PaymentSuccessPage = () => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { mutate: clearCart } = useClearCart();
  const { data: cart } = useCart();

  // Extract payment ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId =
      urlParams.get('session_id') ||
      urlParams.get('reference') ||
      urlParams.get('trxref') ||
      urlParams.get('payment_id');

    setPaymentId(paymentId);
  }, []);

  const {
    data: paymentResponse,
    isLoading,
    error: queryError,
    refetch,
  } = useGetPaymentById(paymentId || '');

  // Clear cart when payment is confirmed
  useEffect(() => {
    if (paymentResponse?.data?.status === 'completed' && cart?.items?.length) {
      clearCart();
    }
  }, [paymentResponse, cart, clearCart]);

  // Handle polling for pending payments
  useEffect(() => {
    if (!paymentId || isLoading) return;

    const paymentData = paymentResponse?.data;
    const isPending = paymentData?.status === 'pending';

    if (isPending) {
      const timer = setTimeout(() => {
        setIsPolling(true);
        refetch();
      }, 3000);

      return () => clearTimeout(timer);
    }
    setIsPolling(false);
  }, [paymentId, paymentResponse, isLoading, refetch]);

  // Navigation handlers
  const navigate = (path: string) => (window.location.href = path);

  // Loading state
  if (isLoading || isPolling) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={6}>
          <Spinner size='xl' thickness='4px' />
          <Text fontSize='lg'>
            {isPolling ? 'Verifying payment...' : 'Loading payment details...'}
          </Text>
        </VStack>
      </Container>
    );
  }

  // Error state
  if (queryError || !paymentResponse?.data) {
    return (
      <Container maxW='2xl' py={20}>
        <Alert status='error' borderRadius='lg' mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Payment verification failed</Text>
            <Text>{queryError?.message || 'Payment details not found'}</Text>
          </Box>
        </Alert>

        <VStack spacing={3}>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
          <Button variant='outline' onClick={() => navigate('/support')}>
            Contact Support
          </Button>
        </VStack>
      </Container>
    );
  }

  const paymentData = paymentResponse.data;

  // Handle non-successful payments
  if (paymentData.status !== 'completed') {
    const statusConfig = {
      pending: {
        title: 'Payment Processing',
        message: 'Your payment is still being processed. Please wait...',
        color: 'info',
      },
      failed: {
        title: 'Payment Failed',
        message: 'Payment could not be completed. Please try again.',
        color: 'error',
      },
      refunded: {
        title: 'Payment Refunded',
        message: 'This payment has been refunded.',
        color: 'warning',
      },
    };

    const config =
      statusConfig[paymentData.status as keyof typeof statusConfig] ||
      statusConfig.pending;

    return (
      <Container maxW='2xl' py={20}>
        <Alert status={config.color} borderRadius='lg' mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>{config.title}</Text>
            <Text>{config.message}</Text>
          </Box>
        </Alert>

        <VStack spacing={3}>
          <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
        </VStack>
      </Container>
    );
  }

  // Success state
  return (
    <Container maxW='2xl' py={20}>
      <VStack spacing={8} align='stretch'>
        {/* Success Header */}
        <Box textAlign='center'>
          <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-4' />
          <Heading size='xl' mb={2}>
            Payment Successful!
          </Heading>
          <Text color='gray.600'>
            Thank you for your purchase. Order #
            {paymentData.orderId?._id.slice(-8)}
          </Text>
        </Box>

        {/* Payment Details */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <Flex justify='space-between'>
                <Text>Amount:</Text>
                <Text fontWeight='bold'>${paymentData.amount.toFixed(2)}</Text>
              </Flex>

              <Flex justify='space-between'>
                <Text>Method:</Text>
                <Text textTransform='capitalize'>
                  {paymentData.paymentProvider}
                </Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={3}>
          {paymentData.orderId && (
            <Button
              colorScheme='blue'
              leftIcon={<FileText />}
              onClick={() => navigate(`/orders/${paymentData.orderId}`)}
            >
              View Order
            </Button>
          )}

          <Button
            variant='outline'
            leftIcon={<ShoppingBag />}
            onClick={() => navigate('/orders')}
          >
            My Orders
          </Button>

          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default PaymentSuccessPage;
