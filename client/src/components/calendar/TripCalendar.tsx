// ============================================================================
// TripCalendar — Wraps react-big-calendar with MUI-styled theme
// ============================================================================

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type ToolbarProps,
  type EventProps,
} from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import CalendarEvent from './CalendarEvent';
import type { CalendarEventData } from './CalendarEvent';
import type { TimelineEvent } from '../../types/budget.types';
import { ACTIVITY_TYPE_COLORS } from '../../types/budget.types';

// ── Localizer setup ──────────────────────────────────────────────────────────
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ── Create DnD-enabled calendar ──────────────────────────────────────────────
const withDragAndDropFn = (withDragAndDrop as any).default || withDragAndDrop;
const DnDCalendar = withDragAndDropFn(Calendar);

interface TripCalendarProps {
  events: TimelineEvent[];
  tripStartDate: string;
  tripEndDate: string;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

// ── Custom Toolbar ───────────────────────────────────────────────────────────
const CustomToolbar: React.FC<ToolbarProps<CalendarEventData>> = ({
  onNavigate,
  onView,
  view,
  label,
}) => {
  const theme = useTheme();
  const views: View[] = ['month', 'week', 'day', 'agenda'];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => onNavigate('PREV')}
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={() => onNavigate('NEXT')}
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
        <Button
          onClick={() => onNavigate('TODAY')}
          startIcon={<TodayIcon />}
          size="small"
          variant="outlined"
          sx={{ ml: 0.5, borderColor: theme.palette.divider }}
        >
          Today
        </Button>
      </Box>

      {/* Current period label */}
      <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', flex: 1 }}>
        {label}
      </Typography>

      {/* View switcher */}
      <ButtonGroup size="small" variant="outlined">
        {views.map((v) => (
          <Button
            key={v}
            onClick={() => onView(v)}
            variant={view === v ? 'contained' : 'outlined'}
            sx={{
              textTransform: 'capitalize',
              fontWeight: view === v ? 600 : 400,
              ...(view !== v && { borderColor: theme.palette.divider }),
            }}
          >
            {v}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

const TripCalendar: React.FC<TripCalendarProps> = ({
  events: rawEvents,
  tripStartDate,
  tripEndDate,
  onEventDrop,
}) => {
  const theme = useTheme();

  // ── Map timeline events → calendar event objects ──────────────────
  const calendarEvents: CalendarEventData[] = useMemo(
    () =>
      rawEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(ev.end),
        type: ev.type,
        activityType: ev.activityType,
        cityName: ev.cityName,
        cost: ev.cost,
        notes: ev.notes,
        durationHours: ev.durationHours,
      })),
    [rawEvents]
  );

  // Default date to trip start
  const defaultDate = useMemo(() => new Date(tripStartDate), [tripStartDate]);

  // ── Event style getter — color-code by activity type ──────────────
  const eventStyleGetter = useCallback(
    (event: CalendarEventData) => {
      if (event.type === 'stop') {
        return {
          style: {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
          },
        };
      }

      const color = ACTIVITY_TYPE_COLORS[event.activityType || 'OTHER'];
      return {
        style: {
          backgroundColor: alpha(color, 0.85),
          color: '#FFFFFF',
          borderRadius: '6px',
          border: 'none',
          fontSize: '11px',
          fontWeight: 500,
        },
      };
    },
    [theme]
  );

  // ── Drag-to-reschedule handler ────────────────────────────────────
  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEventData; start: string | Date; end: string | Date }) => {
      if (event.type === 'activity' && onEventDrop) {
        onEventDrop(event.id, new Date(start), new Date(end));
      }
    },
    [onEventDrop]
  );

  // ── Custom components ──────────────────────────────────────────────
  const components = useMemo(
    () => ({
      toolbar: CustomToolbar,
      event: ({ event }: EventProps<CalendarEventData>) => <CalendarEvent event={event} />,
    }),
    []
  );

  // ── Activity type legend ───────────────────────────────────────────
  const activeTypes = useMemo(() => {
    const types = new Set<string>();
    rawEvents.forEach((ev) => {
      if (ev.type === 'activity' && ev.activityType) {
        types.add(ev.activityType);
      }
    });
    return Array.from(types).sort();
  }, [rawEvents]);

  return (
    <Box>
      {/* Activity type legend */}
      {activeTypes.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {activeTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              sx={{
                bgcolor: alpha(ACTIVITY_TYPE_COLORS[type] || '#999', 0.15),
                color: ACTIVITY_TYPE_COLORS[type] || '#999',
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          ))}
        </Box>
      )}

      {/* Calendar */}
      <Box
        sx={{
          height: 650,
          '& .rbc-calendar': {
            fontFamily: '"Inter", "Roboto", sans-serif',
          },
          '& .rbc-header': {
            padding: '8px 4px',
            fontWeight: 600,
            fontSize: 13,
            color: theme.palette.text.secondary,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          '& .rbc-month-view, & .rbc-time-view': {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            overflow: 'hidden',
          },
          '& .rbc-day-bg': {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          },
          '& .rbc-today': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
          '& .rbc-off-range-bg': {
            backgroundColor: alpha(theme.palette.text.primary, 0.02),
          },
          '& .rbc-date-cell': {
            padding: '4px 8px',
            fontSize: 13,
            color: theme.palette.text.secondary,
            '& a': { color: 'inherit', textDecoration: 'none' },
          },
          '& .rbc-event': {
            padding: '2px 4px',
            borderRadius: 4,
          },
          '& .rbc-show-more': {
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: 12,
          },
          '& .rbc-time-slot': {
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          },
          '& .rbc-time-gutter .rbc-label': {
            fontSize: 11,
            color: theme.palette.text.secondary,
          },
          '& .rbc-agenda-view table': {
            color: theme.palette.text.primary,
          },
          '& .rbc-agenda-date-cell, & .rbc-agenda-time-cell, & .rbc-agenda-event-cell': {
            padding: '8px 12px',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DnDCalendar
          localizer={localizer}
          events={calendarEvents}
          defaultDate={defaultDate}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          step={30}
          timeslots={2}
          components={components}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleEventDrop}
          draggableAccessor={(event: CalendarEventData) => event.type === 'activity'}
          resizable={false}
          min={new Date(2020, 0, 1, 7, 0)}
          max={new Date(2020, 0, 1, 23, 0)}
          popup
          showMultiDayTimes
        />
      </Box>
    </Box>
  );
};

export default TripCalendar;
