import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useCart } from '@/context/CartContext';

export default function CartComponent() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const toast = useToast();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: 'Item added to cart.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to add item to cart.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Failed to add to cart:', error);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (cart.loading) {
    return (
      <Flex justify='center' align='center' minH='200px'>
        <Spinner size='lg' />
        <Text ml={4}>Loading cart...</Text>
      </Flex>
    );
  }

  if (cart.error) {
    return (
      <Box color='red.500' p={4}>
        Error: {cart.error}
      </Box>
    );
  }

  return (
    <Box maxW='4xl' mx='auto' p={6}>
      <Heading size='lg' mb={6}>
        Shopping Cart
      </Heading>

      {cart.items.length === 0 ? (
        <Text>Your cart is empty</Text>
      ) : (
        <>
          <Stack spacing={6}>
            {cart.items.map((item) => (
              <Flex
                key={item.product._id}
                p={4}
                borderWidth='1px'
                borderRadius='lg'
                align='center'
                gap={4}
              >
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  boxSize='80px'
                  objectFit='cover'
                  borderRadius='md'
                />
                <Box flex='1'>
                  <Heading size='sm'>{item.product.name}</Heading>
                  <Text>${item.product.price}</Text>
                  <Flex mt={2} align='center' gap={2}>
                    <Button
                      size='sm'
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <Text fontWeight='bold'>{item.quantity}</Text>
                    <Button
                      size='sm'
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </Button>
                  </Flex>
                </Box>
                <Button
                  colorScheme='red'
                  variant='outline'
                  size='sm'
                  onClick={() => handleRemoveItem(item.product._id)}
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Stack>

          <Box mt={8} borderTopWidth='1px' pt={4}>
            <Text fontWeight='medium'>Total Items: {cart.totalItems}</Text>
            <Text fontWeight='medium' mb={4}>
              Total Amount: ${cart.totalAmount.toFixed(2)}
            </Text>
            <Button colorScheme='red' onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
