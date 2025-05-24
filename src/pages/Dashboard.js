import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Message as MessageIcon,
  LocalOffer as ListingIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/users/dashboard');
        setDashboardData(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error loading dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading...</Typography>
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

  const { dashboard } = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user.firstName}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Here's an overview of your account activity
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Listings
              </Typography>
              <Typography variant="h3" color="primary">
                {dashboard.listingsCount}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<AddIcon />}
                onClick={() => navigate('/listings/new')}
              >
                Create New Listing
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Listings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Recent Listings
              </Typography>
              <Button
                startIcon={<ListingIcon />}
                onClick={() => navigate('/listings')}
              >
                View All
              </Button>
            </Box>
            <List>
              {dashboard.recentListings.map((listing) => (
                <React.Fragment key={listing._id}>
                  <ListItem
                    button
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <ListingIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={listing.title}
                      secondary={`$${listing.price} • ${listing.condition}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {dashboard.recentListings.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No listings yet"
                    secondary="Create your first listing to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Messages */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Recent Messages
              </Typography>
              <Button
                startIcon={<MessageIcon />}
                onClick={() => navigate('/messages')}
              >
                View All
              </Button>
            </Box>
            <List>
              {dashboard.recentMessages.map((message) => (
                <React.Fragment key={message._id}>
                  <ListItem
                    button
                    onClick={() => navigate(`/messages/${message._id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${message.sender.firstName} ${message.sender.lastName}`}
                      secondary={message.content}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {dashboard.recentMessages.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No messages yet"
                    secondary="Start a conversation with other users"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 