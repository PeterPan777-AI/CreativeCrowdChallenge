import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SubmissionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const competitionId = searchParams.get('competition');
  
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState('');
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(competitionId || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  // These steps will be shown in the stepper
  const steps = ['Choose competition', 'Entry details', 'Submit work'];

  useEffect(() => {
    // Fetch competitions list for the dropdown
    async function fetchCompetitions() {
      try {
        const response = await fetch('/api/competitions');
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        
        // Filter to only include active competitions
        const activeCompetitions = data.filter(comp => {
          const endDate = new Date(comp.endDate);
          const today = new Date();
          return endDate > today;
        });
        
        setCompetitions(activeCompetitions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  // When a competition is pre-selected via URL parameter
  useEffect(() => {
    if (competitionId && competitions.length > 0) {
      setSelectedCompetition(competitionId);
      setActiveStep(1); // Skip first step
    }
  }, [competitionId, competitions]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (activeStep === steps.length - 1) {
      setSubmitting(true);
      
      try {
        // In a real app, this would be an API call to submit the entry
        // For demo, simulate success after a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSubmitted(true);
        setActiveStep(steps.length); // Move to completion step
      } catch (err) {
        console.error('Error submitting entry:', err);
        setError('Failed to submit your entry. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      handleNext();
    }
  };

  const validateCurrentStep = () => {
    if (activeStep === 0 && !selectedCompetition) {
      setError('Please select a competition');
      return false;
    }
    
    if (activeStep === 1) {
      if (!title.trim()) {
        setError('Please enter a title for your submission');
        return false;
      }
      if (!description.trim()) {
        setError('Please provide a description for your submission');
        return false;
      }
    }
    
    if (activeStep === 2 && !selectedFile) {
      setError('Please upload a file for your submission');
      return false;
    }
    
    setError(null);
    return true;
  };

  const getSelectedCompetitionDetails = () => {
    return competitions.find(comp => comp.id === selectedCompetition);
  };

  // Format date to a readable format
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Success screen after submission
  if (submitted) {
    return (
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Submission Successful!
          </Typography>
          <Typography variant="body1" paragraph>
            Your entry has been submitted successfully. Thank you for participating!
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to={`/competition/${selectedCompetition}`}
              sx={{ mr: 2 }}
            >
              View Competition
            </Button>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/profile"
            >
              Go to My Profile
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Button 
          component={Link} 
          to={competitionId ? `/competition/${competitionId}` : '/competitions'} 
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Your Entry
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, pt: 2 }}>
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
          {/* Step 1: Choose competition */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select a Competition
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel id="competition-select-label">Competition</InputLabel>
                <Select
                  labelId="competition-select-label"
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  label="Competition"
                >
                  {competitions.length === 0 ? (
                    <MenuItem disabled>No active competitions available</MenuItem>
                  ) : (
                    competitions.map((competition) => (
                      <MenuItem key={competition.id} value={competition.id}>
                        {competition.title} ({competition.type === 'business' ? 'Business' : 'Individual'})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              {selectedCompetition && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Competition
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {(() => {
                      const competition = getSelectedCompetitionDetails();
                      return competition ? (
                        <>
                          <Typography variant="h6">{competition.title}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 1 }}>
                            <Chip 
                              label={competition.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={competition.type === 'business' ? 'Business' : 'Individual'} 
                              size="small"
                              color={competition.type === 'business' ? 'primary' : 'info'}
                            />
                          </Box>
                          <Typography variant="body2" paragraph>
                            {competition.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Submission deadline: {formatDate(competition.endDate)}
                          </Typography>
                        </>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
          
          {/* Step 2: Entry details */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Entry Details
              </Typography>
              
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                helperText="Give your submission a memorable title"
              />
              
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                margin="normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={4}
                helperText="Explain your work, your inspiration, and why it fits the competition theme"
              />
            </Box>
          )}
          
          {/* Step 3: Upload work */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Your Work
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  mb: 3, 
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: 'primary.main',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: JPG, PNG, PDF, MP4, ZIP (max 50MB)
                </Typography>
              </Box>
              
              <TextField
                label="Additional Comments (optional)"
                variant="outlined"
                fullWidth
                margin="normal"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                multiline
                rows={3}
                helperText="Any additional notes for the judges?"
              />
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
              disabled={submitting || (activeStep === 0 && !selectedCompetition)}
            >
              {submitting ? (
                <CircularProgress size={24} sx={{ mr: 1 }} />
              ) : activeStep === steps.length - 1 ? (
                'Submit Entry'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}