import {
  Image,
  Text,
  Badge,
  Button,
  IconButton,
  VStack,
  HStack,
  Tag,
  Tr,
  Td,
} from '@chakra-ui/react';
import { Eye, Trash2 } from 'lucide-react';
import type { Product } from '@/type/product';
import {
  calculateDiscountedPrice,
  formatPrice,
  getStatusColor,
  getStockStatus,
  renderRating,
} from './UtilityFunc';

export const ProductRow = ({
  product,
  onView,
  onDelete,
  onToggleStatus,
  isTogglingStatus,
}: {
  product: Product;
  onView: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (productId: string) => void;
  isTogglingStatus: boolean;
}) => {
  const stockStatus = getStockStatus(product.quantityInStock);
  const discount = product.discount ?? 0;
  const averageRating = product.averageRating ?? 0;

  return (
    <Tr _hover={{ bg: 'gray.50' }}>
      <Td>
        <HStack spacing={3}>
          <Image
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            w='50px'
            h='50px'
            objectFit='cover'
            borderRadius='md'
            fallbackSrc='/placeholder-image.jpg'
          />
          <VStack align='start' spacing={1}>
            <Text fontWeight='medium' noOfLines={1} maxW='200px'>
              {product.name}
            </Text>
            <Text fontSize='sm' color='gray.500' noOfLines={1} maxW='200px'>
              {product.description}
            </Text>
            {discount > 0 && (
              <Badge colorScheme='red' size='sm'>
                -{discount}%
              </Badge>
            )}
          </VStack>
        </HStack>
      </Td>
      <Td>
        <Tag size='sm' colorScheme='blue' variant='subtle'>
          {product.category?.name || 'Uncategorized'}
        </Tag>
      </Td>
      <Td>
        <VStack align='start' spacing={1}>
          {discount > 0 ? (
            <>
              <Text fontWeight='bold' color='green.500'>
                {formatPrice(calculateDiscountedPrice(product.price, discount))}
              </Text>
              <Text
                fontSize='xs'
                textDecoration='line-through'
                color='gray.400'
              >
                {formatPrice(product.price)}
              </Text>
            </>
          ) : (
            <Text fontWeight='bold' color='green.500'>
              {formatPrice(product.price)}
            </Text>
          )}
        </VStack>
      </Td>
      <Td>
        <VStack align='start' spacing={1}>
          <Badge colorScheme={stockStatus.color} size='sm'>
            {product.quantityInStock}
          </Badge>
          <Text fontSize='xs' color={`${stockStatus.color}.500`}>
            {stockStatus.text}
          </Text>
        </VStack>
      </Td>
      <Td>
        <VStack align='start' spacing={2}>
          <Badge
            colorScheme={getStatusColor(product.isActive)}
            size='sm'
            p={2}
            borderRadius='xl'
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            size='xs'
            colorScheme={product.isActive ? 'red' : 'green'}
            variant='outline'
            isLoading={isTogglingStatus}
            loadingText={product.isActive ? 'Deactivating...' : 'Activating...'}
            onClick={() => onToggleStatus(product._id)}
          >
            {product.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </VStack>
      </Td>
      <Td>
        <VStack align='start' spacing={1}>
          {averageRating > 0 && renderRating(averageRating)}
          <Text fontSize='xs' color='gray.500'>
            {product.totalReviews || 0} reviews
          </Text>
        </VStack>
      </Td>
      <Td>
        <VStack align='start' spacing={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {product.vendor?.name || 'Unknown Vendor'}
          </Text>
          <Text fontSize='xs' color='gray.500'>
            {product.vendor?.email || 'No Email'}
          </Text>
        </VStack>
      </Td>
      <Td>
        <HStack spacing={1}>
          <IconButton
            aria-label='View product details'
            icon={<Eye size={14} />}
            size='sm'
            variant='ghost'
            onClick={() => onView(product)}
          />
          <IconButton
            aria-label='Delete product'
            icon={<Trash2 size={14} />}
            size='sm'
            variant='ghost'
            colorScheme='red'
            onClick={() => onDelete(product)}
          />
        </HStack>
      </Td>
    </Tr>
  );
};
