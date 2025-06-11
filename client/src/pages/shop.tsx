import {
  Box,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
  Select,
  Text,
  SimpleGrid,
  Image,
  Button,
  HStack,
  GridItem,
} from '@chakra-ui/react';

const mockProducts = [
  {
    id: 1,
    name: 'Aliquam erat volutpat',
    price: '$319.00 – $359.00',
    originalPrice: '$399.00',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    store: 'Mania Shop',
    rating: 4.5,
    reviews: 24,
    hasVariants: true,
    onSale: true,
  },
  {
    id: 2,
    name: 'Premium Headphones',
    price: '$199.00',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    store: 'Tech Store',
    rating: 4.8,
    reviews: 156,
    hasVariants: false,
    onSale: false,
  },
  {
    id: 3,
    name: 'Smart Watch Pro',
    price: '$249.00',
    originalPrice: '$299.00',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    store: 'Gadget World',
    rating: 4.3,
    reviews: 89,
    hasVariants: true,
    onSale: true,
  },
  {
    id: 4,
    name: 'Wireless Speaker',
    price: '$129.00',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    store: 'Audio Plus',
    rating: 4.6,
    reviews: 73,
    hasVariants: false,
    onSale: false,
  },
  {
    id: 5,
    name: 'Gaming Mouse',
    price: '$79.00',
    originalPrice: '$99.00',
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    store: 'Gaming Hub',
    rating: 4.7,
    reviews: 102,
    hasVariants: true,
    onSale: true,
  },
  {
    id: 6,
    name: 'Laptop Stand',
    price: '$45.00',
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    store: 'Office Essentials',
    rating: 4.2,
    reviews: 45,
    hasVariants: false,
    onSale: false,
  },
  {
    id: 7,
    name: 'USB-C Hub',
    price: '$69.00',
    image:
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop',
    store: 'Tech Store',
    rating: 4.4,
    reviews: 67,
    hasVariants: true,
    onSale: false,
  },
  {
    id: 8,
    name: 'Bluetooth Earbuds',
    price: '$159.00',
    originalPrice: '$199.00',
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
    store: 'Audio Plus',
    rating: 4.9,
    reviews: 234,
    hasVariants: true,
    onSale: true,
  },
];

const categories = ['Electronics', 'Clothing', 'Furniture'];

export default function ShopPage() {
  return (
    <Box p={6}>
      <Grid
        h='200px'
        templateRows='repeat(2, 1fr)'
        templateColumns='repeat(5, 1fr)'
        gap={4}
      >
        <GridItem colSpan={1} bg='tomato'>
          sidenav
        </GridItem>
        <GridItem colSpan={4} bg='papayawhip'>
          main conttent
        </GridItem>
      </Grid>
    </Box>
  );
}
