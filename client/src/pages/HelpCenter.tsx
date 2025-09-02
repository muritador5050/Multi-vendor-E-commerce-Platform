import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, QuestionIcon, RepeatIcon } from '@chakra-ui/icons';
import { Shield } from 'lucide-react';

const HelpCenter = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const faqData = [
    {
      question: 'How do I place an order on your platform?',
      answer:
        'Browse products from our verified vendors, add items to your cart, and proceed to checkout. You can pay securely using various payment methods including credit cards, PayPal, and digital wallets.',
    },
    {
      question: 'How do I track my order?',
      answer:
        "After placing an order, you'll receive a tracking number via email. You can also track your orders in the 'My Orders' section of your account dashboard.",
    },
    {
      question: 'What if I receive a damaged or wrong item?',
      answer:
        "Contact the vendor directly through our messaging system or reach out to our customer support team. We'll help facilitate a resolution including returns, exchanges, or refunds.",
    },
    {
      question: 'How do I become a vendor on your platform?',
      answer:
        "Visit our 'Become a Seller' page, complete the vendor application form, provide required documentation, and wait for approval. Our team will review your application within 3-5 business days.",
    },
    {
      question: 'What are the fees for vendors?',
      answer:
        'We charge a small commission on each sale (typically 5-15% depending on category) plus payment processing fees. There are no monthly subscription fees to maintain your store.',
    },
    {
      question: 'How do I contact a specific vendor?',
      answer:
        "Visit the vendor's store page and use the 'Contact Seller' button, or send them a message through the product page. All communications are secured through our platform.",
    },
  ];

  const categories = [
    { title: 'Getting Started', icon: QuestionIcon, count: 12 },
    { title: 'Orders & Shipping', icon: RepeatIcon, count: 18 },
    { title: 'Vendor Support', icon: Shield, count: 15 },
    { title: 'Account & Billing', icon: CheckCircleIcon, count: 9 },
  ];

  return (
    <Container maxW='container.xl' py={8}>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center'>
          <Heading size='xl' color='teal.900' mb={4}>
            Help Center
          </Heading>
          <Text fontSize='lg' color='gray.600'>
            Find answers to common questions about our multi-vendor marketplace
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {categories.map((category, index) => (
            <Card
              key={index}
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition='all 0.2s'
            >
              <CardBody textAlign='center'>
                <Icon as={category.icon} boxSize={8} color='teal.900' mb={3} />
                <Heading size='md' mb={2}>
                  {category.title}
                </Heading>
                <Badge colorScheme='teal'>{category.count} articles</Badge>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Box>
          <Heading size='lg' mb={6} color='teal.900'>
            Frequently Asked Questions
          </Heading>
          <Accordion allowToggle>
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                border='1px'
                borderColor='gray.200'
                mb={2}
                borderRadius='md'
              >
                <AccordionButton py={4} _hover={{ bg: 'teal.50' }}>
                  <Box flex='1' textAlign='left' fontWeight='medium'>
                    {faq.question}
                  </Box>
                  <AccordionIcon color='teal.900' />
                </AccordionButton>
                <AccordionPanel pb={4} bg={bgColor}>
                  <Text color='gray.700'>{faq.answer}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        <Box textAlign='center' py={8} bg='teal.50' borderRadius='lg'>
          <Heading size='md' mb={4} color='teal.900'>
            Still need help?
          </Heading>
          <Text mb={6} color='gray.600'>
            Our customer support team is here to assist you 24/7
          </Text>
          <HStack spacing={4} justify='center'>
            <Button colorScheme='teal' variant='solid'>
              Contact Support
            </Button>
            <Button colorScheme='teal' variant='outline'>
              Live Chat
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default HelpCenter;
