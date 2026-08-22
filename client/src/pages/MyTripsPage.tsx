import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetTripsQuery } from '../store/api/tripsApi';

export default function MyTripsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // For simplicity we just load the first page of trips.
  // In a real scenario we might load all and categorize locally, or fetch categorized.
  const { data, isLoading } = useGetTripsQuery({ limit: 50 });

  const renderTripCard = (trip: any) => (
    <Card
      key={trip.id}
      onClick={() => navigate(`/trips/${trip.id}`)}
      sx={{
        display: 'flex',
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        cursor: 'pointer',
        '&:hover': { transform: 'translateX(4px)', transition: 'all 0.2s' }
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 200 }}
        image={'https://images.unsplash.com/photo-1501785888041-af3ef285b470'}
        alt={trip.tripName}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {trip.tripName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {trip.description || "Short overview of the trip..."}
        </Typography>
      </CardContent>
    </Card>
  );

  const trips = data?.trips || [];
  
  // Basic categorization based on date
  const now = new Date();
  const ongoing = trips.filter(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now);
  const upcoming = trips.filter(t => new Date(t.startDate) > now);
  const completed = trips.filter(t => new Date(t.endDate) < now);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        My Trips
      </Typography>

      {/* Toolbar */}
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

      {isLoading ? (
        <Typography>Loading trips...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Ongoing Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Ongoing</Typography>
            {ongoing.length > 0 ? ongoing.map(renderTripCard) : <Typography color="text.secondary">No ongoing trips.</Typography>}
          </Box>

          {/* Upcoming Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Up-coming</Typography>
            {upcoming.length > 0 ? upcoming.map(renderTripCard) : <Typography color="text.secondary">No upcoming trips.</Typography>}
          </Box>

          {/* Completed Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Completed</Typography>
            {completed.length > 0 ? completed.map(renderTripCard) : <Typography color="text.secondary">No completed trips.</Typography>}
          </Box>
        </Box>
      )}
    </Box>
  );
}
