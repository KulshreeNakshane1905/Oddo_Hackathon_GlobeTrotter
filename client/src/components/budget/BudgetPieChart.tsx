// ============================================================================
// BudgetPieChart — Doughnut chart showing budget category breakdown
// ============================================================================

import React, { useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import type { CategoryTotals, BudgetCategory } from '../../types/budget.types';
import { BUDGET_CATEGORY_COLORS, BUDGET_CATEGORY_LABELS } from '../../types/budget.types';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

interface BudgetPieChartProps {
  categoryTotals: CategoryTotals;
  currency: string;
}

const CATEGORIES: BudgetCategory[] = ['transport', 'accommodation', 'activities', 'meals', 'other'];

const BudgetPieChart: React.FC<BudgetPieChartProps> = ({ categoryTotals, currency }) => {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

  const data = {
    labels: CATEGORIES.map((c) => BUDGET_CATEGORY_LABELS[c]),
    datasets: [
      {
        data: CATEGORIES.map((c) => categoryTotals[c]),
        backgroundColor: CATEGORIES.map((c) => BUDGET_CATEGORY_COLORS[c]),
        borderColor: theme.palette.background.paper,
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: '"Inter", "Roboto", sans-serif',
            size: 13,
            weight: 500 as const,
          },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? '#1A1D2E' : '#FFFFFF',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: '"Inter", "Roboto", sans-serif',
          size: 14,
          weight: 600 as const,
        },
        bodyFont: {
          family: '"Inter", "Roboto", sans-serif',
          size: 13,
        },
        callbacks: {
          label: (context: { label?: string; parsed: number }) => {
            const value = context.parsed;
            const total = categoryTotals.grandTotal;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatCurrency(value, currency)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Export chart as PNG
  const handleExport = useCallback(() => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = 'budget-breakdown.png';
      link.href = url;
      link.click();
    }
  }, []);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Budget Breakdown
          </Typography>
          <Tooltip title="Download chart as PNG">
            <IconButton size="small" onClick={handleExport} sx={{ color: 'text.secondary' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ position: 'relative', height: 320 }}>
          <Doughnut ref={chartRef} data={data} options={options} />
          {/* Center text */}
          <Box
            sx={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {formatCurrency(categoryTotals.grandTotal, currency)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetPieChart;
