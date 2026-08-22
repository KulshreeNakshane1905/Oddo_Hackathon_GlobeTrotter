import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useDeleteMeMutation } from '../../store/api/usersApi';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog: React.FC<Props> = ({ open, onClose }) => {
  const [deleteMe, { isLoading }] = useDeleteMeMutation();
  const { logout } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteMe().unwrap();
      await logout(); // Log them out immediately
    } catch (err) {
      console.error('Failed to delete account', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ color: 'error.main' }}>Delete Account?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to permanently delete your account? This action cannot be undone and
          all your trips, stops, and saved cities will be lost forever.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
