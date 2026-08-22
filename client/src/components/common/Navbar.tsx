// ============================================================================
// Navbar — Top navigation bar with glassmorphism effect
// ============================================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Person,
  Logout,
  Dashboard,
  Map,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { toggleTheme, toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeMode } = useSelector((state: RootState) => state.ui);
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  // Don't show navbar on auth pages
  const authPages = ['/login', '/signup', '/forgot-password'];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 }, height: 70 }}>
        {/* Mobile menu toggle */}
        {isMobile && isAuthenticated && (
          <IconButton
            edge="start"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 1, color: 'text.primary' }}
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            mr: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: '1.6rem',
              lineHeight: 1,
            }}
          >
            🌍
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            GlobalTrotters
          </Typography>
        </Box>

        {/* Desktop navigation links */}
        {isAuthenticated && !isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
              sx={{
                color: location.pathname === '/dashboard' ? 'primary.main' : 'text.secondary',
                fontWeight: location.pathname === '/dashboard' ? 600 : 500,
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(108,99,255,0.08)' },
              }}
            >
              Dashboard
            </Button>
            <Button
              startIcon={<Map />}
              onClick={() => navigate('/trips')}
              sx={{
                color: location.pathname === '/trips' ? 'primary.main' : 'text.secondary',
                fontWeight: location.pathname === '/trips' ? 600 : 500,
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(108,99,255,0.08)' },
              }}
            >
              My Trips
            </Button>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme toggle */}
        <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton
            onClick={() => dispatch(toggleTheme())}
            sx={{
              color: 'text.secondary',
              mr: 1,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'rotate(30deg)' },
            }}
            aria-label="Toggle theme"
          >
            {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* User menu */}
        {isAuthenticated && user ? (
          <>
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileClick}
                sx={{ p: 0.5 }}
                aria-label="Account menu"
              >
                <Avatar
                  src={user.profilePic || undefined}
                  alt={user.fullName}
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: 'primary.main',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    border: `2px solid ${theme.palette.primary.main}`,
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': {
                      boxShadow: `0 0 0 3px rgba(108, 99, 255, 0.3)`,
                    },
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/profile');
                }}
              >
                <Person sx={{ mr: 1.5, fontSize: 20 }} />
                Profile
              </MenuItem>
              {user.isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/admin');
                  }}
                >
                  <AdminPanelSettings sx={{ mr: 1.5, fontSize: 20 }} />
                  Admin Panel
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          !authPages.includes(location.pathname) && (
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ ml: 1 }}
            >
              Sign In
            </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
}
