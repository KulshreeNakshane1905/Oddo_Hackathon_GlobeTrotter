// ============================================================================
// BudgetBarChart — Stacked bar chart showing daily spending by category
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
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import type { DailyBudget, BudgetCategory } from '../../types/budget.types';
import { BUDGET_CATEGORY_COLORS, BUDGET_CATEGORY_LABELS } from '../../types/budget.types';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend, annotationPlugin);

interface BudgetBarChartProps {
  dailyBreakdowns: DailyBudget[];
  dailyBudgetLimit: number | null;
  currency: string;
}

const STACK_CATEGORIES: BudgetCategory[] = ['transport', 'accommodation', 'activities', 'meals'];

const BudgetBarChart: React.FC<BudgetBarChartProps> = ({
  dailyBreakdowns,
  dailyBudgetLimit,
  currency,
}) => {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  // Format dates for x-axis labels
  const labels = dailyBreakdowns.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const datasets = STACK_CATEGORIES.map((category) => ({
    label: BUDGET_CATEGORY_LABELS[category],
    data: dailyBreakdowns.map((d) => d[category]),
    backgroundColor: BUDGET_CATEGORY_COLORS[category],
    borderRadius: 4,
    borderSkipped: false as const,
  }));

  const data = { labels, datasets };

  // Build annotations
  const annotations: Record<string, object> = {};
  if (dailyBudgetLimit) {
    annotations['budgetLine'] = {
      type: 'line',
      yMin: dailyBudgetLimit,
      yMax: dailyBudgetLimit,
      borderColor: '#FF6B6B',
      borderWidth: 2,
      borderDash: [6, 4],
      label: {
        display: true,
        content: `Daily Limit: ${formatCurrency(dailyBudgetLimit, currency)}`,
        position: 'end',
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        color: '#FFF',
        font: { size: 11, weight: '600' },
        padding: { top: 4, bottom: 4, left: 8, right: 8 },
        borderRadius: 4,
      },
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", sans-serif',
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        stacked: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", sans-serif',
            size: 12,
          },
          callback: (value: string | number) => formatCurrency(Number(value), currency),
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: '"Inter", "Roboto", sans-serif',
            size: 12,
            weight: 500 as const,
          },
          usePointStyle: true,
          pointStyleWidth: 10,
          padding: 16,
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
          size: 13,
          weight: 600 as const,
        },
        bodyFont: {
          family: '"Inter", "Roboto", sans-serif',
          size: 12,
        },
        callbacks: {
          label: (context: { dataset?: { label?: string }; parsed?: { y?: number } }) => {
            const value = context.parsed?.y ?? 0;
            return ` ${context.dataset?.label ?? ''}: ${formatCurrency(value, currency)}`;
          },
          footer: (tooltipItems: Array<{ parsed?: { y?: number } }>) => {
            const total = tooltipItems.reduce((sum, item) => sum + (item.parsed?.y ?? 0), 0);
            const line = `Total: ${formatCurrency(total, currency)}`;
            if (dailyBudgetLimit && total > dailyBudgetLimit) {
              return `${line}  ⚠️ Over budget!`;
            }
            return line;
          },
        },
      },
      annotation: {
        annotations,
      },
    },
  };

  // Export chart as PNG
  const handleExport = useCallback(() => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = 'daily-spending.png';
      link.href = url;
      link.click();
    }
  }, []);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Daily Spending
          </Typography>
          <Tooltip title="Download chart as PNG">
            <IconButton size="small" onClick={handleExport} sx={{ color: 'text.secondary' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ height: 360 }}>
          <Bar ref={chartRef} data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetBarChart;
