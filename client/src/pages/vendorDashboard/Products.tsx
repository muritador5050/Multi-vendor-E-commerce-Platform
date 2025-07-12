import { useProducts } from '@/context/ProductContextService';
import { Box, Image, Stack, Text } from '@chakra-ui/react';
import React from 'react';

export default function Products() {
  const { data } = useProducts();
  return (
    <Box>
      Products
      {data?.products.map((product) => (
        <Stack key={product._id}>
          <Image boxSize='xs' alt={product.name} src={product.images[0]} />
          <Text>{product.name}</Text>
          <Text>{product.description}</Text>
          <Text>{product.discount}</Text>
          <Text>{product.price}</Text>
        </Stack>
      ))}
    </Box>
  );
}
