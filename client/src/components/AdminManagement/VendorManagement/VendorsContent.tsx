import { Box } from '@chakra-ui/react';
import VendorAnalyticsStats from './VendorAnalyticstats';
import VendorsTable from './VendorsTable';

export const VendorsContent = () => {
  return (
    <Box>
      <VendorAnalyticsStats />
      <VendorsTable />
    </Box>
  );
};
