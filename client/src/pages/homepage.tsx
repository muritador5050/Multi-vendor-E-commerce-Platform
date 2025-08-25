import React, { useState } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
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
import ProductComponentCard from '@/components/ProductCard/ProductComponentCard.tsx';
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
  const navigate = useNavigate();
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
    <Box display='grid' gap={6} p={2}>
      <Grid
        templateAreas={{
          base: `"unset"`,
          md: `
          "header header"
          "side sider"
          "foot foot"
          "footer footer"
          "footest footest"
      `,
          lg: `
      "header header side"
      "header header sider"
      "foot footer footest"
    `,
        }}
        templateColumns={{
          base: 'unset',
          md: '1fr 1fr',
          lg: '1fr 1fr ',
        }}
        templateRows={{
          base: 'unset',
          md: '1fr 1fr',
          lg: 'auto auto auto',
        }}
        gap={5}
      >
        <GridItem bg='teal.400' area={{ md: 'header' }}>
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
              <Text
                color='white'
                fontWeight='semibold'
                fontSize={{ base: 'xl', md: '3xl' }}
              >
                Keeping your ears safe and music loud
              </Text>
              <Text color='white'>Fulfill your music needs</Text>
              <Button w='fit-content'>Shop Now</Button>
            </Flex>

            <Image src='/phone.png' alt='accessories' />
          </Stack>
        </GridItem>
        <GridItem p={3} bg='yellow.600' area={{ md: 'side' }}>
          <Flex alignItems='center' justify='space-around'>
            <Stack>
              <Text color='white' fontSize='larger'>
                New iPhone
              </Text>
              <Text
                color='white'
                fontWeight='semibold'
                fontSize={{ base: 'xl', md: '3xl' }}
              >
                Be limitless <br /> or go home
              </Text>
            </Stack>

            <Image
              src='/elegant-smartphone-composition-removebg-preview.png'
              alt='phone'
              boxSize='200px'
            />
          </Flex>
        </GridItem>
        <GridItem p={3} bg='orange.500' area={{ md: 'sider' }}>
          <Flex alignItems='center' justify='space-around'>
            <Stack>
              <Text color='white' fontSize='larger'>
                House Hold
              </Text>
              <Text
                color='white'
                fontWeight='semibold'
                fontSize={{ base: 'xl', md: '3xl' }}
              >
                Drill like a pro
              </Text>
            </Stack>
            <Image
              src='/view-3d-graphic-drill-removebg-preview.png'
              alt='drill'
              objectFit='cover'
              boxSize='200px'
            />
          </Flex>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'foot' }}>
          <Flex alignItems='center' justify='space-around'>
            <Stack>
              <Text fontSize='larger'>At lowest price</Text>
              <Text fontWeight='semibold' fontSize={{ base: 'xl', md: '3xl' }}>
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
            </Stack>
            <Image
              src='/abstract-dadaism-concept.jpg'
              alt='art'
              objectFit='cover'
              boxSize='200px'
            />
          </Flex>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'footer' }}>
          <Flex alignItems='center' justify='space-around'>
            <Stack>
              <Text fontSize='larger'>20% off</Text>
              <Text fontWeight='semibold' fontSize={{ base: 'xl', md: '3xl' }}>
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
            </Stack>
            <Image
              src='/view-3d-laptop-device-with-screen-keyboard-removebg-preview.png'
              alt='laptop'
              boxSize={{ base: '150px', md: '200px' }}
            />
          </Flex>
        </GridItem>
        <GridItem p={3} bg='white' area={{ md: 'footest' }}>
          <Flex alignItems='center' justify='space-around'>
            <Stack>
              <Text fontSize='larger'>New Look</Text>
              <Text fontWeight='semibold' fontSize={{ base: 'xl', md: '3xl' }}>
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
            </Stack>
            <Image
              src='/close-up-bike-indoor-removebg-preview.png'
              alt='bicycle'
              boxSize='200px'
            />
          </Flex>
        </GridItem>
      </Grid>

      <Box bg='white' overflowX='hidden' py={6} px={4} my={6}>
        <Text
          mb={4}
          fontWeight='bold'
          fontSize={{ base: 'xl', md: '3xl' }}
          fontFamily='cursive'
        >
          Shop by category
        </Text>
        <Stack
          overflow='auto'
          display={'grid'}
          gridTemplateColumns={{ base: 'auto auto', md: 'repeat(8, auto)' }}
          gap={4}
        >
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.name);
            const color = getCategoryColor(category.name);
            return (
              <Stack
                key={category._id}
                as={ReactRouterLink}
                to={`/products/category/${category.name
                  .toLowerCase()
                  .replace(/ & | /g, '-')}`}
                maxH='100px'
                align='center'
                justify='center'
                _hover={{
                  bg: 'gray.200',
                  borderRadius: 'full',
                  boxShadow: 'lg',
                }}
              >
                <IconButton
                  icon={<CategoryIcon />}
                  aria-label={category.name}
                  variant='ghost'
                  color={color}
                  size='lg'
                />
                <Text fontSize='sm' fontWeight='medium'>
                  {category.name}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </Box>
      <Box bg='white' p={6}>
        <Flex
          align='center'
          gap={{ base: 3 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text
            fontWeight='bold'
            fontSize={{ base: 'xl', md: '3xl' }}
            fontFamily='cursive'
          >
            Explore in bikes
          </Text>
          <Spacer />
          <Button
            colorScheme='teal'
            onClick={() => navigate(`/products/category/bike`)}
          >
            View all
          </Button>
        </Flex>
        {bikeProducts.length === 0 && (
          <Center>
            <Text fontSize={'2xl'} fontWeight={'medium'} color={'gray'}>
              No product for this category yet please come back shortly
            </Text>
          </Center>
        )}
        <SimpleGrid columns={{ sm: 2, md: 5 }} spacing={4} mt={6}>
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
          <Text
            fontWeight='bold'
            fontSize={{ base: 'xl', md: '3xl' }}
            fontFamily='cursive'
          >
            Daily Use Tools
          </Text>
          <Spacer />
          <Button
            colorScheme='teal'
            onClick={() => navigate(`/products/category/tool`)}
          >
            View all
          </Button>
        </Flex>
        {toolsProducts.length === 0 && (
          <Center>
            <Text fontSize={'2xl'} fontWeight={'medium'} color={'gray'}>
              No product for this category yet please come back shortly
            </Text>
          </Center>
        )}

        <SimpleGrid columns={{ sm: 2, md: 5 }} spacing={4} mt={6}>
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
          sizes='200px'
        />
      </Box>
      <Box bg='white' p={6}>
        <Flex>
          <Text
            fontWeight='bold'
            fontSize={{ base: 'xl', md: '3xl' }}
            fontFamily='cursive'
          >
            For art lovers
          </Text>
          <Spacer />
          <Button
            colorScheme='teal'
            onClick={() => navigate(`/products/category/art`)}
          >
            View all
          </Button>
        </Flex>

        {artProducts.length === 0 && (
          <Center>
            <Text fontSize={'2xl'} fontWeight={'medium'} color={'gray'}>
              No product for this category yet please come back shortly
            </Text>
          </Center>
        )}
        <SimpleGrid columns={{ sm: 2, md: 5 }} spacing={4} mt={6}>
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
          <Text
            fontWeight='bold'
            fontSize={{ base: 'xl', md: '3xl' }}
            fontFamily='cursive'
          >
            Smartphones and Electronics
          </Text>
          <Spacer />
          <Button
            colorScheme='teal'
            onClick={() => navigate(`/products/category/accessories`)}
          >
            View all
          </Button>
        </Flex>
        {smartPhoneProducts.length === 0 && (
          <Center>
            <Text fontSize={'2xl'} fontWeight={'medium'} color={'gray'}>
              No product for this category yet please come back shortly
            </Text>
          </Center>
        )}
        <SimpleGrid columns={{ sm: 2, md: 5 }} spacing={4} mt={6}>
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
          <Text
            fontWeight='bold'
            fontSize={{ base: 'xl', md: '3xl' }}
            fontFamily='cursive'
          >
            Most Popular
          </Text>
          <Spacer />
          <Button colorScheme='teal' onClick={() => navigate(`/shop`)}>
            View all
          </Button>
        </Flex>
        {products.length === 0 && (
          <Center>
            <Text fontSize={'2xl'} fontWeight={'medium'} color={'gray'}>
              No product yet please come back shortly
            </Text>
          </Center>
        )}
        <SimpleGrid columns={{ sm: 2, md: 5 }} spacing={4} mt={6}>
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
