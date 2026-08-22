import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateTripInput } from '../../types/trip.types';

const formSchema = z.object({
  tripName: z.string().min(2, 'Trip name is required').max(255),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  originCity: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

type FormValues = z.input<typeof formSchema>;

interface CreateTripFormProps {
  onSubmit: (data: CreateTripInput) => void;
  isLoading?: boolean;
}

const suggestions = [
  { name: 'Eiffel Tower', loc: 'Paris, France', img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f' },
  { name: 'Grand Canyon', loc: 'Arizona, USA', img: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722' },
  { name: 'Machu Picchu', loc: 'Cusco, Peru', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1' },
  { name: 'Colosseum', loc: 'Rome, Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
  { name: 'Taj Mahal', loc: 'Agra, India', img: 'https://images.unsplash.com/photo-1564507592208-028f805a9632' },
  { name: 'Great Wall', loc: 'Beijing, China', img: 'https://images.unsplash.com/photo-1508804185872-d7bad80009be' },
];

export default function CreateTripForm({ onSubmit, isLoading }: CreateTripFormProps) {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripName: '',
      startDate: '',
      endDate: '',
      originCity: '',
    },
    mode: 'onChange',
  });

  const onFormSubmit = (data: FormValues) => {
    const payload: CreateTripInput = {
      tripName: data.tripName,
      startDate: data.startDate,
      endDate: data.endDate,
      currency: 'USD',
    };
    onSubmit(payload);
  };

  const today = new Date().toISOString().split('T')[0];
  const watchedStartDate = watch('startDate');

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Plan a new trip
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 150, fontWeight: 600 }}>Trip Name:</Typography>
            <Controller
              name="tripName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder="e.g. Europe Trip"
                  error={!!errors.tripName}
                  helperText={errors.tripName?.message}
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 150, fontWeight: 600 }}>Origin City:</Typography>
            <Controller
              name="originCity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder="Select a Place"
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 150, fontWeight: 600 }}>Start Date:</Typography>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  size="small"
                  fullWidth
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  slotProps={{ htmlInput: { min: today } }}
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 150, fontWeight: 600 }}>End Date:</Typography>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  size="small"
                  fullWidth
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  slotProps={{ htmlInput: { min: watchedStartDate || today } }}
                />
              )}
            />
          </Box>

          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
            sx={{ mt: 2, alignSelf: 'flex-start', px: 4 }}
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Button>
        </Box>
      </Box>

      {/* Suggestions Section */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Suggestion for Places to Visit/Activities to perform
        </Typography>
        <Grid container spacing={2}>
          {suggestions.map((sug, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 2, 
                border: `1px solid ${theme.palette.divider}`, 
                boxShadow: theme.shadows[1] 
              }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={sug.img}
                  alt={sug.name}
                />
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{sug.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{sug.loc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
