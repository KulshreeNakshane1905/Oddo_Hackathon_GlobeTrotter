// ============================================================================
// ForgotPasswordForm — Email submission for password reset
// ============================================================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, CircularProgress } from '@mui/material';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

export default function ForgotPasswordForm({ onSubmit, isLoading }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data.email);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <TextField
        {...register('email')}
        label="Email Address"
        type="email"
        fullWidth
        autoComplete="email"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
        sx={{ mb: 3 }}
        id="forgot-email"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoading}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
        }}
        id="forgot-submit"
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          'Send Reset Link'
        )}
      </Button>
    </form>
  );
}
