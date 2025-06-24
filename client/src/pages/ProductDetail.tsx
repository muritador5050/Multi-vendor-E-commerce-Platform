import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Image,
  Stack,
  Text,
  Alert,
  AlertIcon,
  //   Spinner,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

export default function ProductDetail(): React.ReactElement {
  const location = useLocation();
  const { addToCart } = useCart();
  const product = location.state?.product || null;

  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
    }
  };

  if (!product) {
    return (
      <Flex justify='center' align='center' h='300px'>
        <Alert status='error' maxW='md'>
          <AlertIcon />
          Product not found or not passed correctly.
        </Alert>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      p={8}
      gap={10}
      align='flex-start'
    >
      <Box flex='1'>
        <Image
          src={product.image}
          alt={product.name}
          borderRadius='lg'
          maxH='400px'
          objectFit='cover'
          w='100%'
        />
      </Box>

      <Stack flex='1' spacing={5}>
        <Heading>{product.name}</Heading>
        <Text color='gray.500'>
          {product.description || 'No description available'}
        </Text>
        <Text fontSize='2xl' fontWeight='bold' color='teal.500'>
          $
          {typeof product.price === 'string'
            ? product.price
            : product.price.toFixed(2)}
        </Text>

        <Flex align='center' gap={4}>
          <Text>Quantity:</Text>
          <IconButton
            icon={<MinusIcon />}
            aria-label='Decrease quantity'
            onClick={handleDecrease}
            size='sm'
          />
          <Text>{quantity}</Text>
          <IconButton
            icon={<AddIcon />}
            aria-label='Increase quantity'
            onClick={handleIncrease}
            size='sm'
          />
        </Flex>

        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
          <Button colorScheme='teal' onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button colorScheme='orange'>Buy Now</Button>
        </Stack>
      </Stack>
    </Flex>
  );
}
