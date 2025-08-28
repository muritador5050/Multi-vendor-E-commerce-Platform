import {
  Box,
  Text,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Flex,
  Avatar,
  Center,
  Stack,
} from '@chakra-ui/react';

import {
  ChartPie,
  ChartSpline,
  DollarSign,
  Shield,
  ShoppingCart,
  Star,
  type LucideIcon,
} from 'lucide-react';
import {
  useVendorProfile,
  useVendorStats,
} from '@/context/VendorContextService';
import {
  useProductSalesReport,
  useVendorSalesAnalytics,
} from '@/context/OrderContextService';
import { formatLastLogin } from '@/utils/TrackLoginTime';
import { ProductSalesBarChart } from '../charts/ProductSalesBarChart';
import { ProductSalesPieChart } from '../charts/ProductSalesPieChart';
import { VendorSalesSummary } from '../charts/VendorSalesSummary';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
}

interface DashboardCard {
  id: number;
  label: string;
  value: string | number;
  change: string;
  trend: 'increase' | 'decrease';
  bgColor: string;
  icon: LucideIcon;
}

type SalesPoint = {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
};

const getDashboardCards = (stats: DashboardStats): DashboardCard[] => [
  {
    id: 1,
    label: 'Total Revenue',
    value: `$${stats?.totalRevenue}`,
    change: `from ${stats?.totalOrders} orders`,
    trend: 'increase',
    bgColor: 'red',
    icon: DollarSign,
  },
  {
    id: 2,
    label: 'Total Orders',
    value: stats?.totalOrders,
    change: `$${(stats?.totalRevenue / stats?.totalOrders || 0).toFixed(
      0
    )} avg`,
    trend: 'increase',
    bgColor: 'purple',
    icon: ShoppingCart,
  },
  {
    id: 3,
    label: 'Rating',
    value: `${stats?.rating}/5`,
    change: `${stats?.reviewCount} reviews`,
    trend: stats?.rating >= 4 ? 'increase' : 'decrease',
    bgColor: 'blue',
    icon: Star,
  },
  {
    id: 4,
    label: 'Status',
    value: stats?.verificationStatus === 'approved' ? 'Approved' : 'Pending',
    change:
      stats?.verificationStatus === 'approved' ? 'Active' : 'Under Review',
    trend: stats?.verificationStatus === 'approved' ? 'increase' : 'decrease',
    bgColor: stats?.verificationStatus === 'approved' ? 'green' : 'orange',
    icon: Shield,
  },
];

export default function VendorDashboard() {
  const { data, isFetching } = useVendorProfile();
  const { data: stats } = useVendorStats();
  const { data: salesReport, isFetching: isAnalyticsFetching } =
    useVendorSalesAnalytics();
  const { data: salesByProduct } = useProductSalesReport();

  //Stats
  if (!stats) return null;
  const cards = getDashboardCards(stats);

  //Store analytics
  const salesData: SalesPoint[] =
    salesByProduct?.map((item) => ({
      productId: item.productId,
      name: item.name,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    })) ?? [];

  if (isFetching)
    return (
      <Center fontSize={'xl'} fontWeight={'bold'} color={'gray.300'}>
        Fetching Data...
      </Center>
    );

  if (isAnalyticsFetching)
    return (
      <Center fontSize={'xl'} fontWeight={'bold'} color={'gray.300'}>
        Fetching analytics sales...
      </Center>
    );

  return (
    <Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align='center'
        justify='space-between'
        mb={6}
        w='100%'
        bg='white'
        borderRadius='2xl'
        p={6}
      >
        <Stack direction={{ base: 'column', md: 'row' }} align='center' gap={6}>
          <Avatar size='2xl' name='Vendor name' src={data?.user.avatar} />
          <Stat>
            <Text color='teal' fontSize='lg'>
              Welcome to the multivendor-mania Dashboard
            </Text>
            <Text
              textAlign='left'
              fontSize='xl'
              color='red.400'
              fontWeight='bold'
            >
              {' '}
              {data?.businessName}
            </Text>
            <StatHelpText>{formatLastLogin(new Date())}</StatHelpText>
          </Stat>
        </Stack>
        <Stack display={{ base: 'none', md: 'block' }}>
          <Text>Limit stat</Text>
          <Text>Disk space</Text>
        </Stack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {cards.map((card) => {
          const IconComponent = card.icon;

          return (
            <Card
              key={card.id}
              direction='row'
              overflow='hidden'
              variant='outline'
            >
              <Center bg={card.bgColor} w='25%'>
                <IconComponent />
              </Center>
              <CardBody>
                <Stat>
                  <StatLabel>{card.label}</StatLabel>
                  <StatNumber>{card.value}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={card.trend} />
                    {card.change}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
      <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <GridItem colSpan={{ md: 2 }}>
          <VendorSalesSummary data={salesReport ?? null} />
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <ChartSpline />
              <Text fontWeight='semibold'>Sale-By-Product</Text>
            </CardHeader>
            <CardBody>
              <ProductSalesBarChart data={salesData} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <ChartPie />
              <Text fontWeight='semibold'>Sales by Products</Text>
            </CardHeader>
            <CardBody display='flex' flexDirection='column' alignItems='center'>
              <ProductSalesPieChart data={salesData} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
