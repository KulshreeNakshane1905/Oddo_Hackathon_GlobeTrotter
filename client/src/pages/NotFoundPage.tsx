// ============================================================================
// NotFoundPage — 404 page
// ============================================================================

import { Box, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

export default function NotFoundPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography
        sx={{
          fontSize: '5rem',
          mb: 2,
          animation: `${bounce} 2s ease-in-out infinite`,
        }}
      >
        🧭
      </Typography>

      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '4rem', sm: '6rem' },
          background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Looks like you're off the map!
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        The page you're looking for doesn't exist or has been moved to a new destination.
      </Typography>

      <Button
        variant="contained"
        size="large"
        startIcon={<Home />}
        onClick={() => navigate('/dashboard')}
        sx={{ px: 4 }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
}
