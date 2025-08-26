import {
  Box,
  Stack,
  Image,
  Button,
  Text,
  Card,
  CardBody,
  CardFooter,
  ButtonGroup,
  useToast,
} from '@chakra-ui/react';
import { Heart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAddToCart, useIsInCart } from '@/context/CartContextService';
import type { Product } from '@/type/product';
import {
  useAddToWishlist,
  useWishlistStatus,
  useRemoveFromWishlist,
} from '@/context/WishlistContextService';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({
  product,
  onQuickView,
}: ProductCardProps) {
  const navigate = useNavigate();
  const toast = useToast();

  const addToCartMutation = useAddToCart();
  const isInCart = useIsInCart(product._id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const { data: wishlistStatusResponse } = useWishlistStatus(product._id);

  const isInWishlist = wishlistStatusResponse?.data || false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate(
      {
        productId: product._id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success!',
            description: 'Product added to cart successfully!',
            status: 'success',
            duration: 3000,
            position: 'top-right',
            isClosable: true,
          });
        },
        onError: (error) => {
          console.error('Failed to add to cart:', error);
          toast({
            title: 'Error',
            description: 'Failed to add product to cart. Please try again.',
            status: 'error',
            duration: 4000,
            position: 'top-right',
            isClosable: true,
          });
        },
      }
    );
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const mutation = isInWishlist ? removeFromWishlist : addToWishlist;
    const successMessage = isInWishlist
      ? 'Product removed from wishlist successfully!'
      : 'Product added to wishlist successfully!';

    mutation.mutate(product._id, {
      onSuccess: () => {
        toast({
          title: isInWishlist ? 'Removed!' : 'Added!',
          description: successMessage,
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      },
      onError: (error) => {
        console.error('Failed to update wishlist:', error);
        toast({
          title: 'Error',
          description: `Failed to ${
            isInWishlist ? 'remove from' : 'add to'
          } wishlist. Please try again.`,
          status: 'error',
          duration: 4000,
          position: 'top-right',
          isClosable: true,
        });
      },
    });
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

  // Calculate discounted price
  const discount = product.discount ?? 0;
  const discountedPrice = discount
    ? product.price - (product.price * discount) / 100
    : product.price;

  const getProductImage = () => {
    if (
      !product.images ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
      return '/placeholder-image.jpg';
    }
    return product.images[0];
  };

  return (
    <Card
      bg='white'
      boxShadow='none'
      border='none'
      cursor='pointer'
      overflow='hidden'
      role='group'
      _hover={{
        md: {
          bg: 'white',
          boxShadow: '2xl',
          pb: '28',
        },
        position: 'relative',
      }}
      transition='all 0.3s ease-in-out'
    >
      <CardBody onClick={handleNavigateToProduct}>
        <Box position='relative'>
          <Image
            src={getProductImage()}
            alt={product.name || 'Product image'}
            borderRadius='lg'
            objectFit='cover'
            width='100%'
            height='250px'
            fallbackSrc='/placeholder-image.jpg'
          />
          <Button
            onClick={handleQuickView}
            position='absolute'
            inset={0}
            margin='auto'
            maxW='fit-content'
            fontSize='xs'
            fontWeight='thin'
            colorScheme='yellow'
            color='white'
            opacity={{ md: 0 }}
            transition='all 0.4s ease-in-out'
            _groupHover={{
              opacity: 1,
            }}
          >
            Quick View
          </Button>
        </Box>
        <Stack mt={3} textAlign='center'>
          <Text fontWeight='medium' fontFamily='cursive'>
            {product.name}
          </Text>
          <Box>
            <Text color='gray.500' as={product.discount ? 's' : undefined}>
              ${product.price.toFixed(2)}
            </Text>
            {discount > 0 && (
              <Text color='teal.600' fontWeight='bold'>
                ${discountedPrice.toFixed(2)}
              </Text>
            )}
          </Box>
        </Stack>
      </CardBody>
      <CardFooter
        sx={{
          position: { md: 'absolute' },
          transform: { md: 'translateY(100%)' },
          zIndex: { md: 1 },
          opacity: { md: 0 },
          bottom: { md: 0 },
          left: { md: 0 },
        }}
        w='100%'
        bg='white'
        transition='all 0.4s ease-in-out'
        _groupHover={{
          transform: 'translateY(0)',
          opacity: 1,
        }}
      >
        <ButtonGroup
          display='flex'
          flexDirection='column'
          gap={4}
          justifyContent='center'
          w='100%'
          transition='transform 0.3s ease-in-out'
        >
          <Button
            onClick={handleAddToCart}
            variant='solid'
            colorScheme='blue'
            rightIcon={isInCart ? <Check size={16} /> : undefined}
          >
            {isInCart ? 'Added to Cart' : 'Add to Cart'}
          </Button>
          <Button
            variant='ghost'
            colorScheme={isInWishlist ? 'red' : 'blue'}
            leftIcon={
              isInWishlist ? (
                <Heart size={16} fill='red' color='red' />
              ) : (
                <Heart size={16} />
              )
            }
            onClick={handleWishlistToggle}
          >
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
