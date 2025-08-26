import { Box } from '@chakra-ui/react';
import { UserStats } from './UserStats';
import PaymentsStats from './PaymentsStats';
import OrderStats from './OrderStats';
import ProductsStats from './ProductsStats';
import VendorStats from './VendorStats';
import TopVendorsStats from './TopVendorsStats';
import RecentOrdersStats from './RecentOrdersStats';

export const DashboardStats = () => {
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

      <Box w='100%'>
        <UserStats />
      </Box>
    </Box>
  );
};
