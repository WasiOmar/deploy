import React, { useState } from 'react';
import { Box, Button, CircularProgress, Avatar, Typography } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ProfilePictureUpload = ({ userId, currentPicture, onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfilePicture } = useAuth();

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size should be less than 5MB');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      
      const formData = new FormData();
      formData.append('profilePicture', file);

      setLoading(true);
      setError('');

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await axios.post(`/api/users/profile/${userId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      if (response.data.success && response.data.data) {
        // Update the profile picture in AuthContext
        await updateProfilePicture(response.data.data);
        
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.details?.message ||
                         err.message || 
                         'Error uploading profile picture';
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-picture-upload"
        type="file"
        onChange={handleFileUpload}
        disabled={loading}
      />
      <Avatar
        src={currentPicture || undefined}
        sx={{
          width: 120,
          height: 120,
          mx: 'auto',
          mb: 2,
          bgcolor: 'primary.main',
          fontSize: '3rem',
        }}
      />
      <label htmlFor="profile-picture-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <PhotoCamera />}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Picture'}
        </Button>
      </label>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ProfilePictureUpload; 