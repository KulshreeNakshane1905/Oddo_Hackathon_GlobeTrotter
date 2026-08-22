// ============================================================================
// CreateTripForm — Multi-step form with stepper for trip creation
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Check,
  FlightTakeoff,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TripCoverUpload from './TripCoverUpload';
import type { CreateTripInput } from '../../types/trip.types';
import { CURRENCIES } from '../../utils/constants';

// ── Form schema ──────────────────────────────────────────────────────────────
const formSchema = z
  .object({
    tripName: z
      .string()
      .min(2, 'Trip name must be at least 2 characters')
      .max(255, 'Trip name must be at most 255 characters'),
    description: z.string().max(2000).optional().default(''),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    dailyBudget: z
      .union([z.string(), z.number()])
      .transform((val) => (val === '' ? undefined : Number(val)))
      .optional(),
    currency: z.string().default('USD'),
    coverPhotoUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const steps = ['Trip Details', 'Dates', 'Budget', 'Cover Photo'];

interface CreateTripFormProps {
  onSubmit: (data: CreateTripInput) => void;
  isLoading?: boolean;
}

export default function CreateTripForm({ onSubmit, isLoading }: CreateTripFormProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripName: '',
      description: '',
      startDate: '',
      endDate: '',
      dailyBudget: undefined,
      currency: 'USD',
      coverPhotoUrl: undefined,
    },
    mode: 'onChange',
  });

  const coverPhotoUrl = watch('coverPhotoUrl');

  // ── Step navigation ─────────────────────────────────────────────────────
  const handleNext = async () => {
    // Validate current step fields before advancing
    const fieldsToValidate: Record<number, (keyof FormValues)[]> = {
      0: ['tripName'],
      1: ['startDate', 'endDate'],
      2: [], // Budget is optional
      3: [], // Cover photo is optional
    };

    const isValid = await trigger(fieldsToValidate[activeStep]);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onFormSubmit = (data: FormValues) => {
    const payload: CreateTripInput = {
      tripName: data.tripName,
      description: data.description || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      dailyBudget: data.dailyBudget ? Number(data.dailyBudget) : undefined,
      currency: data.currency,
      coverPhotoUrl: data.coverPhotoUrl || undefined,
    };
    onSubmit(payload);
  };

  // ── Today's date for min attribute ──────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const watchedStartDate = watch('startDate');

  // ── Step content ────────────────────────────────────────────────────────
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              What's your trip called?
            </Typography>
            <Controller
              name="tripName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="trip-name-input"
                  label="Trip Name"
                  placeholder="e.g., European Summer Adventure"
                  error={!!errors.tripName}
                  helperText={errors.tripName?.message}
                  fullWidth
                  autoFocus
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="trip-description-input"
                  label="Description (optional)"
                  placeholder="Tell us about your trip..."
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                />
              )}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              When are you traveling?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="trip-start-date-input"
                    label="Start Date"
                    type="date"
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: today },
                    }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="trip-end-date-input"
                    label="End Date"
                    type="date"
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: watchedStartDate || today },
                    }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Set your budget (optional)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can always change this later. We'll help you track spending per day.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="trip-currency-select"
                    select
                    label="Currency"
                    sx={{ minWidth: 150 }}
                  >
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="dailyBudget"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="trip-daily-budget-input"
                    label="Daily Budget"
                    type="number"
                    placeholder="e.g., 100"
                    error={!!errors.dailyBudget}
                    helperText={errors.dailyBudget?.message}
                    slotProps={{
                      htmlInput: { min: 0, step: 1 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {CURRENCIES.find((c) => c.code === watch('currency'))?.symbol || '$'}
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Add a cover photo (optional)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Make your trip stand out with a beautiful cover image.
            </Typography>
            <TripCoverUpload
              value={coverPhotoUrl}
              onChange={(url) => setValue('coverPhotoUrl', url)}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{
        maxWidth: 640,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          '& .MuiStepLabel-label': {
            fontSize: '0.8rem',
            fontWeight: 500,
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: theme.palette.primary.main,
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step content */}
      <Box sx={{ minHeight: 260 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
          sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
        >
          Back
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? undefined : <Check />}
            endIcon={isLoading ? undefined : <FlightTakeoff />}
            sx={{ px: 4 }}
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
