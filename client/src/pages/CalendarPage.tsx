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

export default function CalendarPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // 7 columns
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // A 5x7 grid to mock January 2024
  // 1 starts on Monday (idx 1). 
  // Let's just create an array of 31 days and pad the start.
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const date = i - 0; // Starts from 1 at index 1
    if (date < 1 || date > 31) return null;
    return date;
  });

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
        <IconButton><ArrowBack /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          January 2024
        </Typography>
        <IconButton><ArrowForward /></IconButton>
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
            // Mock highlights
            let highlightText = '';
            let isHighlighted = false;
            let bgColor = 'transparent';

            if (day && day >= 5 && day <= 10) {
              isHighlighted = true;
              bgColor = '#e0e0e0';
              if (day === 5) highlightText = 'PARIS TRIP';
            } else if (day && day >= 15 && day <= 22) {
              isHighlighted = true;
              bgColor = '#bdbdbd';
              if (day === 15) highlightText = 'NYC - GETAWAY';
            } else if (day && day >= 25 && day <= 29) {
              isHighlighted = true;
              bgColor = '#e0e0e0';
              if (day === 25) highlightText = 'JAPAN ADVENTURE';
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
                  bgcolor: isHighlighted ? bgColor : 'transparent',
                  position: 'relative'
                }}
              >
                {day && (
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {day}
                  </Typography>
                )}
                {highlightText && (
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 2 }}>
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
