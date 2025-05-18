import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Container, Title, Text, Paper, Checkbox, Stack, Alert, Loader } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { storeAuthData } from '../utils/authUtils.js';
import Header from '../components/Header.jsx';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    if (isLoading) return; // Prevent multiple submissions
    
    const { credential } = credentialResponse;
    if (!credential) {
      setError('No authentication token received from Google');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Send Google ID token to backend for verification using our apiClient
      const { token, user } = await api.post('/auth/google', {
        token: credential
      });
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store authentication data
      await storeAuthData(token, user, rememberMe);
      
      // Update auth context
      setUser(user);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.status === 409) {
        setError('This email is already registered with a different login method. Please use the appropriate login method.');
      } else if (err.message?.includes('origin is not allowed')) {
        setError('Google authentication is still initializing. Please try again in a few minutes.');
      } else {
        setError(err.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    console.error('Google Sign-In Error:', error);
    setError('Google sign-in failed. Please try again.');
    setIsLoading(false);
  };

  return (
    <Box>
      <Header />
      <Container size="sm" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Title order={1} ta="center" mb="xl">Login</Title>
          <Text ta="center" mb="xl">
            Sign in with your Google account to access member features
          </Text>
          <Stack align="center" spacing="md">
            {error && (
              <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>
                {error}
              </Alert>
            )}
            <Box ta="center" pos="relative">
              {isLoading && (
                <Box 
                  pos="absolute" 
                  top={0} 
                  left={0} 
                  right={0} 
                  bottom={0} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1,
                    borderRadius: '4px'
                  }}
                >
                  <Loader size="sm" />
                </Box>
              )}
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                auto_select={false}
                context="signin"
                disabled={isLoading}
                theme="outline"
                size="large"
                width="300"
                itp_support="false"
                type="standard"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                fedcm_support="false"
              />
            </Box>
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.currentTarget.checked)}
              disabled={isLoading}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 