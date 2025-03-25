const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
let supabase = null;
let demoMode = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  console.log("Supabase URL available:", !!supabaseUrl);
  console.log("Supabase Anon Key available:", !!supabaseAnonKey);

  // Ensure URL has https prefix
  const formattedUrl = supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : `https://${supabaseUrl}`;
  
  console.log("Added https:// prefix to Supabase URL");
  
  supabase = createClient(formattedUrl, supabaseAnonKey);
  console.log("Supabase client initialized successfully");
  
  // Test connection
  testSupabaseConnection();
} else {
  console.log("Supabase credentials not available, running in demo mode");
  demoMode = true;
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('competitions').select('*').limit(1);
    if (error) throw error;
    console.log("Supabase connection successful");
  } catch (error) {
    console.log("Supabase connection test failed:", error);
    demoMode = true;
    console.log("Using application in demo mode due to connection issues");
  }
}

// Mock data for demo mode
const mockCompetitions = [
  {
    id: '1',
    title: 'Summer Photography Challenge',
    description: 'Capture the essence of summer in a single photograph',
    category: 'Photography',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    prizeAmount: 500,
    type: 'individual',
    status: 'active'
  },
  {
    id: '2',
    title: 'Sustainable Business Ideas',
    description: 'Propose innovative business models focused on sustainability',
    category: 'Business',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    prizeAmount: 1000,
    type: 'business',
    status: 'active'
  },
  {
    id: '3',
    title: 'Mobile App UI Design Challenge',
    description: 'Design a mobile app interface for mental wellness',
    category: 'Design',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    prizeAmount: 750,
    type: 'individual',
    status: 'active'
  }
];

// API Routes
app.get('/api/competitions', async (req, res) => {
  if (demoMode) {
    console.log("Supabase not available, using mock competition data");
    return res.json(mockCompetitions);
  }
  
  try {
    const { data, error } = await supabase.from('competitions').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/competitions/:id', async (req, res) => {
  const { id } = req.params;
  
  if (demoMode) {
    const competition = mockCompetitions.find(c => c.id === id);
    if (competition) {
      return res.json(competition);
    }
    return res.status(404).json({ error: 'Competition not found' });
  }
  
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Competition not found' });
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching competition details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});