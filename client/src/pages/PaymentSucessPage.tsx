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
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  CheckCircle,
  Home,
  ShoppingBag,
  FileText,
  RefreshCw,
  HomeIcon,
} from 'lucide-react';
import { useGetPaymentById } from '@/context/PaymentContextService';

const PaymentSuccessPage = () => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const reference = urlParams.get('reference') || urlParams.get('trxref');
    const paymentIdParam = urlParams.get('payment_id');

    const extractedPaymentId = paymentIdParam || sessionId || reference;

    console.log('Payment URL params:', {
      sessionId,
      reference,
      paymentIdParam,
      extractedPaymentId,
    });

    if (!extractedPaymentId) {
      setError('No payment reference found');
      return;
    }

    setPaymentId(extractedPaymentId);
  }, []);

  const {
    data: paymentResponse,
    isLoading,
    error: queryError,
    isError,
    refetch,
  } = useGetPaymentById(paymentId || '');

  // Polling effect - check status every 3 seconds if payment is still pending
  useEffect(() => {
    if (!paymentId || isLoading) return;

    const paymentData = paymentResponse?.data;

    // If payment exists but is still pending, start polling
    if (paymentData && paymentData.status === 'pending' && pollCount < 10) {
      const pollInterval = setTimeout(() => {
        console.log(`Polling payment status (attempt ${pollCount + 1})`);
        setIsPolling(true);
        refetch();
        setPollCount((prev) => prev + 1);
      }, 3000);

      return () => clearTimeout(pollInterval);
    } else {
      setIsPolling(false);
    }
  }, [paymentId, paymentResponse, pollCount, isLoading, refetch]);

  // Handle errors
  useEffect(() => {
    if (isError && queryError) {
      console.error('Payment query error:', queryError);
      setError(queryError.message || 'Failed to verify payment');
    }
  }, [isError, queryError]);

  const paymentData = paymentResponse?.data;

  const handleViewOrderDetails = () => {
    if (paymentData?.orderId) {
      window.location.href = `/order-confirmation?orderId=${paymentData.orderId}`;
    } else {
      window.location.href = `/order-confirmation?paymentId=${paymentId}`;
    }
  };

  const handleNavigateToOrders = () => {
    window.location.href = '/orders';
  };

  const handleContinueShopping = () => {
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    window.location.href = '/support';
  };

  const handleManualRefresh = () => {
    setPollCount(0);
    setIsPolling(true);
    refetch();
  };

  // Loading state - show different messages based on polling status
  if (
    paymentId &&
    (isLoading || (paymentData?.status === 'pending' && pollCount < 10))
  ) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={6}>
          <Spinner size='xl' color='blue.500' thickness='4px' />
          <Text fontSize='lg'>
            {isPolling
              ? 'Checking payment status...'
              : 'Confirming your payment...'}
          </Text>
          <Text fontSize='sm' color='gray.600' textAlign='center'>
            Please don't close this window while we verify your payment.
            {pollCount > 0 && (
              <>
                <br />
                <Text as='span' fontSize='xs' color='gray.500'>
                  Attempt {pollCount} of 10 - Payment processing can take up to
                  30 seconds
                </Text>
              </>
            )}
          </Text>
          {pollCount >= 5 && (
            <Button
              size='sm'
              variant='outline'
              onClick={handleManualRefresh}
              leftIcon={<RefreshCw className='w-4 h-4' />}
            >
              Refresh Status
            </Button>
          )}
        </VStack>
      </Container>
    );
  }

  // Error state or payment not found
  if (error || !paymentId || (paymentId && !isLoading && !paymentData)) {
    return (
      <Container maxW='2xl' py={20}>
        <Alert status='error' borderRadius='lg' mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Payment Verification Issue</Text>
            <Text mb={3}>
              {error || "We couldn't find your payment record."}
            </Text>

            {paymentId && process.env.NODE_ENV === 'development' && (
              <Text
                fontSize='sm'
                color='gray.600'
                fontFamily='mono'
                bg='gray.100'
                p={2}
                borderRadius='md'
              >
                Searched for: {paymentId}
              </Text>
            )}
          </Box>
        </Alert>

        <VStack spacing={3}>
          <Button
            colorScheme='blue'
            onClick={handleManualRefresh}
            leftIcon={<RefreshCw className='w-4 h-4' />}
          >
            Try Again
          </Button>
          <Button colorScheme='gray' onClick={handleContactSupport}>
            Contact Support
          </Button>
          <Button
            variant='outline'
            onClick={handleContinueShopping}
            leftIcon={<Home className='w-4 h-4' />}
          >
            Return to Home
          </Button>
        </VStack>
      </Container>
    );
  }

  // Handle non-completed payments
  if (paymentData?.status !== 'completed') {
    const statusMessages = {
      pending: {
        title: 'Payment Still Processing',
        message:
          pollCount >= 10
            ? 'Your payment is taking longer than expected. Please check back in a few minutes or contact support.'
            : 'Your payment is being processed. This may take a few moments.',
        color: 'warning',
        showRefresh: pollCount >= 10,
      },
      failed: {
        title: 'Payment Failed',
        message:
          'Your payment could not be processed. Please try again or contact support.',
        color: 'error',
        showRefresh: false,
      },
      disputed: {
        title: 'Payment Under Review',
        message:
          'Your payment is under review. Our team will contact you shortly.',
        color: 'warning',
        showRefresh: false,
      },
      refunded: {
        title: 'Payment Refunded',
        message:
          'This payment has been refunded to your original payment method.',
        color: 'info',
        showRefresh: false,
      },
    };

    const statusKey =
      (paymentData?.status as keyof typeof statusMessages) || 'pending';
    const statusInfo = statusMessages[statusKey] || statusMessages.pending;

    return (
      <Container maxW='2xl' py={20}>
        <Alert
          status={
            statusInfo.color as
              | 'error'
              | 'info'
              | 'warning'
              | 'success'
              | 'loading'
          }
          borderRadius='lg'
          mb={6}
        >
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>{statusInfo.title}</Text>
            <Text>{statusInfo.message}</Text>
          </Box>
        </Alert>

        <VStack spacing={3}>
          {statusInfo.showRefresh && (
            <Button
              colorScheme='blue'
              onClick={handleManualRefresh}
              leftIcon={<RefreshCw className='w-4 h-4' />}
            >
              Refresh Status
            </Button>
          )}
          <Button variant='outline' onClick={handleContactSupport}>
            Contact Support
          </Button>
          <Button
            variant='ghost'
            onClick={handleContinueShopping}
            leftIcon={<Home className='w-4 h-4' />}
          >
            Return to Home
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
          <Heading size='xl' color='green.500' mb={2}>
            Payment Successful!
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            Thank you for your purchase. Your order is now being processed.
          </Text>
        </Box>

        {/* Payment Details Card */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <Flex justify='space-between' align='center'>
                <Heading size='md'>Payment Details</Heading>
                <Badge colorScheme='green' fontSize='sm' px={3} py={1}>
                  {paymentData?.status.toUpperCase()}
                </Badge>
              </Flex>

              <Divider />

              <Flex justify='space-between'>
                <Text color='gray.600'>Payment ID:</Text>
                <Text fontFamily='mono' fontSize='sm' maxW='200px' isTruncated>
                  {paymentData?.paymentId || paymentData?._id}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Order Number:</Text>
                <Text fontWeight='medium'>
                  {paymentData.orderId._id || 'N/A'}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Amount Paid:</Text>
                <Text fontWeight='bold' fontSize='lg' color='green.600'>
                  {paymentData?.currency === 'NGN' ? '₦' : '$'}
                  {paymentData?.amount.toFixed(2)}{' '}
                  {paymentData?.currency.toUpperCase()}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Payment Method:</Text>
                <Text textTransform='capitalize'>
                  {paymentData?.paymentProvider === 'stripe'
                    ? 'Credit Card (Stripe)'
                    : paymentData?.paymentProvider === 'paystack'
                    ? 'Paystack'
                    : paymentData?.paymentProvider}
                </Text>
              </Flex>

              {paymentData.createdAt && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Payment Completed:</Text>
                  <Text>
                    {new Date(paymentData.createdAt).toLocaleDateString()} at{' '}
                    {new Date(paymentData.createdAt).toLocaleTimeString()}
                  </Text>
                </Flex>
              )}

              <Divider />

              <Alert status='info' borderRadius='md'>
                <AlertIcon />
                <Box>
                  <Text fontWeight='bold'>What's Next?</Text>
                  <Text fontSize='sm' mt={1}>
                    • You'll receive an email confirmation within 5 minutes
                    <br />
                    • Your order will be processed within 1-2 business days
                    <br />• Tracking information will be sent once your order
                    ships
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={4}>
          <Button
            colorScheme='green'
            size='lg'
            width='full'
            onClick={handleViewOrderDetails}
            leftIcon={<FileText className='w-5 h-5' />}
            isDisabled={!paymentData?.orderId && !paymentId}
          >
            View Order Details
          </Button>

          <Button
            colorScheme='blue'
            variant='outline'
            size='lg'
            width='full'
            onClick={handleNavigateToOrders}
            leftIcon={<ShoppingBag className='w-4 h-4' />}
          >
            View All Orders
          </Button>

          <Button
            variant='ghost'
            size='lg'
            width='full'
            onClick={handleContinueShopping}
            leftIcon={<HomeIcon className='w-4 h-4' />}
          >
            Continue Shopping
          </Button>
        </VStack>

        {/* Support Information */}
        <Box bg='gray.50' p={6} borderRadius='lg' textAlign='center'>
          <Text fontWeight='bold' mb={2}>
            Need Help?
          </Text>
          <Text fontSize='sm' color='gray.600' mb={3}>
            If you have any questions about your order or payment, our support
            team is here to help.
          </Text>
          <VStack spacing={2}>
            <Button
              variant='link'
              colorScheme='blue'
              size='sm'
              onClick={handleContactSupport}
            >
              Contact Support
            </Button>
            <Text fontSize='xs' color='gray.500'>
              Available 24/7 via email and live chat
            </Text>
          </VStack>
        </Box>

        {/* Security Notice */}
        <Box bg='blue.50' p={4} borderRadius='md' textAlign='center'>
          <Text fontSize='sm' color='blue.700'>
            🔒 Your payment was processed securely. This transaction will appear
            on your statement as "Your Store Name".
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default PaymentSuccessPage;
