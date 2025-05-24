import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, listingsRes] = await Promise.all([
          axios.get(`/api/users/profile/${id}`),
          axios.get(`/api/listings/user/${id}`)
        ]);
        setProfile(profileRes.data.user);
        setListings(listingsRes.data.listings);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error loading profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

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

  const isOwnProfile = currentUser && currentUser.id === id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 3 }}
                src={profile.avatar}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<SchoolIcon />}
                    label={profile.university}
                    variant="outlined"
                  />
                  <Chip
                    icon={<BusinessIcon />}
                    label={profile.department}
                    variant="outlined"
                  />
                </Box>
              </Box>
              {isOwnProfile && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/settings')}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email"
                      secondary={profile.email}
                    />
                  </ListItem>
                  {profile.phone && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PhoneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Phone"
                        secondary={profile.phone}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              {profile.bio && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body1">
                    {profile.bio}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Listings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Listings
            </Typography>
            {listings.length === 0 ? (
              <Typography color="textSecondary">
                No listings found
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {listings.map((listing) => (
                  <Grid item xs={12} sm={6} md={4} key={listing._id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => navigate(`/listings/${listing._id}`)}
                    >
                      <Typography variant="h6" noWrap>
                        {listing.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {listing.condition}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${listing.price}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 