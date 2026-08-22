// ============================================================================
// ItineraryPage — Main itinerary builder + viewer for a single trip
// ============================================================================

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Skeleton,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Paper,
  Button,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ViewTimeline as TimelineIcon,
  ViewList as ListIcon,
  Build as BuilderIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/slices/uiSlice';
import { useGetTripByIdQuery } from '../store/api/tripsApi';
import { useAddStopMutation, useUpdateStopMutation, useDeleteStopMutation, useReorderStopsMutation } from '../store/api/stopsApi';
import { useAddActivityToStopMutation, useUpdateStopActivityMutation, useRemoveStopActivityMutation } from '../store/api/activitiesApi';
import StopList from '../components/itinerary/StopList';
import TimelineView from '../components/itinerary/TimelineView';
import CityGroupedView from '../components/itinerary/CityGroupedView';
import CitySearchModal from '../components/itinerary/CitySearchModal';
import ActivitySearchModal from '../components/itinerary/ActivitySearchModal';
import { formatDateRange, formatCurrency, calculateDays } from '../utils/formatters';
import type { City } from '../types/city.types';
import type { Activity } from '../types/activity.types';

type ViewMode = 'builder' | 'timeline' | 'city';

export default function ItineraryPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [activityModal, setActivityModal] = useState<{
    open: boolean;
    stopId: string;
    cityId: string;
    defaultDate: string;
  }>({ open: false, stopId: '', cityId: '', defaultDate: '' });

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: trip,
    isLoading,
    isError,
    error,
  } = useGetTripByIdQuery(tripId!, { skip: !tripId });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [addStop] = useAddStopMutation();
  const [updateStop] = useUpdateStopMutation();
  const [deleteStop] = useDeleteStopMutation();
  const [reorderStops] = useReorderStopsMutation();
  const [addActivity] = useAddActivityToStopMutation();
  const [updateStopActivity] = useUpdateStopActivityMutation();
  const [removeStopActivity] = useRemoveStopActivityMutation();

  // ── Stop handlers ──────────────────────────────────────────────────────────
  const handleAddStop = useCallback(
    async (city: City) => {
      if (!tripId || !trip) return;
      try {
        await addStop({
          tripId,
          data: {
            cityId: city.id,
            startDate: trip.startDate.split('T')[0],
            endDate: trip.startDate.split('T')[0],
          },
        }).unwrap();
        setCityModalOpen(false);
        dispatch(showSnackbar({ message: `${city.name} added to your trip!`, severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to add stop', severity: 'error' }));
      }
    },
    [tripId, trip, addStop, dispatch]
  );

  const handleUpdateStop = useCallback(
    async (stopId: string, data: Record<string, unknown>) => {
      if (!tripId) return;
      try {
        await updateStop({ id: stopId, tripId, data: data as any }).unwrap();
        dispatch(showSnackbar({ message: 'Stop updated', severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to update stop', severity: 'error' }));
      }
    },
    [tripId, updateStop, dispatch]
  );

  const handleDeleteStop = useCallback(
    async (stopId: string) => {
      if (!tripId) return;
      try {
        await deleteStop({ id: stopId, tripId }).unwrap();
        dispatch(showSnackbar({ message: 'Stop removed', severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to remove stop', severity: 'error' }));
      }
    },
    [tripId, deleteStop, dispatch]
  );

  const handleReorderStops = useCallback(
    async (orderedIds: string[]) => {
      if (!tripId) return;
      try {
        await reorderStops({ tripId, data: { orderedIds } }).unwrap();
      } catch {
        dispatch(showSnackbar({ message: 'Failed to reorder stops', severity: 'error' }));
      }
    },
    [tripId, reorderStops, dispatch]
  );

  // ── Activity handlers ──────────────────────────────────────────────────────
  const handleOpenActivityModal = useCallback(
    (stopId: string, cityId: string) => {
      if (!trip) return;
      const stop = trip.stops.find((s) => s.id === stopId);
      setActivityModal({
        open: true,
        stopId,
        cityId,
        defaultDate: stop?.startDate.split('T')[0] || trip.startDate.split('T')[0],
      });
    },
    [trip]
  );

  const handleAddActivity = useCallback(
    async (activity: Activity, scheduledTime: string, cost: number) => {
      if (!tripId) return;
      try {
        await addActivity({
          stopId: activityModal.stopId,
          tripId,
          data: {
            activityId: activity.id,
            scheduledTime,
            cost,
          },
        }).unwrap();
        dispatch(showSnackbar({ message: `${activity.name} added!`, severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to add activity', severity: 'error' }));
      }
    },
    [tripId, activityModal.stopId, addActivity, dispatch]
  );

  const handleUpdateActivity = useCallback(
    async (stopActivityId: string, data: Record<string, unknown>) => {
      if (!tripId) return;
      try {
        await updateStopActivity({
          id: stopActivityId,
          tripId,
          data: data as any,
        }).unwrap();
        dispatch(showSnackbar({ message: 'Activity updated', severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to update activity', severity: 'error' }));
      }
    },
    [tripId, updateStopActivity, dispatch]
  );

  const handleRemoveActivity = useCallback(
    async (stopActivityId: string) => {
      if (!tripId) return;
      try {
        await removeStopActivity({ id: stopActivityId, tripId }).unwrap();
        dispatch(showSnackbar({ message: 'Activity removed', severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to remove activity', severity: 'error' }));
      }
    },
    [tripId, removeStopActivity, dispatch]
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 3 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Container>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !trip) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Trip not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {(error as any)?.data?.error?.message || 'Unable to load this trip.'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/trips')}>
          Back to My Trips
        </Button>
      </Container>
    );
  }

  // ── Computed values ────────────────────────────────────────────────────────
  const totalStops = trip.stops.length;
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);
  const totalDays = calculateDays(trip.startDate, trip.endDate);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* ── Trip Header ──────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark}15 0%, ${theme.palette.secondary.dark}15 100%)`,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Tooltip title="Back to My Trips">
            <IconButton onClick={() => navigate('/trips')} sx={{ mt: 0.5 }}>
              <BackIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {trip.tripName}
            </Typography>
            {trip.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {trip.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<CalendarIcon />}
                label={`${formatDateRange(trip.startDate, trip.endDate)} · ${totalDays} days`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<LocationIcon />}
                label={`${totalStops} stops`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`${totalActivities} activities`}
                variant="outlined"
                size="small"
              />
              {trip.dailyBudget && (
                <Chip
                  icon={<MoneyIcon />}
                  label={`${formatCurrency(Number(trip.dailyBudget), trip.currency)}/day`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* ── View Mode Tabs ────────────────────────────────────────────────── */}
      <Tabs
        value={viewMode}
        onChange={(_e, v) => setViewMode(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
        }}
      >
        <Tab value="builder" label="Builder" icon={<BuilderIcon />} iconPosition="start" />
        <Tab value="timeline" label="Timeline" icon={<TimelineIcon />} iconPosition="start" />
        <Tab value="city" label="By City" icon={<ListIcon />} iconPosition="start" />
      </Tabs>

      {/* ── View Content ──────────────────────────────────────────────────── */}
      {viewMode === 'builder' && (
        <StopList
          stops={trip.stops}
          currency={trip.currency}
          onAddStop={() => setCityModalOpen(true)}
          onDeleteStop={handleDeleteStop}
          onUpdateStop={handleUpdateStop}
          onReorderStops={handleReorderStops}
          onAddActivity={handleOpenActivityModal}
          onUpdateActivity={handleUpdateActivity}
          onRemoveActivity={handleRemoveActivity}
        />
      )}

      {viewMode === 'timeline' && (
        <TimelineView
          stops={trip.stops}
          currency={trip.currency}
          startDate={trip.startDate}
          endDate={trip.endDate}
        />
      )}

      {viewMode === 'city' && (
        <CityGroupedView stops={trip.stops} currency={trip.currency} />
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <CitySearchModal
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        onSelectCity={handleAddStop}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />

      <ActivitySearchModal
        open={activityModal.open}
        onClose={() => setActivityModal((prev) => ({ ...prev, open: false }))}
        onAddActivity={handleAddActivity}
        stopId={activityModal.stopId}
        cityId={activityModal.cityId}
        defaultDate={activityModal.defaultDate}
      />
    </Container>
  );
}
