// ============================================================================
// CitySearchModal — Autocomplete city search dialog for adding stops
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocationCity as CityIcon,
  Public as GlobeIcon,
  TrendingUp as PopularIcon,
} from '@mui/icons-material';
import { useLazySearchCitiesQuery } from '../../store/api/citiesApi';
import { useDebounce } from '../../hooks/useDebounce';
import type { City } from '../../types/city.types';

interface CitySearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  tripStartDate: string;
  tripEndDate: string;
}

export default function CitySearchModal({
  open,
  onClose,
  onSelectCity,
  tripStartDate,
  tripEndDate,
}: CitySearchModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startDate, setStartDate] = useState(tripStartDate.split('T')[0]);
  const [endDate, setEndDate] = useState(tripStartDate.split('T')[0]);

  const debouncedQuery = useDebounce(inputValue, 300);

  const [triggerSearch, { data: cities = [], isFetching }] = useLazySearchCitiesQuery();

  // Trigger search when debounced value changes
  useMemo(() => {
    if (debouncedQuery.length >= 2) {
      triggerSearch({ q: debouncedQuery, limit: 15 });
    }
  }, [debouncedQuery, triggerSearch]);

  const handleSelect = () => {
    if (selectedCity) {
      onSelectCity(selectedCity);
      // Reset form
      setSelectedCity(null);
      setInputValue('');
    }
  };

  const handleClose = () => {
    setSelectedCity(null);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CityIcon color="primary" />
        Search & Add City
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* City search autocomplete */}
          <Autocomplete
            options={cities}
            getOptionLabel={(option) => `${option.name}, ${option.country}`}
            loading={isFetching}
            value={selectedCity}
            onChange={(_e, value) => setSelectedCity(value)}
            inputValue={inputValue}
            onInputChange={(_e, value) => setInputValue(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={inputValue.length < 2 ? 'Type at least 2 characters' : 'No cities found'}
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              return (
                <Box component="li" key={key} {...rest} sx={{ gap: 1.5 }}>
                  <Avatar
                    src={option.imageUrl || undefined}
                    sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                  >
                    <GlobeIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.country} · {option.countryCode}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<PopularIcon />}
                    label={option.popularityScore}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search cities"
                placeholder="e.g., Paris, Tokyo, New York..."
                autoFocus
              />
            )}
          />

          {/* Date range for this stop */}
          {selectedCity && (
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                inputProps={{
                  min: tripStartDate.split('T')[0],
                  max: tripEndDate.split('T')[0],
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                inputProps={{
                  min: startDate,
                  max: tripEndDate.split('T')[0],
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          )}

          {/* Selected city preview */}
          {selectedCity && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={selectedCity.imageUrl || undefined}
                sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
              >
                <CityIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedCity.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCity.country} · Cost Index: {Number(selectedCity.costIndex).toFixed(1)}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={!selectedCity}
        >
          Add Stop
        </Button>
      </DialogActions>
    </Dialog>
  );
}
