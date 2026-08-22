import React, { useState } from 'react';
import { Box, Container, Typography, Button, Avatar, Grid, Card, CardMedia, CardContent, CardActions, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { ProfileForm } from '../components/profile/ProfileForm';
import { useGetTripsQuery } from '../store/api/tripsApi';

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);

  const { data } = useGetTripsQuery({ limit: 50 });
  const allTrips = data?.trips || [];
  
  const now = new Date();
  const upcomingTrips = allTrips.filter(t => new Date(t.startDate) > now);
  const pastTrips = allTrips.filter(t => new Date(t.endDate) < now);

  const renderTripCard = (trip: any) => (
    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={trip.id}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.2s' }
      }}
      onClick={() => navigate(`/trips/${trip.id}`)}
      >
        <CardMedia
          component="img"
          height="140"
          image={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'}
          alt={trip.tripName}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {trip.tripName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" variant="outlined" fullWidth sx={{ borderRadius: 2 }}>
            View
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* Top Header: Image + Details */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 4, 
        alignItems: 'center',
        mb: 8,
        p: 4,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper
      }}>
        <Avatar
          src={user?.profilePic || ''}
          sx={{ width: 150, height: 150, boxShadow: theme.shadows[2] }}
        />
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {!isEditing ? (
            <>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {user?.fullName || 'User Name'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, maxWidth: 600 }}>
                Passionate traveler, exploring the world one city at a time.
                Always looking for the next adventure and ready to share experiences!
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ alignSelf: 'flex-start', mt: 2 }}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <ProfileForm />
              <Button sx={{ mt: 2 }} onClick={() => setIsEditing(false)}>Cancel</Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Preplanned Trips Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Preplanned Trips
        </Typography>
        <Grid container spacing={3}>
          {trips.slice(0, 4).map(renderTripCard)}
        </Grid>
      </Box>

      {/* Previous Trips Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Previous Trips
        </Typography>
        <Grid container spacing={3}>
          {trips.slice(2, 4).map(renderTripCard)}
        </Grid>
      </Box>

    </Container>
  );
};

export default ProfilePage;
