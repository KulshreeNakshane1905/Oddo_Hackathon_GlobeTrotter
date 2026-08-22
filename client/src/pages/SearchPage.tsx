import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';

export default function SearchPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('Paragliding');

  const results = [
    { id: 1, title: 'Option and its details' },
    { id: 2, title: 'Option and its details' },
    { id: 3, title: 'Option and its details' },
    { id: 4, title: 'Option and its details' },
    { id: 5, title: 'Option and its details' },
    { id: 6, title: 'Option and its details' },
    { id: 7, title: 'Option and its details' },
  ];

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

      {/* Results Header */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Results
      </Typography>

      {/* Results List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {results.map((item) => (
          <Card 
            key={item.id} 
            sx={{ 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 500 }}>
                {item.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
