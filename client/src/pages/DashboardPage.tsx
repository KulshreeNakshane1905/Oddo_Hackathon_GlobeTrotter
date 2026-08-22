// ============================================================================
// DashboardPage — Placeholder for Phase 2
// ============================================================================

import { Box, Typography, Paper, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Add } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      {/* Greeting header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
          {greeting}, {user?.fullName?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to plan your next adventure?
        </Typography>
      </Box>

      {/* Quick action card */}
      <Paper
        sx={{
          p: 4,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,107,107,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,107,107,0.05) 100%)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            🗺️ Start a New Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a multi-city itinerary, add activities, and track your budget.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => navigate('/trips/new')}
          sx={{ flexShrink: 0, px: 4 }}
        >
          Plan New Trip
        </Button>
      </Paper>

      {/* Placeholder sections — will be populated in Phase 2 */}
      <Box
        sx={{
          mt: 4,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: 200,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📋 Upcoming Trips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your upcoming trips will appear here once you create them.
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: 200,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            🌆 Popular Destinations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover trending cities and plan your next adventure.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
