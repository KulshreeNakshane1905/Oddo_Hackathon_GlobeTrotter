// ============================================================================
// MUI Theme — Premium dark/light theme for GlobalTrotters
// ============================================================================

import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// ── Design Tokens ─────────────────────────────────────────────────────────
const palette = {
  primary: {
    main: '#6C63FF',     // Vibrant indigo-violet
    light: '#928CFF',
    dark: '#4B45B2',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6B6B',     // Warm coral
    light: '#FF9494',
    dark: '#CC5555',
    contrastText: '#FFFFFF',
  },
  accent: {
    teal: '#00D9A6',     // Fresh teal for success/positive states
    amber: '#FFB020',    // Warm amber for warnings
    sky: '#38BDF8',      // Sky blue for informational
  },
};

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
  h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em', lineHeight: 1.3 },
  h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em', lineHeight: 1.35 },
  h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
  h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
  h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
  subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.6 },
  subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 },
  body1: { fontSize: '1rem', lineHeight: 1.7 },
  body2: { fontSize: '0.875rem', lineHeight: 1.7 },
  button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.02em' },
};

const shape = {
  borderRadius: 12,
};

// ── Shared component overrides ──────────────────────────────────────────────
const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '10px 24px',
        fontSize: '0.95rem',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(108, 99, 255, 0.35)',
          transform: 'translateY(-1px)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #6C63FF 0%, #928CFF 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5B54E0 0%, #7B75FF 100%)',
        },
      },
      containedSecondary: {
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9494 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #E05555 0%, #FF7B7B 100%)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.15)',
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  },
};

// ── Light Theme ─────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: palette.primary,
    secondary: palette.secondary,
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1D2E',
      secondary: '#6B7194',
    },
    divider: 'rgba(107, 113, 148, 0.12)',
  },
  typography,
  shape,
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(107, 113, 148, 0.12)',
          color: '#1A1D2E',
          boxShadow: 'none',
        },
      },
    },
  },
});

// ── Dark Theme ──────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: palette.primary,
    secondary: palette.secondary,
    background: {
      default: '#0F1117',
      paper: '#1A1D2E',
    },
    text: {
      primary: '#E8EAF0',
      secondary: '#9CA3C0',
    },
    divider: 'rgba(156, 163, 192, 0.12)',
  },
  typography,
  shape,
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(156, 163, 192, 0.12)',
          color: '#E8EAF0',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(156, 163, 192, 0.08)',
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(108, 99, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
