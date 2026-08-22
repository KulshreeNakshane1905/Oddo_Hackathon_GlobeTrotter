// ============================================================================
// SignupForm — Registration form with validation
// ============================================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name is too long'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must include uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (email: string, password: string, fullName: string) => Promise<void>;
  isLoading: boolean;
}

export default function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const handleFormSubmit = async (data: SignupFormData) => {
    await onSubmit(data.email, data.password, data.fullName);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <TextField
        {...register('fullName')}
        label="Full Name"
        fullWidth
        autoComplete="name"
        autoFocus
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
        disabled={isLoading}
        sx={{ mb: 2.5 }}
        id="signup-name"
      />

      <TextField
        {...register('email')}
        label="Email Address"
        type="email"
        fullWidth
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
        sx={{ mb: 2.5 }}
        id="signup-email"
      />

      <TextField
        {...register('password')}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        autoComplete="new-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
        sx={{ mb: 2.5 }}
        id="signup-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        {...register('confirmPassword')}
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isLoading}
        sx={{ mb: 3 }}
        id="signup-confirm-password"
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
        id="signup-submit"
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}
