import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy, QrCode2, LinkOff } from '@mui/icons-material';
import { useShareTripMutation, useUnshareTripMutation } from '../../store/api/sharingApi';
import { useGetTripByIdQuery } from '../../store/api/tripsApi';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export const ShareDialog: React.FC<Props> = ({ open, onClose, tripId }) => {
  const { data: trip, isLoading: isFetchingTrip } = useGetTripByIdQuery(tripId, { skip: !open });
  const [shareTrip, { isLoading: isSharing }] = useShareTripMutation();
  const [unshareTrip, { isLoading: isUnsharing }] = useUnshareTripMutation();
  
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (trip?.shareToken) {
      setShareLink(`${window.location.origin}/shared/${trip.shareToken}`);
    } else {
      setShareLink('');
    }
  }, [trip]);

  const handleGenerateLink = async () => {
    try {
      const { token } = await shareTrip(tripId).unwrap();
      setShareLink(`${window.location.origin}/shared/${token}`);
    } catch (err) {
      console.error('Failed to generate share link', err);
    }
  };

  const handleRevokeLink = async () => {
    try {
      await unshareTrip(tripId).unwrap();
      setShareLink('');
    } catch (err) {
      console.error('Failed to revoke share link', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share Trip</DialogTitle>
      <DialogContent>
        {isFetchingTrip ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : shareLink ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Anyone with this link can view your itinerary (read-only) and copy it to their own account.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={shareLink}
                slotProps={{ htmlInput: { readOnly: true } }}
              />
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton onClick={handleCopy} color="primary" sx={{ ml: 1 }}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="text"
              color="error"
              startIcon={<LinkOff />}
              onClick={handleRevokeLink}
              disabled={isUnsharing}
            >
              {isUnsharing ? 'Revoking...' : 'Revoke Link'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              This trip is currently private. Generate a share link to allow others to view it.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateLink}
              disabled={isSharing}
            >
              {isSharing ? 'Generating...' : 'Generate Share Link'}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
