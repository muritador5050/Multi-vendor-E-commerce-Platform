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
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAddToCart } from '../context/CartContextService';

import type { Product } from '@/type/product';
import { ReviewComponent } from './ReviewComponent';
import { useCurrentUser } from '@/context/AuthContextService';

export default function ProductDetail(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const product: Product = location.state?.product || null;
  const [quantity, setQuantity] = useState(1);
  const currentUser = useCurrentUser();
  const toast = useToast();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      addToCartMutation.mutate({
        productId: product._id,
        quantity: quantity,
      });
      toast({
        title: 'Product Added',
        description: 'Product added to cart!',
        status: 'success',
        position: 'top-right',
        duration: 2000,
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

  const handleBuyNow = () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a purchase.',
        status: 'warning',
        position: 'top-right',
      });
      navigate('/my-account');
      return;
    }

    navigate('/checkout', {
      state: {
        buyNow: true,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          quantity: quantity,
        },
      },
    });
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.quantityInStock) {
      setQuantity(() => quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(() => quantity - 1);
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
    <Box p={8}>
      {/* Product Information Section */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={10}
        align='flex-start'
        mb={8}
      >
        <Box flex='1'>
          <Image
            src={
              product.images && product.images.length > 0
                ? product.images[0]
                : product.images[1]
            }
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
              onClick={handleDecreaseQuantity}
              size='sm'
              disabled={quantity <= 1}
            />
            <Text>{quantity}</Text>
            <IconButton
              icon={<AddIcon />}
              aria-label='Increase quantity'
              onClick={handleIncreaseQuantity}
              size='sm'
            />
          </Flex>

          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button colorScheme='teal' onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button colorScheme='orange' onClick={handleBuyNow}>
              Buy Now
            </Button>
          </Stack>

          <Flex>
            <Text fontWeight='bold'>Available Stock:</Text>
            <Text ml={2} color='green.500'>
              {product.quantityInStock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </Flex>
        </Stack>
      </Flex>

      <Divider mb={8} />

      {/* Tabbed Content Section */}
      <Tabs colorScheme='teal'>
        <TabList>
          <Tab>Description</Tab>
          <Tab>Reviews</Tab>
          <Tab>Specifications</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box>
              <Heading size='md' mb={4}>
                Product Description
              </Heading>
              <Text lineHeight='tall'>
                {product.description ||
                  'No detailed description available for this product.'}
              </Text>
            </Box>
          </TabPanel>

          <TabPanel>
            <ReviewComponent productId={product._id} />
          </TabPanel>

          <TabPanel>
            <Box>
              <Heading size='md' mb={4}>
                Specifications
              </Heading>
              <VStack align='start' spacing={2}>
                <HStack>
                  <Text fontWeight='semibold' minW='120px'>
                    Product ID:
                  </Text>
                  <Text>{product._id}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight='semibold' minW='120px'>
                    Category:
                  </Text>
                  <Text>{product.category.name || 'N/A'}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight='semibold' minW='120px'>
                    Stock:
                  </Text>
                  <Text>{product.quantityInStock} units</Text>
                </HStack>
                {/* Add more specifications as needed */}
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
