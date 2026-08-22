// ============================================================================
// Global Styles — CSS-in-JS global overrides
// ============================================================================

import { css } from '@emotion/react';

export const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    overflow-x: hidden;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(108, 99, 255, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(108, 99, 255, 0.5);
  }

  /* Smooth transitions for theme switching */
  * {
    transition: background-color 0.3s ease, color 0.15s ease, border-color 0.3s ease;
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    outline: 2px solid #6C63FF;
    outline-offset: 2px;
  }

  /* Selection color */
  ::selection {
    background: rgba(108, 99, 255, 0.3);
    color: inherit;
  }

  /* Prevent layout shifts from scrollbar */
  html {
    scrollbar-gutter: stable;
  }
`;
