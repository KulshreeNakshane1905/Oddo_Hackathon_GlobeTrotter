import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Avatar, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useGetMeQuery, useUpdateMeMutation } from '../../store/api/usersApi';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
];

export const ProfileForm: React.FC = () => {
  const { data: user, isLoading: isFetching } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const [fullName, setFullName] = useState('');
  const [languagePref, setLanguagePref] = useState('en');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setLanguagePref(user.languagePref || 'en');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMe({ fullName, languagePref }).unwrap();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  if (isFetching) return <CircularProgress />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar src={user?.profilePic || ''} sx={{ width: 80, height: 80, mr: 2 }} />
        <Box>
          <Typography variant="h6">{user?.email}</Typography>
          <Typography variant="body2" color="text.secondary">
            Member since {user && new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        select
        label="Language Preference"
        value={languagePref}
        onChange={(e) => setLanguagePref(e.target.value)}
        margin="normal"
      >
        {LANGUAGES.map((option) => (
          <MenuItem key={option.code} value={option.code}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isUpdating}
        sx={{ mt: 3 }}
      >
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
};
