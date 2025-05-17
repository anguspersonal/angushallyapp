import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Container, Title, Text, Paper, Checkbox, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Login() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    
    if (rememberMe) {
      // Store token with expiration (30 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      localStorage.setItem('googleToken', token);
      localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    } else {
      // Store token in sessionStorage (cleared when browser is closed)
      sessionStorage.setItem('googleToken', token);
    }
    
    navigate('/');
  };

  const handleError = () => {
    console.error('Login Failed');
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
            <Box ta="center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                flow="implicit"
                scope="email profile"
                auto_select={false}
                context="signin"
              />
            </Box>
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.currentTarget.checked)}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 