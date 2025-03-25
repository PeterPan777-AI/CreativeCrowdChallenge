import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function SubmissionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [competition, setCompetition] = useState('');
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get('/api/competitions');
        setCompetitions(response.data.competitions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError('Failed to load competitions. Please try again later.');
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title || !description || !competition) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setSubmitting(true);

    try {
      // In a real app, this would call your submission API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setSubmitting(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCompetition('');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit entry. Please try again.');
      setSubmitting(false);
    }
  };

  const isLoggedIn = localStorage.getItem('user') !== null;
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;

  // Filter competitions based on user type
  const filteredCompetitions = user ? (
    user.type === 'business' 
      ? competitions 
      : competitions.filter(comp => comp.type === 'individual')
  ) : competitions.filter(comp => comp.type === 'individual');

  if (!isLoggedIn) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          You need to be logged in to submit an entry.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Submit Your Entry
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your submission was successful! Redirecting to your profile...
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="competition-select-label">Competition</InputLabel>
                <Select
                  labelId="competition-select-label"
                  id="competition-select"
                  value={competition}
                  label="Competition"
                  onChange={(e) => setCompetition(e.target.value)}
                >
                  {filteredCompetitions.map((comp) => (
                    <MenuItem key={comp.id} value={comp.id}>
                      {comp.title} ({comp.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Entry Title"
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    Submitting...
                  </>
                ) : 'Submit Entry'}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
}