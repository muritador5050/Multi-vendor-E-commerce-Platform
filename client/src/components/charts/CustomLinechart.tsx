import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Simulate registration date
const registrationDate = new Date('2025-06-03');

// Generate 10 days of sample data after registration
const data = Array.from({ length: 10 }, (_, i) => {
  const date = new Date(registrationDate);
  date.setDate(date.getDate() + i);
  return {
    date: date.toISOString(), // ISO format for consistency
    value: parseFloat((Math.random() * 20 - 10).toFixed(2)), // Between -10 and +10
  };
});

const CustomLineChart = () => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='date'
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }
          />
          <YAxis domain={[-10, 10]} ticks={[-10, -5, 0, 5, 10]} />
          <Line
            type='monotone'
            dataKey='value'
            stroke='#00cdac'
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
