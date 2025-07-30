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
  Bell,
  ChartPie,
  ChartSpline,
  CircleHelp,
  DollarSign,
  Megaphone,
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
  useDailySalesReport,
  useProductSalesReport,
  useVendorSalesAnalytics,
} from '@/context/OrderContextService';
import { formatLastLogin } from '@/utils/TrackLoginTime';
import { generateLastNDays, mergeWithSalesData } from '@/utils/GenerateDate';
import DailySalesReportChart from '@/components/charts/DailySalesReportChart';
import { SalesSummaryStats } from '@/components/charts/StoreStats';
import StoreAnalytics from '@/components/charts/StoreAnalyticsChart';
import SaleByProductPie from '@/components/charts/SalesProductPieChart';

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

type DailySalesPoint = {
  date: string;
  totalSales: number;
};

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
    change: '0%',
    trend: 'increase',
    bgColor: 'red',
    icon: DollarSign,
  },
  {
    id: 2,
    label: 'Total Orders',
    value: stats?.totalOrders,
    change: '0%',
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
    value: stats?.verificationStatus === 'verified' ? 'Verified' : 'Pending',
    change:
      stats?.verificationStatus === 'verified' ? 'Active' : 'Under Review',
    trend: stats?.verificationStatus === 'verified' ? 'increase' : 'decrease',
    bgColor: stats?.verificationStatus === 'verified' ? 'green' : 'orange',
    icon: Shield,
  },
];

export default function VendorDashboard() {
  const { data } = useVendorProfile();
  const { data: stats } = useVendorStats();
  const { data: analyticsSales, isLoading: isAnalyticsLoading } =
    useVendorSalesAnalytics();
  const { data: dailySales, isLoading: dailySalesLoading } =
    useDailySalesReport();
  const { data: storeAnalytics } = useProductSalesReport();
  //Stats
  if (!stats) return null;
  const cards = getDashboardCards(stats);

  //Store analytics
  const salesData: SalesPoint[] =
    storeAnalytics?.data?.map((item) => ({
      productId: item.productId,
      name: item.name,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    })) ?? [];

  //Daily-sale-report
  const dialySalesData: DailySalesPoint[] =
    dailySales?.data?.map((item) => ({
      date: new Date(item._id).toISOString(),
      totalSales: item.totalSales,
    })) || [];
  const lastNDays = generateLastNDays(15);
  const filledData = mergeWithSalesData(lastNDays, dialySalesData);

  if (dailySalesLoading)
    return (
      <Center fontSize={'xl'} fontWeight={'bold'} color={'gray.300'}>
        Loading daily sales...
      </Center>
    );
  if (isAnalyticsLoading)
    return (
      <Center fontSize={'xl'} fontWeight={'bold'} color={'gray.300'}>
        Loading analytics sales...
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
          <Card>
            <CardBody>
              <DailySalesReportChart
                title='Sales Report by Date'
                data={filledData}
                xKey='date'
                yKey='totalSales'
                yLabel='Sales'
                lineColor='#4f46e5'
              />
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
              <ChartSpline />
              <Text fontWeight='semibold'>Store Analytics</Text>
            </CardHeader>
            <CardBody>
              <StoreAnalytics
                data={salesData}
                xKey='name'
                yKey='totalRevenue'
                yLabel='Revenue ($)'
                lineColor='#4f46e5'
              />
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
              <SaleByProductPie />
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
              <Bell />
              <Text fontWeight='semibold'>Notifications</Text>
            </CardHeader>
            <CardBody></CardBody>
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
              <CircleHelp />
              <Text fontWeight='semibold'>Inquiries</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader bg='#203a43' color='white'>
              <Text fontWeight='semibold'>Store Stats</Text>
            </CardHeader>
            <CardBody>
              {analyticsSales?.data && (
                <SalesSummaryStats data={analyticsSales.data} />
              )}
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
              <Megaphone />
              <Text fontWeight='semibold'>Latest Topics</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
