import { useAddToCart, useIsInCart } from '@/context/CartContextService';
import {
  useAddToWishlist,
  useWishlistStatus,
} from '@/context/WishlistContextService';
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
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProductProps = {
  product: Product;
  onQuickView: (product: Product) => void;
};

export default function ProductCardByCategory({
  product,
  onQuickView,
}: ProductProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const addToCartMutation = useAddToCart();
  const isInCart = useIsInCart(product._id);
  const addToWishlist = useAddToWishlist();
  const { data: wishlistStatusResponse } = useWishlistStatus(product._id);

  const isInWishlist = wishlistStatusResponse?.data || false;

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
        position: 'top-right',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Failed operation',
        description: 'Failed to add product to cart',
        status: 'error',
        duration: 2000,
        position: 'top-right',
      });
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      addToWishlist.mutate(product._id);
      toast({
        title: 'Product Added',
        description: 'Product added to wishlist!',
        status: 'success',
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Failed operation',
        description: 'Failed to add product to wishlist',
        status: 'error',
        duration: 2000,
        position: 'top-right',
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };
  const handleNavigateToProduct = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Box
      p={4}
      textAlign='center'
      bg={{ base: 'gray.300', md: 'white' }}
      cursor='pointer'
      role='group'
    >
      <Image
        src={product.images[0]}
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
          icon={isInCart ? <ShoppingCart color='red' /> : <ShoppingCart />}
          bg={{ base: 'white', md: 'gray.100' }}
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform={{ base: 'translateY(0)', md: 'translateY(100%)' }}
          opacity={{ base: 1, md: 0 }}
          transition='all 0.5s ease-in-out'
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
          icon={isInWishlist ? <Heart color='red' /> : <Heart />}
          bg={{ base: 'white', md: 'gray.100' }}
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform={{ base: 'translateY(0)', md: 'translateY(100%)' }}
          opacity={{ base: 1, md: 0 }}
          transition='all 0.6s ease-in-out'
          _groupHover={{
            transform: 'translateY(0)',
            opacity: 1,
          }}
          onClick={handleAddToWishlist}
        />
        <IconButton
          aria-label='Eye'
          color='black'
          variant='ghost'
          icon={<Eye />}
          bg={{ base: 'white', md: 'gray.100' }}
          borderRadius='full'
          _hover={{ bg: 'yellow.500', color: 'white' }}
          transform={{ base: 'translateY(0)', md: 'translateY(100%)' }}
          opacity={{ base: 1, md: 0 }}
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
          <Flex align='center' justify='center' gap={1}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={
                  i < Math.floor(product.averageRating as number)
                    ? 'gold'
                    : 'none'
                }
                color={
                  i < Math.floor(product.averageRating as number)
                    ? 'gold'
                    : 'gray'
                }
              />
            ))}
            <Text fontSize='sm' color='gray.600' ml={1}>
              ({product.averageRating})
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
}
