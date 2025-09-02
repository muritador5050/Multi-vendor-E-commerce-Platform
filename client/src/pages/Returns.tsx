import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  List,
  ListItem,
  ListIcon,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const Returns = () => {
  const [selectedTab, setSelectedTab] = useState('buyer');

  return (
    <Container maxW='container.lg' py={8}>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center'>
          <Heading size='xl' color='teal.900' mb={4}>
            Returns & Refunds
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            Easy returns process for buyers and clear guidelines for vendors
          </Text>
        </Box>

        <HStack spacing={4} justify='center'>
          <Button
            colorScheme='teal'
            variant={selectedTab === 'buyer' ? 'solid' : 'outline'}
            onClick={() => setSelectedTab('buyer')}
          >
            For Buyers
          </Button>
          <Button
            colorScheme='teal'
            variant={selectedTab === 'vendor' ? 'solid' : 'outline'}
            onClick={() => setSelectedTab('vendor')}
          >
            For Vendors
          </Button>
        </HStack>

        {selectedTab === 'buyer' && (
          <VStack spacing={6} align='stretch'>
            <Card>
              <CardBody>
                <Heading size='md' color='teal.900' mb={4}>
                  How to Return an Item
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Step 1:
                    </Text>{' '}
                    Go to "My Orders" and select the item you want to return
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Step 2:
                    </Text>{' '}
                    Choose your reason for return and provide details
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Step 3:
                    </Text>{' '}
                    Print the prepaid return label or follow vendor's return
                    instructions
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Step 4:
                    </Text>{' '}
                    Package the item securely and ship it back
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Step 5:
                    </Text>{' '}
                    Track your return and receive your refund
                  </ListItem>
                </List>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size='md' color='teal.900' mb={3}>
                    Return Window
                  </Heading>
                  <Text mb={2}>
                    <Badge colorScheme='teal' mr={2}>
                      30 days
                    </Badge>
                    for most items
                  </Text>
                  <Text mb={2}>
                    <Badge colorScheme='orange' mr={2}>
                      14 days
                    </Badge>
                    for electronics
                  </Text>
                  <Text>
                    <Badge colorScheme='red' mr={2}>
                      7 days
                    </Badge>
                    for perishable goods
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size='md' color='teal.900' mb={3}>
                    Refund Timeline
                  </Heading>
                  <Text mb={2}>
                    <Badge colorScheme='teal' mr={2}>
                      3-5 days
                    </Badge>
                    after vendor receives return
                  </Text>
                  <Text mb={2}>Original payment method</Text>
                  <Text color='gray.600' fontSize='sm'>
                    Bank processing may take additional 1-2 business days
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        )}

        {selectedTab === 'vendor' && (
          <VStack spacing={6} align='stretch'>
            <Card>
              <CardBody>
                <Heading size='md' color='teal.900' mb={4}>
                  Vendor Return Guidelines
                </Heading>
                <Text mb={4}>
                  As a vendor on our platform, you're responsible for handling
                  returns according to our marketplace standards and your
                  individual return policy.
                </Text>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Clear Policy:
                    </Text>{' '}
                    Display your return policy prominently on product pages
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Quick Response:
                    </Text>{' '}
                    Respond to return requests within 24 hours
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Fair Assessment:
                    </Text>{' '}
                    Evaluate returned items promptly and fairly
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color='teal.500' />
                    <Text as='span' fontWeight='medium'>
                      Timely Refunds:
                    </Text>{' '}
                    Process approved refunds within 3 business days
                  </ListItem>
                </List>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size='md' color='teal.900' mb={3}>
                    Return Fees
                  </Heading>
                  <Text mb={2}>
                    Defective/Wrong item:{' '}
                    <Badge colorScheme='green'>Vendor pays</Badge>
                  </Text>
                  <Text mb={2}>
                    Change of mind:{' '}
                    <Badge colorScheme='orange'>Buyer pays</Badge>
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    Platform provides prepaid labels for vendor-fault returns
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size='md' color='teal.900' mb={3}>
                    Performance Metrics
                  </Heading>
                  <Text mb={2}>
                    Target response time:{' '}
                    <Badge colorScheme='teal'>24 hours</Badge>
                  </Text>
                  <Text mb={2}>
                    Refund processing: <Badge colorScheme='teal'>3 days</Badge>
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    Maintain good metrics for platform benefits
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        )}

        <Box textAlign='center' py={6} bg='teal.50' borderRadius='lg'>
          <Text color='gray.700' mb={4}>
            Need help with a return or refund?
          </Text>
          <HStack spacing={4} justify='center'>
            <Button colorScheme='teal' variant='solid'>
              Start Return Process
            </Button>
            <Button colorScheme='teal' variant='outline'>
              Contact Support
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Returns;
