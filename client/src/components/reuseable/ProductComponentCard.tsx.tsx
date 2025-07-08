import { useAddToCart } from '@/context/CartContextService';
import type { Product } from '@/type/product';
import {
  Box,
  Flex,
  IconButton,
  Image,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProductProps = {
  product: Product;
  onQuickView: (product: Product) => void;
};

export default function ProductComponentCard({
  product,
  onQuickView,
}: ProductProps) {
  const navigate = useNavigate();
  const toast = useToast();

  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      addToCartMutation.mutate({
        productId: product._id,
        quantity: 1,
      });
      toast({
        title: 'Product Added',
        description: 'Product added to cart!',
        status: 'success',
        duration: 2000,
        position: 'top',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Failed operation',
        description: 'Failed to add product to cart',
        status: 'error',
        duration: 2000,
        position: 'top',
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };
  const handleNavigateToProduct = () => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  return (
    <Box p={4} textAlign='center' cursor='pointer' role='group'>
      <Image
        src={
          product.images.length > 0
            ? product.images[0]
            : '/placeholder-image.jpg'
        }
        alt={product.name}
        objectFit='cover'
        borderRadius='md'
        width='100%'
        height='250px'
        mb={3}
        transition='transform 0.3s ease'
        _groupHover={{ transform: 'scale(1.05)' }}
        onClick={handleNavigateToProduct}
      />
      <Flex justify='center' gap={2}>
        <IconButton
          aria-label='ShoppingCart'
          color='black'
          variant='ghost'
          icon={<ShoppingCart />}
          bg='gray.100'
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform='translateY(100%)'
          opacity={0}
          transition='all 0.4s ease-in-out'
          _groupHover={{
            transform: 'translateY(0)',
            opacity: 1,
          }}
          onClick={handleAddToCart}
        />
        <IconButton
          aria-label='Heart'
          color='black'
          variant='ghost'
          icon={<Heart />}
          bg='gray.100'
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform='translateY(100%)'
          opacity={0}
          transition='all 0.5s ease-in-out'
          _groupHover={{
            transform: 'translateY(0)',
            opacity: 1,
          }}
        />
        <IconButton
          aria-label='Eye'
          color='black'
          variant='ghost'
          icon={<Eye />}
          bg='gray.100'
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform='translateY(100%)'
          opacity={0}
          transition='all 0.6s ease-in-out'
          _groupHover={{
            transform: 'translateY(0)',
            opacity: 1,
          }}
          onClick={handleQuickView}
        />
      </Flex>
      <VStack position='relative' zIndex={5}>
        <Text fontWeight='semibold' fontSize='lg' noOfLines={2}>
          {product.name}
        </Text>
        <Text fontSize='xl' fontWeight='bold' color='green.500'>
          ${product.price.toFixed(2)}
        </Text>
        {product.averageRating && (
          <Text fontSize='sm' color='gray.600'>
            {product.averageRating}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
