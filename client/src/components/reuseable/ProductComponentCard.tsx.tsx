import type { Product } from '@/type/product';
import { Box, Flex, IconButton, Image, Text, VStack } from '@chakra-ui/react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';

type ProductProps = {
  product: Product;
};

export default function ProductComponentCard({ product }: ProductProps) {
  return (
    <Box p={4} textAlign='center' cursor='pointer' role='group'>
      <Image
        src={product.images[0]}
        alt={product.name}
        objectFit='cover'
        borderRadius='md'
        mb={3}
        fallbackSrc='/placeholder-image.jpg'
        transition='transform 0.3s ease'
        _groupHover={{ transform: 'scale(1.05)' }}
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
