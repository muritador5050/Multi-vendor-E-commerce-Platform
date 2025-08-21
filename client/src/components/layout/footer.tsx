import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  // useColorModeValue,
  HStack,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg='brand.700' color='white' mt='auto'>
      <Container as={Stack} maxW='container.xl' py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {/* Company */}
          <Stack spacing={6}>
            <Text fontSize='lg' fontWeight='bold'>
              ShopApp
            </Text>
            <Text fontSize='sm'>
              Your one-stop shop for everything you need.
            </Text>
          </Stack>

          {/* Quick Links */}
          <Stack spacing={6}>
            <Text fontWeight='bold'>Quick Links</Text>
            <VStack spacing={2} align='start'>
              <Link as={RouterLink} to='/' fontSize='sm'>
                Home
              </Link>
              <Link as={RouterLink} to='/shop' fontSize='sm'>
                Products
              </Link>
              <Link as={RouterLink} to='/about' fontSize='sm'>
                About Us
              </Link>
              <Link as={RouterLink} to='/contact' fontSize='sm'>
                Contact
              </Link>
            </VStack>
          </Stack>

          {/* Support */}
          <Stack spacing={6}>
            <Text fontWeight='bold'>Support</Text>
            <VStack spacing={2} align='start'>
              <Link fontSize='sm'>Help Center</Link>
              <Link fontSize='sm'>Terms of Service</Link>
              <Link fontSize='sm'>Privacy Policy</Link>
              <Link fontSize='sm'>Returns</Link>
            </VStack>
          </Stack>

          {/* Contact Info */}
          <Stack spacing={6}>
            <Text fontWeight='bold'>Contact Us</Text>
            <VStack spacing={2} align='start'>
              <Text fontSize='sm'>Email: support@shopapp.com</Text>
              <Text fontSize='sm'>Phone: (555) 123-4567</Text>
              <Text fontSize='sm'>Address: 123 Shop Street</Text>
            </VStack>
          </Stack>
        </SimpleGrid>
      </Container>

      {/* Bottom Bar */}
      <Box borderTopWidth={1} borderStyle='solid' borderColor='gray.200'>
        <Container
          as={Stack}
          maxW='container.xl'
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text fontSize='sm'>© 2024 ShopApp. All rights reserved</Text>
          <HStack spacing={6}>
            <Link fontSize='sm'>Facebook</Link>
            <Link fontSize='sm'>Twitter</Link>
            <Link fontSize='sm'>Instagram</Link>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
