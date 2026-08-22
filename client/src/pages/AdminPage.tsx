import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Tab, Tabs, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Pagination
} from '@mui/material';
import { 
  useGetPlatformStatsQuery, 
  useGetTopCitiesQuery,
  useGetAllUsersQuery
} from '../store/api/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PlatformStats from '../components/admin/PlatformStats';
import UserGrowthChart from '../components/admin/UserGrowthChart';
import TopCitiesTable from '../components/admin/TopCitiesTable';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useGetPlatformStatsQuery();
  const { data: cities, isLoading: citiesLoading } = useGetTopCitiesQuery(10);
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery({ page, limit: 10 });

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (statsLoading || citiesLoading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Tabs 
        value={tabIndex} 
        onChange={(_, newValue) => setTabIndex(newValue)} 
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Overview" />
        <Tab label="Users Management" />
      </Tabs>

      {tabIndex === 0 && stats && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <PlatformStats stats={stats} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <UserGrowthChart stats={stats} />
          </Grid>
          <Grid item xs={12} lg={4}>
            {cities && <TopCitiesTable cities={cities} />}
          </Grid>
        </Grid>
      )}

      {tabIndex === 1 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Platform Users</Typography>
          {usersLoading ? <LoadingSpinner /> : (
            <>
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Trips</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersData?.users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{u.fullName || 'Anonymous'}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.isAdmin ? (
                            <Chip size="small" color="error" label="Admin" />
                          ) : (
                            <Chip size="small" color="default" label="User" />
                          )}
                        </TableCell>
                        <TableCell>{u._count.trips}</TableCell>
                        <TableCell>{format(new Date(u.createdAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={usersData?.pagination.totalPages || 1} 
                  page={page} 
                  onChange={(_, val) => setPage(val)} 
                  color="primary" 
                />
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default AdminPage;
