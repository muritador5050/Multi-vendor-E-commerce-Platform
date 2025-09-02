import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const TermsOfService = () => {
  return (
    <Container maxW='container.lg' py={8}>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center'>
          <Heading size='xl' color='teal.900' mb={4}>
            Terms of Service
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            Last updated: September 2025
          </Text>
        </Box>

        <Box>
          <VStack spacing={6} align='stretch'>
            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                1. Agreement to Terms
              </Heading>
              <Text mb={4}>
                By accessing and using our multi-vendor e-commerce platform, you
                accept and agree to be bound by the terms and provision of this
                agreement. Our platform connects buyers with independent vendors
                who sell their products through our marketplace.
              </Text>
              <Text>
                These terms apply to all users of the platform, including
                buyers, vendors, and visitors browsing our marketplace.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                2. Platform Services
              </Heading>
              <Text mb={4}>
                Our platform provides a marketplace where independent vendors
                can list and sell their products to customers worldwide. We
                facilitate transactions, provide payment processing, and offer
                dispute resolution services.
              </Text>
              <List spacing={2}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Product listing and catalog management for vendors
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Secure payment processing and transaction handling
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Customer support and dispute resolution
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Order tracking and fulfillment coordination
                </ListItem>
              </List>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                3. Vendor Responsibilities
              </Heading>
              <Text mb={4}>
                Vendors using our platform agree to maintain high standards of
                service and product quality. All vendors must comply with
                applicable laws and our marketplace policies.
              </Text>
              <Text>
                Vendors are responsible for accurate product descriptions,
                timely order fulfillment, customer service, and handling returns
                according to their stated policies.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                4. User Conduct
              </Heading>
              <Text mb={4}>
                Users must not engage in fraudulent activities, post false
                reviews, or misuse the platform in any way that could harm other
                users or vendors.
              </Text>
              <Text>
                We reserve the right to suspend or terminate accounts that
                violate these terms or engage in harmful behavior.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                5. Limitation of Liability
              </Heading>
              <Text>
                While we strive to maintain a secure and reliable platform, we
                are not liable for vendor actions, product quality issues, or
                disputes between buyers and sellers. Our role is to facilitate
                transactions and provide resolution support when needed.
              </Text>
            </Box>
          </VStack>
        </Box>

        <Box textAlign='center' py={6} bg='teal.50' borderRadius='lg'>
          <Text color='gray.700' mb={4}>
            Have questions about our terms? Contact our legal team for
            clarification.
          </Text>
          <Button colorScheme='teal' variant='outline'>
            Contact Legal Team
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default TermsOfService;
