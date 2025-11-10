import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 71%, 45%)', // green
  'hsl(48, 96%, 53%)',  // yellow
  'hsl(262, 83%, 58%)', // purple
  'hsl(0, 84%, 60%)',   // red
  'hsl(199, 89%, 48%)', // blue
  'hsl(25, 95%, 53%)',  // orange
  'hsl(280, 100%, 70%)' // pink
];

export const CourseChart = ({ data, title = "Course Distribution" }) => {
  console.log('CourseChart received data:', data);
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p>No course data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.course || 'Unspecified',
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  console.log('CourseChart chartData:', chartData);

  return (
    <div className="w-full" style={{ height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#ffffff'
            }}
            formatter={(value, name) => [`${value} students`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};