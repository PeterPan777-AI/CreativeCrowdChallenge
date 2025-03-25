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
  InputAdornment,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  // Step 1: Account info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2: Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  
  // Step 3: Account type
  const [accountType, setAccountType] = useState('individual');
  
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  
  // Stepper steps
  const steps = ['Account Information', 'Personal Details', 'Account Type'];

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    // Step 1 validation
    if (activeStep === 0) {
      if (!email) {
        setError('Email is required');
        return false;
      }
      if (!password) {
        setError('Password is required');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    // Step 2 validation
    if (activeStep === 1) {
      if (!firstName) {
        setError('First name is required');
        return false;
      }
      if (!lastName) {
        setError('Last name is required');
        return false;
      }
      if (!username) {
        setError('Username is required');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep === steps.length - 1) {
      if (!validateCurrentStep()) {
        return;
      }
      
      setRegistering(true);
      
      try {
        // In a real app, this would be an API call to register
        // For demo purposes, simulate success after a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onRegister();
        navigate('/');
      } catch (err) {
        setError('Registration failed. Please try again.');
      } finally {
        setRegistering(false);
      }
    } else {
      handleNext();
    }
  };

  const handleGoogleRegister = () => {
    // In a real app, this would redirect to Google OAuth
    setError('Google registration is not implemented in the demo');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Join the creative community today and start participating in competitions
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {activeStep === 0 && (
              <>
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
                
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Password must be at least 6 characters long
                </Typography>
              </>
            )}
            
            {/* Step 2: Personal Details */}
            {activeStep === 1 && (
              <>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  helperText="This will be your public display name"
                />
              </>
            )}
            
            {/* Step 3: Account Type */}
            {activeStep === 2 && (
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Account Type</FormLabel>
                  <RadioGroup
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                  >
                    <FormControlLabel 
                      value="individual" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">Individual Account</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Participate in free competitions and showcase your creativity
                          </Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="business" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">Business Account</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Access to business competitions and premium features
                          </Typography>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  By creating an account, you agree to our{' '}
                  <Link to="#" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="#" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={registering}
              >
                {registering ? (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                ) : activeStep === steps.length - 1 ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </form>
          
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRegister}
                sx={{ mb: 2 }}
              >
                Register with Google
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" component="span" color="primary">
                      Log in
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}