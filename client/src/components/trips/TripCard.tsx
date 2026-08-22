// ============================================================================
// TripCard — Reusable trip card component with cover photo, date, and actions
// ============================================================================

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  CalendarMonth,
  Place,
  Public,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../../types/trip.types';
import { formatDateRange, truncateText } from '../../utils/formatters';

// Default gradient backgrounds for trips without cover photos
const defaultGradients = [
  'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)',
  'linear-gradient(135deg, #00D9A6 0%, #38BDF8 100%)',
  'linear-gradient(135deg, #FF9F43 0%, #EC4899 100%)',
  'linear-gradient(135deg, #A855F7 0%, #6C63FF 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #22C55E 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #A855F7 100%)',
];

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

export default function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Deterministic gradient based on trip id
  const gradientIndex =
    trip.id.charCodeAt(0) % defaultGradients.length;
  const defaultGradient = defaultGradients[gradientIndex];

  const stopCount = trip._count?.stops ?? 0;

  const handleClick = () => {
    navigate(`/trips/${trip.id}`);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.(trip);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(trip);
  };

  return (
    <Card
      id={`trip-card-${trip.id}`}
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover image / gradient fallback */}
      {trip.coverPhotoUrl ? (
        <CardMedia
          component="img"
          height="180"
          image={trip.coverPhotoUrl}
          alt={trip.tripName}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 180,
            background: defaultGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h2"
            sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 900, fontSize: '4rem' }}
          >
            {trip.tripName.charAt(0).toUpperCase()}
          </Typography>
        </Box>
      )}

      {/* Public badge */}
      {trip.isPublic && (
        <Chip
          icon={<Public sx={{ fontSize: 14 }} />}
          label="Public"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.45)',
            color: '#fff',
            fontSize: '0.7rem',
            height: 24,
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />
      )}

      {/* More menu button */}
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.55)' },
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Card content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {trip.tripName}
        </Typography>

        {trip.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {truncateText(trip.description, 80)}
          </Typography>
        )}

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Date range */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatDateRange(trip.startDate, trip.endDate)}
            </Typography>
          </Box>

          {/* Stop count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Place sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
