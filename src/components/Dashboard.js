import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Store as StoreIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/listings/${listingId}`);
        // Update the listings in the state after successful deletion
        setDashboardData(prev => ({
          ...prev,
          listings: prev.listings.filter(listing => listing._id !== listingId)
        }));
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userListings, userMessages] = await Promise.all([
          axios.get(`/api/listings/user/${user.id}`),
          axios.get('/api/messages/conversations')
        ]);

        setDashboardData({
          listings: userListings.data.listings,
          messages: userMessages.data.conversations || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Error loading dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* User Profile Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              {user.university && (
                <Chip icon={<SchoolIcon />} label={user.university} sx={{ mr: 1, mb: 1 }} />
              )}
              {user.department && (
                <Chip icon={<BusinessIcon />} label={user.department} sx={{ mb: 1 }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-listing')}
                fullWidth
      >
        Create New Listing
              </Button>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={() => navigate('/messages')}
                fullWidth
              >
                View Messages
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* My Listings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                My Listings
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-listing')}
                size="small"
              >
                Add New
              </Button>
            </Box>
            <Grid container spacing={2}>
              {dashboardData?.listings?.length > 0 ? (
                dashboardData.listings.map((listing) => (
                  <Grid item xs={12} sm={6} key={listing._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {listing.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          ${listing.price}
                        </Typography>
                        <Chip
                          size="small"
                          label={listing.status || 'Active'}
                          color={listing.status === 'sold' ? 'success' : 'primary'}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={listing.condition}
                        />
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/listings/${listing._id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteListing(listing._id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" align="center">
                    You haven't created any listings yet.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Recent Messages */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Messages
            </Typography>
            {dashboardData?.messages?.length > 0 ? (
              <List>
                {dashboardData.messages.slice(0, 5).map((conversation, index) => (
                  <React.Fragment key={conversation._id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      button
                      onClick={() => navigate(`/messages/${conversation.otherUser._id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {conversation.otherUser.firstName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                        secondary={conversation.lastMessage?.content || 'No messages yet'}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No recent messages.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 