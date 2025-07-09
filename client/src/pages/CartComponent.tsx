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

export default function CartComponent() {
  const { data: cart, isLoading, isError } = useCart();
  const updateQuantity = useUpdateQuantity();
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
        <Stack textAlign='center' spacing={6}>
          <Text fontWeight='bold' fontSize='xl'>
            Your cart is empty
          </Text>
          <Button bg='black' color='white' _hover={{ bg: 'black' }}>
            Back To Shop
          </Button>
        </Stack>
      ) : (
        <>
          <Stack spacing={6}>
            {cart?.items.map((item) => {
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
                      alignSelf='flex-start'
                      onClick={() => removeItem.mutate(item.product._id)}
                    />
                  </Flex>
                  <Divider />
                  <Flex w='100%' align='center' justify='space-between' p={3}>
                    <ButtonGroup
                      size='xs'
                      isAttached
                      variant='outline'
                      alignItems='center'
                    >
                      <Text fontSize='xs' fontWeight='light' mr={2}>
                        Quantity
                      </Text>
                      <IconButton
                        aria-label='Add quantity'
                        icon={<MinusIcon />}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                      />
                      <Button size='xs'>{item.quantity}</Button>
                      <IconButton
                        aria-label='Add quantity'
                        icon={<AddIcon />}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                      />
                    </ButtonGroup>
                    <Text fontWeight='extrabold' fontSize='xs'>
                      ${item.product.price}
                    </Text>
                  </Flex>
                </VStack>
              );
            })}
          </Stack>

          <Divider />

          <Flex
            w='100%'
            bg='white'
            align='center'
            justify='space-between'
            mt={8}
            p={3}
          >
            <Box>
              <Text fontWeight='light' fontSize='xs'>
                Total Items:
                <Text
                  as='span'
                  fontWeight='bold'
                  fontSize='xs'
                  color='blue.600'
                  ml={1}
                >
                  {cart?.totalItems}
                </Text>
              </Text>
              <Text fontWeight='light' fontSize='xs'>
                Sub Total:
                <Text
                  as='span'
                  fontWeight='bold'
                  fontSize='xs'
                  color='red'
                  ml={1}
                >
                  ${cart?.totalAmount.toFixed(2)}
                </Text>
              </Text>
            </Box>
            <Button
              colorScheme='red'
              size='xs'
              onClick={() => clearCartMutation.mutate()}
            >
              Clear Cart
            </Button>
          </Flex>

          <Divider />
          <Box my={5}>
            <Text textAlign='center' fontFamily='cursive' color='black' mb={3}>
              Payment Details
            </Text>
            <Flex w='100%' bg='white' p={3}>
              <ButtonGroup>
                <Button variant='outline' fontSize='xs' px='30px'>
                  View Cart
                </Button>
                <Button bg='black' color='white' fontSize='xs' px='30px'>
                  Checkout
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
}
