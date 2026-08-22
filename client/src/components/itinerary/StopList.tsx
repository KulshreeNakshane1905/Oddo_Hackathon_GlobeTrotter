// ============================================================================
// StopList — Drag-and-drop sortable list of StopCards
// ============================================================================

import { useCallback, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Add as AddIcon, Route as RouteIcon } from '@mui/icons-material';
import StopCard from './StopCard';
import type { TripStop } from '../../types/trip.types';

const ITEM_TYPE = 'STOP_CARD';

interface DragItem {
  index: number;
  id: string;
}

// ── Draggable wrapper for each StopCard ──────────────────────────────────────
interface DraggableStopProps {
  stop: TripStop;
  index: number;
  currency: string;
  moveStop: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (stopId: string) => void;
  onUpdate: (stopId: string, data: Record<string, unknown>) => void;
  onAddActivity: (stopId: string, cityId: string) => void;
  onUpdateActivity: (stopActivityId: string, data: Record<string, unknown>) => void;
  onRemoveActivity: (stopActivityId: string) => void;
}

function DraggableStop({
  stop,
  index,
  currency,
  moveStop,
  onDelete,
  onUpdate,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}: DraggableStopProps) {
  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: ITEM_TYPE,
    item: (): DragItem => ({ id: stop.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveStop(item.index, index);
        item.index = index;
      }
    },
  });

  // Combine drop + preview refs
  const combinedRef = (node: HTMLDivElement | null) => {
    previewRef(node);
    dropRef(node);
  };

  return (
    <Box ref={combinedRef} sx={{ opacity: isDragging ? 0.4 : 1 }}>
      <StopCard
        stop={stop}
        index={index}
        currency={currency}
        isDragging={isDragging}
        dragHandleProps={{ ref: dragRef }}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onAddActivity={onAddActivity}
        onUpdateActivity={onUpdateActivity}
        onRemoveActivity={onRemoveActivity}
      />
    </Box>
  );
}

// ── Main StopList component ──────────────────────────────────────────────────
interface StopListProps {
  stops: TripStop[];
  currency: string;
  onAddStop: () => void;
  onDeleteStop: (stopId: string) => void;
  onUpdateStop: (stopId: string, data: Record<string, unknown>) => void;
  onReorderStops: (orderedIds: string[]) => void;
  onAddActivity: (stopId: string, cityId: string) => void;
  onUpdateActivity: (stopActivityId: string, data: Record<string, unknown>) => void;
  onRemoveActivity: (stopActivityId: string) => void;
}

export default function StopList({
  stops,
  currency,
  onAddStop,
  onDeleteStop,
  onUpdateStop,
  onReorderStops,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}: StopListProps) {
  // Local state for optimistic drag-and-drop reorder
  const [localStops, setLocalStops] = useState<TripStop[]>(stops);

  // Sync local state when props change (e.g., after mutation)
  if (stops !== localStops && !isDraggingRef.current) {
    setLocalStops(stops);
  }

  const moveStop = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      isDraggingRef.current = true;
      setLocalStops((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(hoverIndex, 0, moved);
        return updated;
      });
    },
    []
  );

  // Commit reorder to backend when drag ends
  const commitReorder = useCallback(() => {
    isDraggingRef.current = false;
    const orderedIds = localStops.map((s) => s.id);
    // Only call if order actually changed
    const originalIds = stops.map((s) => s.id);
    if (JSON.stringify(orderedIds) !== JSON.stringify(originalIds)) {
      onReorderStops(orderedIds);
    }
  }, [localStops, stops, onReorderStops]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
        {localStops.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <RouteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No stops yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add your first city to start building your itinerary
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddStop}>
              Add First Stop
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {localStops.map((stop, index) => (
              <DraggableStop
                key={stop.id}
                stop={stop}
                index={index}
                currency={currency}
                moveStop={moveStop}
                onDelete={onDeleteStop}
                onUpdate={onUpdateStop}
                onAddActivity={onAddActivity}
                onUpdateActivity={onUpdateActivity}
                onRemoveActivity={onRemoveActivity}
              />
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddStop}
              sx={{
                py: 1.5,
                borderStyle: 'dashed',
                borderWidth: 2,
                '&:hover': { borderStyle: 'dashed', borderWidth: 2 },
              }}
            >
              Add Another Stop
            </Button>
          </Stack>
        )}
      </Box>
    </DndProvider>
  );
}

// Ref to track if we're in the middle of a drag operation
const isDraggingRef = { current: false };
