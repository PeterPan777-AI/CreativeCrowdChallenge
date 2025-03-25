const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Demo competitions data (similar to your current mock data)
const competitions = [
  {
    id: 1,
    title: 'Photography Challenge',
    description: 'Capture the essence of nature in your photography.',
    category: 'photography',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'individual'
  },
  {
    id: 2,
    title: 'Creative Writing Contest',
    description: 'Write a short story on the theme of "Changes".',
    category: 'writing',
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'individual'
  },
  {
    id: 3,
    title: 'Brand Identity Challenge',
    description: 'Create a brand identity for a fictional eco-friendly business.',
    category: 'design',
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'business'
  }
];

// API Routes
app.get('/api/competitions', (req, res) => {
  res.json({ competitions });
});

app.get('/api/competitions/:id', (req, res) => {
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  if (!competition) return res.status(404).json({ error: 'Competition not found' });
  res.json({ competition });
});

// User API (mock data)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }
  
  // Mock successful login
  return res.json({
    user: {
      id: 1,
      name: 'Demo User',
      email,
      type: email.includes('business') ? 'business' : 'individual'
    },
    token: 'mock-jwt-token'
  });
});

// Subscriptions API (mock data)
app.get('/api/subscriptions/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        features: ['Submit to 5 business competitions/month', 'Basic analytics']
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 19.99,
        features: ['Unlimited business competition submissions', 'Advanced analytics', 'Priority support']
      }
    ]
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});