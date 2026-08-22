import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PublicIcon from '@mui/icons-material/Public';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import {  } from '../../store/api/adminApi';

interface PlatformStatsProps {
  stats: AdminStats;
}

const PlatformStats: React.FC<PlatformStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers,
      icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Total Trips',
      value: stats.overview.totalTrips,
      icon: <FlightTakeoffIcon color="secondary" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Public Trips',
      value: stats.overview.publicTrips,
      icon: <PublicIcon color="success" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Total Activities',
      value: stats.overview.totalActivities,
      icon: <LocalActivityIcon color="warning" sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {card.value.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ opacity: 0.8 }}>{card.icon}</Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default PlatformStats;
