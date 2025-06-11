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
  Spacer,
  Divider,
  InputGroup,
  Input,
} from '@chakra-ui/react';
import { base } from 'framer-motion/client';

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
      <Flex direction={{ base: 'column', md: 'row' }}>
        <Stack order={{ base: 1, md: 0 }} bg='tomato'>
          <Box>
            <Text>PRICE FILTER</Text>
            <Divider />
            <InputGroup display='flex' justifyContent='space-between'>
              <Input h={12} w={12} />
              <Input h={12} w={12} />
            </InputGroup>
          </Box>
          <Box>
            <Text>FILTER BY STOCK STATUS</Text>
            <Stack spacing={5} direction='column'>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text>FILTER BY FRAME SIZE</Text>
            <Stack spacing={5} direction='column'>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text>FILTER BY TYRE SIZE</Text>
            <Stack spacing={5} direction='column'>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text>FILTER BY STRAP TYPE</Text>
            <Stack spacing={5} direction='column'>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
              <Checkbox>Checkbox</Checkbox>
            </Stack>
          </Box>
        </Stack>
        <Stack order={{ base: 0, md: 1 }} bg='papayawhip'>
          <Flex justifyContent='space-between' alignItems='center'>
            <Text>Showing 1–16 of 46 results</Text>
            <Select placeholder='Select option' w='20%'>
              <option value='option1'>Option 1</option>
              <option value='option2'>Option 2</option>
              <option value='option3'>Option 3</option>
              <option value='option3'>Option 3</option>
            </Select>
          </Flex>
        </Stack>
      </Flex>
    </Box>
  );
}
