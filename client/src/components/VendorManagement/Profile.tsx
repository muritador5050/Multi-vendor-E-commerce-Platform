import React from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Badge,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Icon,
  Link,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  Shield,
  Store,
  CreditCard,
  Building,
  TrendingUp,
  Award,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { useVendorProfile } from '@/context/VendorContextService';
import type {
  VendorProfile as VendorProfileType,
  VerificationStatus,
  SocialMedia,
} from '@/type/vendor';

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  colorScheme?: string;
}

const VendorProfile: React.FC = () => {
  const { data } = useVendorProfile();
  const vendor = data as VendorProfileType | undefined;

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date): string => {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: VerificationStatus): string => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      case 'suspended':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const socialIcons: Record<
    keyof SocialMedia,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  > = {
    website: Globe,
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Youtube,
  };

  const StatCard: React.FC<StatCardProps> = ({
    icon: IconComponent,
    label,
    value,
    colorScheme = 'blue',
  }) => (
    <Card bg={cardBg} shadow='sm' border='1px' borderColor={borderColor}>
      <CardBody>
        <Flex align='center' justify='space-between'>
          <Flex align='center' gap={3}>
            <Box p={2} bg={`${colorScheme}.50`} borderRadius='lg'>
              <Icon
                as={IconComponent}
                w={5}
                h={5}
                color={`${colorScheme}.500`}
              />
            </Box>
            <Box>
              <Text fontSize='sm' color='gray.600'>
                {label}
              </Text>
              <Text fontSize='xl' fontWeight='bold'>
                {value}
              </Text>
            </Box>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );

  if (!vendor) {
    return (
      <Box
        minH='100vh'
        bg={bg}
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Text>Loading vendor profile...</Text>
      </Box>
    );
  }

  return (
    <Box minH='100vh' bg={bg}>
      {/* Header Section */}
      <Box bg={cardBg} borderBottom='1px' borderColor={borderColor}>
        <Container maxW='7xl' py={6}>
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align={{ lg: 'center' }}
            justify='space-between'
            gap={4}
          >
            <Flex align='center' gap={4}>
              {vendor.generalSettings?.storeLogo && (
                <Image
                  src={
                    typeof vendor.generalSettings.storeLogo === 'string'
                      ? vendor.generalSettings.storeLogo
                      : URL.createObjectURL(vendor.generalSettings.storeLogo)
                  }
                  alt={vendor.generalSettings?.storeName || 'Store Logo'}
                  w={16}
                  h={16}
                  borderRadius='xl'
                  objectFit='cover'
                  border='2px'
                  borderColor={borderColor}
                />
              )}
              <Box>
                <Heading size='lg'>
                  {vendor.generalSettings?.storeName || 'Store Name'}
                </Heading>
                <Text color='gray.600'>{vendor.businessName}</Text>
                <HStack mt={2} gap={4}>
                  <HStack gap={1}>
                    <Icon as={Star} w={4} h={4} color='yellow.400' />
                    <Text fontSize='sm' fontWeight='medium'>
                      {vendor.rating.toFixed(1)}
                    </Text>
                    <Text fontSize='sm' color='gray.600'>
                      ({vendor.reviewCount.toLocaleString()} reviews)
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme={getStatusColor(vendor.verificationStatus)}
                    px={2}
                    py={1}
                    borderRadius='full'
                    fontSize='xs'
                  >
                    <Icon as={Shield} w={3} h={3} mr={1} />
                    {vendor.verificationStatus.charAt(0).toUpperCase() +
                      vendor.verificationStatus.slice(1)}
                  </Badge>
                </HStack>
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Banner Image */}
      {vendor.generalSettings?.storeBanner && (
        <Box h={64} position='relative' overflow='hidden'>
          <Image
            src={
              typeof vendor.generalSettings.storeBanner === 'string'
                ? vendor.generalSettings.storeBanner
                : Array.isArray(vendor.generalSettings.storeBanner)
                ? typeof vendor.generalSettings.storeBanner[0] === 'string'
                  ? vendor.generalSettings.storeBanner[0]
                  : URL.createObjectURL(vendor.generalSettings.storeBanner[0])
                : URL.createObjectURL(vendor.generalSettings.storeBanner)
            }
            alt='Store Banner'
            w='full'
            h='full'
            objectFit='cover'
          />
        </Box>
      )}

      <Container maxW='7xl' py={8}>
        {/* Tabs */}
        <Tabs
          variant='enclosed'
          bg={cardBg}
          borderRadius='xl'
          shadow='sm'
          border='1px'
          borderColor={borderColor}
        >
          <TabList>
            <Tab>
              <Icon as={Store} w={4} h={4} mr={2} />
              Overview
            </Tab>
            <Tab>
              <Icon as={Building} w={4} h={4} mr={2} />
              Business Info
            </Tab>
            <Tab>
              <Icon as={TrendingUp} w={4} h={4} mr={2} />
              Performance
            </Tab>
            <Tab>
              <Icon as={Clock} w={4} h={4} mr={2} />
              Contact & Hours
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <VStack spacing={8} align='stretch'>
                {/* Key Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <StatCard
                    icon={TrendingUp}
                    label='Total Orders'
                    value={vendor.totalOrders.toLocaleString()}
                    colorScheme='green'
                  />
                  <StatCard
                    icon={CreditCard}
                    label='Revenue'
                    value={formatCurrency(vendor.totalRevenue)}
                    colorScheme='blue'
                  />
                  <StatCard
                    icon={Star}
                    label='Rating'
                    value={`${vendor.rating.toFixed(1)}/5.0`}
                    colorScheme='yellow'
                  />
                  <StatCard
                    icon={Award}
                    label='Reviews'
                    value={vendor.reviewCount.toLocaleString()}
                    colorScheme='purple'
                  />
                </SimpleGrid>

                {/* About & Description */}
                {vendor.generalSettings?.shopDescription && (
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        About Store
                      </Heading>
                      <Text color='gray.600' lineHeight='tall'>
                        {vendor.generalSettings.shopDescription}
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* Quick Info Grid */}
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        Quick Information
                      </Heading>
                      <VStack spacing={3} align='stretch'>
                        <Flex justify='space-between'>
                          <Text color='gray.600'>Business Type</Text>
                          <Text fontWeight='medium' textTransform='capitalize'>
                            {vendor.businessType}
                          </Text>
                        </Flex>
                        <Flex justify='space-between'>
                          <Text color='gray.600'>Member Since</Text>
                          <Text fontWeight='medium'>
                            {formatDate(vendor.createdAt)}
                          </Text>
                        </Flex>
                        <Flex justify='space-between'>
                          <Text color='gray.600'>Payment Terms</Text>
                          <Text fontWeight='medium' textTransform='uppercase'>
                            {vendor.paymentTerms}
                          </Text>
                        </Flex>
                        <Flex justify='space-between'>
                          <Text color='gray.600'>Commission Rate</Text>
                          <Text fontWeight='medium'>
                            {(vendor.commission * 100).toFixed(1)}%
                          </Text>
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        Owner Information
                      </Heading>
                      <Flex align='center' gap={4} mb={4}>
                        <Avatar
                          src={vendor.user.avatar}
                          name={vendor.user.name}
                          size='md'
                        />
                        <Box>
                          <Text fontWeight='medium'>{vendor.user.name}</Text>
                          <Text fontSize='sm' color='gray.600'>
                            {vendor.user.email}
                          </Text>
                        </Box>
                      </Flex>
                      <Text fontSize='sm' color='gray.600'>
                        Joined {formatDate(vendor.user.createdAt as string)}
                      </Text>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>

            {/* Business Info Tab */}
            <TabPanel>
              <VStack spacing={6} align='stretch'>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        <Icon as={Building} w={5} h={5} mr={2} />
                        Business Details
                      </Heading>
                      <VStack spacing={3} align='stretch'>
                        <Box>
                          <Text fontSize='sm' color='gray.600'>
                            Business Name
                          </Text>
                          <Text fontWeight='medium'>{vendor.businessName}</Text>
                        </Box>
                        <Box>
                          <Text fontSize='sm' color='gray.600'>
                            Business Type
                          </Text>
                          <Text fontWeight='medium' textTransform='capitalize'>
                            {vendor.businessType}
                          </Text>
                        </Box>
                        {vendor.taxId && (
                          <Box>
                            <Text fontSize='sm' color='gray.600'>
                              Tax ID
                            </Text>
                            <Text fontWeight='medium'>{vendor.taxId}</Text>
                          </Box>
                        )}
                        {vendor.businessRegistrationNumber && (
                          <Box>
                            <Text fontSize='sm' color='gray.600'>
                              Registration Number
                            </Text>
                            <Text fontWeight='medium'>
                              {vendor.businessRegistrationNumber}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        <Icon as={Shield} w={5} h={5} mr={2} />
                        Verification Status
                      </Heading>
                      <VStack spacing={3} align='stretch'>
                        <Box>
                          <Badge
                            colorScheme={getStatusColor(
                              vendor.verificationStatus
                            )}
                            px={3}
                            py={1}
                            borderRadius='full'
                            fontSize='sm'
                          >
                            {vendor.verificationStatus.charAt(0).toUpperCase() +
                              vendor.verificationStatus.slice(1)}
                          </Badge>
                        </Box>
                        {vendor.verifiedAt && (
                          <Box>
                            <Text fontSize='sm' color='gray.600'>
                              Verified On
                            </Text>
                            <Text fontWeight='medium'>
                              {formatDate(vendor.verifiedAt)}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>

                {vendor.storeAddress && (
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        <Icon as={MapPin} w={5} h={5} mr={2} />
                        Store Address
                      </Heading>
                      <Grid
                        templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                        gap={6}
                      >
                        <VStack spacing={2} align='start'>
                          {vendor.storeAddress.street && (
                            <Text fontWeight='medium'>
                              {vendor.storeAddress.street}
                            </Text>
                          )}
                          {vendor.storeAddress.apartment && (
                            <Text color='gray.600'>
                              {vendor.storeAddress.apartment}
                            </Text>
                          )}
                          <Text color='gray.600'>
                            {[
                              vendor.storeAddress.city,
                              vendor.storeAddress.state,
                              vendor.storeAddress.zipCode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                          {vendor.storeAddress.country && (
                            <Text color='gray.600'>
                              {vendor.storeAddress.country}
                            </Text>
                          )}
                        </VStack>
                      </Grid>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Performance Tab */}
            <TabPanel>
              <VStack spacing={6} align='stretch'>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <StatCard
                    icon={TrendingUp}
                    label='Total Orders'
                    value={vendor.totalOrders.toLocaleString()}
                    colorScheme='green'
                  />
                  <StatCard
                    icon={CreditCard}
                    label='Total Revenue'
                    value={formatCurrency(vendor.totalRevenue)}
                    colorScheme='blue'
                  />
                  <StatCard
                    icon={Award}
                    label='Avg. Order Value'
                    value={
                      vendor.totalOrders > 0
                        ? formatCurrency(
                            vendor.totalRevenue / vendor.totalOrders
                          )
                        : '$0'
                    }
                    colorScheme='purple'
                  />
                </SimpleGrid>

                <Card
                  bg={cardBg}
                  shadow='sm'
                  border='1px'
                  borderColor={borderColor}
                >
                  <CardBody>
                    <Heading size='md' mb={4}>
                      Customer Satisfaction
                    </Heading>
                    <Flex align='center' gap={6}>
                      <Flex align='center' gap={2}>
                        <HStack>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              as={Star}
                              w={6}
                              h={6}
                              color={
                                star <= Math.floor(vendor.rating)
                                  ? 'yellow.400'
                                  : 'gray.300'
                              }
                              fill={
                                star <= Math.floor(vendor.rating)
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                          ))}
                        </HStack>
                        <Text fontSize='2xl' fontWeight='bold'>
                          {vendor.rating.toFixed(1)}
                        </Text>
                      </Flex>
                      <Box>
                        <Text fontSize='sm' color='gray.600'>
                          Based on {vendor.reviewCount.toLocaleString()} reviews
                        </Text>
                      </Box>
                    </Flex>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Contact & Hours Tab */}
            <TabPanel>
              <VStack spacing={6} align='stretch'>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        Contact Information
                      </Heading>
                      <VStack spacing={4} align='stretch'>
                        {vendor.generalSettings?.storeEmail && (
                          <Flex align='center' gap={3}>
                            <Icon as={Mail} w={5} h={5} color='gray.400' />
                            <Text>{vendor.generalSettings.storeEmail}</Text>
                          </Flex>
                        )}
                        {vendor.generalSettings?.storePhone && (
                          <Flex align='center' gap={3}>
                            <Icon as={Phone} w={5} h={5} color='gray.400' />
                            <Text>{vendor.generalSettings.storePhone}</Text>
                          </Flex>
                        )}
                        {vendor.storeAddress && (
                          <Flex align='center' gap={3}>
                            <Icon as={MapPin} w={5} h={5} color='gray.400' />
                            <Text>
                              {[
                                vendor.storeAddress.street,
                                vendor.storeAddress.city,
                                vendor.storeAddress.state,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </Text>
                          </Flex>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        Social Media
                      </Heading>
                      <VStack spacing={3} align='stretch'>
                        {vendor.socialMedia &&
                          Object.entries(vendor.socialMedia).map(
                            ([platform, url]) => {
                              if (!url || typeof url !== 'string') return null;
                              const IconComponent =
                                socialIcons[platform as keyof SocialMedia];
                              return (
                                <Flex key={platform} align='center' gap={3}>
                                  <Icon
                                    as={IconComponent}
                                    w={5}
                                    h={5}
                                    color='gray.400'
                                  />
                                  <Link
                                    href={url}
                                    color='blue.500'
                                    textTransform='capitalize'
                                    isExternal
                                  >
                                    {platform}
                                    <Icon
                                      as={ExternalLink}
                                      w={3}
                                      h={3}
                                      ml={1}
                                    />
                                  </Link>
                                </Flex>
                              );
                            }
                          )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>

                {vendor.storeHours && vendor.storeHours.length > 0 && (
                  <Card
                    bg={cardBg}
                    shadow='sm'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Heading size='md' mb={4}>
                        <Icon as={Clock} w={5} h={5} mr={2} />
                        Store Hours
                      </Heading>
                      <Grid
                        templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                        gap={4}
                      >
                        {vendor.storeHours.map((hour, index) => (
                          <Flex
                            key={hour.day || index}
                            justify='space-between'
                            py={2}
                          >
                            <Text
                              fontWeight='medium'
                              textTransform='capitalize'
                            >
                              {hour.day || 'Unknown Day'}
                            </Text>
                            <Text color={hour.isOpen ? 'green.500' : 'red.500'}>
                              {hour.isOpen && hour.openTime && hour.closeTime
                                ? `${hour.openTime} - ${hour.closeTime}`
                                : 'Closed'}
                            </Text>
                          </Flex>
                        ))}
                      </Grid>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default VendorProfile;
