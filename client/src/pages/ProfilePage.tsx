import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Button, Divider } from '@mui/material';
import { ProfileForm } from '../components/profile/ProfileForm';
import { SavedCities } from '../components/profile/SavedCities';
import { DeleteAccountDialog } from '../components/profile/DeleteAccountDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfilePage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Profile Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="profile tabs">
          <Tab label="General Info" />
          <Tab label="Saved Cities" />
          <Tab label="Danger Zone" sx={{ color: 'error.main' }} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabIndex} index={0}>
        <ProfileForm />
      </CustomTabPanel>

      <CustomTabPanel value={tabIndex} index={1}>
        <SavedCities />
      </CustomTabPanel>

      <CustomTabPanel value={tabIndex} index={2}>
        <Box sx={{ maxWidth: 600 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Delete Account
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button variant="outlined" color="error" onClick={() => setIsDeleteDialogOpen(true)}>
            Delete My Account
          </Button>
        </Box>
      </CustomTabPanel>

      <DeleteAccountDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} />
    </Container>
  );
};

export default ProfilePage;
