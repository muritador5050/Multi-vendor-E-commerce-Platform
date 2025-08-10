import {
  TableContainer,
  Table,
  Th,
  Td,
  Tr,
  Thead,
  Tbody,
  Flex,
  Image,
  IconButton,
  Tooltip,
  Text,
  Box,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import {
  useRemoveFromWishlist,
  useWishlist,
} from '@/context/WishlistContextService';
import { useMutationState } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X as Clear } from 'lucide-react';

function WishList() {
  const navigate = useNavigate();
  const { data: wishlist, isLoading, error } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const pendingRemoval = useMutationState({
    filters: { mutationKey: ['remove-from-wishlist'], status: 'pending' },
  });

  // Handle loading state
  if (isLoading) {
    return (
      <Flex justify='center' align='center' py={8}>
        <Spinner size='lg' />
        <Text ml={4}>Loading wishlist...</Text>
      </Flex>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert status='error'>
        <AlertIcon />
        Failed to load wishlist. Please try again.
      </Alert>
    );
  }

  // Handle empty wishlist or undefined data
  if (!wishlist?.data || wishlist.data.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <Text color='gray.500' fontSize='lg'>
          Your wishlist is empty.
        </Text>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>
              <Flex align='center' gap={2}>
                <Box as='span' w='24px' />
                <Box as='span' w='20px' />
                <Text>Product name</Text>
              </Flex>
            </Th>
            <Th>Unit price</Th>
            <Th>Stock status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {wishlist.data.map((item) => {
            // Safely access nested properties
            const product = item?.product;
            if (!product) return null;

            const productImage = product.images?.[0];
            const productPrice = product.price || 0;
            const isInStock = product.isActive ?? false;

            // Check if this item is being removed optimistically
            const isBeingRemoved = pendingRemoval.some(
              (mutation) => mutation.variables === product._id
            );

            return (
              <Tr
                key={item._id || product._id}
                // Add visual feedback for optimistic removal
                opacity={isBeingRemoved ? 0.5 : 1}
                transition='opacity 0.2s ease'
              >
                <Td>
                  <Flex align='center' gap={2}>
                    <Tooltip label='Remove from wishlist'>
                      <IconButton
                        aria-label='remove-product'
                        icon={<Clear color='red' size='12' />}
                        variant='ghost'
                        size='xs'
                        isLoading={isBeingRemoved}
                        onClick={() => removeFromWishlist.mutate(product._id)}
                      />
                    </Tooltip>
                    {productImage && (
                      <Image
                        src={productImage}
                        alt={product.name || 'Product image'}
                        boxSize='50px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='/placeholder-image.png'
                      />
                    )}
                    <Text>{product.name || 'Unknown Product'}</Text>
                  </Flex>
                </Td>
                <Td>${productPrice.toFixed(2)}</Td>
                <Td>
                  <Text color={isInStock ? 'green.500' : 'red.500'}>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </Td>
                <Td>
                  <Text
                    color='blue.500'
                    cursor='pointer'
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => {
                      navigate(`/product/${product._id}`, {
                        state: { product },
                      });
                    }}
                  >
                    View product
                  </Text>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default WishList;
