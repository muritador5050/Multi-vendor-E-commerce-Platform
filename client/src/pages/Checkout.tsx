import { useCurrentUser } from '@/context/AuthContextService';
import { useCart } from '@/context/CartContextService';
import { useCreateOrder } from '@/context/OrderContextService';
import type { CreateOrderRequest, Order } from '@/type/Order';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  VStack,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    useSameAddress: true,
    paymentMethod: 'card',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const createOrderMutation = useCreateOrder();
  const { data: cartItems } = useCart();
  const shippingCost = 9.99;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('shipping')) {
      const field = name.split('.')[1];
      setOrderData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
      }));
    } else if (name.startsWith('billing')) {
      const field = name.split('.')[1];
      setOrderData((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value,
        },
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setOrderData((prev) => ({
      ...prev,
      useSameAddress: isChecked,
      billingAddress: isChecked ? prev.shippingAddress : prev.billingAddress,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const products = cartItems?.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      if (!products || products.length === 0) {
        throw new Error('No products in cart');
      }

      const finalOrderData: CreateOrderRequest = {
        products,
        totalPrice: (cartItems?.totalAmount || 0) + shippingCost,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.useSameAddress
          ? orderData.shippingAddress
          : orderData.billingAddress,
        useSameAddress: orderData.useSameAddress,
        paymentMethod: orderData.paymentMethod as Order['paymentMethod'],
        shippingCost: shippingCost,
      };

      const createdOrder = await createOrderMutation.mutateAsync(
        finalOrderData
      );

      toast({
        title: 'Order Created!',
        description: 'Proceeding to payment...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      navigate('/payment', {
        state: {
          orderId: createdOrder.data?._id,
          amount: (cartItems?.totalAmount || 0) + shippingCost,
          paymentMethod: orderData.paymentMethod,
          subtotal: cartItems?.totalAmount || 0,
          shippingCost: shippingCost,
        },
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'There was an error creating your order. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box maxW='7xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      <Heading as='h1' fontSize='3xl' mb={8} fontWeight='bold'>
        Checkout
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
        {/* Left Column - Shipping and Payment */}
        <Box as='form' onSubmit={handleSubmit}>
          {/* Shipping Information */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={6}>
              Shipping Information
            </Heading>

            <FormControl isRequired mb={4}>
              <FormLabel>Street Address</FormLabel>
              <Textarea
                name='shipping.street'
                value={orderData.shippingAddress.street}
                onChange={handleInputChange}
                placeholder='123 Main St'
              />
            </FormControl>

            <Grid
              templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }}
              gap={4}
              mb={4}
            >
              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input
                  name='shipping.city'
                  value={orderData.shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder='New York'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>State/Province</FormLabel>
                <Input
                  name='shipping.state'
                  value={orderData.shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder='NY'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>ZIP/Postal Code</FormLabel>
                <Input
                  name='shipping.zipCode'
                  value={orderData.shippingAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder='10001'
                />
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel>Country</FormLabel>
              <Input
                name='shipping.country'
                value={orderData.shippingAddress.country}
                onChange={handleInputChange}
                placeholder='United States'
              />
            </FormControl>
          </Box>

          {/* Billing Information */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={4}>
              Billing Information
            </Heading>

            <Checkbox
              isChecked={orderData.useSameAddress}
              onChange={handleSameAddressChange}
              mb={4}
            >
              Same as shipping address
            </Checkbox>

            {!orderData.useSameAddress && (
              <>
                <FormControl isRequired mb={4}>
                  <FormLabel>Street Address</FormLabel>
                  <Textarea
                    name='billing.street'
                    value={orderData.billingAddress.street}
                    onChange={handleInputChange}
                    placeholder='123 Main St'
                  />
                </FormControl>

                <Grid
                  templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }}
                  gap={4}
                  mb={4}
                >
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input
                      name='billing.city'
                      value={orderData.billingAddress.city}
                      onChange={handleInputChange}
                      placeholder='New York'
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>State/Province</FormLabel>
                    <Input
                      name='billing.state'
                      value={orderData.billingAddress.state}
                      onChange={handleInputChange}
                      placeholder='NY'
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>ZIP/Postal Code</FormLabel>
                    <Input
                      name='billing.zipCode'
                      value={orderData.billingAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder='10001'
                    />
                  </FormControl>
                </Grid>

                <FormControl isRequired>
                  <FormLabel>Country</FormLabel>
                  <Input
                    name='billing.country'
                    value={orderData.billingAddress.country}
                    onChange={handleInputChange}
                    placeholder='United States'
                  />
                </FormControl>
              </>
            )}
          </Box>

          {/* Payment Method */}
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={6}>
              Payment Method
            </Heading>

            <RadioGroup
              value={orderData.paymentMethod}
              onChange={(value) =>
                setOrderData((prev) => ({
                  ...prev,
                  paymentMethod: value,
                }))
              }
            >
              <Stack direction='column' spacing={4}>
                <Radio value='card'>
                  <Box ml={2}>
                    <Text fontWeight='medium'>Credit/Debit Card</Text>
                    <Text fontSize='sm' color='gray.500'>
                      Pay with Visa, Mastercard, or American Express via Stripe
                    </Text>
                  </Box>
                </Radio>
                <Radio value='paystack'>
                  <Box ml={2}>
                    <Text fontWeight='medium'>Paystack</Text>
                    <Text fontSize='sm' color='gray.500'>
                      Pay with your Paystack account
                    </Text>
                  </Box>
                </Radio>
                <Radio value='stripe'>
                  <Box ml={2}>
                    <Text fontWeight='medium'>Stripe</Text>
                    <Text fontSize='sm' color='gray.500'>
                      Secure credit card payments
                    </Text>
                  </Box>
                </Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Button
            type='submit'
            colorScheme='blue'
            size='lg'
            width='full'
            isLoading={isProcessing}
            loadingText='Creating Order...'
          >
            Continue to Payment
          </Button>
        </Box>

        {/* Right Column - Order Summary */}
        <Box>
          <Box bg='white' p={6} borderRadius='lg' boxShadow='sm' mb={6}>
            <Heading as='h2' fontSize='xl' mb={6}>
              Order Summary
            </Heading>

            <VStack spacing={4} mb={6}>
              {cartItems?.items.map((item) => (
                <Flex key={item._id} width='full' justify='space-between'>
                  <Text>
                    {item.product.name} × {item.quantity}
                  </Text>
                  <Text fontWeight='medium'>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </Flex>
              ))}
            </VStack>

            <VStack spacing={3} borderTopWidth='1px' pt={4} mb={6}>
              <Flex width='full' justify='space-between'>
                <Text>Subtotal</Text>
                <Text>${cartItems?.totalAmount.toFixed(2)}</Text>
              </Flex>
              <Flex width='full' justify='space-between'>
                <Text>Shipping</Text>
                <Text>${shippingCost.toFixed(2)}</Text>
              </Flex>
              <Flex
                width='full'
                justify='space-between'
                fontWeight='bold'
                fontSize='lg'
                pt={2}
                borderTopWidth='1px'
              >
                <Text>Total</Text>
                <Text>
                  ${((cartItems?.totalAmount || 0) + shippingCost).toFixed(2)}
                </Text>
              </Flex>
            </VStack>

            <Button
              variant='outline'
              colorScheme='gray'
              width='full'
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </Button>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
