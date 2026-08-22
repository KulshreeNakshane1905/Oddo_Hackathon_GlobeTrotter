// ============================================================================
// ErrorBoundary — Catches React rendering errors
// ============================================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
// Icon removed to fix build

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 64, mb: 2, opacity: 0.8 }}>
            ⚠️
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Something went wrong
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 500 }}
          >
            An unexpected error occurred. Please try refreshing the page or contact support
            if the problem persists.
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleReset}
            sx={{ minWidth: 160 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
