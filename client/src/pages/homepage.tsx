import React, { useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import PaypalIcon from '../assets/8666366_paypal_icon.svg';
import ProductComponentCard from '@/components/reuseable/ProductComponentCard.tsx';
import { useCategories } from '@/context/CategoryContextService';
import {
  Truck,
  DollarSign,
  Headset,
  Star,
  Bell,
  Bike,
  Camera,
  Laptop,
  Settings,
  Wrench,
  House,
  TimerReset,
  Smartphone,
  Briefcase,
  Gamepad2,
  LetterText,
  Footprints,
  BanknoteArrowUp,
  Shirt,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useProducts,
  useProductsByCategory,
} from '@/context/ProductContextService';
import ProductQuickView from '@/components/ProductQuickView';
import type { Product } from '@/type/product';

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    Accessories: Star,
    Art: LetterText,
    Audio: Bell,
    Bike: Bike,
    Cameras: Camera,
    'Computer & Laptops': Laptop,
    'Book & Media': Bell,
    'Drill Machine': Settings,
    'Hand Tool': Wrench,
    'Health & Beauty': BanknoteArrowUp,
    'Home & Garden': House,
    'Clothing & Fashion': Shirt,
    Smartphone: Smartphone,
    Tool: Wrench,
    'Tool Case': Briefcase,
    'Video Games': Gamepad2,
    'Sport & Outdoors': Footprints,
    Watches: TimerReset,
  };

  return iconMap[categoryName] || Star;
};

// Get category color
const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    Accessories: 'red.500',
    Art: 'green.500',
    Audio: 'yellow.500',
    Bikes: 'pink.500',
    Camera: 'gray.500',
    Laptop: 'blue.500',
    'Drill Machine': 'red.500',
    'Hand Tools': 'pink.500',
    'Home Appliances': 'yellow.500',
    Movies: 'pink.500',
    'Smart Watches': 'gray.500',
    Smartphone: 'black',
    Tools: 'green.500',
    'Tool Bag': 'yellow.700',
    'Video Games': 'purple.500',
    Headphone: 'yellow.700',
  };

  return colorMap[categoryName] || 'gray.500';
};

