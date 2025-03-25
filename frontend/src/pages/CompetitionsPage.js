import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import axios from 'axios';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCompetitionClick = (id) => {
    navigate(`/competition/${id}`);
  };

  const filterCompetitions = () => {
    if (tabValue === 0) return competitions;
    const type = tabValue === 1 ? 'individual' : 'business';
    return competitions.filter(competition => competition.type === type);
  };

  const filteredCompetitions = filterCompetitions();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Competitions
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="competition categories"
          >
            <Tab label="All" id="tab-0" />
            <Tab label="Individual" id="tab-1" />
            <Tab label="Business" id="tab-2" />
          </Tabs>
          <Divider />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : filteredCompetitions.length > 0 ? (
          <Grid container spacing={3}>
            {filteredCompetitions.map((competition) => (
              <Grid item key={competition.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleCompetitionClick(competition.id)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2">
                        {competition.title}
                      </Typography>
                      <Chip 
                        label={competition.type === 'business' ? 'Business' : 'Individual'} 
                        color={competition.type === 'business' ? 'primary' : 'secondary'} 
                        size="small" 
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 1 }}
                    >
                      Category: {competition.category}
                    </Typography>
                    <Typography variant="body2">
                      {competition.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ p: 2 }}>
            No competitions found in this category.
          </Typography>
        )}
      </Box>
    </Container>
  );
}