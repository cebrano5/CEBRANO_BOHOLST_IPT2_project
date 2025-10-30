import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface DepartmentChartProps {
  data: Array<{
    department: string;
    count: number;
  }>;
  title?: string;
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({
  data,
  title = "Department Distribution"
}) => {
  // Check if data is empty or loading
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No department data available</p>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.department || 'Unspecified',
    count: item.count,
    fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)` // Random colors for now
  }));

  return (
    <div className="w-full h-80 min-h-[320px]">
      <ResponsiveContainer width="100%" height={320} minWidth={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          <XAxis
            dataKey="name"
            className="text-gray-600 dark:text-gray-400"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            fontSize={11}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value) => [`${value} faculty`, 'Count']}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};