import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';

export default function CommunityPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    { id: 1, author: 'Alice', content: 'Had an amazing time paragliding in Switzerland! Highly recommend it to anyone visiting Interlaken.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 2, author: 'Bob', content: 'Looking for recommendations for the best local food spots in Kyoto. Any hidden gems?', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' },
    { id: 3, author: 'Charlie', content: 'Just finished a 10-day road trip across the US West Coast. The Pacific Coast Highway is breathtaking.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { id: 4, author: 'Diana', content: 'What are the must-pack items for a safari in Kenya?', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      {/* Toolbar */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2, 
          mb: 4 
        }}
      >
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
            },
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        
        {/* Main Feed Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Community tab
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {posts.map((post) => (
              <Box key={post.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar 
                  src={post.avatar} 
                  sx={{ width: 64, height: 64, border: `1px solid ${theme.palette.divider}` }}
                />
                <Card 
                  sx={{ 
                    flexGrow: 1, 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <CardContent>
                    <Typography variant="body1">
                      {post.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Info Box */}
        <Box sx={{ width: { xs: '100%', lg: 350 }, flexShrink: 0 }}>
          <Card sx={{ 
            borderRadius: 3, 
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            bgcolor: theme.palette.background.default
          }}>
            <CardContent>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Community section where all the users can share their experience about a certain trip or activity.
                <br /><br />
                Using the search, group by or filter and sortby option, the user can narrow down the result that he is looking for...
              </Typography>
            </CardContent>
          </Card>
        </Box>

      </Box>
    </Box>
  );
}
