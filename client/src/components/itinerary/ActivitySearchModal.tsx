// ============================================================================
// ActivitySearchModal — Search and add activities to a stop
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Slider,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useLazySearchActivitiesQuery } from '../../store/api/activitiesApi';
import { useDebounce } from '../../hooks/useDebounce';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_COLORS } from '../../utils/constants';
import type { Activity, ActivityType } from '../../types/activity.types';

interface ActivitySearchModalProps {
  open: boolean;
  onClose: () => void;
  onAddActivity: (activity: Activity, scheduledTime: string, cost: number) => void;
  stopId: string;
  cityId: string | null;
  defaultDate: string; // YYYY-MM-DD for the stop's start date
}

export default function ActivitySearchModal({
  open,
  onClose,
  onAddActivity,
  cityId,
  defaultDate,
}: ActivitySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [maxCost, setMaxCost] = useState<number>(500);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const debouncedQuery = useDebounce(searchQuery, 300);

  const [triggerSearch, { data: activities = [], isFetching }] = useLazySearchActivitiesQuery();

  useEffect(() => {
    if (debouncedQuery.length >= 1) {
      triggerSearch({
        q: debouncedQuery,
        type: selectedType || undefined,
        cityId: cityId || undefined,
        maxCost: maxCost < 500 ? maxCost : undefined,
        limit: 20,
      });
    }
  }, [debouncedQuery, selectedType, maxCost, cityId, triggerSearch]);

  const handleAddActivity = (activity: Activity) => {
    // Build ISO datetime from date + time
    const scheduledTime = `${defaultDate}T${selectedTime}:00.000Z`;
    onAddActivity(activity, scheduledTime, Number(activity.avgCost));
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedType(null);
    setMaxCost(500);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon color="primary" />
          Find Activities
        </Box>
        <Tooltip title="Toggle filters">
          <IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Search input */}
          <TextField
            fullWidth
            placeholder="Search activities (e.g., Eiffel Tower, sushi, hiking...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: isFetching ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Type filter chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {ACTIVITY_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                sx={{
                  bgcolor: selectedType === type ? `${ACTIVITY_TYPE_COLORS[type]}30` : undefined,
                  color: selectedType === type ? ACTIVITY_TYPE_COLORS[type] : undefined,
                  borderColor: selectedType === type ? ACTIVITY_TYPE_COLORS[type] : undefined,
                  fontWeight: selectedType === type ? 700 : 400,
                  fontSize: '0.7rem',
                }}
                variant={selectedType === type ? 'outlined' : 'filled'}
              />
            ))}
          </Box>

          {/* Extended filters */}
          {showFilters && (
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Max Cost: ${maxCost}{maxCost >= 500 ? '+' : ''}
              </Typography>
              <Slider
                value={maxCost}
                onChange={(_e, v) => setMaxCost(v as number)}
                min={0}
                max={500}
                step={10}
                size="small"
              />
              <TextField
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1, width: 150 }}
              />
            </Box>
          )}

          {/* Results grid */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 1 }}>
            {activities.length === 0 && debouncedQuery.length >= 1 && !isFetching && (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No activities found. Try a different search term.
              </Typography>
            )}

            <Grid container spacing={1.5}>
              {activities.map((activity) => {
                const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.OTHER;
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={activity.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        height: '100%',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      {activity.imageUrl && (
                        <CardMedia
                          component="img"
                          sx={{ width: 80, objectFit: 'cover' }}
                          image={activity.imageUrl}
                          alt={activity.name}
                        />
                      )}
                      <CardContent sx={{ flex: 1, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {activity.name}
                            </Typography>
                            <Chip
                              label={activity.type}
                              size="small"
                              sx={{
                                bgcolor: `${typeColor}20`,
                                color: typeColor,
                                fontWeight: 600,
                                fontSize: '0.6rem',
                                height: 18,
                                mt: 0.25,
                              }}
                            />
                            <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <MoneyIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  ${Number(activity.avgCost)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {Number(activity.durationHours)}h
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Tooltip title="Add to stop">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAddActivity(activity)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 28,
                                height: 28,
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
