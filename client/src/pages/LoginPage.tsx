// ============================================================================
// LoginPage — Premium auth page with animated background
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
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useEffect } from 'react';

// Animated gradient background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatUp = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/dashboard');
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
              : 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #6C63FF)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
        }}
      />

      {/* Decorative floating circles */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(108, 99, 255, 0.1)',
          top: -100,
          right: -100,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 107, 107, 0.1)',
          bottom: -80,
          left: -80,
          filter: 'blur(60px)',
        }}
      />

      {/* Left panel — Brand showcase (hidden on mobile) */}
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
          <Typography sx={{ fontSize: '4rem', mb: 2 }}>🌍</Typography>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            GlobalTrotters
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Plan multi-city adventures, track budgets, and share your itineraries with the world.
          </Typography>

          {/* Feature highlights */}
          {[
            { emoji: '🗺️', text: 'Multi-city itinerary builder' },
            { emoji: '💰', text: 'Smart budget tracking & estimates' },
            { emoji: '📅', text: 'Interactive calendar & timeline' },
            { emoji: '🔗', text: 'Share trips with anyone' },
          ].map((feature, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1.5,
                animation: `${floatUp} ${0.8 + i * 0.15}s ease-out`,
              }}
            >
              <Typography sx={{ fontSize: '1.4rem' }}>{feature.emoji}</Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                }}
              >
                {feature.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right panel — Login form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
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
            maxWidth: 420,
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
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
            Sign in to continue planning your adventures
          </Typography>

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <Box sx={{ textAlign: 'right', mt: 2, mb: 3 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
              sx={{ color: 'primary.main', fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/signup"
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Sign up for free
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
