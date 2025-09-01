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
  Alert,
  AlertIcon,
  Image,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BuyNowProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface LocationState {
  buyNow?: boolean;
  product?: BuyNowProduct;
}

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
  const location = useLocation();
  const currentUser = useCurrentUser();
  const createOrderMutation = useCreateOrder();
  const { data: cartItems } = useCart();
  const shippingCost = 9.99;

  // Check if this is a "Buy Now" flow
  const locationState = location.state as LocationState;
  const isBuyNow = locationState?.buyNow || false;
  const buyNowProduct = locationState?.product;

  // Determine what items to process
  const itemsToProcess =
    isBuyNow && buyNowProduct
      ? [
          {
            product: {
              _id: buyNowProduct._id,
              name: buyNowProduct.name,
              price: buyNowProduct.price,
              images: buyNowProduct.image ? [buyNowProduct.image] : [],
            },
            quantity: buyNowProduct.quantity,
            _id: `buynow-${buyNowProduct._id}`,
          },
        ]
      : cartItems?.items || [];

  // Calculate totals
  const subtotal = itemsToProcess.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalAmount = subtotal + shippingCost;

  useEffect(() => {
    // Redirect if no items to process
    if (!isBuyNow && (!cartItems?.items || cartItems.items.length === 0)) {
      toast({
        title: 'No items to checkout',
        description: 'Please add items to your cart first.',
        status: 'warning',
        position: 'top-right',
        duration: 3000,
      });
      navigate('/carts');
    }

    if (isBuyNow && !buyNowProduct) {
      toast({
        title: 'Invalid product',
        description: 'Product information is missing.',
        status: 'error',
        position: 'top-right',
        duration: 3000,
      });
      navigate('/shop');
    }
  }, [isBuyNow, buyNowProduct, cartItems, navigate, toast]);

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

      const products = itemsToProcess.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      if (!products || products.length === 0) {
        throw new Error('No products to order');
      }

      const finalOrderData: CreateOrderRequest = {
        products,
        totalPrice: totalAmount,
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

      navigate('/payments', {
        state: {
          orderId: createdOrder.data?._id,
          amount: totalAmount,
          paymentMethod: orderData.paymentMethod,
          subtotal: subtotal,
          shippingCost: shippingCost,
          isBuyNow: isBuyNow,
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
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackNavigation = () => {
    if (isBuyNow) {
      navigate(-1); // Go back to product page
    } else {
      navigate('/carts');
    }
  };

  return (
    <Box maxW='7xl' mx='auto' px={{ base: 4, md: 8 }} py={12}>
      {/* Buy Now Alert */}
      {isBuyNow && (
        <Alert status='info' mb={6} borderRadius='lg'>
          <AlertIcon />
          <Box>
            <Text fontWeight='bold'>Express Checkout</Text>
            <Text fontSize='sm'>
              You're purchasing this item directly. This won't affect your cart.
            </Text>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
        {/* Left Column - Shipping and Payment */}
        <Box as='form' onSubmit={handleSubmit}>
          {/* Shipping Information */}
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
            mb={6}
          >
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
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
            mb={6}
          >
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
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
            mb={6}
          >
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
            colorScheme='teal'
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
          <Box
            bg='teal.900'
            color='white'
            p={6}
            borderRadius='lg'
            boxShadow='sm'
            mb={6}
          >
            <Heading as='h2' fontSize='xl' mb={6}>
              Order Summary
            </Heading>

            <VStack spacing={4} mb={6}>
              {itemsToProcess.map((item, index) => (
                <Flex
                  key={item._id || index}
                  width='full'
                  align='center'
                  gap={3}
                >
                  {/* Product Image */}
                  <Box
                    w='50px'
                    h='50px'
                    bg='gray.100'
                    borderRadius='md'
                    overflow='hidden'
                    flexShrink={0}
                  >
                    {item.product.images && item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        w='full'
                        h='full'
                        objectFit='cover'
                      />
                    ) : (
                      <Box bg='gray.200' w='full' h='full' />
                    )}
                  </Box>

                  {/* Product Details */}
                  <Box flex='1'>
                    <Text fontSize='sm' noOfLines={1} mb={1}>
                      {item.product.name}
                    </Text>
                    <Text fontSize='xs' color='gray.300'>
                      Qty: {item.quantity}
                    </Text>
                  </Box>

                  {/* Price */}
                  <Text fontWeight='medium'>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </Flex>
              ))}
            </VStack>

            <VStack spacing={3} borderTopWidth='1px' pt={4} mb={6}>
              <Flex width='full' justify='space-between'>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
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
                <Text>${totalAmount.toFixed(2)}</Text>
              </Flex>
            </VStack>

            <Button
              variant='outline'
              colorScheme='white'
              width='full'
              onClick={handleBackNavigation}
            >
              {isBuyNow ? 'Back to Product' : 'Back to Cart'}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
