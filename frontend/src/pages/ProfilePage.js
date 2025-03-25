import React, { useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Paper,
  Avatar,
  Grid,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

// Tab Panel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);

  // Mock user data (in a real app, this would come from an API)
  const userProfile = {
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex.johnson@example.com',
    bio: 'Creative photographer and designer with a passion for urban landscapes and minimalist design.',
    joinedDate: 'March 2024',
    type: 'individual', // or 'business'
    avatar: null, // would be a URL in real app
    stats: {
      participations: 12,
      wins: 3,
      totalVotes: 156,
      submittedEntries: 15
    }
  };

  // Mock submissions data
  const submissions = [
    {
      id: 's1',
      title: 'Urban Skyline at Dusk',
      competitionTitle: 'City Photography',
      submittedDate: '2025-02-15',
      votes: 48,
      status: 'winner'
    },
    {
      id: 's2',
      title: 'Coffee Shop Branding Concept',
      competitionTitle: 'Logo Design Challenge',
      submittedDate: '2025-01-22',
      votes: 36,
      status: 'participant'
    },
    {
      id: 's3',
      title: 'Sustainable Packaging Design',
      competitionTitle: 'Eco-friendly Design',
      submittedDate: '2025-03-05',
      votes: 28,
      status: 'active'
    }
  ];

  // Mock competitions data
  const participatedCompetitions = [
    {
      id: 'c1',
      title: 'City Photography',
      category: 'Photography',
      endDate: '2025-02-20',
      status: 'completed',
      result: 'winner'
    },
    {
      id: 'c2',
      title: 'Logo Design Challenge',
      category: 'Design',
      endDate: '2025-01-30',
      status: 'completed',
      result: 'participant'
    },
    {
      id: 'c3',
      title: 'Eco-friendly Design',
      category: 'Design',
      endDate: '2025-04-10',
      status: 'active',
      result: null
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
          >
            {userProfile.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {userProfile.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{userProfile.username}
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Chip 
                label={userProfile.type === 'business' ? 'Business' : 'Individual'} 
                color={userProfile.type === 'business' ? 'primary' : 'info'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Joined ${userProfile.joinedDate}`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph>
          {userProfile.bio}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {userProfile.stats.participations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {userProfile.stats.wins}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {userProfile.stats.submittedEntries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {userProfile.stats.totalVotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Votes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="My Submissions" />
            <Tab label="Competitions" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" component="h2" gutterBottom>
            Your Submissions
          </Typography>
          
          <List>
            {submissions.map((submission) => (
              <Paper key={submission.id} variant="outlined" sx={{ mb: 2 }}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbUpIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{submission.votes}</Typography>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={submission.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {submission.competitionTitle}
                        </Typography>
                        {` — Submitted on ${new Date(submission.submittedDate).toLocaleDateString()}`}
                        <Box sx={{ mt: 1 }}>
                          {submission.status === 'winner' && (
                            <Chip 
                              icon={<EmojiEventsIcon />} 
                              label="Winner" 
                              color="success" 
                              size="small" 
                            />
                          )}
                          {submission.status === 'active' && (
                            <Chip 
                              label="Active" 
                              color="primary" 
                              size="small" 
                            />
                          )}
                          {submission.status === 'participant' && (
                            <Chip 
                              label="Completed" 
                              variant="outlined" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <CardActions>
                  <Button size="small">View Details</Button>
                </CardActions>
              </Paper>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" component="h2" gutterBottom>
            Competitions You've Participated In
          </Typography>
          
          <List>
            {participatedCompetitions.map((competition) => (
              <Paper key={competition.id} variant="outlined" sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: competition.status === 'active' ? 'primary.main' : 'text.secondary' }}>
                      <EmojiEventsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={competition.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Category: {competition.category}
                        </Typography>
                        {` — Ended: ${new Date(competition.endDate).toLocaleDateString()}`}
                        <Box sx={{ mt: 1 }}>
                          {competition.status === 'active' ? (
                            <Chip 
                              label="Active" 
                              color="primary" 
                              size="small" 
                            />
                          ) : competition.result === 'winner' ? (
                            <Chip 
                              icon={<EmojiEventsIcon />} 
                              label="Winner" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="Participated" 
                              variant="outlined" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <CardActions>
                  <Button size="small">View Competition</Button>
                </CardActions>
              </Paper>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" component="h2" gutterBottom>
            Account Settings
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">
                  {userProfile.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">
                  {userProfile.username}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {userProfile.email}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small">
                Edit Profile
              </Button>
            </Box>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Account Security
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Password
              </Typography>
              <Typography variant="body1">
                •••••••••••
              </Typography>
            </Box>
            <Button variant="outlined" size="small">
              Change Password
            </Button>
          </Paper>
        </TabPanel>
      </Paper>
    </Container>
  );
}