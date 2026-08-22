import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort, ArrowDownward } from '@mui/icons-material';
import { useGetTripByIdQuery } from '../store/api/tripsApi';

export default function ItineraryPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const { data: trip, isLoading } = useGetTripByIdQuery(tripId!, { skip: !tripId });

  if (isLoading) {
    return <Box sx={{ p: 4 }}>Loading...</Box>;
  }

  if (!trip) {
    return <Box sx={{ p: 4 }}>Trip not found.</Box>;
  }

  const hasStops = trip.stops && trip.stops.length > 0;

  // Generate some mock activities for visualization if the backend doesn't provide them.
  const days = hasStops 
    ? trip.stops.map((stop: any, index: number) => ({
        dayLabel: `Day ${index + 1}`,
        activities: stop.activities?.length > 0
          ? stop.activities.map((a: any) => ({ 
              id: a.id, 
              title: a.activity?.name || 'Local Activity', 
              expense: a.activity?.estimatedCost ? `$${a.activity.estimatedCost}` : '$0.00'
            }))
          : [
              { id: 1, title: `Visit ${stop.city?.name || 'Local Attraction'}`, expense: '$50.00' },
              { id: 2, title: 'Lunch at local restaurant', expense: '$35.00' },
              { id: 3, title: 'Evening Walk & Sightseeing', expense: '$0.00' },
            ]
      }))
    : [
        {
          dayLabel: 'Day 1',
          activities: [
            { id: 1, title: 'Visit Local Attraction (Example)', expense: '$50.00' },
            { id: 2, title: 'Lunch at local restaurant (Example)', expense: '$35.00' },
            { id: 3, title: 'Evening Walk & Sightseeing (Example)', expense: '$0.00' },
          ]
        },
        {
          dayLabel: 'Day 2',
          activities: [
            { id: 4, title: 'Museum Tour (Example)', expense: '$20.00' },
            { id: 5, title: 'Shopping (Example)', expense: '$100.00' },
          ]
        }
      ];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1000,
        mx: 'auto',
      }}
    >
      {/* Toolbar */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2, 
          mb: 4 
        }}
      >
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Group by
          </Button>
          <Button variant="outlined" startIcon={<FilterList />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<Sort />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Sort by...
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 4 }}>
        Itenary for a selected place
      </Typography>

      {/* Column Headers */}
      <Box sx={{ display: 'flex', mb: 3, pl: { xs: 0, sm: 12 } }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, textAlign: 'center' }}>
          Physical Activity
        </Typography>
        <Typography variant="h6" sx={{ width: 150, fontWeight: 700, textAlign: 'center' }}>
          Expense
        </Typography>
      </Box>

      {/* Days List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {days.map((day, dIdx) => (
          <Box key={dIdx} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
            
            {/* Day Badge */}
            <Box sx={{ 
              border: `2px solid ${theme.palette.text.primary}`,
              borderRadius: 2,
              px: 2,
              py: 1,
              minWidth: 80,
              textAlign: 'center',
              fontWeight: 700,
              mt: 1
            }}>
              {day.dayLabel}
            </Box>

            {/* Activities and Expenses */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {day.activities.map((activity, aIdx) => (
                <Box key={activity.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* Row: Activity Box + Expense Box */}
                  <Box sx={{ display: 'flex', width: '100%', gap: 3, alignItems: 'center' }}>
                    
                    {/* Activity Box */}
                    <Box sx={{ 
                      flexGrow: 1, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 2, 
                      p: 2,
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: theme.palette.background.paper
                    }}>
                      <Typography variant="body1">{activity.title}</Typography>
                    </Box>

                    {/* Expense Box */}
                    <Box sx={{ 
                      width: 150, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 2, 
                      p: 2,
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.background.paper
                    }}>
                      <Typography variant="body1">{activity.expense}</Typography>
                    </Box>
                  </Box>

                  {/* Arrow (except after last item) */}
                  {aIdx < day.activities.length - 1 && (
                    <ArrowDownward sx={{ my: 1, color: 'text.secondary' }} />
                  )}
                </Box>
              ))}
            </Box>

          </Box>
        ))}

        {days.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No itinerary items available.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
