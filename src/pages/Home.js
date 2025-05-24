import React from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingsPage from '../components/ListingsPage';
import ChatBot from '../components/ChatBot';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <ListingsPage />
      <ChatBot />
      <Container maxWidth="lg">
        <Box
          sx={{
            mt: 8,
            mb: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Campus Marketplace
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Buy and sell items within your university community. Connect with fellow students,
            find great deals, and make your campus life easier.
          </Typography>
          <Box sx={{ mt: 4 }}>
            {user ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Safe & Secure
              </Typography>
              <Typography>
                Verified university email addresses ensure a safe trading environment
                within your campus community.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Easy to Use
              </Typography>
              <Typography>
                Simple and intuitive interface to list items, browse listings,
                and connect with buyers and sellers.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Campus Focused
              </Typography>
              <Typography>
                Connect with fellow students, find items specific to your university,
                and build your campus network.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Home; 