function HomePage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: productsData } = useProducts();
  const { data: bikeCategory } = useProductsByCategory('bike', {
    limit: 5,
  });
  const { data: artCategory } = useProductsByCategory('art', {
    limit: 5,
  });
  const { data: toolsCategory } = useProductsByCategory('drill-machine', {
    limit: 5,
  });

  const { data: smartphoneCategory } = useProductsByCategory('smartphone', {
    limit: 5,
  });

  const { data: categoryResponse } = useCategories();
  const categories = categoryResponse?.categories || [];
  const products = productsData?.products || [];
  const bikeProducts = bikeCategory?.products || [];
  const artProducts = artCategory?.products || [];
  const toolsProducts = toolsCategory?.products || [];
  const smartPhoneProducts = smartphoneCategory?.products || [];
  // Create a motion component for Box
  const MotionBox = motion.create(Box);

  // Handle quick view
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    onOpen();
  };

  // Close quick view
  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    onClose();
  };

  return (
    <Box display='grid' gap={6} p={{ sm: 2, md: 6 }}>
      <Grid
        templateAreas={{
          base: `"unset"`,
          md: `
      "header header side"
      "header header sider"
      "foot footer footest"
    `,
        }}
        templateColumns={{ base: 'unset', md: '1fr 1fr 1fr' }}
        templateRows={{
          base: 'unset',
          md: 'auto auto auto',
        }}
        gap={5}
      >
        <GridItem bg='red.500' area={{ md: 'header' }}>
          <Stack
            position='relative'
            direction='row'
            justifyContent='center'
            alignItems='center'
          >
            <Flex
              direction='column'
              gap={3}
              pl={4}
              justifyContent={{ base: 'center' }}
              alignItems={{ base: 'center', md: 'revert' }}
              position={{ base: 'absolute', md: 'revert' }}
              zIndex={{ base: 1, md: 'none' }}
            >
              <Text color='white' fontSize='larger'>
                Get 40% off
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Keeping your ears safe and music loud
              </Text>
              <Text color='white'>Fulfill your music needs</Text>
              <Button w='fit-content'>Shop Now</Button>
            </Flex>

            <Image
              src='	https://wpthemes.themehunk.com/multivendor-mania/wp-content/uploads/sites/229/2022/03/sliderw.png'
              alt='mutilvendor-img'
            />
          </Stack>
        </GridItem>
        <GridItem p={3} bg='blue' area={{ md: 'side' }}>
          <HStack alignItems='center'>
            <Flex
              direction='column'
              gap={3}
              position={{ md: 'absolute', lg: 'revert' }}
            >
              <Text color='white' fontSize='larger'>
                New iPhone
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Be limitless <br /> or go home
              </Text>
            </Flex>

            <Image
              src='/elegant-smartphone-composition-removebg-preview.png'
              alt='phone'
              boxSize='200px'
            />
          </HStack>
        </GridItem>
        <GridItem p={3} bg='orange.500' area={{ md: 'sider' }}>
          <HStack alignItems='center'>
            <Flex
              direction='column'
              gap={3}
              position={{ md: 'absolute', lg: 'revert' }}
            >
              <Text color='white' fontSize='larger'>
                House Hold
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Drill like a pro
              </Text>
            </Flex>
            <Image
              src='/view-3d-graphic-drill-removebg-preview.png'
              alt='drill'
              objectFit='cover'
              boxSize='200px'
            />
          </HStack>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'foot' }}>
          <HStack alignItems='center'>
            <Flex
              direction='column'
              gap={3}
              position={{ md: 'absolute', lg: 'revert' }}
            >
              <Text fontSize='larger'>At lowest price</Text>
              <Text fontWeight='semibold' fontSize='3xl'>
                Art and Accessories
              </Text>
              <Button
                w='fit-content'
                bg='yellow.500'
                color='white'
                _hover={{ bg: 'yellow.50' }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Shop Now
              </Button>
            </Flex>
            <Image
              src='/abstract-dadaism-concept.jpg'
              alt='art'
              objectFit='cover'
              boxSize='200px'
            />
          </HStack>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'footer' }}>
          <HStack alignItems='center'>
            <Flex
              direction='column'
              gap={3}
              position={{ md: 'absolute', lg: 'revert' }}
            >
              <Text fontSize='larger'>20% off</Text>
              <Text fontWeight='semibold' fontSize='3xl'>
                Laptop and computers
              </Text>
              <Button
                w='fit-content'
                bg='yellow.500'
                color='white'
                _hover={{ bg: 'yellow.50' }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Shop now
              </Button>
            </Flex>
            <Image
              src='/view-3d-laptop-device-with-screen-keyboard-removebg-preview.png'
              alt='laptop'
              boxSize={{ base: '150px', md: '200px' }}
            />
          </HStack>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'footest' }}>
          <HStack alignItems='center'>
            <Flex
              direction='column'
              gap={3}
              position={{ md: 'absolute', lg: 'revert' }}
            >
              <Text fontSize='larger'>New Look</Text>
              <Text fontWeight='semibold' fontSize='3xl'>
                Go on ride <br /> hurry
              </Text>
              <Button
                w='fit-content'
                bg='yellow.500'
                color='white'
                _hover={{ colorScheme: 'yellow' }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Shop now
              </Button>
            </Flex>
            <Image
              src='/close-up-bike-indoor-removebg-preview.png'
              alt='bicycle'
              boxSize='200px'
            />
          </HStack>
        </GridItem>
      </Grid>

      <Box bg='white' overflowX='hidden' py={6} px={4} my={6}>
        <Text mb={4} fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
          Shop by category
        </Text>
        <Flex overflow='hidden' position='relative' gap={4}>
          {categories.map((category, index) => {
            const CategoryIcon = getCategoryIcon(category.name);
            const color = getCategoryColor(category.name);
            return (
              <MotionBox
                key={category._id}
                animate={{ x: ['100%', '-100%'] }}
                transition={{
                  duration: 10,
                  delay: index * 0.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Stack
                  key={category._id}
                  as={ReactRouterLink}
                  to={`/products/category/${category.name
                    .toLowerCase()
                    .replace(/ & | /g, '-')}`}
                  borderRadius='xl'
                  h={{ base: '150px', md: '250px' }}
                  align='center'
                  justify='center'
                  flex='0 0 auto'
                  minW={{ base: '50%', sm: '33.33%', md: '200px' }}
                  border='1px solid'
                  borderColor='gray.200'
                  p={4}
                  bg='gray.50'
                  boxShadow='md'
                >
                  <Center
                    w='80px'
                    h='80px'
                    borderRadius='full'
                    border='2px solid green'
                  >
                    <IconButton
                      icon={<CategoryIcon />}
                      aria-label={category.name}
                      variant='ghost'
                      color={color}
                      size='lg'
                    />
                  </Center>
                  <Text fontSize='sm' fontWeight='medium'>
                    {category.name}
                  </Text>
                </Stack>
              </MotionBox>
            );
          })}
        </Flex>
      </Box>
      <Box bg='white' p={6}>
        <Flex
          align='center'
          gap={{ base: 3 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Explore in bikes
          </Text>
          <Spacer />
          <Button bg='black' color='white'>
            View all
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
          {bikeProducts.map((product) => (
            <ProductComponentCard
              key={product._id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </SimpleGrid>
      </Box>
      <Box bg='white' p={6}>
        <Flex
          align='center'
          gap={{ base: 3 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Daily Use Tools
          </Text>
          <Spacer />
          <Button bg='black' color='white'>
            View all
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
          {toolsProducts.map((product) => (
            <ProductComponentCard
              key={product._id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </SimpleGrid>
      </Box>
      <Box>
        <Image
          src='/spacejoy-9M66C_w_ToM-unsplash.jpg'
          alt='Photo'
          objectFit='cover'
        />
      </Box>
      <Box bg='white' p={6}>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            For art lovers
          </Text>
          <Spacer />
          <Button bg='black' color='white'>
            View all
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
          {artProducts.map((product) => (
            <ProductComponentCard
              key={product._id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </SimpleGrid>
      </Box>
      <Box bg='white' p={6}>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Smartphones and Electronics
          </Text>
          <Spacer />
          <Button bg='black' color='white'>
            View all
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
          {smartPhoneProducts.map((product) => (
            <ProductComponentCard
              key={product._id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Box bg='white' p={6}>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Most Popular
          </Text>
          <Spacer />
          <Button bg='black' color='white'>
            View all
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mt={6}>
          {products.map((product) => (
            <ProductComponentCard
              key={product._id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </SimpleGrid>
      </Box>
      <SimpleGrid
        mb={6}
        py={6}
        bg='white'
        spacing={3}
        columns={{ base: 2, md: 4 }}
      >
        <VStack gap={3}>
          <IconButton
            aria-label='Truck'
            color='yellow.500'
            variant='ghost'
            icon={<Truck size={80} />}
            mb={6}
          />
          <Text fontWeight='bold'>Free Shipping</Text>
          <Text fontWeight='semibold' color='yellow.500'>
            From $350
          </Text>
        </VStack>
        <VStack>
          <IconButton
            aria-label='Dollar Sign'
            color='yellow.500'
            variant='ghost'
            icon={<DollarSign size={80} />}
            mb={6}
          />
          <Text fontWeight='bold'>Money Guarantee</Text>
          <Text fontWeight='semibold' color='yellow.500'>
            30 Days Back
          </Text>
        </VStack>
        <VStack>
          <IconButton
            aria-label='Paypal'
            icon={<img src={PaypalIcon} alt='paypal' />}
            variant='ghost'
            color='yellow.500'
            mb={6}
          />
          <Text fontWeight='bold'>Payment Method</Text>
          <Text fontWeight='semibold' color='yellow.500'>
            Secure Payment
          </Text>
        </VStack>
        <VStack>
          <IconButton
            aria-label='Headset'
            color='yellow.500'
            variant='ghost'
            icon={<Headset size={80} />}
            mb={6}
          />
          <Text fontWeight='bold'>Support 24x7</Text>
          <Text fontWeight='semibold' color='yellow.500'>
            Black Bread
          </Text>
        </VStack>
      </SimpleGrid>
      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isOpen}
        onClose={handleCloseQuickView}
      />
    </Box>
  );
}

export default HomePage;
