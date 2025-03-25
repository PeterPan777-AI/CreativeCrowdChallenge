import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box, 
  Paper, 
  Chip,
  CircularProgress
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Featured competition component
function FeaturedCompetition({ competition }) {
  if (!competition) return null;
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 4, 
        background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" gutterBottom>
          Featured Competition
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom>
          {competition.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {competition.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={competition.category} size="small" />
          <Chip label={`$${competition.prizeAmount} Prize`} size="small" />
        </Box>
        <Button 
          variant="contained" 
          color="secondary" 
          component={Link} 
          to={`/competition/${competition.id}`}
          sx={{ mt: 1 }}
        >
          View Details
        </Button>
      </Box>
      <Box 
        sx={{ 
          position: 'absolute', 
          right: -50, 
          bottom: -50, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255,255,255,0.1)' 
        }} 
      />
    </Paper>
  );
}

export default function HomePage() {
  const [competitions, setCompetitions] = useState([]);
  const [featuredCompetition, setFeaturedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const response = await fetch('/api/competitions');
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        setCompetitions(data);
        
        // Set the first active competition as featured
        if (data.length > 0) {
          setFeaturedCompetition(data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ my: 4 }}>
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <FeaturedCompetition competition={featuredCompetition} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Active Competitions
        </Typography>
        
        <Grid container spacing={3}>
          {competitions.map(competition => (
            <Grid item xs={12} sm={6} md={4} key={competition.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ paddingTop: '56.25%', backgroundColor: competition.type === 'business' ? '#3f51b5' : '#2196f3' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {competition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {competition.description.length > 100 
                      ? `${competition.description.substring(0, 100)}...` 
                      : competition.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip 
                      label={competition.type === 'business' ? 'Business' : 'Individual'} 
                      size="small"
                      color={competition.type === 'business' ? 'primary' : 'info'}
                    />
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/competition/${competition.id}`}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box sx={{ textAlign: 'center', my: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Join the Creative Revolution
        </Typography>
        <Typography variant="body1" paragraph>
          Participate in exciting challenges, showcase your creativity, and win prizes!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/competitions" 
          size="large"
        >
          Browse All Competitions
        </Button>
      </Box>
    </Container>
  );
}