// ============================================================================
// GlobalSnackbar — App-wide notification toast
// ============================================================================

import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { hideSnackbar } from '../../store/slices/uiSlice';

export default function GlobalSnackbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { snackbar } = useSelector((state: RootState) => state.ui);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={snackbar.severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 3,
          fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
