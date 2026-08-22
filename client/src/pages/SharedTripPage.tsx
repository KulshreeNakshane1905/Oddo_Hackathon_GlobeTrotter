import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Avatar, CircularProgress, Alert } from '@mui/material';
import { useGetPublicTripQuery } from '../store/api/sharingApi';
import { PublicItinerary } from '../components/sharing/PublicItinerary';
import { CopyTripButton } from '../components/sharing/CopyTripButton';

export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { data: trip, isLoading, error } = useGetPublicTripQuery(token || '');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error" variant="filled">
          This trip link is invalid or has been revoked by the owner.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          height: 300,
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 4,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 'bold' }} gutterBottom>
            {trip.tripName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={trip.user?.profilePic || ''} sx={{ width: 40, height: 40 }} />
            <Typography variant="subtitle1">
              Curated by {trip.user?.fullName}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
              Trip Itinerary
            </Typography>
            <Typography variant="body1" color="text.secondary" component="p" sx={{ mb: 2 }}>
              {trip.description || 'No description provided for this trip.'}
            </Typography>
            <Box sx={{ mt: 4 }}>
              <PublicItinerary trip={trip} />
            </Box>
          </Box>

          {/* Sticky Sidebar for Copy Button */}
          <Box
            sx={{
              position: 'sticky',
              top: 100,
              width: { xs: '100%', md: 350 },
              p: 3,
              borderRadius: 4,
              bgcolor: 'background.paper',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              Like this trip?
            </Typography>
            <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
              Copy this exact itinerary into your own account. You can then edit dates, add stops, and customize it to your liking!
            </Typography>
            <Box sx={{ mt: 3 }}>
              <CopyTripButton token={token!} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SharedTripPage;
