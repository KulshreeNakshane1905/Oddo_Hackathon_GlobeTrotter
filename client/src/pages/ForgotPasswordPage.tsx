// ============================================================================
// ForgotPasswordPage — Password reset request
// ============================================================================

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Link,
  useTheme,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { ArrowBack } from '@mui/icons-material';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatUp = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 3, sm: 4 },
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(-45deg, #0F1117, #1a1040, #0d2137, #0F1117)'
              : 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #6C63FF)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(26, 29, 46, 0.9)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
          animation: `${floatUp} 0.6s ease-out`,
        }}
      >
        <Link
          component={RouterLink}
          to="/login"
          underline="none"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            mb: 3,
            fontSize: '0.875rem',
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to login
        </Link>

        {!submitted ? (
          <>
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🔑</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Reset password
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
              Enter your email and we'll send you a link to reset your password.
            </Typography>

            <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>📧</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Check your email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              If an account exists with that email, we've sent password reset instructions.
            </Typography>
            <Link
              component="button"
              onClick={() => navigate('/login')}
              underline="hover"
              sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.95rem' }}
            >
              Return to login
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
