// ============================================================================
// CityGroupedView — Activities grouped by city/stop
// ============================================================================

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  LocationCity as CityIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ACTIVITY_TYPE_COLORS } from '../../utils/constants';
import { formatDateRange, formatTime, formatCurrency } from '../../utils/formatters';
import type { TripStop } from '../../types/trip.types';

interface CityGroupedViewProps {
  stops: TripStop[];
  currency: string;
}

export default function CityGroupedView({ stops, currency }: CityGroupedViewProps) {
  if (stops.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CityIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          No stops to display
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add stops and activities to see your itinerary by city
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {stops.map((stop, index) => {
        const totalStopCost =
          stop.activities.reduce((sum, sa) => sum + Number(sa.cost), 0) +
          Number(stop.transportCost || 0) +
          Number(stop.accommodationCost || 0);

        return (
          <Card key={stop.id} variant="outlined" sx={{ borderRadius: 2 }}>
            {/* City header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2.5,
                py: 2,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Avatar
                src={stop.city.imageUrl || undefined}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {stop.city.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={stop.city.country}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateRange(stop.startDate, stop.endDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {formatCurrency(totalStopCost, currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stop.activities.length} activities
                </Typography>
              </Box>
            </Box>

            {/* Activities list */}
            <CardContent sx={{ py: 1 }}>
              {stop.activities.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 2, fontStyle: 'italic' }}
                >
                  No activities planned for this stop
                </Typography>
              ) : (
                <Stack divider={<Divider />}>
                  {stop.activities.map((sa) => {
                    const { activity } = sa;
                    const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.OTHER;

                    return (
                      <Box
                        key={sa.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1.5,
                          px: 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: typeColor,
                            }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {activity.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={activity.type}
                                size="small"
                                sx={{
                                  bgcolor: `${typeColor}20`,
                                  color: typeColor,
                                  fontWeight: 600,
                                  fontSize: '0.6rem',
                                  height: 16,
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <TimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(sa.scheduledTime)} · {Number(activity.durationHours)}h
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>

                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {formatCurrency(Number(sa.cost), currency)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>

            {/* Stop costs footer */}
            {(stop.transportCost || stop.accommodationCost) && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  px: 2.5,
                  py: 1,
                  bgcolor: 'action.hover',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {stop.transportCost && (
                  <Typography variant="caption" color="text.secondary">
                    Transport: {formatCurrency(Number(stop.transportCost), currency)}
                  </Typography>
                )}
                {stop.accommodationCost && (
                  <Typography variant="caption" color="text.secondary">
                    Accommodation: {formatCurrency(Number(stop.accommodationCost), currency)}
                  </Typography>
                )}
              </Box>
            )}
          </Card>
        );
      })}
    </Stack>
  );
}
