// ============================================================================
// CalendarPage — Calendar view for a trip's activities and stops
// ============================================================================

import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useGetTripByIdQuery } from '../store/api/tripsApi';
import { useGetTripTimelineQuery } from '../store/api/budgetApi';
import { useUpdateStopActivityMutation } from '../store/api/activitiesApi';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/slices/uiSlice';
import TripCalendar from '../components/calendar/TripCalendar';
import { formatDateRange } from '../utils/formatters';

const CalendarPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { data: trip } = useGetTripByIdQuery(tripId!, { skip: !tripId });
  const {
    data: events,
    isLoading,
    error,
  } = useGetTripTimelineQuery(tripId!, { skip: !tripId });

  const [updateStopActivity] = useUpdateStopActivityMutation();

  // ── Drag-to-reschedule handler ────────────────────────────────────
  const handleEventDrop = useCallback(
    async (eventId: string, newStart: Date, _newEnd: Date) => {
      // Only update activities (stops can't be dragged)
      // eventId for activities is the StopActivity ID
      if (eventId.startsWith('stop-')) return;

      try {
        await updateStopActivity({
          id: eventId,
          tripId: tripId!,
          data: { scheduledTime: newStart.toISOString() },
        }).unwrap();

        dispatch(
          showSnackbar({
            message: 'Activity rescheduled successfully',
            severity: 'success',
          })
        );
      } catch {
        dispatch(
          showSnackbar({
            message: 'Failed to reschedule activity',
            severity: 'error',
          })
        );
      }
    },
    [updateStopActivity, dispatch, tripId]
  );

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
            Calendar
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(`/trips/${tripId}`)} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              📅 Trip Calendar
            </Typography>
            {trip && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {trip.tripName} · {formatDateRange(trip.startDate, trip.endDate)}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => navigate(`/trips/${tripId}/budget`)}
            sx={{
              color: 'primary.main',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <AccountBalanceWalletIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ── Error state ────────────────────────────────────────────────── */}
      {error && (
        <Card sx={{ mb: 3, border: `1px solid ${theme.palette.error.main}` }}>
          <CardContent>
            <Typography color="error" sx={{ fontWeight: 600 }}>
              Failed to load timeline data. Please try again.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {isLoading && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Skeleton width={200} height={36} />
              <Skeleton width={300} height={36} />
            </Box>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
          </CardContent>
        </Card>
      )}

      {/* ── Calendar ───────────────────────────────────────────────────── */}
      {!isLoading && events && trip && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            {events.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  No activities scheduled yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Add stops and activities to your trip to see them on the calendar.
                </Typography>
              </Box>
            ) : (
              <TripCalendar
                events={events}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
                onEventDrop={handleEventDrop}
              />
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default CalendarPage;
