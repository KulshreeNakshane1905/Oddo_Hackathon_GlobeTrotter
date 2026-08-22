import React from 'react';
import { 
  Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress, Box
} from '@mui/material';
import {  } from '../../store/api/adminApi';

interface TopCitiesTableProps {
  cities: CityStats[];
}

const TopCitiesTable: React.FC<TopCitiesTableProps> = ({ cities }) => {
  const maxScore = cities.length > 0 ? Math.max(...cities.map(c => c.popularityScore)) : 100;

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Top Destinations</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell sx={{ width: '40%' }}>Popularity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>{city.name}</TableCell>
                <TableCell>{city.country}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(city.popularityScore / (maxScore || 1)) * 100} 
                        color="primary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {city.popularityScore}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {cities.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No city data available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TopCitiesTable;
