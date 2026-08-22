import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCopyTripMutation } from '../../store/api/sharingApi';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  token: string;
}

export const CopyTripButton: React.FC<Props> = ({ token }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [copyTrip, { isLoading }] = useCopyTripMutation();
  const [error, setError] = useState('');

  const handleCopy = async () => {
    if (!session) {
      // Redirect to login, but ideally pass a return_url in state
      navigate('/login', { state: { returnUrl: `/shared/${token}` } });
      return;
    }

    try {
      const newTrip = await copyTrip(token).unwrap();
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      setError(err?.data?.error?.message || 'Failed to copy trip');
      alert(error); // In a real app, use a toast
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ContentCopy />}
      onClick={handleCopy}
      disabled={isLoading}
      sx={{
        borderRadius: 2,
        px: 4,
        py: 1.5,
        fontWeight: 'bold',
        textTransform: 'none',
        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
        },
        transition: 'all 0.2s',
      }}
    >
      {isLoading ? 'Copying to your account...' : session ? 'Copy to My Trips' : 'Login to Copy Trip'}
    </Button>
  );
};
