import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const response = await fetch('/api/competitions');
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        setCompetitions(data);
        setFilteredCompetitions(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    let result = competitions;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(comp => comp.category === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(comp => comp.type === typeFilter);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(comp => 
        comp.title.toLowerCase().includes(query) || 
        comp.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredCompetitions(result);
  }, [categoryFilter, typeFilter, searchQuery, competitions]);

  // Get unique categories from competitions
  const categories = ['all', ...new Set(competitions.map(comp => comp.category))];

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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Explore Competitions
      </Typography>
      
      <Box sx={{ mb: 4, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search competitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {filteredCompetitions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" gutterBottom>
            No competitions found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try changing your filters or check back later for new competitions.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCompetitions.map(competition => (
            <Grid item xs={12} sm={6} md={4} key={competition.id}>
              <Card className="competition-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ 
                    paddingTop: '56.25%', 
                    backgroundColor: competition.type === 'business' ? '#3f51b5' : '#2196f3',
                    position: 'relative'
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                  
                  <Typography variant="h6" component="h2" gutterBottom>
                    {competition.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {competition.description.length > 100 
                      ? `${competition.description.substring(0, 100)}...` 
                      : competition.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Deadline: {formatDate(competition.endDate)}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      ${competition.prizeAmount} Prize
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      to={`/competition/${competition.id}`}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}