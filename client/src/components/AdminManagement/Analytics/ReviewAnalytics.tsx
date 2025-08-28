import React from 'react';
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Heading,
  Flex,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Star, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { useReviewStats } from '@/context/ReviewContextService';

interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  averageRating: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

interface RatingDistribution {
  rating: string;
  count: number;
  percentage: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  helpText?: string;
  color?: string;
}

interface RatingBarProps {
  rating: string;
  count: number;
  total: number;
  color: string;
}

type RatingColorScheme = 'green' | 'yellow' | 'orange' | 'red';

const ReviewAnalytics: React.FC = () => {
  const { data: apiResponse, isLoading, error } = useReviewStats();

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Loading state
  if (isLoading) {
    return (
      <Center h='100vh'>
        <VStack spacing={4}>
          <Spinner size='xl' color='blue.500' />
          <Text color={textColor}>Loading review analytics...</Text>
        </VStack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6}>
        <Alert status='error'>
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading analytics!</AlertTitle>
            <AlertDescription>
              {error.message ||
                'An unexpected error occurred while fetching review statistics.'}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  // No data or unsuccessful response
  if (!apiResponse?.success || !apiResponse.data) {
    return (
      <Box p={6}>
        <Alert status='warning'>
          <AlertIcon />
          <Box>
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              {apiResponse?.message ||
                'Unable to load review statistics at this time.'}
              {apiResponse?.errors && (
                <VStack align='start' mt={2} spacing={1}>
                  {apiResponse.errors.map((error: string, index: number) => (
                    <Text key={index} fontSize='sm' color='red.600'>
                      • {error}
                    </Text>
                  ))}
                </VStack>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  const reviewData: ReviewStats = apiResponse.data;

  // Prepare chart data
  const ratingDistribution: RatingDistribution[] = [
    {
      rating: '1★',
      count: reviewData.rating1,
      percentage: (
        (reviewData.rating1 / reviewData.totalReviews) *
        100
      ).toFixed(1),
    },
    {
      rating: '2★',
      count: reviewData.rating2,
      percentage: (
        (reviewData.rating2 / reviewData.totalReviews) *
        100
      ).toFixed(1),
    },
    {
      rating: '3★',
      count: reviewData.rating3,
      percentage: (
        (reviewData.rating3 / reviewData.totalReviews) *
        100
      ).toFixed(1),
    },
    {
      rating: '4★',
      count: reviewData.rating4,
      percentage: (
        (reviewData.rating4 / reviewData.totalReviews) *
        100
      ).toFixed(1),
    },
    {
      rating: '5★',
      count: reviewData.rating5,
      percentage: (
        (reviewData.rating5 / reviewData.totalReviews) *
        100
      ).toFixed(1),
    },
  ];

  // Calculate approval rate
  const approvalRate: string =
    reviewData.totalReviews > 0
      ? ((reviewData.approvedReviews / reviewData.totalReviews) * 100).toFixed(
          1
        )
      : '0';

  // Get rating color based on average
  const getRatingColor = (rating: number): RatingColorScheme => {
    if (rating >= 4.5) return 'green';
    if (rating >= 3.5) return 'yellow';
    if (rating >= 2.5) return 'orange';
    return 'red';
  };

  // Get rating quality text
  const getRatingQuality = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Fair';
    return 'Poor';
  };

  // Find most common rating
  const getMostCommonRating = (distribution: RatingDistribution[]): string => {
    return distribution.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    ).rating;
  };

  const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    helpText,
    color = 'blue',
  }) => (
    <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
      <CardBody>
        <Stat>
          <Flex justify='space-between' align='flex-start'>
            <Box>
              <StatLabel fontSize='sm' color={textColor}>
                {title}
              </StatLabel>
              <StatNumber fontSize='2xl' color={`${color}.500`}>
                {value}
              </StatNumber>
              {helpText && (
                <StatHelpText fontSize='xs'>{helpText}</StatHelpText>
              )}
            </Box>
            <Icon as={icon} boxSize={6} color={`${color}.400`} />
          </Flex>
        </Stat>
      </CardBody>
    </Card>
  );

  const RatingBar: React.FC<RatingBarProps> = ({
    rating,
    count,
    total,
    color,
  }) => {
    const percentage: number = total > 0 ? (count / total) * 100 : 0;

    return (
      <HStack spacing={3} w='full'>
        <Text fontSize='sm' minW='30px' color={textColor}>
          {rating}
        </Text>
        <Progress
          value={percentage}
          colorScheme={color}
          size='md'
          flex={1}
          borderRadius='md'
        />
        <Text fontSize='sm' minW='40px' color={textColor} textAlign='right'>
          {count} ({percentage.toFixed(1)}%)
        </Text>
      </HStack>
    );
  };

  const ratingColorSchemes: string[] = [
    'red',
    'orange',
    'yellow',
    'blue',
    'green',
  ];

  return (
    <Box p={6} bg={'gray.50'} minH='100vh'>
      <VStack spacing={6} align='stretch'>
        {/* Header */}
        <Box>
          <Heading size='lg' mb={2} color={textColor}>
            Review Analytics Dashboard
          </Heading>
          <Text color='gray.500'>
            Overview of customer feedback and ratings
          </Text>
        </Box>

        {/* Key Metrics */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={4}
        >
          <StatCard
            title='Total Reviews'
            value={reviewData.totalReviews}
            icon={Users}
            helpText='All submitted reviews'
            color='blue'
          />
          <StatCard
            title='Average Rating'
            value={reviewData.averageRating.toFixed(2)}
            icon={Star}
            helpText='Out of 5 stars'
            color={getRatingColor(reviewData.averageRating)}
          />
          <StatCard
            title='Approval Rate'
            value={`${approvalRate}%`}
            icon={CheckCircle}
            helpText={`${reviewData.approvedReviews} approved`}
            color='green'
          />
          <StatCard
            title='Pending Reviews'
            value={reviewData.pendingReviews}
            icon={Clock}
            helpText='Awaiting moderation'
            color={reviewData.pendingReviews > 0 ? 'orange' : 'gray'}
          />
        </Grid>

        {/* Charts Section */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Rating Distribution Bar Chart */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
            <CardBody>
              <VStack align='stretch' spacing={4}>
                <Heading size='md' color={textColor}>
                  Rating Distribution
                </Heading>
                <Box h='300px'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={ratingDistribution}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='rating' />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [value, 'Reviews']}
                        labelFormatter={(label: string) => `${label} Rating`}
                      />
                      <Bar
                        dataKey='count'
                        fill='#4A90E2'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Rating Breakdown */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
            <CardBody>
              <VStack align='stretch' spacing={4}>
                <Heading size='md' color={textColor}>
                  Rating Breakdown
                </Heading>
                <VStack spacing={3} align='stretch'>
                  {[...ratingDistribution]
                    .reverse()
                    .map((item: RatingDistribution, index: number) => (
                      <RatingBar
                        key={item.rating}
                        rating={item.rating}
                        count={item.count}
                        total={reviewData.totalReviews}
                        color={ratingColorSchemes[4 - index]}
                      />
                    ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Summary Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
            <CardBody>
              <VStack align='center' spacing={2}>
                <Icon as={TrendingUp} boxSize={8} color='green.400' />
                <Heading size='sm' color={textColor}>
                  Most Common Rating
                </Heading>
                <Badge colorScheme='blue' fontSize='lg' px={3} py={1}>
                  {getMostCommonRating(ratingDistribution)}
                </Badge>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
            <CardBody>
              <VStack align='center' spacing={2}>
                <Icon as={CheckCircle} boxSize={8} color='green.400' />
                <Heading size='sm' color={textColor}>
                  Review Status
                </Heading>
                <HStack>
                  <Badge colorScheme='green'>
                    {reviewData.approvedReviews} Approved
                  </Badge>
                  {reviewData.pendingReviews > 0 && (
                    <Badge colorScheme='orange'>
                      {reviewData.pendingReviews} Pending
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth='1px'>
            <CardBody>
              <VStack align='center' spacing={2}>
                <Icon
                  as={Star}
                  boxSize={8}
                  color={`${getRatingColor(reviewData.averageRating)}.400`}
                />
                <Heading size='sm' color={textColor}>
                  Rating Quality
                </Heading>
                <Badge
                  colorScheme={getRatingColor(reviewData.averageRating)}
                  fontSize='md'
                  px={3}
                  py={1}
                >
                  {getRatingQuality(reviewData.averageRating)}
                </Badge>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
};

export default ReviewAnalytics;
