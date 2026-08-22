import { useState } from 'react';
import { 
  Box, Typography, TextField, InputAdornment, Button, Tabs, Tab, Card, CardContent, useTheme 
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  BarChart, Bar,
  ResponsiveContainer
} from 'recharts';
import { useGetPlatformStatsQuery, useGetTopCitiesQuery } from '../store/api/adminApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function AdminPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const { data: stats, isLoading: statsLoading } = useGetPlatformStatsQuery();
  const { data: topCities, isLoading: citiesLoading } = useGetTopCitiesQuery(3);

  // Transform real data for charts
  const pieData = stats ? [
    { name: 'Total Users', value: stats.overview.totalUsers },
    { name: 'Total Trips', value: stats.overview.totalTrips },
    { name: 'Total Activities', value: stats.overview.totalActivities },
  ] : [];

  const lineData = stats?.growth.users.map((count, i) => ({
    name: `Wk ${i+1}`,
    uv: parseInt(count, 10)
  })) || [];

  const barData = topCities ? topCities.map(c => ({
    name: c.name,
    uv: c.popularityScore
  })) : [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      
      {/* Toolbar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bar ......"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, bgcolor: theme.palette.background.paper }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Group by
          </Button>
          <Button variant="outlined" startIcon={<FilterList />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<Sort />} sx={{ bgcolor: theme.palette.background.paper, color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}>
            Sort by...
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={tabIndex} 
        onChange={(_, newValue) => setTabIndex(newValue)} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 4, 
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': { 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 8, 
            mr: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': { bgcolor: 'action.selected' }
          }
        }}
      >
        <Tab label="Manage Users" />
        <Tab label="Popular cities" />
        <Tab label="Popular Activites" />
        <Tab label="User Trends and Analytics" />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        
        {/* Dashboard Container */}
        <Box sx={{ 
          flexGrow: 1, 
          bgcolor: theme.palette.action.hover, 
          borderRadius: 4, 
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          {statsLoading || citiesLoading ? (
             <Typography>Loading statistics...</Typography>
          ) : (
            <>
              {/* Top Row: Info + Pie Chart */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Platform Overview</Typography>
                  <Typography>Total Registered Users: <b>{stats?.overview.totalUsers}</b></Typography>
                  <Typography>Total Trips Created: <b>{stats?.overview.totalTrips}</b></Typography>
                  <Typography>Publicly Shared Trips: <b>{stats?.overview.publicTrips}</b></Typography>
                </Box>
                <Box sx={{ width: 200, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Middle Row: Line Chart */}
              <Box sx={{ height: 250, width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>User Growth Trend</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="uv" stroke="#ff7300" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Bottom Row: Bar Chart + Info */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
                <Box sx={{ width: '50%', height: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Top 3 Popular Cities</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="uv" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                   {topCities?.map(city => (
                     <Typography key={city.id}>
                       {city.name} - Score: {city.popularityScore}
                     </Typography>
                   ))}
                </Box>
              </Box>
            </>
          )}

        </Box>

        {/* Right Info Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 350 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Manage User Section:</Typography>
                <Typography variant="body2" color="text.secondary">
                  This Section is responsible for the managing the users and their actions.
                  This section will give the admin the access to view all the trips made by the user.
                  Also other functionalities are welcome....
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Popular cities:</Typography>
                <Typography variant="body2" color="text.secondary">
                  Lists all the popular cities where the users are visiting based on the current user trends.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Popular Activites:</Typography>
                <Typography variant="body2" color="text.secondary">
                  List all the popular activites that the users are doing based on the current user trend data.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>User trends and Analytics:</Typography>
                <Typography variant="body2" color="text.secondary">
                  This section will major focus on the providing analysis across various points and give useful information to the user.
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Box>
      </Box>

    </Box>
  );
}
