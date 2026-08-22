// ============================================================================
// TripCoverUpload — Drag-and-drop cover photo upload component
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { CloudUpload, Close, Image as ImageIcon } from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface TripCoverUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function TripCoverUpload({ value, onChange }: TripCoverUploadProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `trip-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Fall back to using the local preview as the value
        // This handles the case where Supabase storage isn't configured
        console.warn('Supabase upload failed, using local preview:', uploadError.message);
        onChange(objectUrl);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('trip-covers')
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      setPreview(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      // Still set the local preview
      onChange(objectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Preview mode ────────────────────────────────────────────────────────
  if (preview) {
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          border: `2px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          component="img"
          src={preview}
          alt="Trip cover preview"
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <CircularProgress size={40} sx={{ color: '#fff' }} />
          </Box>
        )}
        <IconButton
          size="small"
          onClick={handleRemove}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  // ── Upload zone ─────────────────────────────────────────────────────────
  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: `2px dashed ${
            isDragging ? theme.palette.primary.main : theme.palette.divider
          }`,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging
            ? `${theme.palette.primary.main}08`
            : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.light,
            backgroundColor: `${theme.palette.primary.main}05`,
          },
        }}
      >
        {isDragging ? (
          <CloudUpload
            sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }}
          />
        ) : (
          <ImageIcon
            sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }}
          />
        )}
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {isDragging ? 'Drop your image here' : 'Upload cover photo'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag & drop or click to browse • JPEG, PNG, WebP • Max 5MB
        </Typography>
      </Box>

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: 'block' }}
        >
          {error}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
