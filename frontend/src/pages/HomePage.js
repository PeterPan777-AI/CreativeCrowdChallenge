import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid,
  Paper
} from '@mui/material';

// Featured competition component
function FeaturedCompetition({ competition }) {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {competition.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {competition.category}
        </Typography>
        <Typography variant="body2" paragraph>
          {competition.description.substring(0, 120)}...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={Link} 
          to={`/competitions/${competition.id}`}
          sx={{ 
            color: 'primary.main', 
            fontWeight: 'medium' 
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default function HomePage() {
  const [featuredCompetitions, setFeaturedCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch competitions
  async function fetchCompetitions() {
    try {
      const response = await fetch('/api/competitions');
      const data = await response.json();
      // Take first 3 competitions as featured
      setFeaturedCompetitions(data.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return (
    <Container maxWidth="lg">
      {/* Hero section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundColor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Creative Crowd Challenge
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Discover and participate in exciting creative competitions!
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          component={Link} 
          to="/competitions"
          sx={{ fontWeight: 'bold' }}
        >
          Explore Competitions
        </Button>
      </Paper>

      {/* Featured competitions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Competitions
        </Typography>
        <Grid container spacing={4}>
          {loading ? (
            <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
              <Typography>Loading competitions...</Typography>
            </Box>
          ) : (
            featuredCompetitions.map((competition) => (
              <Grid item key={competition.id} xs={12} sm={6} md={4}>
                <FeaturedCompetition competition={competition} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* How it works section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                1. Discover
              </Typography>
              <Typography>
                Browse through our curated collection of creative competitions across multiple categories.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                2. Participate
              </Typography>
              <Typography>
                Submit your creative entries to competitions that inspire you and showcase your talent.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                3. Win
              </Typography>
              <Typography>
                Get recognized, win prizes, and gain exposure for your creative work.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}