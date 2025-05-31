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
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: '',
    department: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for ID:', id);
        const [profileRes, listingsRes] = await Promise.all([
          axios.get(`/api/users/profile/${id}`),
          axios.get(`/api/listings/user/${id}`)
        ]);
        
        console.log('Profile API response:', profileRes.data);
        const userData = profileRes.data.user;
        
        if (!userData) {
          console.error('No user data in response');
          throw new Error('User data not found in response');
        }

        // Validate required fields
        if (!userData.firstName || !userData.lastName || !userData.email) {
          console.error('Missing required user data:', userData);
          throw new Error('Incomplete user data');
        }

        console.log('Setting profile data:', userData);
        setProfile(userData);
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          university: userData.university || '',
          department: userData.department || '',
          phone: userData.phone || '',
          bio: userData.bio || ''
        });

        // Handle listings data
        const listingsData = listingsRes.data?.listings || [];
        console.log('Setting listings:', listingsData);
        setListings(listingsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        // If listings fetch fails but profile succeeds, still show the profile
        if (err.response?.data?.path?.includes('/api/listings/user/')) {
          console.log('Listings fetch failed but profile succeeded');
          setListings([]);
          setLoading(false);
        } else {
          setError(err.response?.data?.error || err.message || 'Error loading profile');
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      university: profile.university || '',
      department: profile.department || '',
      phone: profile.phone || '',
      bio: profile.bio || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        setSuccess('Profile updated successfully');
        setProfile({ ...profile, ...editForm });
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating profile');
    }
  };

  const handleProfilePictureUpdate = (newPictureUrl) => {
    setProfile(prev => ({
      ...prev,
      profilePicture: newPictureUrl
    }));
  };

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

  if (!profile) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">Profile not found</Typography>
        </Box>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === id;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          color: '#1a237e'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            {isOwnProfile ? (
              <ProfilePictureUpload
                userId={id}
                currentPicture={profile.profilePicture}
                onUploadSuccess={handleProfilePictureUpdate}
              />
            ) : (
              <Avatar
                src={profile.profilePicture}
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" component="h1" sx={{ mb: 1, color: '#1a237e' }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, color: '#3949ab' }}>
                  {profile.department} @ {profile.university}
                </Typography>
                {profile.bio && (
                  <Typography variant="body1" sx={{ mb: 2, maxWidth: '600px', color: '#424242' }}>
                    {profile.bio}
                  </Typography>
                )}
              </Box>
              {isOwnProfile && !isEditing && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{ 
                    bgcolor: 'white',
                    color: '#1a237e',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<PersonIcon />} label="Information" />
          <Tab icon={<StoreIcon />} label="Listings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <div role="tabpanel" hidden={currentTab !== 0}>
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <EmailIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Email" secondary={profile.email} />
                    </ListItem>
                    {profile.phone && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <PhoneIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Phone" secondary={profile.phone} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Academic Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Academic Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="University" secondary={profile.university} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <BusinessIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Department" secondary={profile.department} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </div>

      <div role="tabpanel" hidden={currentTab !== 1}>
        {currentTab === 1 && (
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.images[0] || 'https://via.placeholder.com/200'}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {listing.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ${listing.price}
                      </Typography>
                      <Chip 
                        label={listing.status} 
                        color={listing.status === 'Available' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* Edit Form Dialog */}
      {isEditing && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Edit Profile
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="University"
                  name="university"
                  value={editForm.university}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={editForm.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    sx={{
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: '#1a237e',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 