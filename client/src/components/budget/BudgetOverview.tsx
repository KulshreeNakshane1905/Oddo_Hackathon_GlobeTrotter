// ============================================================================
// BudgetOverview — Summary stat cards for budget breakdown
// ============================================================================

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { BudgetBreakdown } from '../../types/budget.types';
import { formatCurrency } from '../../utils/formatters';

interface BudgetOverviewProps {
  budget: BudgetBreakdown | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  warning?: boolean;
}

function StatCard({ icon, label, value, subtitle, color, warning }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: warning
          ? `2px solid ${theme.palette.warning.main}`
          : `1px solid ${theme.palette.divider}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.12),
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                color: warning ? 'warning.main' : 'text.primary',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Skeleton variant="rounded" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="80%" height={36} sx={{ mt: 0.5 }} />
            <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget, isLoading }) => {
  const theme = useTheme();

  if (isLoading || !budget) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  const { categoryTotals, dailyBudgetLimit, totalDays, overBudgetDays, currency } = budget;
  const dailyAverage = totalDays > 0 ? categoryTotals.grandTotal / totalDays : 0;
  const budgetStatus = dailyBudgetLimit
    ? dailyBudgetLimit * totalDays - categoryTotals.grandTotal
    : null;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          icon={<AccountBalanceWalletIcon />}
          label="Total Budget"
          value={formatCurrency(categoryTotals.grandTotal, currency)}
          subtitle={`Across ${totalDays} days`}
          color={theme.palette.primary.main}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          icon={<TrendingUpIcon />}
          label="Daily Average"
          value={formatCurrency(dailyAverage, currency)}
          subtitle={
            dailyBudgetLimit
              ? `Limit: ${formatCurrency(dailyBudgetLimit, currency)}/day`
              : 'No daily limit set'
          }
          color="#00D9A6"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          icon={<CalendarTodayIcon />}
          label="Trip Duration"
          value={`${totalDays} days`}
          subtitle={`${budget.stopBreakdowns.length} stops planned`}
          color="#38BDF8"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          icon={<WarningAmberIcon />}
          label={budgetStatus !== null ? 'Budget Remaining' : 'Over-Budget Days'}
          value={
            budgetStatus !== null
              ? formatCurrency(Math.abs(budgetStatus), currency)
              : `${overBudgetDays}`
          }
          subtitle={
            budgetStatus !== null
              ? budgetStatus >= 0
                ? 'Under total budget'
                : 'Over total budget!'
              : overBudgetDays > 0
                ? `${overBudgetDays} of ${totalDays} days exceed limit`
                : 'All days within limit'
          }
          color={
            budgetStatus !== null
              ? budgetStatus >= 0
                ? '#00D9A6'
                : '#FF6B6B'
              : overBudgetDays > 0
                ? '#FFB020'
                : '#00D9A6'
          }
          warning={
            (budgetStatus !== null && budgetStatus < 0) || overBudgetDays > 0
          }
        />
      </Grid>
    </Grid>
  );
};

export default BudgetOverview;
