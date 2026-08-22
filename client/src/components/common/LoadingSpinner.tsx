// ============================================================================
// LoadingSpinner — Full-screen or inline loading indicator
// ============================================================================

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  fullScreen = false,
  message = 'Loading...',
}: LoadingSpinnerProps) {
  const theme = useTheme();

  if (!fullScreen) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={32} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        bgcolor: theme.palette.background.default,
        zIndex: 9999,
      }}
    >
      {/* Animated globe emoji */}
      <Typography
        sx={{
          fontSize: '3rem',
          animation: `${float} 2s ease-in-out infinite`,
        }}
      >
        🌍
      </Typography>

      <CircularProgress
        size={48}
        thickness={3}
        sx={{
          color: theme.palette.primary.main,
        }}
      />

      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          animation: `${pulse} 1.5s ease-in-out infinite`,
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
