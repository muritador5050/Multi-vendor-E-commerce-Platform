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
import { useCart, useUpdateQuantity } from '@/context/CartContextService';
import { AddIcon, MinusIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProp {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProp) {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError } = useCart();
  const updateQuantity = useUpdateQuantity();

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
          <Button
            bg='black'
            color='white'
            _hover={{ bg: 'black' }}
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
                <VStack key={item.product._id} bg='teal.900'>
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
                      border='2px solid gray'
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
                        color={'white'}
                        onClick={() =>
                          updateQuantity.mutate({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                      />
                      <Button size='xs' color={'white'}>
                        {item.quantity}
                      </Button>
                      <IconButton
                        aria-label='Add quantity'
                        icon={<AddIcon />}
                        color={'white'}
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

          <Box w='100%' bg='teal.900' mt={8} p={3}>
            <Flex align='center' justify='space-between'>
              <Text fontWeight='light' fontSize='sm'>
                Total Items:
              </Text>
              <Text fontWeight='bold' fontSize='xs' color='blue.600' ml={1}>
                {cart?.totalItems}
              </Text>
            </Flex>
            <Flex align='center' justify='space-between'>
              <Text fontWeight='light' fontSize='sm'>
                Sub Total:
              </Text>
              <Text fontWeight='bold' fontSize='xs' color='red' ml={1}>
                ${cart?.totalAmount.toFixed(2)}
              </Text>
            </Flex>
          </Box>

          <Divider />
          <Box bg='teal.900' my={5}>
            <Text textAlign='center' fontFamily='cursive' mb={3}>
              Payment Details
            </Text>
            <Flex w='100%' p={3}>
              <ButtonGroup>
                <Button
                  variant='outline'
                  fontSize='xs'
                  colorScheme='white'
                  px='30px'
                  onClick={() => {
                    setTimeout(() => navigate('/cart'), 100);
                    onClose();
                  }}
                >
                  View Cart
                </Button>
                <Button
                  colorScheme='blackAlpha'
                  fontSize='xs'
                  px='30px'
                  onClick={() => {
                    setTimeout(() => navigate('/checkout'), 100);
                    onClose();
                  }}
                >
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
