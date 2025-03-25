import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Box,
  Container,
  Chip
} from '@mui/material';
import axios from 'axios';

// Component to display featured competitions on homepage
function FeaturedCompetition({ competition }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {competition.title}
        </Typography>
        <Chip 
          label={competition.type === 'business' ? 'Business' : 'Individual'} 
          color={competition.type === 'business' ? 'primary' : 'secondary'} 
          size="small" 
          sx={{ mb: 1 }}
        />
        <Typography>
          {competition.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={Link} 
          to={`/competition/${competition.id}`}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default function HomePage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to CreativeCrowdChallenge
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Join creative competitions and showcase your talent to the world
        </Typography>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" component="h2">
            Featured Competitions
          </Typography>
        </Box>

        {loading && (
          <Typography>Loading competitions...</Typography>
        )}

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        {!loading && !error && (
          <Grid container spacing={4}>
            {competitions.map((competition) => (
              <Grid item key={competition.id} xs={12} sm={6} md={4}>
                <FeaturedCompetition competition={competition} />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/competitions"
          >
            View All Competitions
          </Button>
        </Box>
      </Box>
    </Container>
  );
}