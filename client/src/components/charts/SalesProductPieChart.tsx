// import { useProductSalesReport } from '@/context/OrderContextService';
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
// } from 'recharts';

// type SalesPoint = {
//   productId: string;
//   name: string;
//   totalQuantity: number;
//   totalRevenue: number;
// };

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// export default function SaleByProductPie() {
//   const { data } = useProductSalesReport();

//   const salesData: SalesPoint[] =
//     data?.data?.map((item) => ({
//       productId: item.productId,
//       name: item.name,
//       totalQuantity: item.totalQuantity,
//       totalRevenue: item.totalRevenue,
//     })) ?? [];

//   // Add loading state
//   if (!data?.data || data.data.length === 0) {
//     return <div>No data available</div>;
//   }

//   return (
//     <ResponsiveContainer width='100%' height={375}>
//       <PieChart>
//         <Pie
//           data={salesData} // Use the processed salesData
//           cx='50%'
//           cy='50%'
//           fill='#8884d8'
//           dataKey='totalRevenue' // Use totalRevenue or totalQuantity
//           nameKey='name' // This tells the chart which field to use for labels
//           label
//         >
//           {salesData.map((_, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// }

import { useProductSalesReport } from '@/context/OrderContextService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

type SalesPoint = {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SaleByProductPie() {
  const { data } = useProductSalesReport();

  const salesData: SalesPoint[] =
    data?.data?.map((item) => ({
      productId: item.productId,
      name: item.name,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    })) ?? [];

  // Create placeholder data when no data is available
  const hasData = data?.data && data.data.length > 0;

  const displayData = hasData
    ? salesData
    : [
        {
          productId: 'placeholder',
          name: 'No data available ',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      ];

  return (
    <div className='relative'>
      <ResponsiveContainer width='100%' height={375}>
        <PieChart>
          <Pie
            data={displayData}
            cx='50%'
            cy='50%'
            fill='#8884d8'
            dataKey='totalRevenue'
            nameKey='name'
            label={hasData}
          >
            {displayData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={hasData ? COLORS[index % COLORS.length] : '#E5E7EB'}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
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
