// import React from 'react';
// import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// const data = [
//   { name: 'Electronics', value: 400, color: '#0088FE' },
//   { name: 'Clothing', value: 300, color: '#00C49F' },
//   { name: 'Furniture', value: 300, color: '#FFBB28' },
//   { name: 'Health', value: 200, color: '#FF8042' },
// ];

// export default function CustomPieChart() {
//   return (
//     <div style={{ width: '100%', height: 370 }}>
//       <ResponsiveContainer>
//         <PieChart>
//           <Pie
//             dataKey='value'
//             startAngle={180}
//             endAngle={0}
//             data={data}
//             cx='50%'
//             cy='50%'
//             innerRadius={70}
//             outerRadius={120}
//             stroke='none'
//             label={({ name, percent }) =>
//               `${name} ${(percent * 100).toFixed(0)}%`
//             }
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  { name: 'Audio', value: 400 },
  { name: 'Art', value: 300 },
  { name: 'Camera', value: 300 },
  { name: 'Laptop', value: 200 },
  { name: 'Bikes', value: 300 },
  { name: 'Tools', value: 300 },
  { name: 'Drill Machine', value: 100 },
  { name: 'Accessories', value: 200 },
  { name: 'Smartphones', value: 400 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TwoSimplePieChart() {
  return (
    <ResponsiveContainer width='100%' height={375}>
      <PieChart>
        <Pie data={data} cx='50%' cy='50%' fill='#8884d8' dataKey='value' label>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
