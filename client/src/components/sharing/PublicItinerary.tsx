import React from 'react';
import { Box, Typography, Paper, Chip, Divider, Avatar } from '@mui/material';
import { Trip, Stop } from '../../types/trip.types';

interface Props {
  trip: Trip;
}

const getCategoryColor = (type: string) => {
  const colors: Record<string, string> = {
    SIGHTSEEING: '#8b5cf6',
    FOOD: '#f59e0b',
    ADVENTURE: '#ef4444',
    CULTURE: '#10b981',
    NIGHTLIFE: '#ec4899',
    SHOPPING: '#3b82f6',
    NATURE: '#84cc16',
    TRANSPORT: '#64748b',
    OTHER: '#94a3b8',
  };
  return colors[type] || colors.OTHER;
};

export const PublicItinerary: React.FC<Props> = ({ trip }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {trip.stops?.map((stop: Stop, index: number) => (
        <Paper key={stop.id} elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar 
              src={stop.city?.imageUrl} 
              sx={{ width: 64, height: 64, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Stop {index + 1}: {stop.city?.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {new Date(stop.startDate).toLocaleDateString()} — {new Date(stop.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          {stop.activities && stop.activities.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stop.activities.map((act) => (
                <Box 
                  key={act.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {act.activity?.name}
                      </Typography>
                      <Chip 
                        label={act.activity?.type} 
                        size="small" 
                        sx={{ 
                          bgcolor: `${getCategoryColor(act.activity?.type || 'OTHER')}20`,
                          color: getCategoryColor(act.activity?.type || 'OTHER'),
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 20
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(act.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                      {' • '} 
                      {act.activity?.durationHours} hrs
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              No activities scheduled yet.
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};
