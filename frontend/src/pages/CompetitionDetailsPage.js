import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Format date to a readable format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Calculate days remaining until end date
function daysRemaining(endDateString) {
  const endDate = new Date(endDateString);
  const today = new Date();
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export default function CompetitionDetailsPage() {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock submissions data (in a real app, this would come from an API)
  const mockSubmissions = [
    {
      id: 's1',
      title: 'Sunset by the Beach',
      description: 'A beautiful sunset captured at the beach with vibrant colors',
      userDisplayName: 'Alex Chen',
      submittedAt: '2025-03-15T10:30:00Z',
      votes: 24
    },
    {
      id: 's2',
      title: 'Mountain View Panorama',
      description: 'Panoramic view of mountain ranges in the early morning',
      userDisplayName: 'Jamie Smith',
      submittedAt: '2025-03-17T14:45:00Z',
      votes: 18
    },
    {
      id: 's3',
      title: 'Urban Nightscape',
      description: 'City skyline at night with vibrant lights and reflections',
      userDisplayName: 'Taylor Wilson',
      submittedAt: '2025-03-18T20:15:00Z',
      votes: 32
    }
  ];

  useEffect(() => {
    async function fetchCompetitionDetails() {
      try {
        const response = await fetch(`/api/competitions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch competition details');
        }
        const data = await response.json();
        setCompetition(data);
        
        // In a real app, you would fetch submissions from API
        // For now, use mock data
        setSubmissions(mockSubmissions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competition details:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCompetitionDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !competition) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ my: 4 }}>
          Error: {error || 'Competition not found'}
        </Typography>
        <Button variant="contained" component={Link} to="/competitions">
          Back to Competitions
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Button 
        component={Link} 
        to="/competitions" 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Competitions
      </Button>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {competition.title}
          </Typography>
          
          <Chip 
            label={competition.type === 'business' ? 'Business' : 'Individual'} 
            color={competition.type === 'business' ? 'primary' : 'info'}
            sx={{ mb: { xs: 2, sm: 0 } }}
          />
        </Box>
        
        <Typography variant="body1" paragraph>
          {competition.description}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Timeline</Typography>
                  <Typography variant="body1">
                    {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <EmojiEventsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Prize</Typography>
                  <Typography variant="body1">${competition.prizeAmount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{competition.category}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Days Remaining</Typography>
                  <Typography variant="body1">{daysRemaining(competition.endDate)} days</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Submissions" />
          <Tab label="Rules & Guidelines" />
          <Tab label="FAQ" />
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />
        
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Top Submissions
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to={`/submit?competition=${id}`}
                disabled={daysRemaining(competition.endDate) === 0}
              >
                Submit Entry
              </Button>
            </Box>
            
            {submissions.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No submissions yet. Be the first to submit!
                </Typography>
              </Paper>
            ) : (
              <List sx={{ width: '100%' }}>
                {submissions.map((submission) => (
                  <Paper key={submission.id} sx={{ mb: 2, overflow: 'hidden' }}>
                    <ListItem 
                      alignItems="flex-start"
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton edge="end" aria-label="vote">
                            <ThumbUpIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {submission.votes}
                          </Typography>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {submission.userDisplayName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={submission.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary">
                              {submission.description}
                            </Typography>
                            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                              Submitted by {submission.userDisplayName} on {formatDate(submission.submittedAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )}
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Rules & Guidelines
            </Typography>
            <Typography variant="body1" paragraph>
              1. All submissions must be original work created by the participant.
            </Typography>
            <Typography variant="body1" paragraph>
              2. Submissions must adhere to the theme and requirements of the competition.
            </Typography>
            <Typography variant="body1" paragraph>
              3. Participants may submit only one entry per competition.
            </Typography>
            <Typography variant="body1" paragraph>
              4. All submissions will be reviewed for compliance with the guidelines before being displayed.
            </Typography>
            <Typography variant="body1" paragraph>
              5. The winner will be determined based on community votes and judges' decisions.
            </Typography>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              How do I submit my entry?
            </Typography>
            <Typography variant="body1" paragraph>
              Click the "Submit Entry" button above and follow the instructions to upload your work.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              When will winners be announced?
            </Typography>
            <Typography variant="body1" paragraph>
              Winners will be announced within 7 days after the competition ends.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              How are winners selected?
            </Typography>
            <Typography variant="body1" paragraph>
              Winners are selected based on a combination of community votes (70%) and judges' evaluation (30%).
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              How will I receive my prize?
            </Typography>
            <Typography variant="body1" paragraph>
              Winners will be contacted via email with instructions on how to claim their prizes.
            </Typography>
          </Box>
        )}
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Participate Together
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body1">
            {submissions.length} participants have already submitted their work!
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          Join the community of creative individuals and showcase your talent.
        </Typography>
      </Paper>
    </Container>
  );
}