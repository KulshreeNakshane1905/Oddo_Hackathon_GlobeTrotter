// ============================================================================
// SignupPage — Registration page with premium design
// ============================================================================

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Link,
  Divider,
  useTheme,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useEffect } from 'react';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatUp = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

export default function SignupPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (email: string, password: string, fullName: string) => {
    try {
      await registerUser(email, password, fullName);
      navigate('/login');
    } catch {
      // Error handled by useAuth hook
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(-45deg, #0F1117, #1a1040, #0d2137, #0F1117)'
              : 'linear-gradient(-45deg, #764ba2, #667eea, #6C63FF, #f093fb)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
        }}
      />

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(108, 99, 255, 0.08)',
          top: -200,
          left: -150,
          filter: 'blur(80px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255, 107, 107, 0.08)',
          bottom: -100,
          right: -100,
          filter: 'blur(60px)',
        }}
      />

      {/* Left panel — Brand showcase */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          p: 6,
        }}
      >
        <Box
          sx={{
            animation: `${floatUp} 0.8s ease-out`,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          <Typography sx={{ fontSize: '4rem', mb: 2 }}>✈️</Typography>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            Start Exploring
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Join thousands of travelers who plan smarter, travel further, and create unforgettable memories.
          </Typography>
        </Box>
      </Box>

      {/* Right panel — Signup form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 500px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(26, 29, 46, 0.9)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            animation: `${floatUp} 0.6s ease-out`,
          }}
        >
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1.5,
              mb: 3,
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '2rem' }}>🌍</Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GlobalTrotters
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Create account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
            Start planning your dream adventure today
          </Typography>

          <SignupForm onSubmit={handleSignup} isLoading={isLoading} />

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
