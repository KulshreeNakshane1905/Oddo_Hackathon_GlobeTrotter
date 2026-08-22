// ============================================================================
// TimelineView — Day-by-day timeline of activities across all stops
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
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { ACTIVITY_TYPE_COLORS } from '../../utils/constants';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import type { TripStop, StopActivityWithDetail } from '../../types/trip.types';

interface TimelineEntry {
  date: string;
  activities: Array<{
    stopActivity: StopActivityWithDetail;
    cityName: string;
    cityCountry: string;
  }>;
}

interface TimelineViewProps {
  stops: TripStop[];
  currency: string;
  startDate: string;
  endDate: string;
}

/**
 * Build a day-by-day timeline from stops and activities.
 */
function buildTimeline(stops: TripStop[], startDate: string, endDate: string): TimelineEntry[] {
  const timeline: Map<string, TimelineEntry['activities']> = new Map();

  // Initialize all days in the trip range
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    timeline.set(key, []);
  }

  // Place activities on their scheduled day
  for (const stop of stops) {
    for (const sa of stop.activities) {
      const day = new Date(sa.scheduledTime).toISOString().split('T')[0];
      const existing = timeline.get(day) || [];
      existing.push({
        stopActivity: sa,
        cityName: stop.city.name,
        cityCountry: stop.city.country,
      });
      timeline.set(day, existing);
    }
  }

  // Sort activities by scheduled time within each day
  const result: TimelineEntry[] = [];
  for (const [date, activities] of timeline.entries()) {
    activities.sort(
      (a, b) =>
        new Date(a.stopActivity.scheduledTime).getTime() -
        new Date(b.stopActivity.scheduledTime).getTime()
    );
    result.push({ date, activities });
  }

  return result;
}

export default function TimelineView({ stops, currency, startDate, endDate }: TimelineViewProps) {
  const timeline = buildTimeline(stops, startDate, endDate);

  if (stops.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          No stops to display
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add stops and activities to see your day-by-day timeline
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {timeline.map((entry, idx) => (
        <Box key={entry.date} sx={{ display: 'flex', gap: 2 }}>
          {/* Timeline rail */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 40,
              pt: 1.5,
            }}
          >
            <DotIcon
              sx={{
                fontSize: 12,
                color: entry.activities.length > 0 ? 'primary.main' : 'text.disabled',
              }}
            />
            {idx < timeline.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  width: 2,
                  bgcolor: 'divider',
                  my: 0.5,
                }}
              />
            )}
          </Box>

          {/* Day content */}
          <Box sx={{ flex: 1, pb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: entry.activities.length > 0 ? 'text.primary' : 'text.disabled',
                mb: 1,
              }}
            >
              {formatDate(entry.date)}
            </Typography>

            {entry.activities.length === 0 ? (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                No activities scheduled
              </Typography>
            ) : (
              <Stack spacing={1}>
                {entry.activities.map(({ stopActivity, cityName, cityCountry }) => {
                  const { activity } = stopActivity;
                  const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.OTHER;

                  return (
                    <Card
                      key={stopActivity.id}
                      variant="outlined"
                      sx={{
                        borderLeft: `3px solid ${typeColor}`,
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {activity.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.25, alignItems: 'center' }}>
                              <Chip
                                label={activity.type}
                                size="small"
                                sx={{
                                  bgcolor: `${typeColor}20`,
                                  color: typeColor,
                                  fontWeight: 600,
                                  fontSize: '0.6rem',
                                  height: 18,
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {cityName}, {cityCountry}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Stack sx={{ alignItems: 'flex-end' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {formatTime(stopActivity.scheduledTime)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(Number(stopActivity.cost), currency)}
                            </Typography>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
