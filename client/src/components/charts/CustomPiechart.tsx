import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Electronics', value: 400, color: '#0088FE' },
  { name: 'Clothing', value: 300, color: '#00C49F' },
  { name: 'Furniture', value: 300, color: '#FFBB28' },
  { name: 'Health', value: 200, color: '#FF8042' },
];

const cx = 200;
const cy = 200;
const iR = 70;
const oR = 120;
const value = 600; // Example value for needle (if used)

// Optional needle rendering function
const needle = (
  value: number,
  data: { name: string; value: number; color: string }[],
  cx: number,
  cy: number,
  iR: number,
  oR: number,
  color: string
) => {
  const total = data.reduce((acc, entry) => acc + entry.value, 0);
  const angle = 180 - (value / total) * 180;
  const length = oR;
  const rad = Math.PI / 180;
  const x = cx + length * Math.cos(-angle * rad);
  const y = cy + length * Math.sin(-angle * rad);

  return (
    <g>
      <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill={color} />
    </g>
  );
};

export default function CustomPieChart() {
  return (
    <ResponsiveContainer width={700} height='80%'>
      <PieChart>
        <Pie
          dataKey='value'
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          fill='#8884d8'
          stroke='none'
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {needle(value, data, cx, cy, iR, oR, '#d0d000')}
      </PieChart>
    </ResponsiveContainer>
  );
}
