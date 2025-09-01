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
  Avatar,
  Stack,
} from '@chakra-ui/react';
import {
  FaStore,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaCreditCard,
  FaHeadset,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaGlobe,
  FaMobile,
  FaTools,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SellWithUs = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.400, teal.600)',
    'linear(to-r, teal.600, teal.800)'
  );

  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const benefits = [
    {
      icon: FaStore,
      title: 'Your Own Storefront',
      description:
        'Get a personalized store page with your branding and product showcase.',
    },
    {
      icon: FaChartLine,
      title: 'Analytics & Insights',
      description:
        'Track your sales, customer behavior, and performance metrics in real-time.',
    },
    {
      icon: FaUsers,
      title: 'Access to Millions',
      description:
        'Reach our growing customer base of over 2 million active buyers.',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Transactions',
      description:
        'Built-in fraud protection and secure payment processing for peace of mind.',
    },
    {
      icon: FaCreditCard,
      title: 'Fast Payments',
      description:
        'Get paid quickly with our streamlined payment system and low fees.',
    },
    {
      icon: FaHeadset,
      title: '24/7 Support',
      description:
        'Dedicated seller support team available around the clock to help you succeed.',
    },
  ];

  const features = [
    {
      icon: FaGlobe,
      title: 'Global Reach',
      description:
        'Sell to customers worldwide with international shipping support',
    },
    {
      icon: FaMobile,
      title: 'Mobile Optimized',
      description: 'Your store looks perfect on all devices and platforms',
    },
    {
      icon: FaTools,
      title: 'Easy Management',
      description:
        'Intuitive dashboard to manage inventory, orders, and customers',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Handmade Crafts Co.',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b1c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
      text: 'Joining this platform increased my sales by 300% in just 6 months. The support team is amazing!',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      business: 'Tech Gadgets Plus',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
      text: 'The analytics tools helped me understand my customers better and optimize my product listings.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      business: 'Fashion Forward',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
      text: 'Easy to set up, great commission rates, and excellent customer reach. Highly recommended!',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      features: [
        'Up to 50 products',
        '5% commission fee',
        'Basic analytics',
        'Email support',
      ],
      popular: false,
      planRoute: 'plan=stater',
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      features: [
        'Up to 500 products',
        '3% commission fee',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
      ],
      popular: true,
      planRoute: 'plan=pro',
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: [
        'Unlimited products',
        '2% commission fee',
        'Full analytics suite',
        'Dedicated account manager',
        'API access',
        'Custom integrations',
      ],
      popular: false,
      planRoute: 'plan=enterprise',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box bgGradient={bgGradient} color='white' py={20}>
        <Container maxW='6xl'>
          <VStack spacing={8} textAlign='center'>
            <Heading size='2xl' fontWeight='bold'>
              Start Selling With Us Today
            </Heading>
            <Text fontSize='xl' maxW='2xl'>
              Join thousands of successful vendors and grow your business with
              our powerful e-commerce platform. Reach millions of customers and
              boost your sales.
            </Text>
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <Button
                size='lg'
                bg='white'
                color='teal.900'
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                rightIcon={<Icon as={FaArrowRight} />}
                onClick={() => navigate('/register/vendor/?plan=starter')}
              >
                Get Started Free
              </Button>
              <Button
                size='lg'
                variant='outline'
                color='white'
                borderColor='white'
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/how-it-works')}
              >
                Learn More
              </Button>
            </Stack>

            <HStack spacing={8} pt={8}>
              <VStack spacing={2}>
                <Heading size='md'>2M+</Heading>
                <Text fontSize='sm' opacity={0.9}>
                  Active Customers
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Heading size='md'>50K+</Heading>
                <Text fontSize='sm' opacity={0.9}>
                  Active Vendors
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Heading size='md'>$2M+</Heading>
                <Text fontSize='sm' opacity={0.9}>
                  Monthly Sales
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>Why Sell With Us?</Heading>
              <Text fontSize='lg' color={textColor} maxW='2xl'>
                We provide everything you need to succeed as an online seller.
                From powerful tools to dedicated support, we've got you covered.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow='md'
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                >
                  <CardBody>
                    <VStack spacing={4} align='start'>
                      <Box p={3} bg='teal.50' borderRadius='lg'>
                        <Icon as={benefit.icon} boxSize={6} color='teal.500' />
                      </Box>
                      <Heading size='md'>{benefit.title}</Heading>
                      <Text color={textColor}>{benefit.description}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW='6xl'>
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={12}
            alignItems='center'
          >
            <VStack spacing={8} align='start'>
              <VStack spacing={4} align='start'>
                <Heading size='xl'>Powerful Features for Your Success</Heading>
                <Text fontSize='lg' color={textColor}>
                  Our platform is built with sellers in mind. Access
                  professional tools and features that help you manage and grow
                  your business effectively.
                </Text>
              </VStack>

              <VStack spacing={6} align='start' w='full'>
                {features.map((feature, index) => (
                  <HStack key={index} spacing={4} align='start'>
                    <Box p={2} bg='teal.50' borderRadius='md'>
                      <Icon as={feature.icon} boxSize={5} color='teal.600' />
                    </Box>
                    <VStack spacing={1} align='start'>
                      <Heading size='sm'>{feature.title}</Heading>
                      <Text color={textColor} fontSize='sm'>
                        {feature.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            <Box>
              <Image
                src='https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
                alt='Dashboard preview'
                borderRadius='lg'
                shadow='xl'
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>Choose Your Plan</Heading>
              <Text fontSize='lg' color={textColor}>
                Start free and upgrade as you grow. All plans include our core
                features.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow='md'
                  position='relative'
                  border={plan.popular ? '2px solid' : 'none'}
                  borderColor='teal.500'
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                >
                  {plan.popular && (
                    <Badge
                      position='absolute'
                      top='-12px'
                      left='50%'
                      transform='translateX(-50%)'
                      bg='teal.500'
                      color='white'
                      px={3}
                      py={1}
                      borderRadius='full'
                      fontSize='sm'
                    >
                      Most Popular
                    </Badge>
                  )}
                  <CardBody>
                    <VStack spacing={6}>
                      <VStack spacing={2}>
                        <Heading size='lg'>{plan.name}</Heading>
                        <HStack align='baseline'>
                          <Heading size='2xl' color='teal.500'>
                            {plan.price}
                          </Heading>
                          <Text color={textColor}>{plan.period}</Text>
                        </HStack>
                      </VStack>

                      <VStack spacing={3} align='start' w='full'>
                        {plan.features.map((feature, idx) => (
                          <HStack key={idx} spacing={3}>
                            <Icon as={FaCheckCircle} color='green.500' />
                            <Text fontSize='sm'>{feature}</Text>
                          </HStack>
                        ))}
                      </VStack>

                      <Button
                        w='full'
                        colorScheme={plan.popular ? 'teal' : 'gray'}
                        variant={plan.popular ? 'solid' : 'outline'}
                        size='lg'
                        onClick={() =>
                          navigate(`/register/vendor/?${plan.planRoute}`)
                        }
                      >
                        Get Started
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={20}>
        <Container maxW='6xl'>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
              <Heading size='xl'>What Our Vendors Say</Heading>
              <Text fontSize='lg' color={textColor}>
                Join thousands of successful vendors who are already growing
                their business with us.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {testimonials.map((testimonial, index) => (
                <Card key={index} bg={cardBg} shadow='md'>
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack spacing={1}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Icon key={i} as={FaStar} color='yellow.400' />
                        ))}
                      </HStack>
                      <Text
                        fontSize='sm'
                        color={textColor}
                        textAlign='center'
                        fontStyle='italic'
                      >
                        "{testimonial.text}"
                      </Text>
                      <VStack spacing={2}>
                        <Avatar src={testimonial.avatar} size='md' />
                        <VStack spacing={0}>
                          <Text fontWeight='bold' fontSize='sm'>
                            {testimonial.name}
                          </Text>
                          <Text fontSize='xs' color={textColor}>
                            {testimonial.business}
                          </Text>
                        </VStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bgGradient={bgGradient} color='white' py={16}>
        <Container maxW='4xl'>
          <VStack spacing={6} textAlign='center'>
            <Heading size='xl'>Ready to Start Your Journey?</Heading>
            <Text fontSize='lg' opacity={0.9}>
              Join our platform and take your business to the next level. It's
              free to get started and takes less than 5 minutes to set up.
            </Text>
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <Button
                size='lg'
                bg='white'
                color='teal.900'
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                rightIcon={<Icon as={FaArrowRight} />}
                onClick={() => navigate('/register/vendor/?plan=starter')}
              >
                Start Selling Now
              </Button>
              <Button
                size='lg'
                variant='outline'
                color='white'
                borderColor='white'
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/contact-us')}
              >
                Contact Sales
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default SellWithUs;
