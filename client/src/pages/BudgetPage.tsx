// ============================================================================
// BudgetPage — Full budget visualization for a trip
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useGetTripByIdQuery } from '../store/api/tripsApi';
import { useGetTripBudgetQuery } from '../store/api/budgetApi';
import BudgetOverview from '../components/budget/BudgetOverview';
import BudgetPieChart from '../components/budget/BudgetPieChart';
import BudgetBarChart from '../components/budget/BudgetBarChart';
import DailyBudgetAlert from '../components/budget/DailyBudgetAlert';
import { formatCurrency, formatDateRange } from '../utils/formatters';
import { BUDGET_CATEGORY_COLORS } from '../types/budget.types';
import type { StopBudget } from '../types/budget.types';

// ── ExpandableStopRow — shows per-stop cost breakdown with activity details ──
interface ExpandableStopRowProps {
  stop: StopBudget;
  currency: string;
}

const ExpandableStopRow: React.FC<ExpandableStopRowProps> = ({ stop, currency }) => {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const stopTotal = stop.transport + stop.accommodation + stop.activities + stop.meals;

  return (
    <>
      <TableRow
        hover
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', '& td': { borderBottom: expanded ? 'none' : undefined } }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <LocationOnIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stop.cityName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stop.country} · {stop.days} day{stop.days > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Chip
            label={formatCurrency(stop.transport, currency)}
            size="small"
            sx={{ bgcolor: alpha(BUDGET_CATEGORY_COLORS.transport, 0.12), fontWeight: 500 }}
          />
        </TableCell>
        <TableCell align="right">
          <Chip
            label={formatCurrency(stop.accommodation, currency)}
            size="small"
            sx={{ bgcolor: alpha(BUDGET_CATEGORY_COLORS.accommodation, 0.12), fontWeight: 500 }}
          />
        </TableCell>
        <TableCell align="right">
          <Chip
            label={formatCurrency(stop.activities, currency)}
            size="small"
            sx={{ bgcolor: alpha(BUDGET_CATEGORY_COLORS.activities, 0.12), fontWeight: 500 }}
          />
        </TableCell>
        <TableCell align="right">
          <Chip
            label={formatCurrency(stop.meals, currency)}
            size="small"
            sx={{ bgcolor: alpha(BUDGET_CATEGORY_COLORS.meals, 0.12), fontWeight: 500 }}
          />
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatCurrency(stopTotal, currency)}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Expanded activity details */}
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, px: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              {stop.activityDetails.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No activities added to this stop yet.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Activities ({stop.activityDetails.length})
                  </Typography>
                  {stop.activityDetails.map((act, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 0.75,
                        borderBottom: i < stop.activityDetails.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={act.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                        <Typography variant="body2">{act.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(act.cost, currency)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ── BudgetPage — Main page component ────────────────────────────────────────
const BudgetPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: trip } = useGetTripByIdQuery(tripId!, { skip: !tripId });
  const { data: budget, isLoading, error } = useGetTripBudgetQuery(tripId!, { skip: !tripId });

  if (!tripId) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 8 }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/trips')}
            sx={{ cursor: 'pointer' }}
          >
            My Trips
          </Link>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/trips/${tripId}`)}
            sx={{ cursor: 'pointer' }}
          >
            {trip?.tripName || 'Trip'}
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Budget
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <IconButton onClick={() => navigate(`/trips/${tripId}`)} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              💰 Budget Breakdown
            </Typography>
            {trip && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {trip.tripName} · {formatDateRange(trip.startDate, trip.endDate)}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => navigate(`/trips/${tripId}/calendar`)}
            sx={{
              color: 'primary.main',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <CalendarMonthIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ── Error state ────────────────────────────────────────────────── */}
      {error && (
        <Card sx={{ mb: 3, border: `1px solid ${theme.palette.error.main}` }}>
          <CardContent>
            <Typography color="error" sx={{ fontWeight: 600 }}>
              Failed to load budget data. Please try again.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ── Overview cards ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <BudgetOverview budget={budget} isLoading={isLoading} />
      </Box>

      {/* ── Daily budget alert ─────────────────────────────────────────── */}
      {budget && (
        <Box sx={{ mb: 4 }}>
          <DailyBudgetAlert
            dailyBreakdowns={budget.dailyBreakdowns}
            dailyBudgetLimit={budget.dailyBudgetLimit}
            currency={budget.currency}
          />
        </Box>
      )}

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          {isLoading ? (
            <Card sx={{ height: 440 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton width="40%" height={28} />
                <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto', mt: 4 }} />
              </CardContent>
            </Card>
          ) : budget ? (
            <BudgetPieChart
              categoryTotals={budget.categoryTotals}
              currency={budget.currency}
            />
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {isLoading ? (
            <Card sx={{ height: 440 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton width="40%" height={28} />
                <Skeleton variant="rectangular" height={340} sx={{ mt: 2, borderRadius: 2 }} />
              </CardContent>
            </Card>
          ) : budget ? (
            <BudgetBarChart
              dailyBreakdowns={budget.dailyBreakdowns}
              dailyBudgetLimit={budget.dailyBudgetLimit}
              currency={budget.currency}
            />
          ) : null}
        </Grid>
      </Grid>

      {/* ── Per-stop cost table ────────────────────────────────────────── */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Cost by Stop
          </Typography>

          {isLoading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={56} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : budget && budget.stopBreakdowns.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: BUDGET_CATEGORY_COLORS.transport }}>
                      Transport
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: BUDGET_CATEGORY_COLORS.accommodation }}>
                      Accommodation
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: BUDGET_CATEGORY_COLORS.activities }}>
                      Activities
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: BUDGET_CATEGORY_COLORS.meals }}>
                      Meals
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budget.stopBreakdowns.map((stop) => (
                    <ExpandableStopRow key={stop.stopId} stop={stop} currency={budget.currency} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Add stops to your trip to see cost breakdown.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BudgetPage;
