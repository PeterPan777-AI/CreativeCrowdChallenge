import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';

// Mock submissions for the competition
const mockSubmissions = [
  {
    id: 1,
    title: 'My First Entry',
    description: 'This is my submission for the competition.',
    author: 'John Doe',
    votes: 15,
    createdAt: '2023-05-01T10:30:00'
  },
  {
    id: 2,
    title: 'Creative Photography',
    description: 'Capturing the beauty of nature.',
    author: 'Jane Smith',
    votes: 24,
    createdAt: '2023-05-02T14:20:00'
  }
];

export default function CompetitionDetailsPage() {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitionDetails = async () => {
      try {
        const response = await axios.get(`/api/competitions/${id}`);
        setCompetition(response.data.competition);
        // In a real app, you would fetch submissions for this competition
        setSubmissions(mockSubmissions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competition details:', err);
        setError('Failed to load competition details. Please try again later.');
        setLoading(false);
      }
    };

    fetchCompetitionDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="md">
        <Typography sx={{ mt: 4 }}>
          Competition not found.
        </Typography>
      </Container>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {competition.title}
          </Typography>
          <Chip 
            label={competition.type === 'business' ? 'Business' : 'Individual'} 
            color={competition.type === 'business' ? 'primary' : 'secondary'} 
          />
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Category: {competition.category}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {competition.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              Ends: {formatDate(competition.endDate)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              Participants: {submissions.length}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/submit" 
            color="primary"
            startIcon={<EmojiEventsIcon />}
            sx={{ mb: 1 }}
          >
            Submit Entry
          </Button>
          
          <Button 
            variant="outlined" 
            component={Link} 
            to="/competitions"
          >
            Back to Competitions
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Submissions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {submissions.length > 0 ? (
          <Grid container spacing={3}>
            {submissions.map((submission) => (
              <Grid item key={submission.id} xs={12} sm={6}>
                <Card sx={{ display: 'flex', height: '100%' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="h3" variant="h6">
                      {submission.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                        {submission.author.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {submission.author}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {submission.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={`${submission.votes} votes`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(submission.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>
            No submissions yet. Be the first to submit!
          </Typography>
        )}
      </Box>
    </Container>
  );
}