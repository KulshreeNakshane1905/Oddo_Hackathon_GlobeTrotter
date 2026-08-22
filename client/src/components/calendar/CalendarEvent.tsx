// ============================================================================
// CalendarEvent — Custom event renderer for react-big-calendar
// ============================================================================

import React from 'react';
import {
  Box,
  Typography,
  Popover,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ACTIVITY_TYPE_COLORS } from '../../types/budget.types';
import { formatCurrency, formatTime } from '../../utils/formatters';

export interface CalendarEventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'activity' | 'stop';
  activityType?: string;
  cityName: string;
  cost: number;
  notes: string | null;
  durationHours: number;
}

interface CalendarEventProps {
  event: CalendarEventData;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({ event }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const bgColor = event.type === 'activity'
    ? ACTIVITY_TYPE_COLORS[event.activityType || 'OTHER']
    : theme.palette.primary.main;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 1,
          backgroundColor: alpha(bgColor, 0.85),
          color: '#FFF',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: bgColor,
            transform: 'scale(1.02)',
            boxShadow: `0 2px 8px ${alpha(bgColor, 0.4)}`,
          },
        }}
      >
        {event.type === 'activity' && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#FFF',
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: 11,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {event.title}
        </Typography>
      </Box>

      {/* Detail popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              minWidth: 280,
              maxWidth: 340,
              border: `1px solid ${alpha(bgColor, 0.3)}`,
              boxShadow: `0 8px 32px ${alpha(bgColor, 0.15)}`,
            },
          },
        }}
      >
        <Card elevation={0}>
          {/* Colored header bar */}
          <Box
            sx={{
              height: 4,
              background: `linear-gradient(90deg, ${bgColor}, ${alpha(bgColor, 0.5)})`,
            }}
          />
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {event.title}
            </Typography>

            {event.type === 'activity' && event.activityType && (
              <Chip
                label={event.activityType}
                size="small"
                sx={{
                  mb: 1.5,
                  bgcolor: alpha(bgColor, 0.12),
                  color: bgColor,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {event.cityName}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatTime(event.start.toISOString())} – {formatTime(event.end.toISOString())}
                  {event.type === 'activity' && ` (${event.durationHours}h)`}
                </Typography>
              </Box>

              {event.cost > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {formatCurrency(event.cost)}
                  </Typography>
                </Box>
              )}

              {event.notes && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {event.notes}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
};

export default CalendarEvent;
