import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Icon,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  Image,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Flex,
} from '@chakra-ui/react';
import {
  FaStore,
  FaUpload,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaHeadset,
  FaCheckCircle,
  FaArrowRight,
  FaRocket,
  FaUserPlus,
  FaDollarSign,
  FaTruck,
  FaSearch,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-r, teal.400, teal.900)',
    'linear(to-r, teal.600, teal.800)'
  );

  const cardBg = 'white';
  const textColor = 'gray.600';
  const accentColor = 'teal.500';

  const steps = [
    {
      number: '01',
      icon: FaUserPlus,
      title: 'Create Your Account',
      description:
        'Sign up in minutes with just your email and basic business information. No setup fees or hidden costs.',
      details: [
        'Email verification',
        'Business details',
        'Tax information',
        'Bank account setup',
      ],
    },
    {
      number: '02',
      icon: FaStore,
      title: 'Set Up Your Store',
      description:
        'Customize your storefront with your branding, colors, and logo. Make it uniquely yours.',
      details: [
        'Upload logo & branding',
        'Choose store theme',
        'Add business description',
        'Set store policies',
      ],
    },
    {
      number: '03',
      icon: FaUpload,
      title: 'Add Your Products',
      description:
        'Upload your products with high-quality images, detailed descriptions, and competitive pricing.',
      details: [
        'Product photos',
        'Detailed descriptions',
        'Pricing & inventory',
        'Categories & tags',
      ],
    },
    {
      number: '04',
      icon: FaRocket,
      title: 'Start Selling',
      description:
        'Go live and start reaching millions of customers. We handle payments, security, and logistics.',
      details: [
        'Instant visibility',
        'Secure payments',
        'Order management',
        'Customer support',
      ],
    },
  ];

  const features = [
    {
      category: 'Store Management',
      icon: FaStore,
      items: [
        'Customizable storefront with your branding',
        'Product catalog management',
        'Inventory tracking and alerts',
        'Bulk product upload tools',
        'SEO optimization for better visibility',
      ],
    },
    {
      category: 'Sales & Analytics',
      icon: FaChartLine,
      items: [
        'Real-time sales dashboard',
        'Customer behavior analytics',
        'Revenue and profit tracking',
        'Performance insights and recommendations',
        'Export reports for accounting',
      ],
    },
    {
      category: 'Customer Reach',
      icon: FaUsers,
      items: [
        'Access to 2M+ active customers',
        'Advanced search and discovery',
        'Promotional tools and campaigns',
        'Cross-selling opportunities',
        'Mobile-optimized shopping experience',
      ],
    },
    {
      category: 'Payments & Security',
      icon: FaShieldAlt,
      items: [
        'Secure payment processing',
        'Multiple payment methods accepted',
        'Fraud protection and monitoring',
        'Fast payouts (next-day available)',
        'PCI DSS compliance',
      ],
    },
  ];

  const benefits = [
    {
      icon: FaDollarSign,
      title: 'Low Fees',
      description:
        'Starting at just 2% commission with no monthly fees on our Starter plan.',
      highlight: 'Save thousands compared to competitors',
    },
    {
      icon: FaTruck,
      title: 'Logistics Support',
      description:
        'Optional fulfillment services and shipping integrations with major carriers.',
      highlight: 'Focus on products, we handle shipping',
    },
    {
      icon: FaSearch,
      title: 'SEO Optimized',
      description:
        'Your products automatically appear in search engines and our internal search.',
      highlight: 'Increased visibility = more sales',
    },
    {
      icon: FaHeadset,
      title: 'Dedicated Support',
      description:
        '24/7 seller support team to help you succeed and grow your business.',
      highlight: "Never sell alone - we're here to help",
    },
  ];

  const faqs = [
    {
      question: 'How much does it cost to start selling?',
      answer:
        "It's completely free to get started! Our Starter plan has no monthly fees - you only pay a small commission when you make a sale. This means zero risk and no upfront investment required.",
    },
    {
      question: 'How long does it take to get approved?',
      answer:
        'Most sellers get approved within 24-48 hours. We review your application to ensure quality and authenticity. Once approved, you can start listing products immediately.',
    },
    {
      question: 'What products can I sell?',
      answer:
        'You can sell almost anything legal! Popular categories include electronics, fashion, home goods, beauty products, books, and handmade items. We have restrictions on certain items like weapons, adult content, and counterfeit goods.',
    },
    {
      question: 'How do I get paid?',
      answer:
        "We pay sellers weekly via direct deposit. You can track your earnings in real-time through your dashboard. Payments are processed securely and you'll receive detailed transaction reports.",
    },
    {
      question: 'Do you provide customer service for my products?',
      answer:
        'Yes! We handle basic customer inquiries, order tracking, and return processing. For product-specific questions, customers can contact you directly through our messaging system.',
    },
    {
      question: 'Can I use my own shipping methods?',
      answer:
        'Absolutely! You can handle shipping yourself or use our integrated shipping partners for discounted rates. We also offer optional fulfillment services where we store and ship your products.',
    },
  ];

  const stats = [
    { number: '$2.5M+', label: 'Average Monthly Sales Volume' },
    { number: '15%', label: 'Average Monthly Growth Rate' },
    { number: '4.8/5', label: 'Average Seller Satisfaction' },
    { number: '72hrs', label: 'Average First Sale Time' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box bgGradient={bgGradient} color='white' py={20}>
        <Container maxW='6xl'>
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={12}
            alignItems='center'
          >
            <VStack spacing={6} align='start'>
              <Badge
                colorScheme='orange'
                px={3}
                py={1}
                borderRadius='full'
                fontSize='sm'
              >
                Learn How It Works
              </Badge>
              <Heading size='2xl' fontWeight='bold' lineHeight='shorter'>
                Everything You Need to Know About Selling With Us
              </Heading>
              <Text fontSize='xl' opacity={0.9}>
                Discover how thousands of entrepreneurs have built successful
                businesses on our platform. Get all the details about fees,
                features, and the selling process.
              </Text>
              <Button
                size='lg'
                bg='white'
                color='purple.900'
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                rightIcon={<Icon as={FaArrowRight} />}
                onClick={() => navigate('/register/vendor')}
              >
                Start Your Journey
              </Button>
            </VStack>

            <Box>
              <Image
                src='https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
                alt='Successful online business'
                borderRadius='xl'
                shadow='2xl'
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={12} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW='6xl'>
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={8}>
            {stats.map((stat, index) => (
              <VStack key={index} spacing={2} textAlign='center'>
                <Heading size='xl' color={accentColor}>
                  {stat.number}
                </Heading>
                <Text color={textColor} fontSize='sm' fontWeight='medium'>
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={20}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>How It Works</Heading>
              <Text fontSize='lg' color={textColor} maxW='2xl'>
                Getting started is simple. Follow these four steps to launch
                your online business and start reaching customers worldwide.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
              {steps.map((step, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow='lg'
                  border='1px solid'
                  borderColor={'gray.200'}
                >
                  <CardBody p={8}>
                    <HStack spacing={6} align='start'>
                      <VStack spacing={4}>
                        <Box
                          w='60px'
                          h='60px'
                          bg={accentColor}
                          borderRadius='full'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
                          <Text color='white' fontWeight='bold' fontSize='lg'>
                            {step.number}
                          </Text>
                        </Box>
                        <Box w='2px' h='100px' bg={'gray.200'} />
                      </VStack>

                      <VStack spacing={4} align='start' flex={1}>
                        <HStack spacing={3}>
                          <Icon
                            as={step.icon}
                            boxSize={6}
                            color={accentColor}
                          />
                          <Heading size='md'>{step.title}</Heading>
                        </HStack>
                        <Text color={textColor}>{step.description}</Text>

                        <List spacing={2}>
                          {step.details.map((detail, idx) => (
                            <ListItem key={idx} fontSize='sm'>
                              <ListIcon as={FaCheckCircle} color='green.500' />
                              {detail}
                            </ListItem>
                          ))}
                        </List>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>Powerful Features & Tools</Heading>
              <Text fontSize='lg' color={textColor} maxW='2xl'>
                Everything you need to manage and grow your business is built
                right into the platform.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow='md'
                  _hover={{ shadow: 'lg' }}
                >
                  <CardBody p={8}>
                    <VStack spacing={6} align='start'>
                      <HStack spacing={4}>
                        <Box
                          p={3}
                          bg={`${accentColor.split('.')[0]}.50`}
                          borderRadius='lg'
                        >
                          <Icon
                            as={feature.icon}
                            boxSize={6}
                            color={accentColor}
                          />
                        </Box>
                        <Heading size='md'>{feature.category}</Heading>
                      </HStack>

                      <List spacing={3}>
                        {feature.items.map((item, idx) => (
                          <ListItem key={idx} fontSize='sm'>
                            <ListIcon as={FaCheckCircle} color='green.500' />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={20}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>Why Choose Our Platform?</Heading>
              <Text fontSize='lg' color={textColor} maxW='2xl'>
                We've designed our platform to give sellers every advantage in
                today's competitive marketplace.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow='md'
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                >
                  <CardBody p={6}>
                    <Stack spacing={4} align='start'>
                      <Flex direction={{ base: 'column', sm: 'row' }}>
                        <Box
                          p={3}
                          bg={`${accentColor.split('.')[0]}.50`}
                          borderRadius='lg'
                          width={'fit-content'}
                        >
                          <Icon
                            as={benefit.icon}
                            boxSize={6}
                            color={accentColor}
                          />
                        </Box>
                        <VStack spacing={1} align='start'>
                          <Heading size='md'>{benefit.title}</Heading>
                          <Badge
                            colorScheme='green'
                            fontSize={{ base: '2xs', md: 'xs' }}
                            whiteSpace='nowrap'
                          >
                            {benefit.highlight}
                          </Badge>
                        </VStack>
                      </Flex>
                      <Text color={textColor}>{benefit.description}</Text>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW='4xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>Frequently Asked Questions</Heading>
              <Text fontSize='lg' color={textColor}>
                Get answers to the most common questions about selling on our
                platform.
              </Text>
            </VStack>

            <Accordion allowMultiple w='full'>
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  border='1px solid'
                  borderColor={'gray.200'}
                  borderRadius='lg'
                  mb={4}
                >
                  <AccordionButton p={6} _hover={{ bg: 'gray.50' }}>
                    <Box flex='1' textAlign='left'>
                      <Heading size='sm'>{faq.question}</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel p={6} pt={0}>
                    <Text color={textColor}>{faq.answer}</Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bgGradient={bgGradient} color='white' py={16}>
        <Container maxW='4xl'>
          <VStack spacing={8} textAlign='center'>
            <VStack spacing={4}>
              <Heading size='xl'>Ready to Start Your Success Story?</Heading>
              <Text fontSize='lg' opacity={0.9} maxW='2xl'>
                Join thousands of successful sellers who have built thriving
                businesses on our platform. Your journey to e-commerce success
                starts here.
              </Text>
            </VStack>

            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <Button
                size='lg'
                bg='white'
                color='purple.900'
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                rightIcon={<Icon as={FaArrowRight} />}
                onClick={() => navigate('/register/vendor')}
              >
                Get Started Free
              </Button>
              <Button
                size='lg'
                variant='outline'
                color='white'
                borderColor='white'
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/contact-us')}
              >
                Contact Support
              </Button>
            </Stack>

            <Text fontSize='sm' opacity={0.8}>
              No credit card required • Free to start • 24/7 support
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HowItWorks;
