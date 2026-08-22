// ============================================================================
// TripList — Responsive grid of TripCards with pagination
// ============================================================================

import {
  Box,
  Grid,
  Pagination,
  Skeleton,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import { Add, FlightTakeoff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../../types/trip.types';
import type { PaginationMeta } from '../../types/api.types';
import TripCard from './TripCard';
import { keyframes } from '@emotion/react';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface TripListProps {
  trips: Trip[];
  meta?: PaginationMeta;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

export default function TripList({
  trips,
  meta,
  isLoading,
  page,
  onPageChange,
  onEdit,
  onDelete,
}: TripListProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton
              variant="rounded"
              height={320}
              sx={{ borderRadius: 4 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (trips.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          animation: `${fadeInUp} 0.5s ease-out`,
        }}
      >
        <FlightTakeoff
          sx={{
            fontSize: 72,
            color: theme.palette.primary.main,
            opacity: 0.5,
            mb: 2,
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          No trips yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start planning your next adventure! Create a trip to add cities,
          activities, and track your budget.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => navigate('/trips/new')}
          sx={{ px: 4 }}
        >
          Plan Your First Trip
        </Button>
      </Box>
    );
  }

  // ── Trip grid ───────────────────────────────────────────────────────────
  return (
    <Box>
      <Grid container spacing={3}>
        {trips.map((trip, index) => (
          <Grid
            key={trip.id}
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{
              animation: `${fadeInUp} 0.4s ease-out`,
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both',
            }}
          >
            <TripCard trip={trip} onEdit={onEdit} onDelete={onDelete} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={meta.totalPages}
            page={page}
            onChange={(_e, value) => onPageChange(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
