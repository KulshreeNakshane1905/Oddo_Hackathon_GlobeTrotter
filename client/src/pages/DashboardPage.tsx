// ============================================================================
// DashboardPage — Home dashboard with upcoming trips and popular cities
// ============================================================================

import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useGetTripsQuery } from '../store/api/tripsApi';
import { useGetPopularCitiesQuery } from '../store/api/citiesApi';
import { Add, CalendarMonth, Place, TrendingUp } from '@mui/icons-material';
import { formatDateRange, getRelativeTime } from '../utils/formatters';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const defaultCityGradients = [
  'linear-gradient(135deg, #6C63FF 0%, #38BDF8 100%)',
  'linear-gradient(135deg, #FF6B6B 0%, #FFB020 100%)',
  'linear-gradient(135deg, #00D9A6 0%, #22C55E 100%)',
  'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)',
];

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch upcoming trips (next 3, sorted by start date, upcoming only)
  const { data: upcomingData, isLoading: tripsLoading } = useGetTripsQuery({
    limit: 3,
    sort: 'startDate',
    order: 'asc',
    upcoming: true,
  });

  // Fetch popular cities
  const { data: popularCities, isLoading: citiesLoading } = useGetPopularCitiesQuery(6);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const upcomingTrips = upcomingData?.trips || [];

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

      {/* Content grid */}
      <Box
        sx={{
          mt: 4,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* ── Upcoming Trips ────────────────────────────────────────────── */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              📋 Upcoming Trips
            </Typography>
            {upcomingTrips.length > 0 && (
              <Button size="small" onClick={() => navigate('/trips')}>
                View All
              </Button>
            )}
          </Box>

          {tripsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          ) : upcomingTrips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No upcoming trips. Time to plan one!
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => navigate('/trips/new')}
              >
                Create Trip
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {upcomingTrips.map((trip) => (
                <Box
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(108,99,255,0.06)'
                          : 'rgba(108,99,255,0.03)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {trip.tripName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </Typography>
                    </Box>
                    <Chip
                      label={getRelativeTime(trip.startDate)}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(108,99,255,0.15)'
                            : 'rgba(108,99,255,0.1)',
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* ── Popular Destinations ──────────────────────────────────────── */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              🌆 Popular Destinations
            </Typography>
            <TrendingUp sx={{ fontSize: 18, color: theme.palette.primary.main }} />
          </Box>

          {citiesLoading ? (
            <Grid container spacing={1.5}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid key={i} size={{ xs: 6, sm: 4 }}>
                  <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : !popularCities || popularCities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Popular destinations will appear here.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {popularCities.map((city, index) => (
                <Grid key={city.id} size={{ xs: 6, sm: 4 }}>
                  <Card
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 2.5,
                      height: 120,
                      cursor: 'pointer',
                    }}
                  >
                    {city.imageUrl ? (
                      <CardMedia
                        component="img"
                        image={city.imageUrl}
                        alt={city.name}
                        sx={{ height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          background:
                            defaultCityGradients[index % defaultCityGradients.length],
                        }}
                      />
                    )}
                    {/* Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 1.5,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {city.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Place sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {city.country}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
