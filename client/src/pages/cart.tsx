import {
  Box,
  Button,
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
  useUpdateCartQuantity,
  useClearCart,
} from '@/context/CartContext';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';

export default function CartComponent() {
  const { data: cart, isLoading, isError } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  if (isLoading) {
    return (
      <Flex justify='center' align='center' minH='200px'>
        <Spinner size='lg' />
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
    <Box>
      {cart?.items.length === 0 ? (
        <Text>Your cart is empty</Text>
      ) : (
        <>
          <Stack spacing={6}>
            {cart?.items.map((item) => {
              console.log('Cart item:', item); // Add this line
              console.log('Product in cart:', item.product); // Add this line
              console.log('Average rating:', item.product.averageRating);
              return (
                <VStack key={item.product._id} bg='white'>
                  <Flex w='100%' align='center' justify='space-between' p={3}>
                    <Image
                      src={
                        item.product.images?.length > 0
                          ? item.product.images[0]
                          : '/placeholder-image.jpg'
                      }
                      alt={item.product.name}
                      boxSize='70px'
                      objectFit='cover'
                      borderRadius='md'
                      border='2px solid red'
                    />

                    <VStack spacing={2} flex={1} mx={3} align='flex-start'>
                      <Text
                        isTruncated
                        fontSize='sm'
                        maxW='120px'
                        fontWeight='medium'
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
                                    : 'gray.300'
                                }
                                boxSize={3}
                              />
                            );
                          })}
                      </HStack>
                    </VStack>

                    <IconButton
                      aria-label='delete item'
                      colorScheme='red'
                      icon={<DeleteIcon />}
                      size='xs'
                      onClick={() => removeItem.mutate(item.product._id)}
                    />
                  </Flex>
                  <Box flex='1'>
                    <Text>${item.product.price}</Text>
                    <Flex mt={2} align='center' gap={2}>
                      <Button
                        size='sm'
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Text fontWeight='bold'>{item.quantity}</Text>
                      <Button
                        size='sm'
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </Flex>
                  </Box>
                </VStack>
              );
            })}
          </Stack>

          <Box mt={8} borderTopWidth='1px' pt={4}>
            <Text fontWeight='medium'>Total Items: {cart?.totalItems}</Text>
            <Text fontWeight='medium' mb={4}>
              Total Amount: ${cart?.totalAmount.toFixed(2)}
            </Text>
            <Button
              colorScheme='red'
              onClick={() => clearCartMutation.mutate()}
            >
              Clear Cart
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
