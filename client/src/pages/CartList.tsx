import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  useCart,
  useRemoveFromCart,
  useUpdateQuantity,
  useClearCart,
} from '@/context/CartContextService';
import { AddIcon, DeleteIcon, MinusIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

export default function CartList() {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError } = useCart();
  const updateQuantity = useUpdateQuantity();
  const removeItem = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  if (isLoading) {
    return (
      <Flex justify='center' align='center' minH='200px'>
        <Spinner size='lg' color='teal.500' />
        <Text ml={4}>Loading cart...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box color='red.500' p={4}>
        Error: {isError}
      </Box>
    );
  }

  return (
    <Box p={3}>
      {cart?.items.length === 0 ? (
        <VStack spacing={6} py={8} textAlign='center'>
          <Text
            fontWeight='bold'
            fontSize={{ base: 'lg', md: 'xl' }}
            color='teal.600'
          >
            Your cart is empty
          </Text>
          <Button
            colorScheme='teal'
            onClick={() => navigate('/shop')}
            size={{ base: 'md', md: 'lg' }}
            w={{ base: 'full', sm: 'auto' }}
            maxW='250px'
          >
            Back To Shop
          </Button>
        </VStack>
      ) : (
        <>
          {/* Cart Header */}
          <VStack spacing={3} mb={4}>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight='bold'
              color='teal.700'
              textAlign='center'
            >
              Cart ({cart?.totalItems} items)
            </Text>
            <Button
              colorScheme='red'
              variant='outline'
              size='sm'
              onClick={() => clearCartMutation.mutate()}
              leftIcon={<DeleteIcon />}
              w='full'
              maxW='200px'
            >
              Clear Cart
            </Button>
          </VStack>

          {/* Cart Items */}
          <Stack spacing={4} mb={6}>
            {cart?.items.map((item) => (
              <VStack
                key={item.product._id}
                bg='teal.900'
                color='white'
                borderRadius='lg'
                overflow='hidden'
                spacing={0}
              >
                {/* Product Info Section */}
                <Flex w='100%' align='center' p={3} gap={3}>
                  <Image
                    src={
                      item.product.images?.length > 0
                        ? item.product.images[0]
                        : '/placeholder-image.jpg'
                    }
                    alt={item.product.name}
                    boxSize={{ base: '60px', md: '70px' }}
                    objectFit='cover'
                    borderRadius='md'
                    border='2px solid'
                    borderColor='teal.400'
                    flexShrink={0}
                  />

                  <VStack align='flex-start' spacing={1} flex={1} minW={0}>
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight='semibold'
                      noOfLines={2}
                      wordBreak='break-word'
                    >
                      {item.product.name}
                    </Text>

                    <HStack spacing={1}>
                      {Array(5)
                        .fill('')
                        .map((_, i) => {
                          const rating =
                            Number(item.product.averageRating) || 0;
                          return (
                            <StarIcon
                              key={i}
                              color={
                                i < Math.floor(rating)
                                  ? 'yellow.400'
                                  : 'gray.400'
                              }
                              boxSize={3}
                            />
                          );
                        })}
                    </HStack>

                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight='bold'
                      color='teal.200'
                    >
                      ${item.product.price} each
                    </Text>
                  </VStack>

                  <IconButton
                    aria-label='Remove item'
                    colorScheme='red'
                    icon={<DeleteIcon />}
                    size='sm'
                    onClick={() => removeItem.mutate(item.product._id)}
                    flexShrink={0}
                  />
                </Flex>

                <Divider borderColor='teal.700' />

                {/* Quantity and Total Section */}
                <Flex
                  w='100%'
                  align='center'
                  p={3}
                  direction={{ base: 'column', sm: 'row' }}
                  gap={4}
                >
                  {/* Quantity Controls */}
                  <VStack spacing={2} w={{ base: 'full', sm: 'auto' }}>
                    <Text fontSize='xs' fontWeight='medium' color='teal.200'>
                      Quantity
                    </Text>
                    <ButtonGroup
                      size='sm'
                      isAttached
                      variant='outline'
                      w='fit-content'
                    >
                      <IconButton
                        aria-label='Decrease quantity'
                        icon={<MinusIcon />}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                        color='white'
                        borderColor='teal.400'
                        _hover={{ bg: 'teal.800' }}
                      />
                      <Button
                        size='sm'
                        color='white'
                        borderColor='teal.400'
                        minW='50px'
                        cursor='default'
                      >
                        {item.quantity}
                      </Button>
                      <IconButton
                        aria-label='Increase quantity'
                        icon={<AddIcon />}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        color='white'
                        borderColor='teal.400'
                        _hover={{ bg: 'teal.800' }}
                      />
                    </ButtonGroup>
                  </VStack>

                  {/* Subtotal */}
                  <VStack spacing={1} align='center' flex={1}>
                    <Text fontSize='xs' color='teal.200' fontWeight='medium'>
                      Subtotal
                    </Text>
                    <Text
                      fontSize={{ base: 'md', md: 'lg' }}
                      fontWeight='bold'
                      color='white'
                    >
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </VStack>
                </Flex>
              </VStack>
            ))}
          </Stack>

          {/* Cart Summary */}
          <Box bg='teal.900' color='white' borderRadius='lg' p={4} mb={4}>
            <VStack spacing={3}>
              <Flex w='100%' align='center'>
                <Text flex={1} fontSize='md' fontWeight='medium'>
                  Total Items:
                </Text>
                <Text fontSize='md' fontWeight='bold' color='teal.200'>
                  {cart?.totalItems}
                </Text>
              </Flex>

              <Divider borderColor='teal.700' />

              <Flex w='100%' align='center'>
                <Text flex={1} fontSize='lg' fontWeight='bold'>
                  Total Amount:
                </Text>
                <Text fontSize='lg' fontWeight='bold' color='teal.200'>
                  ${cart?.totalAmount.toFixed(2)}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <VStack spacing={3}>
            <Button
              variant='outline'
              colorScheme='teal'
              onClick={() => navigate('/shop')}
              size='md'
              w='full'
            >
              Continue Shopping
            </Button>

            <Button
              colorScheme='teal'
              onClick={() => navigate('/checkout')}
              size='lg'
              w='full'
              fontWeight='bold'
            >
              Checkout
            </Button>
          </VStack>
        </>
      )}
    </Box>
  );
}
