import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartComponent = ({ 
  type = 'line', 
  data, 
  options = {}, 
  title,
  height = 300,
  className = ""
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        },
        cornerRadius: 8
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    } : {}
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins
    }
  };

  const ChartWrapper = ({ children }) => (
    <div className={`chart-container ${className}`} style={{ height }}>
      {children}
    </div>
  );

  switch (type) {
    case 'line':
      return (
        <ChartWrapper>
          <Line data={data} options={mergedOptions} />
        </ChartWrapper>
      );
    case 'bar':
      return (
        <ChartWrapper>
          <Bar data={data} options={mergedOptions} />
        </ChartWrapper>
      );
    case 'doughnut':
      return (
        <ChartWrapper>
          <Doughnut data={data} options={mergedOptions} />
        </ChartWrapper>
      );
    default:
      return (
        <ChartWrapper>
          <Line data={data} options={mergedOptions} />
        </ChartWrapper>
      );
  }
};

export default ChartComponent;
