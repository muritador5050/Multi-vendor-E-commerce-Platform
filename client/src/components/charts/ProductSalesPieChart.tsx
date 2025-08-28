import { Box, Text } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ProductSalesPieChartProps {
  data: Array<{
    productId: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

const PIE_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export function ProductSalesPieChart({ data }: ProductSalesPieChartProps) {
  const hasData = data && data.length > 0;

  const displayData = hasData
    ? data
    : [{ name: 'No data available', totalRevenue: 1 }];

  return (
    <Box position='relative' w='100%' h='375px'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={displayData}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={
              hasData
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : false
            }
            outerRadius={80}
            fill='#8884d8'
            dataKey='totalRevenue'
          >
            {displayData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  hasData ? PIE_COLORS[index % PIE_COLORS.length] : '#E5E7EB'
                }
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {!hasData && (
        <Box
          position='absolute'
          top='0'
          left='0'
          right='0'
          bottom='0'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Box textAlign='center' color='gray.500'>
            <Text fontSize='lg' fontWeight='medium'>
              No sales data available
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
