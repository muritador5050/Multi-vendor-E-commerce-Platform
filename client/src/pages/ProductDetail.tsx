// import React, { useState } from 'react';
// import {
//   Box,
//   Button,
//   Flex,
//   Heading,
//   IconButton,
//   Image,
//   Stack,
//   Text,
//   Alert,
//   AlertIcon,
//   useToast,
//   //   Spinner,
// } from '@chakra-ui/react';
// import { AddIcon, MinusIcon } from '@chakra-ui/icons';
// import { useLocation } from 'react-router-dom';
// import { useAddToCart, useUpdateQuantity } from '../context/CartContext';
// import type { Product } from '@/type/product';

// interface CartItem {
//   product: Product;
//   quantity: number;
//   _id?: string;
// }

// export default function ProductDetail(): React.ReactElement {
//   const location = useLocation();
//   const product:CartItem[] = location.state?.product || null;
//   const [quantity, setQuantity] = useState(1);
//   const toast = useToast();
//   const addToCartMutation = useAddToCart();
//   const updateQuantity = useUpdateQuantity();

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       addToCartMutation.mutate({
//         productId: product._id,
//         quantity: 1,
//       });
//       toast({
//         title: 'Product Added',
//         description: 'Product added to cart!',
//         status: 'success',
//         duration: 2000,
//         position: 'top',
//       });
//     } catch (error) {
//       console.log(error);
//       toast({
//         title: 'Failed operation',
//         description: 'Failed to add product to cart',
//         status: 'error',
//         duration: 2000,
//         position: 'top',
//       });
//     }
//   };

//   if (!product) {
//     return (
//       <Flex justify='center' align='center' h='300px'>
//         <Alert status='error' maxW='md'>
//           <AlertIcon />
//           Product not found or not passed correctly.
//         </Alert>
//       </Flex>
//     );
//   }

//   return (
//     <Flex
//       direction={{ base: 'column', md: 'row' }}
//       p={8}
//       gap={10}
//       align='flex-start'
//     >
//       <Box flex='1'>
//         <Image
//           src={
//             product.images && product.images.length > 0
//               ? product.images[0]
//               : product.images[1]
//           }
//           alt={product.name}
//           borderRadius='lg'
//           maxH='400px'
//           objectFit='cover'
//           w='100%'
//         />
//       </Box>

//       <Stack flex='1' spacing={5}>
//         <Heading>{product.name}</Heading>
//         <Text color='gray.500'>
//           {product.description || 'No description available'}
//         </Text>
//         <Text fontSize='2xl' fontWeight='bold' color='teal.500'>
//           $
//           {typeof product.price === 'string'
//             ? product.price
//             : product.price.toFixed(2)}
//         </Text>

//         <Flex align='center' gap={4}>
//           <Text>Quantity:</Text>
//           <IconButton
//             icon={<MinusIcon />}
//             aria-label='Decrease quantity'
//             onClick={() =>
//               updateQuantity.mutate({
//                 productId: product._id,
//                 quantity: quantity - 1,
//               })
//             }
//             size='sm'
//           />
//           <Text>{quantity}</Text>
//           <IconButton
//             icon={<AddIcon />}
//             aria-label='Increase quantity'
//             onClick={() =>
//               updateQuantity.mutate({
//                 productId: product._id,
//                 quantity: quantity + 1,
//               })
//             }
//             size='sm'
//           />
//         </Flex>

//         <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
//           <Button colorScheme='teal' onClick={handleAddToCart}>
//             Add to Cart
//           </Button>
//           <Button colorScheme='orange'>Buy Now</Button>
//         </Stack>
//       </Stack>
//     </Flex>
//   );
// }

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
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import { useAddToCart } from '../context/CartContext';
import type { Product } from '@/type/product';

export default function ProductDetail(): React.ReactElement {
  const location = useLocation();
  const product: Product = location.state?.product || null;
  const [quantity, setQuantity] = useState(1);
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
    <Flex
      direction={{ base: 'column', md: 'row' }}
      p={8}
      gap={10}
      align='flex-start'
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
            disabled={quantity <= 1} // Disable when quantity is 1
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
          <Button colorScheme='orange'>Buy Now</Button>
        </Stack>
        <Flex>
          <Text fontWeight='bold'>Available Stock:</Text>
          <Text ml={2} color='green.500'>
            {product.quantityInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </Text>
        </Flex>
      </Stack>
    </Flex>
  );
}
