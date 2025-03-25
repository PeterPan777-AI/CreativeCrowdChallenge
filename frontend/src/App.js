import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';

// Import pages
import HomePage from './pages/HomePage';
import CompetitionsPage from './pages/CompetitionsPage';
import CompetitionDetailsPage from './pages/CompetitionDetailsPage';
import SubmissionPage from './pages/SubmissionPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          CreativeCrowd
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding component={Link} to="/competitions" sx={{ color: 'inherit', textDecoration: 'none' }}>
          <ListItemButton>
            <ListItemIcon>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText primary="Competitions" />
          </ListItemButton>
        </ListItem>
        
        {isLoggedIn && (
          <ListItem disablePadding component={Link} to="/profile" sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
        )}
        
        {isLoggedIn && (
          <ListItem disablePadding component={Link} to="/submit" sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Submit Entry" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      {!isLoggedIn && (
        <List>
          <ListItem disablePadding component={Link} to="/login" sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding component={Link} to="/register" sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </div>
  );

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              CreativeCrowdChallenge
            </Typography>
            {!isLoggedIn ? (
              <Box>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </Box>
            ) : (
              <Button color="inherit" onClick={() => setIsLoggedIn(false)}>Logout</Button>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/competition/:id" element={<CompetitionDetailsPage />} />
            <Route path="/submit" element={<SubmissionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;