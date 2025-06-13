import React from 'react';
import {
  Box,
  Button,
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
} from '@chakra-ui/react';
import ProductCard from '@/components/reuseable/productCard';
import { categories } from '@/components/reuseable/categories';

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
    <Box display='grid' gap={6}>
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
                _hover='none'
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
                _hover='none'
              >
                Shop now
              </Button>
            </Flex>
            <Image
              src='/view-3d-laptop-device-with-screen-keyboard-removebg-preview.png'
              alt='laptop'
              boxSize='200px'
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
                _hover='none'
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

      <Box bg='white' py={6} my={6}>
        <Text mb={4} fontWeight='bold' fontSize='3xl' fontFamily='cursive'>
          Shop by category
        </Text>
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(8, 1fr)' }}
          templateRows={{ base: 'repeat(8, 1fr)', md: 'repeat(2, 1fr)' }}
          rowGap={10}
        >
          {categories.map((category) => (
            <GridItem key={category.id} textAlign='center'>
              <IconButton
                icon={category.icon}
                aria-label='Favorites'
                variant='ghost'
                colorScheme='white'
              />
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
