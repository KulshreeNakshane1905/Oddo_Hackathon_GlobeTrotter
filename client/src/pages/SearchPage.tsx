import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardMedia,
  CardContent,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';
import { useGetPopularCitiesQuery, useLazySearchCitiesQuery } from '../store/api/citiesApi';

export default function SearchPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: popularCities, isLoading: popularLoading } = useGetPopularCitiesQuery(20);
  const [triggerSearch, { data: searchResults, isLoading: searchLoading }] = useLazySearchCitiesQuery();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      triggerSearch({ q: searchQuery.trim(), limit: 20 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Show search results if we searched, otherwise show popular cities
  const displayCities = searchQuery.trim() && searchResults ? searchResults : popularCities || [];
  const isLoading = searchLoading || popularLoading;

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
          onKeyDown={handleKeyDown}
          placeholder="Search cities..."
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
          <Button variant="outlined" onClick={handleSearch} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Search
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
        {searchQuery.trim() && searchResults ? `Results for "${searchQuery}"` : 'Popular Cities'}
      </Typography>

      {/* Results List */}
      {isLoading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {displayCities.length > 0 ? displayCities.map((city) => (
            <Card 
              key={city.id} 
              sx={{ 
                display: 'flex',
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: 120, height: 90, objectFit: 'cover' }}
                image={city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400'}
                alt={city.name}
              />
              <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {city.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {city.country} · Cost Index: {city.costIndex} · Popularity: {city.popularityScore}/100
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No cities found. Try a different search term.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
