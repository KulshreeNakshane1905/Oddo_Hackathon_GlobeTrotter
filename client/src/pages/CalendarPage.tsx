import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useGetTripsQuery } from '../store/api/tripsApi';

export default function CalendarPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Basic date state for month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data } = useGetTripsQuery({ limit: 50 });
  const trips = data?.trips || [];

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar grid
  const calendarDays = [];
  
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // Pad the rest to complete 5 or 6 weeks (35 or 42 cells)
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Helper to check if a specific day is in a trip
  const getTripForDay = (day: number) => {
    if (!day) return null;
    
    // Construct the actual date object for this cell
    const cellDate = new Date(currentYear, currentMonth, day);
    // Remove time for pure date comparison
    cellDate.setHours(0, 0, 0, 0);

    for (const trip of trips) {
      const start = new Date(trip.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(trip.endDate);
      end.setHours(23, 59, 59, 999);

      if (cellDate >= start && cellDate <= end) {
        return trip;
      }
    }
    return null;
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
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
          placeholder="Search calendar events..."
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

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Calendar View
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: { xs: 2, md: 8 }
      }}>
        <IconButton onClick={handlePrevMonth}><ArrowBack /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {monthName} {currentYear}
        </Typography>
        <IconButton onClick={handleNextMonth}><ArrowForward /></IconButton>
      </Box>

      {/* Calendar Grid Container */}
      <Box sx={{ 
        width: '100%', 
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper
      }}>
        {/* Days of week header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${theme.palette.divider}` }}>
          {daysOfWeek.map((day) => (
            <Box key={day} sx={{ p: 2, textAlign: 'center', fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>
              {day}
            </Box>
          ))}
        </Box>

        {/* Days Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((day, idx) => {
            const trip = day ? getTripForDay(day) : null;
            const isHighlighted = !!trip;
            
            // Generate a deterministic color based on trip ID length so it stays consistent
            const colorIndex = trip ? trip.id.length % 3 : 0;
            const bgColors = ['#e0e0e0', '#bdbdbd', '#cfcfcf'];
            const bgColor = isHighlighted ? (theme.palette.mode === 'dark' ? '#333' : bgColors[colorIndex]) : 'transparent';
            
            // Only show the trip name on the FIRST day of the trip within this month, or if it's the 1st of the month and the trip is ongoing
            let highlightText = '';
            if (trip && day) {
               const cellDate = new Date(currentYear, currentMonth, day);
               cellDate.setHours(0,0,0,0);
               const startDate = new Date(trip.startDate);
               startDate.setHours(0,0,0,0);
               
               if (cellDate.getTime() === startDate.getTime() || day === 1) {
                 highlightText = trip.tripName.toUpperCase();
               }
            }

            return (
              <Box 
                key={idx} 
                sx={{ 
                  minHeight: 120, 
                  borderRight: `1px solid ${theme.palette.divider}`, 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: bgColor,
                  position: 'relative'
                }}
              >
                {day && (
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {day}
                  </Typography>
                )}
                {highlightText && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      mt: 2, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      px: 0.5
                    }}
                  >
                    {highlightText}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
