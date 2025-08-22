import { useCreatePayment } from '@/context/PaymentContextService';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiShield } from 'react-icons/fi';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const createPaymentMutation = useCreatePayment();

  const [isProcessing, setIsProcessing] = useState(false);

  // Get order data from location state
  const orderData = location.state as {
    orderId: string;
    amount: number;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
  } | null;

  useEffect(() => {
    if (!orderData?.orderId) {
      toast({
        title: 'Error',
        description: 'No order data found. Please start from checkout.',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
      navigate('/checkout');
      return;
    }
  }, [orderData, navigate, toast]);

  const handlePayment = async () => {
    if (!orderData?.orderId) return;
    setIsProcessing(true);
    try {
      const paymentResult = await createPaymentMutation.mutateAsync({
        orderId: orderData.orderId,
      });

      // Check for checkout URL
      if (!paymentResult.data?.checkoutUrl) {
        throw new Error('Payment provider did not return a checkout URL');
      }

      const checkoutUrl = paymentResult.data.checkoutUrl;
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 500);
    } catch (error) {
      let errorMessage = 'Failed to create payment. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Payment Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <Box maxW='md' mx='auto' mt={20} textAlign='center'>
        <Spinner size='xl' color='blue.500' />
        <Text mt={4} fontSize='lg'>
          Loading payment details...
        </Text>
      </Box>
    );
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card via Stripe';
      case 'stripe':
        return 'Stripe';
      case 'paystack':
        return 'Paystack';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <Box maxW='4xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Heading
        as='h1'
        fontSize='3xl'
        mb={8}
        fontWeight='bold'
        textAlign='center'
      >
        Complete Your Payment
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
        {/* Payment Information */}
        <Box>
          <Alert status='info' mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Secure Payment Processing</AlertTitle>
              <AlertDescription>
                You will be redirected to our secure payment partner to complete
                your transaction.
              </AlertDescription>
            </Box>
          </Alert>

          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={6}>
              Payment Processing
            </Heading>

            <VStack spacing={4} align='stretch'>
              <Box p={4} bg='gray.50' borderRadius='md'>
                <Text fontSize='sm' color='gray.600' mb={2}>
                  Payment Method:
                </Text>
                <Text fontWeight='semibold' fontSize='lg'>
                  {getPaymentMethodDisplay(orderData.paymentMethod)}
                </Text>
              </Box>

              <Box p={4} bg='blue.50' borderRadius='md'>
                <Text fontSize='sm' color='blue.600' mb={2}>
                  Total Amount:
                </Text>
                <Text fontWeight='bold' fontSize='2xl' color='blue.700'>
                  ${orderData.amount?.toFixed(2)}
                </Text>
              </Box>

              <Text fontSize='sm' color='gray.600' textAlign='center'>
                Click the button below to proceed to our secure payment partner.
              </Text>

              <VStack spacing={3}>
                <Button
                  onClick={handlePayment}
                  colorScheme='green'
                  size='lg'
                  width='full'
                  isLoading={isProcessing}
                  loadingText='Redirecting to payment...'
                  disabled={isProcessing}
                  leftIcon={<Icon as={FiLock} />}
                >
                  {isProcessing
                    ? 'Processing...'
                    : `Pay $${orderData.amount?.toFixed(2)}`}
                </Button>

                <Button
                  variant='outline'
                  width='full'
                  onClick={() => navigate('/checkout')}
                  disabled={isProcessing}
                >
                  Back to Checkout
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Security Information */}
          <Box bg='gray.50' p={4} borderRadius='lg'>
            <Flex align='center' mb={2}>
              <Icon as={FiShield} color='green.500' mr={2} />
              <Heading as='h3' fontSize='md'>
                Your Payment is Secure
              </Heading>
            </Flex>
            <Text fontSize='sm' color='gray.600'>
              Your payment information is protected by bank-level security and
              SSL encryption. We do not store your payment details on our
              servers.
            </Text>
          </Box>
        </Box>

        {/* Order Summary */}
        <Box>
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={6}>
              Order Summary
            </Heading>

            <VStack spacing={3} mb={6}>
              <Flex width='full' justify='space-between'>
                <Text color='gray.600'>Order ID:</Text>
                <Text fontFamily='mono' fontSize='sm'>
                  {orderData.orderId?.slice(-8)}...
                </Text>
              </Flex>

              <Flex width='full' justify='space-between'>
                <Text>Subtotal</Text>
                <Text>${orderData.subtotal?.toFixed(2)}</Text>
              </Flex>

              <Flex width='full' justify='space-between'>
                <Text>Shipping</Text>
                <Text>${orderData.shippingCost?.toFixed(2)}</Text>
              </Flex>

              <Flex
                width='full'
                justify='space-between'
                fontWeight='bold'
                fontSize='lg'
                pt={3}
                borderTopWidth='2px'
                borderColor='gray.200'
              >
                <Text>Total</Text>
                <Text color='green.600'>${orderData.amount?.toFixed(2)}</Text>
              </Flex>
            </VStack>

            <Box fontSize='sm' color='gray.600' textAlign='center'>
              <Text mb={2}>
                <Icon as={FiLock} mr={1} />
                SSL Secured Payment
              </Text>
              <Text>
                Your transaction is protected by industry-standard encryption
              </Text>
            </Box>
          </Box>

          {/* Help Information */}
          <Box bg='blue.50' p={4} borderRadius='lg'>
            <Heading as='h3' fontSize='md' mb={2} color='blue.700'>
              Need Help?
            </Heading>
            <Text fontSize='sm' color='blue.600'>
              If you encounter any issues during payment, please contact our
              support team or try again in a few moments.
            </Text>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default PaymentPage;
