import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Image,
  Stack,
  Text,
  Button,
} from '@chakra-ui/react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/type/product';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({
  product,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      alert('Product added to cart!');
      onClose();
    } catch (error) {
      console.log(error);
      alert('Failed to add product to cart');
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.quantityInStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Calculate discounted price
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='5xl'
      motionPreset='slideInTop'
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            <Image
              src={product.images[0] || '/placeholder-image.jpg'}
              alt={product.name}
              borderRadius='md'
              maxW='300px'
            />
            <Stack spacing={4}>
              <Text fontWeight='bold' fontSize='lg'>
                {product.name}
              </Text>
              <Text color='gray.600'>Store: {product.vendor.name}</Text>
              <Flex align='center' gap={2}>
                {product.discount > 0 && (
                  <Text color='gray.400' as='s'>
                    ${product.price.toFixed(2)}
                  </Text>
                )}
                <Text fontSize='xl' color='teal.600' fontWeight='bold'>
                  ${discountedPrice.toFixed(2)}
                </Text>
                {product.discount > 0 && (
                  <Text color='red.500' fontSize='sm'>
                    ({product.discount}% off)
                  </Text>
                )}
              </Flex>
              <Text>
                Rating: {product.averageRating} ⭐ ({product.totalReviews}{' '}
                reviews)
              </Text>
              <Text
                color={product.quantityInStock > 0 ? 'green.500' : 'red.500'}
              >
                {product.quantityInStock > 0
                  ? `${product.quantityInStock} in stock`
                  : 'Out of stock'}
              </Text>
              <Text color='gray.600'>{product.description}</Text>

              {/* Quantity Control */}
              <Flex align='center' gap={4}>
                <Text fontWeight='medium'>Quantity:</Text>
                <Button
                  size='sm'
                  onClick={decrementQuantity}
                  isDisabled={quantity <= 1}
                >
                  –
                </Button>
                <Text fontSize='lg'>{quantity}</Text>
                <Button
                  size='sm'
                  onClick={incrementQuantity}
                  isDisabled={quantity >= product.quantityInStock}
                >
                  +
                </Button>
              </Flex>
            </Stack>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Close
          </Button>
          <Button
            variant='solid'
            colorScheme='teal'
            onClick={handleAddToCart}
            isDisabled={product.quantityInStock === 0}
          >
            Add to Cart
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
