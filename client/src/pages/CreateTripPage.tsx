// ============================================================================
// CreateTripPage — Multi-step trip creation wizard
// ============================================================================

import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCreateTripMutation } from '../store/api/tripsApi';
import { showSnackbar } from '../store/slices/uiSlice';
import CreateTripForm from '../components/trips/CreateTripForm';
import type { CreateTripInput } from '../types/trip.types';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function CreateTripPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [createTrip, { isLoading }] = useCreateTripMutation();

  const handleSubmit = async (data: CreateTripInput) => {
    try {
      const trip = await createTrip(data).unwrap();
      dispatch(
        showSnackbar({
          message: `"${trip.tripName}" created! Start adding stops.`,
          severity: 'success',
        })
      );
      // Navigate to the itinerary builder for this trip
      navigate(`/trips/${trip.id}`);
    } catch (err: any) {
      const message =
        err?.data?.error?.message || 'Failed to create trip. Please try again.';
      dispatch(showSnackbar({ message, severity: 'error' }));
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 800,
        mx: 'auto',
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Plan a New Trip
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's set up the basics — you can add cities and activities later.
        </Typography>
      </Box>

      {/* Form card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(26, 29, 46, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <CreateTripForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Paper>
    </Box>
  );
}
