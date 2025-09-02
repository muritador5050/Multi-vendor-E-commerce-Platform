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

const PrivacyPolicy = () => {
  return (
    <Container maxW='container.lg' py={8}>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center'>
          <Heading size='xl' color='teal.900' mb={4}>
            Privacy Policy
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            Your privacy is important to us. Last updated: September 2025
          </Text>
        </Box>

        <Box>
          <VStack spacing={6} align='stretch'>
            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                Information We Collect
              </Heading>
              <Text mb={4}>
                We collect information necessary to provide our marketplace
                services, facilitate transactions between buyers and vendors,
                and improve your experience on our platform.
              </Text>

              <Heading size='md' color='teal.700' mb={3}>
                Personal Information:
              </Heading>
              <List spacing={2} mb={4}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Name, email address, and contact information
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Shipping and billing addresses
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Payment information (processed securely by our payment
                  partners)
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Purchase history and preferences
                </ListItem>
              </List>

              <Heading size='md' color='teal.700' mb={3}>
                Platform Usage Data:
              </Heading>
              <List spacing={2}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Browsing patterns and product interactions
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Device information and IP addresses
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Communication with vendors and support team
                </ListItem>
              </List>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                How We Use Your Information
              </Heading>
              <Text mb={4}>
                We use your information to provide marketplace services, process
                transactions, communicate with you, and improve our platform.
              </Text>
              <List spacing={2}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Processing orders and facilitating vendor communications
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Providing customer support and resolving disputes
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Sending order updates, promotional offers, and platform news
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color='teal.500' />
                  Preventing fraud and maintaining platform security
                </ListItem>
              </List>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                Information Sharing
              </Heading>
              <Text mb={4}>
                We share limited information with vendors to fulfill orders and
                with trusted partners to provide our services. We never sell
                your personal data to third parties.
              </Text>
              <Text>
                Vendors receive necessary shipping and contact information to
                fulfill your orders. All vendors agree to our data protection
                standards and privacy requirements.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size='lg' color='teal.900' mb={4}>
                Your Rights
              </Heading>
              <Text mb={4}>
                You have the right to access, update, or delete your personal
                information. You can also opt out of marketing communications
                and request data portability.
              </Text>
              <Text>
                Contact our privacy team to exercise these rights or if you have
                questions about how we handle your data.
              </Text>
            </Box>
          </VStack>
        </Box>

        <Box textAlign='center' py={6} bg='teal.50' borderRadius='lg'>
          <Text color='gray.700' mb={4}>
            Questions about our privacy practices?
          </Text>
          <Button colorScheme='teal' variant='outline'>
            Contact Privacy Team
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default PrivacyPolicy;
