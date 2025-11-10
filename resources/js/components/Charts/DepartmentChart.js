import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DepartmentChart = ({ data, title = "Department Distribution" }) => {
  console.log('DepartmentChart received data:', data);
  
  // Safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p>No department data available</p>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.department || 'Unspecified',
    count: item.count || 0
  }));

  console.log('DepartmentChart chartData:', chartData);

  return (
    <div className="w-full" style={{ height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
            stroke="#9ca3af"
          />
          <YAxis
            fontSize={11}
            width={30}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value} faculty`, 'Count']}
          />
          <Bar
            dataKey="count"
            fill="hsl(217.2, 91.2%, 59.8%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentChart;