import { Box } from '@chakra-ui/react';
import { UserStats } from '../DashboardStats/UserStats';
import PaymentsStats from '../DashboardStats/PaymentsStats';
import OrderStats from '../DashboardStats/OrderStats';
import ProductsStats from '../DashboardStats/ProductsStats';
import VendorStats from '../DashboardStats/VendorStats';
import TopVendorsStats from '../DashboardStats/TopVendorsStats';
import RecentOrdersStats from '../DashboardStats/RecentOrdersStats';
import RevenueChart from '../DashboardStats/RevenueChart';

export const DashboardContent = () => {
  return (
    <Box>
      <Box
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={{ base: 4, md: 6 }}
        mb={{ base: 6, md: 8 }}
      >
        <ProductsStats />
        <OrderStats />
        <PaymentsStats />
        <VendorStats />
      </Box>

      <Box
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          xl: '2fr 1fr',
        }}
        gap={{ base: 6, md: 8 }}
        mb={{ base: 6, md: 8 }}
      >
        <RecentOrdersStats />
        <TopVendorsStats />
      </Box>

      <Box
        w='100%'
        display='grid'
        gridTemplateColumns={{
          base: '1fr',
          xl: '1fr 2fr',
        }}
        gap={{ base: 6, md: 8 }}
        mb={{ base: 6, md: 8 }}
      >
        <UserStats />
        <RevenueChart />
      </Box>
    </Box>
  );
};
