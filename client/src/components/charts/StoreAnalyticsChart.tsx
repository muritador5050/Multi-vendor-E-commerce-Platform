// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
// } from 'recharts';

// interface LineChartCardProps<T> {
//   data: T[];
//   xKey: keyof T;
//   yKey: keyof T;
//   title?: string;
//   lineColor?: string;
//   yLabel?: string;
//   height?: number;
// }

// function StoreAnalytics<T extends Record<string, string | number | Date>>({
//   data,
//   xKey,
//   yKey,
//   lineColor = '#00cdac',
//   yLabel = 'Value',
//   height = 400,
// }: LineChartCardProps<T>) {
//   return (
//     <div
//       className='bg-white p-4 rounded shadow'
//       style={{ width: '100%', height }}
//     >
//       <ResponsiveContainer>
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray='3 3' />
//           <XAxis
//             dataKey={xKey as string}
//             tickFormatter={(value: string) =>
//               new Date(value).toLocaleDateString('en-US', {
//                 month: 'short',
//                 day: 'numeric',
//                 year: '2-digit',
//               })
//             }
//           />
//           <YAxis />
//           <Tooltip
//             formatter={(value) => [`$${value}`, yLabel]}
//             labelFormatter={(label: string) =>
//               new Date(label).toLocaleDateString('en-US', {
//                 weekday: 'short',
//                 month: 'short',
//                 day: 'numeric',
//               })
//             }
//           />
//           <Line
//             type='monotone'
//             dataKey={yKey as string}
//             stroke={lineColor}
//             strokeWidth={2}
//             dot={{ r: 4 }}
//             activeDot={{ r: 6 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default StoreAnalytics;

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface LineChartCardProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  title?: string;
  lineColor?: string;
  yLabel?: string;
  height?: number;
}

function StoreAnalytics<T extends Record<string, string | number | Date>>({
  data,
  xKey,
  yKey,
  lineColor = '#00cdac',
  yLabel = 'Value',
  height = 400,
}: LineChartCardProps<T>) {
  // Check if we have actual data
  const hasData = data && data.length > 0;

  // Create placeholder data when no data is available
  const generatePlaceholderData = () => {
    const placeholderData = [];
    const today = new Date();

    // Generate 7 days of placeholder data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      placeholderData.push({
        [xKey]: date.toISOString(),
        [yKey]: 0,
      } as T);
    }

    return placeholderData;
  };

  const displayData = hasData ? data : generatePlaceholderData();

  return (
    <div
      className='bg-white p-4 rounded shadow relative'
      style={{ width: '100%', height }}
    >
      <ResponsiveContainer>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey={xKey as string}
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: '2-digit',
              })
            }
          />
          <YAxis />
          <Tooltip
            formatter={(value) => [`$${value}`, yLabel]}
            labelFormatter={(label: string) =>
              new Date(label).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            }
          />
          <Line
            type='monotone'
            dataKey={yKey as string}
            stroke={hasData ? lineColor : '#E5E7EB'}
            strokeWidth={2}
            dot={{ r: hasData ? 4 : 0 }} // Hide dots when no data
            activeDot={{ r: hasData ? 6 : 0 }} // Hide active dots when no data
            strokeDasharray={hasData ? undefined : '5 5'} // Dashed line when no data
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Overlay message when no data */}
      {!hasData && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <div className='text-center text-gray-500 bg-white/80 p-4 rounded'>
            {/* <p className='text-lg font-medium text-align'>No data available</p> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreAnalytics;
