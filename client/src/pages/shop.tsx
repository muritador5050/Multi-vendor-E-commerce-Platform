import { useState } from 'react';
import {
  Box,
  Checkbox,
  Stack,
  Flex,
  Select,
  Text,
  SimpleGrid,
  Image,
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Card,
  CardBody,
  CardFooter,
  ButtonGroup,
  VStack,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { Heart } from 'lucide-react';

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

export default function ShopPage() {
  const format = (val: number) => `$${val}`;
  const parse = (val: string) => val.replace(/^\$/, '');
  const [sliderValue, setSliderValue] = useState<number[]>([5, 650]);

  // Handle slider change
  const handleSliderChange = (val: number[]) => {
    setSliderValue(val);
  };

  // Handle min price input change
  const handleMinChange = (valueString: string) => {
    const numValue = parseInt(parse(valueString)) || 5;
    // Ensure min doesn't exceed max and stays within bounds
    const clampedValue = Math.max(5, Math.min(numValue, sliderValue[1] - 5));
    setSliderValue([clampedValue, sliderValue[1]]);
  };

  // Handle max price input change
  const handleMaxChange = (valueString: string) => {
    const numValue = parseInt(parse(valueString)) || 650;
    // Ensure max doesn't go below min and stays within bounds
    const clampedValue = Math.min(650, Math.max(numValue, sliderValue[0] + 5));
    setSliderValue([sliderValue[0], clampedValue]);
  };

  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} gap={5}>
        <Stack
          position='static'
          left={0}
          flex={0.75}
          order={{ base: 1, md: 0 }}
          bg='tomato'
          p={4}
          spacing={5}
        >
          <Box display='flex' flexDirection='column' gap={3}>
            <Text fontSize='xl' fontWeight='bold'>
              PRICE FILTER
            </Text>
            <RangeSlider
              aria-label={['min', 'max']}
              defaultValue={[5, 650]}
              min={5}
              max={650}
              step={5}
              onChange={handleSliderChange}
            >
              <RangeSliderTrack bg='gray.500'>
                <RangeSliderFilledTrack bg='black' />
              </RangeSliderTrack>
              <RangeSliderThumb boxSize={5} borderColor='black' index={0} />
              <RangeSliderThumb boxSize={5} borderColor='black' index={1} />
            </RangeSlider>

            <Flex justifyContent='space-between'>
              <VStack>
                <NumberInput
                  min={5}
                  max={645}
                  onChange={handleMinChange}
                  value={format(sliderValue[0])}
                >
                  <NumberInputField h={12} w={20} p={2} textAlign='center' />
                </NumberInput>
                <Text>Min. Price</Text>
              </VStack>
              <VStack>
                <NumberInput
                  min={10}
                  max={650}
                  onChange={handleMaxChange}
                  value={format(sliderValue[1])}
                >
                  <NumberInputField h={12} w={20} p={2} textAlign='center' />
                </NumberInput>
                <Text>Max. Price</Text>
              </VStack>
            </Flex>
            <Text float={'right'}>Reset</Text>
          </Box>
          <Box>
            <Text fontSize='xl' fontWeight='bold'>
              FILTER BY STOCK STATUS
            </Text>
            <Stack direction='column'>
              <Checkbox>In Stock</Checkbox>
              <Checkbox>Out Stock</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text fontSize='xl' fontWeight='bold'>
              FILTER BY FRAME SIZE
            </Text>
            <Stack direction='column'>
              <Checkbox>15 Inch</Checkbox>
              <Checkbox>17 Inch</Checkbox>
              <Checkbox>19 Inch</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text fontSize='xl' fontWeight='bold'>
              FILTER BY TYRE SIZE
            </Text>
            <Stack direction='column'>
              <Checkbox>60 Cm</Checkbox>
              <Checkbox>75 Cm</Checkbox>
            </Stack>
          </Box>
          <Box>
            <Text fontSize='xl' fontWeight='bold'>
              FILTER BY STRAP TYPE
            </Text>
            <Stack direction='column'>
              <Checkbox>Chain</Checkbox>
              <Checkbox>Leather</Checkbox>
              <Checkbox>Robber</Checkbox>
            </Stack>
          </Box>
        </Stack>
        <Stack flex={3} order={{ base: 0, md: 1 }} p={4} bg='papayawhip'>
          <Flex justifyContent='space-between' alignItems='center'>
            <Text>Showing 1–16 of 46 results</Text>
            <Select placeholder='Select option' w='20%'>
              <option value='option1'>Option 1</option>
              <option value='option2'>Option 2</option>
              <option value='option3'>Option 3</option>
              <option value='option3'>Option 3</option>
            </Select>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {mockProducts.map((product) => (
              <Card
                key={product.id}
                bg={{ md: 'transparent' }}
                position='relative'
                cursor='pointer'
                _hover={{ md: { bg: 'white', boxShadow: 'dark-lg' } }}
                transition='background 0.3s ease-in-out'
              >
                <CardBody>
                  <Image
                    src={product.image}
                    alt={product.name}
                    borderRadius='lg'
                  />
                  <Stack spacing={3} mt={3}>
                    <Text>{product.name}</Text>
                    <Text>{product.price}</Text>
                  </Stack>
                </CardBody>
                <CardFooter
                  position='absolute'
                  bottom='-48'
                  bg={'white'}
                  w='100%'
                >
                  <ButtonGroup
                    display='flex'
                    flexDirection='column'
                    gap={4}
                    justifyContent='center'
                    w='100%'
                  >
                    <Button variant='solid' colorScheme='blue'>
                      Add to cart
                    </Button>
                    <Button
                      variant='ghost'
                      colorScheme='blue'
                      leftIcon={<Heart />}
                    >
                      Wishlist
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Flex>
    </Box>
  );
}
