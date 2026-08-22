// ============================================================================
// DailyBudgetAlert — Alert banner highlighting days that exceed daily budget
// ============================================================================

import React from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import type { DailyBudget } from '../../types/budget.types';
import { formatCurrency } from '../../utils/formatters';

interface DailyBudgetAlertProps {
  dailyBreakdowns: DailyBudget[];
  dailyBudgetLimit: number | null;
  currency: string;
}

const DailyBudgetAlert: React.FC<DailyBudgetAlertProps> = ({
  dailyBreakdowns,
  dailyBudgetLimit,
  currency,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  // If no daily limit is set, don't show anything
  if (!dailyBudgetLimit) {
    return null;
  }

  const overBudgetDays = dailyBreakdowns.filter((d) => d.isOverBudget);
  const isAllClear = overBudgetDays.length === 0;

  // All clear — green confirmation
  if (isAllClear) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleOutlinedIcon />}
        sx={{
          borderRadius: 2,
          '& .MuiAlert-icon': { alignItems: 'center' },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>Budget on Track</AlertTitle>
        All {dailyBreakdowns.length} days are within your daily budget of{' '}
        {formatCurrency(dailyBudgetLimit, currency)}.
      </Alert>
    );
  }

  // Over-budget warning
  return (
    <Alert
      severity="warning"
      icon={<WarningAmberIcon />}
      sx={{
        borderRadius: 2,
        '& .MuiAlert-icon': { alignItems: 'center', pt: 0.5 },
      }}
      action={
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>
        {overBudgetDays.length} day{overBudgetDays.length > 1 ? 's' : ''} over budget
      </AlertTitle>
      <Typography variant="body2">
        Your daily limit is {formatCurrency(dailyBudgetLimit, currency)}.{' '}
        {overBudgetDays.length} of {dailyBreakdowns.length} days exceed this limit.
      </Typography>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {overBudgetDays.map((day) => {
            const overAmount = day.total - dailyBudgetLimit;
            const dateLabel = new Date(day.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            return (
              <Chip
                key={day.date}
                label={`${dateLabel}: ${formatCurrency(day.total, currency)} (+${formatCurrency(overAmount, currency)})`}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.15),
                  color: theme.palette.warning.dark,
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.warning.main, 0.3),
                  border: '1px solid',
                }}
              />
            );
          })}
        </Box>
      </Collapse>
    </Alert>
  );
};

export default DailyBudgetAlert;
