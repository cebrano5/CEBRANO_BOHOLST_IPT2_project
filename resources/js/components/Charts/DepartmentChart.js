import React from 'react';
import Chart from 'react-apexcharts';

const DepartmentChart = ({ data }) => {
  const series = [{
    name: 'Students',
    data: data.map(d => d.count)
  }];

  const options = {
    chart: {
      type: 'bar'
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    xaxis: {
      categories: data.map(d => d.department),
    },
    title: {
      text: 'Students per Department',
      align: 'center',
      style: {
        fontSize: '18px'
      }
    }
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
};

export default DepartmentChart;