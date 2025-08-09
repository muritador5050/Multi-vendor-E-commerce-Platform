import { HStack, Text } from '@chakra-ui/react';
import { Star } from 'lucide-react';
// Utility functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculateDiscountedPrice = (price: number, discount: number) => {
  return price - (price * discount) / 100;
};

export const getStatusColor = (isActive: boolean) =>
  isActive ? 'green' : 'red';

export const getStockStatus = (stock: number) => {
  if (stock === 0) return { text: 'Out of Stock', color: 'red' };
  if (stock < 10) return { text: 'Low Stock', color: 'orange' };
  return { text: 'In Stock', color: 'green' };
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const renderRating = (rating: number) => (
  <HStack spacing={1}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < Math.floor(rating) ? '#F6AD55' : 'none'}
        color={i < Math.floor(rating) ? '#F6AD55' : '#CBD5E0'}
      />
    ))}
    <Text fontSize='xs' color={'gray.300'}>
      ({rating.toFixed(1)})
    </Text>
  </HStack>
);
