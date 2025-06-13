import React from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react';
import ProductCard from '@/components/reuseable/productCard';

const categories = [
  { id: 1, name: 'A', icon: '📦' }, // Packages
  { id: 2, name: 'B', icon: '📚' }, // Books
  { id: 3, name: 'C', icon: '💻' }, // Computers
  { id: 4, name: 'D', icon: '🎧' }, // Audio
  { id: 5, name: 'E', icon: '👕' }, // Clothing
  { id: 6, name: 'F', icon: '🛋️' }, // Furniture
  { id: 7, name: 'G', icon: '🍔' }, // Food
  { id: 8, name: 'H', icon: '🏀' }, // Sports
  { id: 9, name: 'I', icon: '🍼' }, // Baby
  { id: 10, name: 'J', icon: '🧴' }, // Skincare
  { id: 11, name: 'K', icon: '📱' }, // Phones
  { id: 12, name: 'L', icon: '🎮' }, // Gaming
  { id: 13, name: 'M', icon: '🚗' }, // Automotive
  { id: 14, name: 'N', icon: '🎨' }, // Art
  { id: 15, name: 'O', icon: '💡' }, // Electronics
  { id: 16, name: 'P', icon: '🍷' }, // Drinks
  { id: 17, name: 'Q', icon: '🏡' }, // Home
  { id: 18, name: 'R', icon: '📷' }, // Cameras
  { id: 19, name: 'S', icon: '🛠️' }, // Tools
  { id: 20, name: 'T', icon: '🧸' }, // Toys
];

const dummy = [
  {
    id: 1,
    name: 'Aliquam erat volutpat',
    price: 319.0,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Premium Headphones',
    price: 199.0,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Smart Watch Pro',
    price: 249.0,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    rating: 4.3,
  },
  {
    id: 4,
    name: 'Wireless Speaker',
    price: 129.0,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    rating: 4.6,
  },
  {
    id: 5,
    name: 'Gaming Mouse',
    price: 79.0,
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    rating: 4.7,
  },
];

function HomePage() {
  return (
    <Box p={3} display='grid' gap={6}>
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
        templateRows={{ base: 'unset', md: 'auto auto auto' }}
        gap={5}
      >
        <GridItem bg='red' area={{ md: 'header' }}>
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
              zIndex={{ base: 5, md: 'none' }}
            >
              <Text color='white' fontSize='larger'>
                Get 40% off
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Keeping your ears safe and music loud
              </Text>
              <Text color='white'>Fulfill your music needs</Text>
              <Button w='20%'>Shop Now</Button>
            </Flex>
            <Box
              position='relative'
              display={{ base: 'flex' }}
              justifyContent={{ base: 'center' }}
              alignItems={{ base: 'center' }}
              zIndex={{ base: 1, md: 'none' }}
            >
              <Image
                src='	https://wpthemes.themehunk.com/multivendor-mania/wp-content/uploads/sites/229/2022/03/sliderw.png'
                alt='mutilvendor-img'
              />
            </Box>
          </Stack>
        </GridItem>
        <GridItem bg='blue' area={{ md: 'side' }}>
          <Stack direction='row' align='center' justify='space-around'>
            <Flex direction='column' gap={3}>
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
          </Stack>
        </GridItem>
        <GridItem bg='green' area={{ md: 'sider' }}>
          <Stack direction='row' align='center' justify='space-around'>
            <Flex direction='column' gap={3}>
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
          </Stack>
        </GridItem>
        <GridItem bg='purple' area={{ md: 'foot' }}>
          <Stack direction='row' align='center' justify='space-around'>
            <Flex direction='column' gap={3}>
              <Text color='white' fontSize='larger'>
                At lowest price
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Art a Accessories
              </Text>
              <Button>Shop now</Button>
            </Flex>
            <Image
              src='/abstract-dadaism-concept.jpg'
              alt='art'
              objectFit='cover'
              boxSize='200px'
            />
          </Stack>
        </GridItem>
        <GridItem bg='yellow' area={{ md: 'footer' }}>
          <Stack direction='row' align='center' justify='space-around'>
            <Flex direction='column' gap={3}>
              <Text color='white' fontSize='larger'>
                20% off
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Laptop and computers
              </Text>
              <Button>Shop now</Button>
            </Flex>
            <Image
              src='/view-3d-laptop-device-with-screen-keyboard-removebg-preview.png'
              alt='laptop'
              boxSize='200px'
            />
          </Stack>
        </GridItem>
        <GridItem bg='black' area={{ md: 'footest' }}>
          <Stack direction='row' align='center' justify='space-around'>
            <Flex direction='column' gap={3}>
              <Text color='white' fontSize='larger'>
                New Look
              </Text>
              <Text color='white' fontWeight='semibold' fontSize='3xl'>
                Go on ride hurry
              </Text>
              <Button>Shop now</Button>
            </Flex>
            <Image
              src='/close-up-bike-indoor-removebg-preview.png'
              alt='bicycle'
              boxSize='200px'
            />
          </Stack>
        </GridItem>
      </Grid>

      <Box bg='wheat' my={6}>
        <Text mb={4} fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
          Shop by category
        </Text>
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(10, 1fr)' }}
          templateRows={{ base: 'repeat(10, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          {categories.map((category) => (
            <GridItem key={category.id} textAlign='center'>
              <Box>{category.icon}</Box>
              <Text>{category.name}</Text>
            </GridItem>
          ))}
        </Grid>
      </Box>
      <Box bg='purple' p={6}>
        <Flex
          align='center'
          gap={{ base: 3 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Explore in bikes
          </Text>
          <Spacer />
          <Button>View all</Button>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
          {dummy.map((dm) => (
            <ProductCard key={dm.id} product={dm} />
          ))}
        </SimpleGrid>
      </Box>
      <Box bg='brown' p={6}>
        <Flex
          align='center'
          gap={{ base: 3 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Daily Use Tools
          </Text>
          <Spacer />
          <Button>View all</Button>
        </Flex>
        <Flex>Tools</Flex>
      </Box>
      <Box>
        <Flex>PHOTOS</Flex>
      </Box>
      <Box>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            For art lovers
          </Text>
          <Spacer />
          <Button>View all</Button>
        </Flex>
        <Flex>Arts</Flex>
      </Box>
      <Box>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Electronics Items
          </Text>
          <Spacer />
          <Button>show all</Button>
        </Flex>
        <Flex>Electronics</Flex>
      </Box>
      <Box>
        <Flex>PHOTOS</Flex>
      </Box>
      <Box>
        <Flex>
          <Text fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
            Most Popular
          </Text>
          <Spacer />
          <Button>View all</Button>
        </Flex>
        <Grid>
          <GridItem></GridItem>
        </Grid>
      </Box>
      <Flex>ADVERTS</Flex>
    </Box>
  );
}

export default HomePage;
