// ============================================================================
// StopCard — Expandable card for a single stop within the itinerary builder
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
  Stack,
  Chip,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  LocationCity as CityIcon,
  CalendarMonth as CalendarIcon,
  DirectionsBus as TransportIcon,
  Hotel as HotelIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ActivityCard from './ActivityCard';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import type { TripStop } from '../../types/trip.types';

interface StopCardProps {
  stop: TripStop;
  index: number;
  currency: string;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onDelete: (stopId: string) => void;
  onUpdate: (stopId: string, data: Record<string, unknown>) => void;
  onAddActivity: (stopId: string, cityId: string) => void;
  onUpdateActivity: (stopActivityId: string, data: Record<string, unknown>) => void;
  onRemoveActivity: (stopActivityId: string) => void;
}

export default function StopCard({
  stop,
  index,
  currency,
  isDragging,
  dragHandleProps,
  onDelete,
  onUpdate,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}: StopCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(stop.notes || '');
  const [editTransport, setEditTransport] = useState(String(stop.transportCost || ''));
  const [editAccommodation, setEditAccommodation] = useState(String(stop.accommodationCost || ''));

  const handleSave = () => {
    onUpdate(stop.id, {
      notes: editNotes,
      transportCost: editTransport ? parseFloat(editTransport) : null,
      accommodationCost: editAccommodation ? parseFloat(editAccommodation) : null,
    });
    setIsEditing(false);
  };

  const totalActivityCost = stop.activities.reduce(
    (sum, sa) => sum + Number(sa.cost),
    0
  );

  return (
    <Card
      elevation={isDragging ? 8 : 1}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
        opacity: isDragging ? 0.9 : 1,
        transform: isDragging ? 'rotate(1deg)' : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': { borderColor: 'primary.light' },
        overflow: 'visible',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          gap: 1.5,
          bgcolor: 'action.hover',
          borderRadius: '8px 8px 0 0',
        }}
      >
        {/* Drag handle */}
        <Box
          {...dragHandleProps}
          sx={{
            cursor: 'grab',
            color: 'text.disabled',
            display: 'flex',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <DragIcon />
        </Box>

        {/* Stop number badge */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {index + 1}
        </Avatar>

        {/* City info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {stop.city.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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

        {/* Cost summary */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {stop.transportCost && (
            <Tooltip title="Transport">
              <Chip
                icon={<TransportIcon />}
                label={formatCurrency(Number(stop.transportCost), currency)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Tooltip>
          )}
          {stop.accommodationCost && (
            <Tooltip title="Accommodation">
              <Chip
                icon={<HotelIcon />}
                label={formatCurrency(Number(stop.accommodationCost), currency)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Tooltip>
          )}
        </Stack>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title={isEditing ? 'Cancel' : 'Edit'}>
            <IconButton
              size="small"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete stop">
            <IconButton size="small" onClick={() => onDelete(stop.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Edit form */}
      <Collapse in={isEditing}>
        <Box sx={{ px: 2, py: 2, bgcolor: 'background.default' }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Transport Cost"
                type="number"
                size="small"
                value={editTransport}
                onChange={(e) => setEditTransport(e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Accommodation Cost"
                type="number"
                size="small"
                value={editAccommodation}
                onChange={(e) => setEditAccommodation(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              label="Notes"
              size="small"
              multiline
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>

      {/* Activities section */}
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 1.5 }}>
          {stop.notes && !isEditing && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
              {stop.notes}
            </Typography>
          )}

          {/* Activities header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Activities ({stop.activities.length})
              {totalActivityCost > 0 && ` · ${formatCurrency(totalActivityCost, currency)}`}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddActivity(stop.id, stop.cityId)}
              sx={{ fontSize: '0.75rem' }}
            >
              Add Activity
            </Button>
          </Box>

          {stop.activities.length === 0 ? (
            <Box
              sx={{
                py: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <CityIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                No activities yet. Click "Add Activity" to start planning.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {stop.activities.map((sa) => (
                <ActivityCard
                  key={sa.id}
                  stopActivity={sa}
                  currency={currency}
                  onUpdate={(id, data) => onUpdateActivity(id, data)}
                  onRemove={onRemoveActivity}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
