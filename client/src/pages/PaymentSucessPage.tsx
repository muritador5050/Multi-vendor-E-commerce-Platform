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
  const [provider, setProvider] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { mutate: clearCart } = useClearCart();
  const { data: cart } = useCart();

  // Currency formatting helper
  const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    paymentProvider: string
  ) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      NGN: '₦',
      usd: '$',
      ngn: '₦',
    };

    const symbol = currencySymbols[currency] || '$';
    const displayCurrency = currency.toUpperCase();

    // Use extracted provider or fallback to paymentProvider
    const currentProvider = provider || paymentProvider;

    // Paystack amounts might be in kobo (1/100 NGN)
    const displayAmount =
      currentProvider === 'paystack' && currency.toUpperCase() === 'NGN'
        ? (amount / 100).toFixed(2)
        : amount.toFixed(2);

    return `${symbol}${displayAmount} ${displayCurrency}`;
  };

  // Extract payment details from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('URL Params:', Object.fromEntries(urlParams));

    // Get provider and order ID
    const detectedProvider = urlParams.get('provider');
    const detectedOrderId = urlParams.get('order_id');

    let extractedPaymentId: string | null = null;

    if (detectedProvider === 'stripe') {
      extractedPaymentId = urlParams.get('session_id');
    } else if (detectedProvider === 'paystack') {
      extractedPaymentId =
        urlParams.get('reference') || urlParams.get('trxref');
    } else {
      // Fallback to current method (works for both providers)
      extractedPaymentId =
        urlParams.get('session_id') ||
        urlParams.get('reference') ||
        urlParams.get('trxref') ||
        urlParams.get('payment_id');
    }

    console.log('Extracted payment details:', {
      paymentId: extractedPaymentId,
      provider: detectedProvider,
      orderId: detectedOrderId,
    });

    setPaymentId(extractedPaymentId);
    setProvider(detectedProvider);
    setOrderId(detectedOrderId);
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

  // Navigation helpers
  const navigate = (path: string) => (window.location.href = path);

  // Get current order ID (URL param takes precedence)
  const getCurrentOrderId = () => {
    return orderId || paymentResponse?.data?.orderId?._id;
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    const currentProvider = provider || paymentResponse?.data?.paymentProvider;

    switch (currentProvider) {
      case 'stripe':
        return 'Credit Card (Stripe)';
      case 'paystack':
        return 'Paystack';
      default:
        return currentProvider
          ? currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)
          : 'Unknown';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={6}>
          <Spinner size='xl' thickness='4px' color='green.500' />
          <Text fontSize='lg'>Loading payment details...</Text>
          <Text fontSize='sm' color='gray.600'>
            Please wait while we retrieve your payment information
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
            <Text fontWeight='bold'>Payment Verification Failed</Text>
            <Text>{queryError?.message || 'Payment details not found'}</Text>
            {paymentId && (
              <Text fontSize='sm' color='gray.600' mt={1}>
                Payment ID: {paymentId}
                {provider && ` (${getProviderDisplayName()})`}
                {orderId && ` | Order: ${orderId}`}
              </Text>
            )}
          </Box>
        </Alert>

        <VStack spacing={3}>
          <Button colorScheme='blue' onClick={() => refetch()}>
            Try Again
          </Button>
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
        message: 'Your payment is still being processed.',
        color: 'info' as const,
        action:
          'This may take a few minutes. Please check back shortly or contact support if this persists.',
      },
      failed: {
        title: 'Payment Failed',
        message: 'Payment could not be completed. Please try again.',
        color: 'error' as const,
        action: 'You can retry your payment or contact support for assistance.',
      },
      refunded: {
        title: 'Payment Refunded',
        message: 'This payment has been refunded to your account.',
        color: 'warning' as const,
        action:
          'The refund should appear in your account within 3-5 business days.',
      },
      disputed: {
        title: 'Payment Under Review',
        message: 'This payment is being reviewed due to a dispute.',
        color: 'warning' as const,
        action: "Our team is investigating. We'll contact you with updates.",
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
            <Text fontSize='sm' mt={2}>
              {config.action}
            </Text>
          </Box>
        </Alert>

        <Card mb={6}>
          <CardBody>
            <VStack spacing={3} align='stretch'>
              <Flex justify='space-between'>
                <Text color='gray.600'>Payment ID:</Text>
                <Text fontFamily='mono' fontSize='sm'>
                  {paymentData.paymentId}
                </Text>
              </Flex>
              <Flex justify='space-between'>
                <Text color='gray.600'>Amount:</Text>
                <Text fontWeight='bold'>
                  {formatCurrency(
                    paymentData.amount,
                    paymentData.currency,
                    paymentData.paymentProvider
                  )}
                </Text>
              </Flex>
              <Flex justify='space-between'>
                <Text color='gray.600'>Method:</Text>
                <Text>{getProviderDisplayName()}</Text>
              </Flex>
              {getCurrentOrderId() && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Order ID:</Text>
                  <Text fontFamily='mono' fontSize='sm'>
                    #{getCurrentOrderId()?.slice(-8).toUpperCase()}
                  </Text>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={3}>
          {paymentData.status === 'failed' && (
            <Button
              colorScheme='blue'
              onClick={() => {
                const currentOrderId = getCurrentOrderId();
                const queryParams = new URLSearchParams({
                  payment_id: paymentData.paymentId,
                  ...(currentOrderId && { order_id: currentOrderId }),
                  ...(provider && { provider }),
                });
                navigate(`/payment-failed?${queryParams.toString()}`);
              }}
            >
              View Details & Retry
            </Button>
          )}

          <Button colorScheme='blue' onClick={() => refetch()}>
            Refresh Status
          </Button>

          <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
          <Button variant='outline' onClick={() => navigate('/support')}>
            Contact Support
          </Button>
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
          <Heading size='xl' mb={2} color='green.600'>
            Payment Successful!
          </Heading>
          <Text color='gray.600' fontSize='lg'>
            Thank you for your purchase! Your order has been confirmed.
          </Text>
          {getCurrentOrderId() && (
            <Text fontSize='sm' color='gray.500' mt={2}>
              Order #{getCurrentOrderId()?.slice(-8).toUpperCase()}
            </Text>
          )}
        </Box>

        {/* Payment Details */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <Heading size='md' mb={2}>
                Payment Details
              </Heading>

              <Flex justify='space-between'>
                <Text color='gray.600'>Amount Paid:</Text>
                <Text fontWeight='bold' fontSize='lg'>
                  {formatCurrency(
                    paymentData.amount,
                    paymentData.currency,
                    paymentData.paymentProvider
                  )}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Payment Method:</Text>
                <Text fontWeight='medium'>{getProviderDisplayName()}</Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Payment ID:</Text>
                <Text fontFamily='mono' fontSize='sm' maxW='200px' isTruncated>
                  {paymentData.paymentId}
                </Text>
              </Flex>

              {paymentData.createdAt && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Payment Date:</Text>
                  <Text>
                    {new Date(paymentData?.createdAt)?.toLocaleDateString()} at{' '}
                    {new Date(paymentData?.createdAt)?.toLocaleTimeString()}
                  </Text>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={3}>
          {getCurrentOrderId() && (
            <Button
              colorScheme='blue'
              size='lg'
              width='full'
              leftIcon={<FileText />}
              onClick={() => navigate(`/orders/${getCurrentOrderId()}/details`)}
            >
              View Order Details
            </Button>
          )}

          <Button
            variant='outline'
            colorScheme='blue'
            size='lg'
            width='full'
            leftIcon={<ShoppingBag />}
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>

          <Button size='lg' width='full' onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </VStack>

        {/* Success Notice */}
        <Box bg='green.50' p={4} borderRadius='md' textAlign='center'>
          <Text fontSize='sm' color='green.700'>
            Your order is being processed and you'll receive a confirmation
            email shortly.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default PaymentSuccessPage;
