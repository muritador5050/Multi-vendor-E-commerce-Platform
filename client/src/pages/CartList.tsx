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
    <Box p={3}>
      {cart?.items.length === 0 ? (
        <Stack textAlign='center' spacing={6}>
          <Text fontWeight='bold' fontSize='xl'>
            Your cart is empty
          </Text>
          <Button
            mx='auto'
            colorScheme='teal'
            onClick={() => navigate('/shop')}
          >
            Back To Shop
          </Button>
        </Stack>
      ) : (
        <>
          <Stack spacing={6}>
            {cart?.items.map((item) => {
              return (
                <VStack key={item.product._id} bg='teal.900' color='white'>
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
                      colorScheme='orange'
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
                        color='white'
                      />
                      <Button size='xs' color='white'>
                        {item.quantity}
                      </Button>
                      <IconButton
                        aria-label='Add quantity'
                        icon={<AddIcon />}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        color='white'
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
            bg='teal.900'
            color='white'
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
              colorScheme='orange'
              size='xs'
              onClick={() => clearCartMutation.mutate()}
            >
              Clear Cart
            </Button>
          </Flex>

          <Flex
            w='100%'
            bg='teal.900'
            color='white'
            my={5}
            p={3}
            justify='flex-end'
          >
            <Button
              colorScheme='teal'
              fontSize='xs'
              px='30px'
              onClick={() => navigate('/checkout')}
            >
              Checkout
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
}
