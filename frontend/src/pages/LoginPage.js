import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoggingIn(true);
    setError('');
    
    try {
      // In a real app, this would be an API call to authenticate
      // Simulate login success for demo
      setTimeout(() => {
        onLogin();
        navigate('/');
      }, 1000);
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = () => {
    // In a real app, this would redirect to Google OAuth
    setError('Google login is not implemented in the demo');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Log in to CreativeCrowdChallenge
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Welcome back! Log in to continue your creative journey
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Link to="#" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Forgot password?
                </Typography>
              </Link>
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoggingIn}
              sx={{ mb: 2 }}
            >
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" component="span" color="primary">
                  Sign up
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By logging in, you agree to our{' '}
            <Link to="#" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" component="span" color="primary">
                Terms of Service
              </Typography>
            </Link>
            {' '}and{' '}
            <Link to="#" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" component="span" color="primary">
                Privacy Policy
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}