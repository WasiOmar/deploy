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
  Snackbar
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isOwnProfile ? 'My Profile' : `${profile.firstName}'s Profile`}
          </Typography>
          {isOwnProfile && !isEditing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleChange}
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
              <Grid item xs={12} sm={6}>
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
                  multiline
                  rows={4}
                  value={editForm.bio}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <ProfilePictureUpload
                  userId={id}
                  currentPicture={profile.profilePicture}
                  onUploadSuccess={handleProfilePictureUpdate}
                />
                <Typography variant="h5" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {profile.university && (
                    <Chip icon={<SchoolIcon />} label={profile.university} />
                  )}
                  {profile.department && (
                    <Chip icon={<BusinessIcon />} label={profile.department} />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Email" secondary={profile.email} />
                </ListItem>
                {profile.phone && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Phone" secondary={profile.phone} />
                  </ListItem>
                )}
              </List>
              {profile.bio && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {profile.bio}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 