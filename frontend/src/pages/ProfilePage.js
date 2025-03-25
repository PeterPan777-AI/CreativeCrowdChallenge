import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Chip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your API
    // Simulating user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Mock data for demo
      setSubmissions([
        { 
          id: 1, 
          title: 'Nature Photography', 
          competition: 'Photography Challenge',
          status: 'active',
          votes: 12,
          createdAt: '2023-04-15T10:30:00'
        },
        { 
          id: 2, 
          title: 'Urban Landscapes', 
          competition: 'City Life',
          status: 'completed',
          votes: 28,
          createdAt: '2023-03-10T14:20:00'
        }
      ]);
      
      setVotes([
        { 
          id: 1, 
          submission: 'Mountain Sunrise', 
          author: 'Jane Smith',
          competition: 'Nature Photography',
          votedAt: '2023-04-20T09:15:00'
        },
        { 
          id: 2, 
          submission: 'Abstract Art', 
          author: 'Alex Johnson',
          competition: 'Digital Art Contest',
          votedAt: '2023-04-18T16:40:00'
        }
      ]);
      
      if (parsedUser.type === 'business') {
        setSubscriptionInfo({
          plan: 'Professional',
          status: 'active',
          nextBilling: '2023-06-01',
          price: '$19.99/month'
        });
      }
    }
    
    setLoading(false);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          You need to be logged in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: user.type === 'business' ? 'primary.main' : 'secondary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1">
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
              <Chip 
                label={user.type === 'business' ? 'Business Account' : 'Individual Account'} 
                color={user.type === 'business' ? 'primary' : 'secondary'} 
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          
          {user.type === 'business' && subscriptionInfo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Plan
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="subtitle1" component="div">
                        {subscriptionInfo.plan}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={subscriptionInfo.status} color="success" size="small" />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Next billing: {subscriptionInfo.nextBilling}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="h6" component="div">
                        {subscriptionInfo.price}
                      </Typography>
                      <Button size="small" color="primary" sx={{ mt: 1 }}>
                        Manage Subscription
                      </Button>
                    </div>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<EmojiEventsIcon />} 
              label="My Submissions" 
              id="profile-tab-0" 
              aria-controls="profile-tabpanel-0" 
            />
            <Tab 
              icon={<HowToVoteIcon />} 
              label="My Votes" 
              id="profile-tab-1" 
              aria-controls="profile-tabpanel-1" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          {submissions.length > 0 ? (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {submissions.map((submission) => (
                <React.Fragment key={submission.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <EmojiEventsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={submission.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {submission.competition}
                          </Typography>
                          {" — "}
                          Submitted on {formatDate(submission.createdAt)} 
                          {" • "} 
                          <Chip 
                            label={`${submission.votes} votes`} 
                            size="small" 
                            variant="outlined" 
                          />
                          {" • "}
                          <Chip 
                            label={submission.status} 
                            size="small" 
                            color={submission.status === 'active' ? 'success' : 'default'} 
                          />
                        </>
                      }
                    />
                    <Button size="small" color="primary">
                      View
                    </Button>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>
              You haven't submitted any entries yet.
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          {votes.length > 0 ? (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {votes.map((vote) => (
                <React.Fragment key={vote.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <HowToVoteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={vote.submission}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {vote.competition}
                          </Typography>
                          {" — "}
                          By {vote.author}
                          {" • "}
                          Voted on {formatDate(vote.votedAt)}
                        </>
                      }
                    />
                    <Button size="small" color="primary">
                      View
                    </Button>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>
              You haven't voted on any submissions yet.
            </Typography>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
}