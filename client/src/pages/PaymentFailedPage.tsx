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
  Card,
  CardBody,
  Flex,
  Divider,
  Badge,
  List,
  ListItem,
  ListIcon,
  Spinner,
} from '@chakra-ui/react';
import {
  XCircleIcon,
  HomeIcon,
  CreditCardIcon,
  ArrowRightSquareIcon,
  // SquareX,
  CheckIcon,
} from 'lucide-react';
import { useGetPaymentById } from '@/context/PaymentContextService';

const PaymentFailedPage = () => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  // Use the hook to fetch payment data
  const {
    data: paymentResponse,
    isLoading,
    error: queryError,
    isError,
  } = useGetPaymentById(paymentId || '');

  // Handle errors
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError.message || 'Failed to fetch payment details');
    }
  }, [isError, queryError]);

  const paymentData = paymentResponse?.data;

  const handleRetryPayment = () => {
    if (!paymentData?.orderId) {
      // If no order data, redirect to checkout
      window.location.href = '/checkout';
      return;
    }

    setRetryAttempts((prev) => prev + 1);

    // Navigate back to payment page with order data
    window.location.href = `/payment?retry=true&orderId=${paymentData.orderId}`;
  };

  const handleBackToCart = () => {
    // In real app: navigate('/cart')
    window.location.href = '/cart';
  };

  const handleBackToCheckout = () => {
    // In real app: navigate('/checkout')
    window.location.href = '/checkout';
  };

  const handleContactSupport = () => {
    // In real app: navigate('/support')
    window.location.href = '/support';
  };

  const handleContinueShopping = () => {
    // In real app: navigate('/')
    window.location.href = '/';
  };

  // const getFailureReasonIcon = (reason: string) => {
  //   if (
  //     reason?.toLowerCase().includes('declined') ||
  //     reason?.toLowerCase().includes('insufficient')
  //   ) {
  //     return CreditCardIcon;
  //   }
  //   return SquareX;
  // };

  // Loading state - only show if we have a paymentId
  if (paymentId && isLoading) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={6}>
          <Spinner size='xl' color='red.500' thickness='4px' />
          <Text fontSize='lg'>Checking payment status...</Text>
        </VStack>
      </Container>
    );
  }

  // Error state - no payment ID or fetch error
  if (error || !paymentId || (paymentId && !isLoading && !paymentData)) {
    return (
      <Container maxW='2xl' py={20}>
        <Alert status='error' borderRadius='lg' mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Payment Information Unavailable</Text>
            <Text>
              {error ||
                "We couldn't retrieve your payment details. Please contact support."}
            </Text>
          </Box>
        </Alert>
        <Button
          colorScheme='blue'
          onClick={handleContinueShopping}
          leftIcon={<HomeIcon className='w-4 h-4' />}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW='2xl' py={20}>
      <VStack spacing={8} align='stretch'>
        {/* Failed Header */}
        <Box textAlign='center'>
          <XCircleIcon className='w-20 h-20 text-red-500 mx-auto mb-4' />
          <Heading size='xl' color='red.500' mb={2}>
            Payment Failed
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            We couldn't process your payment. Don't worry - your order is saved
            and you can try again.
          </Text>
        </Box>

        {/* Failure Details Card */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <Flex justify='space-between' align='center'>
                <Heading size='md'>Payment Details</Heading>
                <Badge colorScheme='red' fontSize='sm' px={3} py={1}>
                  FAILED
                </Badge>
              </Flex>

              <Divider />

              {/* Failure Reason */}
              {/* <Alert status='error' borderRadius='md'>
                <AlertIcon as={getFailureReasonIcon(paymentData. ?? '')} />
                <Box>
                  <Text fontWeight='bold'>Reason for failure:</Text>
                  <Text fontSize='sm' mt={1}>
                    {paymentData?.failureReason ||
                      'Payment processing failed. Please try again.'}
                  </Text>
                </Box>
              </Alert> */}

              <Flex justify='space-between'>
                <Text color='gray.600'>Payment ID:</Text>
                <Text fontFamily='mono' fontSize='sm' maxW='200px' isTruncated>
                  {paymentData?.paymentId || paymentData?._id}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Order Number:</Text>
                <Text fontWeight='medium'>
                  {paymentData?.orderId._id || 'N/A'}
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text color='gray.600'>Amount:</Text>
                <Text fontWeight='bold' fontSize='lg'>
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

              <Flex justify='space-between'>
                <Text color='gray.600'>Attempted:</Text>
                <Text>
                  {new Date(
                    paymentData?.createdAt ?? paymentData?.updatedAt ?? ''
                  ).toLocaleDateString()}{' '}
                  at{' '}
                  {new Date(
                    paymentData?.createdAt ?? paymentData?.updatedAt ?? ''
                  ).toLocaleTimeString()}
                </Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* What to do next */}
        <Card>
          <CardBody>
            <Heading size='md' mb={4}>
              What you can do:
            </Heading>
            <List spacing={3}>
              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>
                    Try a different payment method
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    Use another credit card, debit card, or payment option
                  </Text>
                </Box>
              </ListItem>
              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Check your card details</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Ensure your card number, expiry date, and CVV are correct
                  </Text>
                </Box>
              </ListItem>
              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Contact your bank</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Your bank may have declined the transaction for security
                    reasons
                  </Text>
                </Box>
              </ListItem>
              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Try again later</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Sometimes payment processors experience temporary issues
                  </Text>
                </Box>
              </ListItem>
            </List>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={4}>
          <Button
            colorScheme='blue'
            size='lg'
            width='full'
            onClick={handleRetryPayment}
            leftIcon={<ArrowRightSquareIcon className='w-4 h-4' />}
          >
            Try Payment Again
            {retryAttempts > 0 && (
              <Badge ml={2} colorScheme='blue' variant='subtle'>
                Attempt {retryAttempts + 1}
              </Badge>
            )}
          </Button>

          <Button
            variant='outline'
            colorScheme='blue'
            size='lg'
            width='full'
            onClick={handleBackToCheckout}
            leftIcon={<CreditCardIcon className='w-4 h-4' />}
          >
            Change Payment Method
          </Button>

          <Button
            variant='outline'
            size='lg'
            width='full'
            onClick={handleBackToCart}
          >
            Back to Cart
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
        <Box bg='orange.50' p={6} borderRadius='lg' textAlign='center'>
          <Text fontWeight='bold' mb={2} color='orange.700'>
            Still Having Trouble?
          </Text>
          <Text fontSize='sm' color='orange.600' mb={3}>
            Our payment specialists are here to help you complete your purchase.
          </Text>
          <Button
            variant='outline'
            colorScheme='orange'
            size='sm'
            onClick={handleContactSupport}
          >
            Contact Payment Support
          </Button>
          <Text fontSize='xs' color='gray.500' mt={2}>
            Available 24/7 • Average response time: 2 minutes
          </Text>
        </Box>

        {/* Security Notice */}
        <Box bg='gray.50' p={4} borderRadius='md' textAlign='center'>
          <Text fontSize='sm' color='gray.600'>
            🔒 Your payment information is always secure. We use
            industry-standard encryption and never store your card details.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default PaymentFailedPage;
