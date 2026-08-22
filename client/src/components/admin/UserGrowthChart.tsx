import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { AdminStats } from '../../store/api/adminApi';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserGrowthChartProps {
  stats: AdminStats;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ stats }) => {
  // Aggregate data by month for the last 6 months
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return format(d, 'MMM yyyy');
  });

  const getMonthlyCounts = (dates: string[]) => {
    const counts = new Array(6).fill(0);
    dates.forEach(d => {
      const date = new Date(d);
      const monthLabel = format(date, 'MMM yyyy');
      const idx = months.indexOf(monthLabel);
      if (idx !== -1) counts[idx]++;
    });
    return counts;
  };

  const userCounts = getMonthlyCounts(stats.growth.users);
  const tripCounts = getMonthlyCounts(stats.growth.trips);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'New Users',
        data: userCounts,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'New Trips',
        data: tripCounts,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>Platform Growth (Last 6 Months)</Typography>
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <Line options={options} data={data} />
      </Box>
    </Paper>
  );
};

export default UserGrowthChart;
