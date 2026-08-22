// ============================================================================
// MyTripsPage — List all user's trips with sort/filter and pagination
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from '@mui/material';
import { Add, Sort as SortIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetTripsQuery, useDeleteTripMutation } from '../store/api/tripsApi';
import { showSnackbar } from '../store/slices/uiSlice';
import TripList from '../components/trips/TripList';
import type { Trip } from '../types/trip.types';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

type SortField = 'createdAt' | 'startDate' | 'tripName';
type SortOrder = 'asc' | 'desc';

export default function MyTripsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Local state ─────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  // ── API hooks ───────────────────────────────────────────────────────────
  const { data, isLoading } = useGetTripsQuery({
    page,
    limit: 9,
    sort,
    order,
  });

  const [deleteTrip, { isLoading: isDeleting }] = useDeleteTripMutation();

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSortChange = (newSort: SortField) => {
    setSort(newSort);
    setPage(1); // Reset to page 1 on sort change
  };

  const handleOrderToggle = () => {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const handleEdit = (trip: Trip) => {
    navigate(`/trips/${trip.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTrip(deleteTarget.id).unwrap();
      dispatch(
        showSnackbar({ message: 'Trip deleted successfully', severity: 'success' })
      );
    } catch {
      dispatch(
        showSnackbar({ message: 'Failed to delete trip', severity: 'error' })
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            My Trips
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data?.meta?.total
              ? `${data.meta.total} trip${data.meta.total === 1 ? '' : 's'}`
              : 'Manage your travel plans'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/trips/new')}
          sx={{ flexShrink: 0, px: 3 }}
        >
          New Trip
        </Button>
      </Box>

      {/* Sort controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <SortIcon sx={{ color: 'text.secondary' }} />
        <TextField
          select
          size="small"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as SortField)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="createdAt">Date Created</MenuItem>
          <MenuItem value="startDate">Start Date</MenuItem>
          <MenuItem value="tripName">Name</MenuItem>
        </TextField>
        <ToggleButtonGroup
          size="small"
          value={order}
          exclusive
          onChange={handleOrderToggle}
        >
          <ToggleButton value="desc" aria-label="descending">
            Newest
          </ToggleButton>
          <ToggleButton value="asc" aria-label="ascending">
            Oldest
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Trip list */}
      <TripList
        trips={data?.trips || []}
        meta={data?.meta}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.tripName}</strong>? This will permanently
            remove all stops, activities, and budget data associated with this
            trip. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
