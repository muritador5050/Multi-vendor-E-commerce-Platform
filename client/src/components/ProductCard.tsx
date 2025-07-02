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
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAddToCart } from '@/context/CartContext';
import type { Product } from '@/type/product';

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

  // Calculate discounted price
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

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
            src={product.images[0] || '/placeholder-image.jpg'}
            alt={product.name}
            borderRadius='lg'
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
            {product.discount > 0 && (
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
            isDisabled={addToCartMutation.isPending}
            variant='solid'
            colorScheme='blue'
          >
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button variant='ghost' colorScheme='blue' leftIcon={<Heart />}>
            Wishlist
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
