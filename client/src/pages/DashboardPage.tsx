import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardMedia,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  useTheme,
  IconButton,
  Fab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useGetTripsQuery } from '../store/api/tripsApi';
import { useGetPopularCitiesQuery } from '../store/api/citiesApi';
import { Add, Search, FilterList, Sort } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: upcomingData } = useGetTripsQuery({
    limit: 5,
    sort: 'startDate',
    order: 'asc',
  });

  const { data: popularCities } = useGetPopularCitiesQuery(10);
  const userTrips = upcomingData?.trips || [];

  return (
    <Box
      sx={{
        width: '100%',
        animation: `${fadeIn} 0.5s ease-out`,
        pb: 10, // padding for FAB
      }}
    >
      {/* ── Banner Image ────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 320,
          width: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          mb: 4,
          borderRadius: { xs: 0, md: 4 },
          overflow: 'hidden',
          boxShadow: theme.shadows[4],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <Typography 
          variant="h2" 
          sx={{ 
            color: 'white', 
            fontWeight: 800, 
            position: 'relative', 
            zIndex: 1,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            textAlign: 'center',
            px: 2
          }}
        >
          Explore the World, {user?.fullName?.split(' ')[0]}
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* ── Search and Filter Toolbar ──────────────────────────────────────── */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2, 
            mb: 5 
          }}
        >
          <TextField
            placeholder="Search bar ......"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, bgcolor: theme.palette.background.paper }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider' }}>
              Group by
            </Button>
            <Button variant="outlined" startIcon={<FilterList />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider' }}>
              Filter
            </Button>
            <Button variant="outlined" startIcon={<Sort />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider' }}>
              Sort by...
            </Button>
          </Box>
        </Box>

        {/* ── Top Regional Selections ──────────────────────────────────────── */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Top Regional Selections
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              px: 0.5,
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.divider, borderRadius: 4 },
            }}
          >
            {popularCities?.map((city) => (
              <Card
                key={city.id}
                sx={{
                  minWidth: 160,
                  height: 160,
                  flexShrink: 0,
                  borderRadius: 3,
                  position: 'relative',
                  boxShadow: theme.shadows[2],
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                }}
              >
                <CardMedia
                  component="img"
                  image={city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607'}
                  alt={city.name}
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    p: 1.5,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    {city.name}
                  </Typography>
                </Box>
              </Card>
            ))}
            {(!popularCities || popularCities.length === 0) && (
              <Typography color="text.secondary">Loading regions...</Typography>
            )}
          </Box>
        </Box>

        {/* ── Previous Trips ──────────────────────────────────────── */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Previous Trips
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              px: 0.5,
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.divider, borderRadius: 4 },
            }}
          >
            {userTrips.map((trip) => (
              <Card
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                sx={{
                  minWidth: 200,
                  height: 280,
                  flexShrink: 0,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: theme.shadows[2],
                  cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-4px)', transition: 'all 0.2s' }
                }}
              >
                <CardMedia
                  component="img"
                  image={'https://images.unsplash.com/photo-1501785888041-af3ef285b470'}
                  alt={trip.tripName}
                  sx={{ height: 160, objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                    {trip.tripName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {new Date(trip.startDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            {userTrips.length === 0 && (
              <Paper sx={{ p: 4, width: '100%', textAlign: 'center', borderStyle: 'dashed' }}>
                <Typography color="text.secondary">You have no previous trips.</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Floating Action Button ──────────────────────────────────────── */}
      <Fab
        color="primary"
        variant="extended"
        onClick={() => navigate('/trips/new')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          px: 4,
          py: 3,
          fontSize: '1rem',
          fontWeight: 700,
          boxShadow: theme.shadows[8]
        }}
      >
        <Add sx={{ mr: 1 }} />
        Plan a trip
      </Fab>
    </Box>
  );
}
