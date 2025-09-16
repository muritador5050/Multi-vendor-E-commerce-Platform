import {
  Box,
  Stack,
  Image,
  Button,
  Text,
  Card,
  CardBody,
  CardFooter,
  useToast,
  AspectRatio,
  Badge,
  HStack,
  Center,
} from '@chakra-ui/react';
import { Heart, Check, Eye, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAddToCart, useIsInCart } from '@/context/CartContextService';
import type { Product } from '@/type/product';
import {
  useAddToWishlist,
  useWishlistStatus,
  useRemoveFromWishlist,
} from '@/context/WishlistContextService';
import { useIsAuthenticated } from '@/context/AuthContextService';

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
  const { isAuthenticated } = useIsAuthenticated();
  const addToCartMutation = useAddToCart();
  const isInCart = useIsInCart(product._id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const { data: wishlistStatusResponse } = useWishlistStatus(product._id);
  const isInWishlist = wishlistStatusResponse?.data || false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/my-account');
      return;
    }

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

    if (!isAuthenticated) {
      navigate('/my-account');
      return;
    }

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
    navigate(`/product/${product._id}`);
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
      borderRadius={{ base: 'md', md: 'lg' }}
      overflow='hidden'
      cursor='pointer'
      role='group'
      border={{ base: '1px solid', md: 'none' }}
      borderColor='gray.100'
      boxShadow={{ base: 'sm', md: 'none' }}
      _hover={{
        md: {
          boxShadow: '2xl',
          transform: 'translateY(-4px)',
        },
      }}
      transition='all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      maxW='100%'
      w='100%'
    >
      <CardBody p={{ base: 2, sm: 3, md: 4 }} onClick={handleNavigateToProduct}>
        {/* Image Container */}
        <Box position='relative' mb={{ base: 2, md: 3 }}>
          {product.images && product.images[0] ? (
            <AspectRatio ratio={1}>
              <Image
                src={getProductImage()}
                alt={product.name || 'Product image'}
                borderRadius={{ base: 'sm', md: 'md' }}
                objectFit='cover'
                fallbackSrc='/placeholder-image.jpg'
                transition='transform 0.3s ease'
                _groupHover={{
                  md: { transform: 'scale(1.05)' },
                }}
              />
            </AspectRatio>
          ) : (
            <Center h='full' color='gray.300'>
              <Package size={32} />
            </Center>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <Badge
              position='absolute'
              top={2}
              left={2}
              colorScheme='red'
              fontSize={{ base: '2xs', sm: 'xs' }}
              px={2}
              py={1}
              borderRadius='md'
            >
              -{discount}%
            </Badge>
          )}

          {/* Wishlist Button - Always visible on mobile, hover on desktop */}
          <Button
            onClick={handleWishlistToggle}
            position='absolute'
            top={2}
            right={2}
            size={{ base: 'sm', md: 'md' }}
            colorScheme={'gray'}
            variant={isInWishlist ? 'solid' : 'ghost'}
            opacity={{ base: 1, md: 0 }}
            bg='whiteAlpha.900'
            _groupHover={{ opacity: 1 }}
            transition='opacity 0.3s ease'
            minW='auto'
            h='auto'
            p={2}
          >
            <Heart
              size={16}
              fill={isInWishlist ? 'red' : 'none'}
              color={isInWishlist ? 'white' : 'gray'}
            />
          </Button>

          {/* Quick View Button - Desktop only */}
          <Button
            onClick={handleQuickView}
            position='absolute'
            bottom={2}
            left='50%'
            transform='translateX(-50%)'
            size='sm'
            colorScheme='blue'
            leftIcon={<Eye size={14} />}
            opacity={{ base: 0, md: 0 }}
            display={{ base: 'none', md: 'flex' }}
            _groupHover={{ opacity: 1 }}
            transition='opacity 0.3s ease'
            fontSize='xs'
          >
            Quick View
          </Button>
        </Box>

        {/* Product Info */}
        <Stack spacing={{ base: 1, md: 2 }} textAlign='center'>
          <Text
            fontWeight='medium'
            fontSize={{ base: 'sm', md: 'md' }}
            lineHeight='short'
            noOfLines={2}
            minH={{ base: '32px', md: '40px' }}
            fontFamily='inherit'
          >
            {product.name}
          </Text>

          {/* Price Section */}
          <HStack justify='center' spacing={2}>
            {discount > 0 ? (
              <>
                <Text
                  color='gray.400'
                  fontSize={{ base: 'xs', md: 'sm' }}
                  textDecoration='line-through'
                >
                  ${product.price.toFixed(2)}
                </Text>
                <Text
                  color='red.500'
                  fontWeight='bold'
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  ${discountedPrice.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text
                color='gray.700'
                fontWeight='semibold'
                fontSize={{ base: 'sm', md: 'md' }}
              >
                ${product.price.toFixed(2)}
              </Text>
            )}
          </HStack>
        </Stack>
      </CardBody>

      {/* Footer with Add to Cart - Always visible on mobile */}
      <CardFooter
        p={{ base: 2, sm: 3, md: 4 }}
        pt={{ base: 0, md: 4 }}
        display={{ base: 'block', md: 'block' }}
        opacity={{ base: 1, md: 0 }}
        transform={{ base: 'none', md: 'translateY(10px)' }}
        _groupHover={{
          md: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        }}
        transition='all 0.3s ease'
      >
        <Button
          onClick={handleAddToCart}
          w='100%'
          size={{ base: 'sm', md: 'md' }}
          colorScheme={isInCart ? 'green' : 'blue'}
          leftIcon={isInCart ? <Check size={16} /> : undefined}
          fontSize={{ base: 'xs', md: 'sm' }}
          isLoading={addToCartMutation.isPending}
          loadingText='Adding...'
        >
          {isInCart ? 'Added to Cart' : 'Add to Cart'}
        </Button>

        {/* Mobile Quick View Button */}
        <Button
          onClick={handleQuickView}
          w='100%'
          mt={2}
          size='sm'
          variant='outline'
          colorScheme='blue'
          leftIcon={<Eye size={14} />}
          fontSize='xs'
          display={{ base: 'flex', md: 'none' }}
        >
          Quick View
        </Button>
      </CardFooter>
    </Card>
  );
}
