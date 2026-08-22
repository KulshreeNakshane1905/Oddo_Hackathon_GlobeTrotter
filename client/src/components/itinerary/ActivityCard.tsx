// ============================================================================
// ActivityCard — Compact card for an activity within a stop
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ACTIVITY_TYPE_COLORS } from '../../utils/constants';
import { formatTime, formatCurrency } from '../../utils/formatters';
import type { StopActivityWithDetail } from '../../types/trip.types';

interface ActivityCardProps {
  stopActivity: StopActivityWithDetail;
  currency: string;
  onUpdate: (id: string, data: { scheduledTime?: string; cost?: number; notes?: string }) => void;
  onRemove: (id: string) => void;
}

export default function ActivityCard({ stopActivity, currency, onUpdate, onRemove }: ActivityCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCost, setEditCost] = useState(String(stopActivity.cost));
  const [editNotes, setEditNotes] = useState(stopActivity.notes || '');

  const { activity } = stopActivity;
  const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.OTHER;

  const handleSave = () => {
    onUpdate(stopActivity.id, {
      cost: parseFloat(editCost) || 0,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${typeColor}`,
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {activity.name}
              </Typography>
              <Chip
                label={activity.type}
                size="small"
                sx={{
                  bgcolor: `${typeColor}20`,
                  color: typeColor,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 20,
                }}
              />
            </Box>

            {!isEditing ? (
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(stopActivity.scheduledTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(stopActivity.cost, currency)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {activity.durationHours}h
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  label="Cost"
                  type="number"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  sx={{ width: 100 }}
                />
                <TextField
                  size="small"
                  label="Notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
            )}

            {stopActivity.notes && !isEditing && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                {stopActivity.notes}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.25, ml: 1 }}>
            {isEditing ? (
              <>
                <Tooltip title="Save">
                  <IconButton size="small" onClick={handleSave} color="primary">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton size="small" onClick={() => setIsEditing(false)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton size="small" onClick={() => onRemove(stopActivity.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
