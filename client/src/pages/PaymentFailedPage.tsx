import { useEffect, useState } from 'react';
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
  CheckIcon,
} from 'lucide-react';
import { useGetPaymentById } from '@/context/PaymentContextService';
import { useNavigate } from 'react-router-dom';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Currency formatting helper
  const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    provider: string
  ) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      NGN: '₦',
      usd: '$',
      ngn: '₦',
    };

    const symbol = currencySymbols[currency] || '$';
    const displayCurrency = currency.toUpperCase();

    const displayAmount =
      provider === 'paystack' && currency.toUpperCase() === 'NGN'
        ? (amount / 100).toFixed(2)
        : amount.toFixed(2);

    return `${symbol}${displayAmount} ${displayCurrency}`;
  };

  const getProviderSpecificMessage = (provider: string) => {
    const messages = {
      stripe: {
        retry: 'Try with a different credit/debit card',
        contact: 'Contact your bank if the card was declined',
        alternative: 'Consider trying Paystack for local payment methods',
      },
      paystack: {
        retry: 'Try bank transfer, USSD, or different card',
        contact: 'Ensure your account has sufficient funds',
        alternative: 'Consider trying Stripe for international cards',
      },
    };

    return messages[provider as keyof typeof messages] || messages.stripe;
  };

  // Extract payment details from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const detectedProvider = urlParams.get('provider');
    const detectedOrderId = urlParams.get('order_id');
    const reasonParam = urlParams.get('reason');

    // Extract payment ID based on provider or fallback method
    let extractedPaymentId: string | null = null;

    if (detectedProvider === 'stripe') {
      extractedPaymentId = urlParams.get('session_id');
    } else if (detectedProvider === 'paystack') {
      extractedPaymentId =
        urlParams.get('reference') || urlParams.get('trxref');
    } else {
      // Fallback method
      extractedPaymentId =
        urlParams.get('session_id') ||
        urlParams.get('reference') ||
        urlParams.get('trxref') ||
        urlParams.get('payment_id');
    }

    console.log('Payment failure URL params:', {
      provider: detectedProvider,
      orderId: detectedOrderId,
      paymentId: extractedPaymentId,
      reason: reasonParam,
    });

    if (!extractedPaymentId && !detectedOrderId) {
      setError('No payment or order reference found');
      return;
    }

    setPaymentId(extractedPaymentId);
    setProvider(detectedProvider);
    setOrderId(detectedOrderId);

    // Set error if reason is provided
    if (reasonParam) {
      setError(
        reasonParam === 'user_cancelled' ? 'Payment was cancelled' : reasonParam
      );
    }
  }, []);

  // Fetch payment data
  const {
    data: paymentResponse,
    isLoading,
    error: queryError,
    isError,
  } = useGetPaymentById(paymentId || '');

  // Handle query errors
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError.message || 'Failed to fetch payment details');
    }
  }, [isError, queryError]);

  const paymentData = paymentResponse?.data;
  const providerMessages = paymentData
    ? getProviderSpecificMessage(paymentData.paymentProvider)
    : null;

  // Navigation handlers
  const handleRetryPayment = () => {
    const targetOrderId = paymentData?.orderId?._id || orderId;

    if (!targetOrderId) {
      window.location.href = '/checkout';
      return;
    }

    setRetryAttempts((prev) => prev + 1);

    // Provider-specific retry URLs with smart fallback
    const currentProvider = paymentData?.paymentProvider || provider;
    const baseUrl = `/payment?retry=true&orderId=${targetOrderId}`;

    // Suggest alternative provider after multiple failures
    if (retryAttempts >= 2 && currentProvider === 'stripe') {
      window.location.href = `${baseUrl}&suggested_provider=paystack&reason=stripe_failed`;
    } else if (retryAttempts >= 2 && currentProvider === 'paystack') {
      window.location.href = `${baseUrl}&suggested_provider=stripe&reason=paystack_failed`;
    } else {
      window.location.href = `${baseUrl}&provider=${currentProvider}`;
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleBackToCheckout = () => {
    const targetOrderId = paymentData?.orderId?._id || orderId;
    if (targetOrderId) {
      navigate(`/checkout?orderId=${targetOrderId}&change_payment=true`);
    } else {
      navigate('/checkout');
    }
  };

  const handleContactSupport = () => {
    const supportParams = new URLSearchParams({
      issue: 'payment_failed',
      paymentId: paymentId || 'unknown',
      orderId: paymentData?.orderId?._id || orderId || 'unknown',
      provider: paymentData?.paymentProvider || provider || 'unknown',
    });

    navigate(`/support?${supportParams.toString()}`);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  // Loading state - only show if we have a paymentId
  if (paymentId && isLoading) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={6}>
          <Spinner size='xl' color='red.500' thickness='4px' />
          <Text fontSize='lg'>Checking payment status...</Text>
          <Text fontSize='sm' color='gray.600'>
            Retrieving payment details for further assistance
          </Text>
        </VStack>
      </Container>
    );
  }

  // Error state - no payment ID or fetch error
  if (
    error ||
    (!paymentId && !orderId) ||
    (paymentId && !isLoading && !paymentData)
  ) {
    return (
      <Container maxW='2xl' py={20}>
        <VStack spacing={8} align='stretch'>
          <Box textAlign='center'>
            <XCircleIcon className='w-20 h-20 text-red-500 mx-auto mb-4' />
            <Heading size='xl' color='red.500' mb={2}>
              Payment Issue
            </Heading>
          </Box>

          <Alert status='error' borderRadius='lg'>
            <AlertIcon />
            <Box>
              <Text fontWeight='bold'>Payment Information Unavailable</Text>
              <Text>
                {error ||
                  "We couldn't retrieve your payment details. Please try again or contact support."}
              </Text>
            </Box>
          </Alert>

          <VStack spacing={3}>
            <Button
              colorScheme='blue'
              size='lg'
              width='full'
              onClick={() => navigate('/checkout')}
              leftIcon={<CreditCardIcon className='w-4 h-4' />}
            >
              Try Payment Again
            </Button>
            <Button
              variant='outline'
              size='lg'
              width='full'
              onClick={handleContinueShopping}
              leftIcon={<HomeIcon className='w-4 h-4' />}
            >
              Return to Home
            </Button>
            <Button variant='ghost' onClick={handleContactSupport}>
              Contact Support
            </Button>
          </VStack>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW='2xl' py={20}>
      <VStack spacing={8} align='stretch'>
        {/* Failed Header */}
        <Box bg='gray.300' p={2} textAlign='center'>
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

              {paymentData?.paymentId && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Payment ID:</Text>
                  <Text
                    fontFamily='mono'
                    fontSize='sm'
                    maxW='200px'
                    isTruncated
                  >
                    {paymentData.paymentId}
                  </Text>
                </Flex>
              )}

              <Flex justify='space-between'>
                <Text color='gray.600'>Order Reference:</Text>
                <Text fontWeight='medium' fontFamily='mono' fontSize='sm'>
                  {paymentData?.orderId?._id?.slice(-8).toUpperCase() ||
                    orderId?.slice(-8).toUpperCase() ||
                    'N/A'}
                </Text>
              </Flex>

              {paymentData?.amount && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Amount:</Text>
                  <Text fontWeight='bold' fontSize='lg'>
                    {formatCurrency(
                      paymentData.amount,
                      paymentData.currency || 'USD',
                      paymentData.paymentProvider
                    )}
                  </Text>
                </Flex>
              )}

              {paymentData?.paymentProvider && (
                <Flex justify='space-between'>
                  <Text color='gray.600'>Payment Method:</Text>
                  <Text textTransform='capitalize'>
                    {paymentData.paymentProvider === 'stripe'
                      ? 'Credit Card (Stripe)'
                      : paymentData.paymentProvider === 'paystack'
                      ? 'Paystack'
                      : paymentData.paymentProvider}
                  </Text>
                </Flex>
              )}

              <Flex justify='space-between'>
                <Text color='gray.600'>Failed At:</Text>
                <Text>
                  {paymentData?.updatedAt
                    ? `${new Date(
                        paymentData.updatedAt
                      ).toLocaleDateString()} at ${new Date(
                        paymentData.updatedAt
                      ).toLocaleTimeString()}`
                    : 'Just now'}
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
                    {providerMessages?.retry || 'Use another payment option'}
                  </Text>
                </Box>
              </ListItem>

              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Check your payment details</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Verify card number, expiry date, CVV, and billing address
                  </Text>
                </Box>
              </ListItem>

              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Contact your bank</Text>
                  <Text fontSize='sm' color='gray.600'>
                    {providerMessages?.contact ||
                      'Your bank may have declined the transaction'}
                  </Text>
                </Box>
              </ListItem>

              {retryAttempts >= 1 && providerMessages?.alternative && (
                <ListItem display='flex' alignItems='flex-start'>
                  <ListIcon as={CheckIcon} color='blue.500' mt={1} />
                  <Box>
                    <Text fontWeight='medium'>
                      Try alternative payment provider
                    </Text>
                    <Text fontSize='sm' color='gray.600'>
                      {providerMessages.alternative}
                    </Text>
                  </Box>
                </ListItem>
              )}

              <ListItem display='flex' alignItems='flex-start'>
                <ListIcon as={CheckIcon} color='green.500' mt={1} />
                <Box>
                  <Text fontWeight='medium'>Try again later</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Payment processors sometimes experience temporary issues
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
