import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ProductSalesBarChartProps {
  data: Array<{
    productId: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export function ProductSalesBarChart({ data }: ProductSalesBarChartProps) {
  const hasData = data && data.length > 0;

  const displayData = hasData
    ? data
    : [{ name: 'No Data', totalRevenue: 0, totalQuantity: 0 }];

  return (
    <div className='relative'>
      <ResponsiveContainer width='100%' height={375}>
        <BarChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='name'
            angle={-45}
            textAnchor='end'
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              name === 'totalRevenue' ? `$${value}` : value,
              name === 'totalRevenue' ? 'Revenue' : 'Quantity',
            ]}
          />
          <Bar
            dataKey='totalRevenue'
            fill={hasData ? '#8884d8' : '#E5E7EB'}
            name='Revenue ($)'
          />
        </BarChart>
      </ResponsiveContainer>

      {!hasData && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-gray-500'>
            <p className='text-lg font-medium'>No sales data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
