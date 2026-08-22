import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, IconButton, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useGetSavedCitiesQuery, useUnsaveCityMutation } from '../../store/api/usersApi';

export const SavedCities: React.FC = () => {
  const { data: cities, isLoading } = useGetSavedCitiesQuery();
  const [unsaveCity] = useUnsaveCityMutation();

  if (isLoading) return <CircularProgress />;

  if (!cities || cities.length === 0) {
    return <Typography color="text.secondary">You haven't saved any cities yet.</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {cities.map((city) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={city.id}>
          <Card sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="140"
              image={city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607'}
              alt={city.name}
            />
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main', bgcolor: 'rgba(255,255,255,0.7)' }}
              onClick={() => unsaveCity(city.id)}
            >
              <Favorite />
            </IconButton>
            <CardContent>
              <Typography variant="h6">{city.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {city.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
