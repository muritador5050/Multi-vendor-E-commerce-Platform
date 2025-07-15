import { Box, Flex, Text } from '@chakra-ui/react';
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

function DailySalesReportChart<
  T extends Record<string, string | number | Date>
>({
  data,
  xKey,
  yKey,
  title = 'Line Chart',
  lineColor = '#8884d8',
  yLabel = 'Value',
  height = 400,
}: LineChartCardProps<T>) {
  // Extract y values and find max absolute value
  const yValues = data.map((d) => Number(d[yKey]));
  const maxAbs = Math.max(...yValues.map(Math.abs));
  const yDomain: [number, number] = [-maxAbs, maxAbs];

  return (
    <Box>
      <div
        className='bg-white p-4 rounded shadow'
        style={{ width: '100%', height }}
      >
        <ResponsiveContainer>
          <LineChart data={data}>
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
            <YAxis domain={yDomain} />
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
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Flex justify='center'>
        <Text fontWeight='bold' color='teal'>
          {title}
        </Text>
      </Flex>
    </Box>
  );
}

export default DailySalesReportChart;
