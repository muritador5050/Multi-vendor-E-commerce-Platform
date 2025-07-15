import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';

type SummarySales = {
  totalOrders: number;
  totalProductsSold: number;
  totalSales: number;
};

export function SalesSummaryStats({ data }: { data: SummarySales }) {
  return (
    <SimpleGrid spacing={6}>
      <Stat
        p={4}
        rounded='md'
        shadow='md'
        bgGradient='linear(to-r, teal.400, cyan.400)'
        color='white'
      >
        <StatLabel>Total Sales</StatLabel>
        <StatNumber>${data?.totalSales?.toFixed(2) || 0}</StatNumber>
        <StatHelpText>All-time sales</StatHelpText>
      </Stat>

      <Stat
        p={4}
        rounded='md'
        shadow='md'
        bgGradient='linear(to-r, purple.400, pink.400)'
        color='white'
      >
        <StatLabel>Total Orders</StatLabel>
        <StatNumber>{data?.totalOrders || 0}</StatNumber>
        <StatHelpText>All orders made</StatHelpText>
      </Stat>

      <Stat
        p={4}
        rounded='md'
        shadow='md'
        bgGradient='linear(to-r, orange.400, red.400)'
        color='white'
      >
        <StatLabel>Products Sold</StatLabel>
        <StatNumber>{data?.totalProductsSold || 0}</StatNumber>
        <StatHelpText>All-time</StatHelpText>
      </Stat>
    </SimpleGrid>
  );
}
