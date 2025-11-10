import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 min-h-[320px] flex items-center justify-center border rounded-lg bg-card">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.course || 'Unspecified',
    value: item.count
  }));

  return (
    <div className="w-full h-80 min-h-[320px]">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};