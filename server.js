const http = require('http');
const fs = require('fs');
const path = require('path');

// Handle loading Supabase with care
let createClient, supabase = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (error) {
  console.error('Failed to load Supabase client library:', error.message);
}

// Supabase client initialization - only if the library loaded successfully
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log credentials availability (without exposing values)
console.log(`Supabase URL available: ${Boolean(supabaseUrl)}`);
console.log(`Supabase Anon Key available: ${Boolean(supabaseAnonKey)}`);

// Ensure URL has https:// prefix
if (supabaseUrl && !(supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
  supabaseUrl = 'https://' + supabaseUrl;
  console.log('Added https:// prefix to Supabase URL');
}

// Only initialize Supabase if we have valid credentials
if (createClient && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
    
    // Test the connection to see if we can actually connect
    (async () => {
      try {
        const { data, error } = await supabase.from('competitions').select('count');
        if (error) {
          console.error('Supabase connection test failed:', error);
          console.warn('Using application in demo mode due to connection issues');
          supabase = null;
        } else {
          console.log('Supabase connection test successful');
        }
      } catch (testError) {
        console.error('Supabase connection test exception:', testError);
        console.warn('Using application in demo mode due to connection issues');
        supabase = null;
      }
    })();
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
    supabase = null;
  }
} else {
  console.warn('Using application without Supabase connection - demo mode active');
}

const PORT = process.env.PORT || 5000;

// Define MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Function to serve static files
const serveFile = (res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

// Create the HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // API routes
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // Special handling for service worker and manifest
  if (req.url === '/service-worker.js') {
    // Serve the service worker with special headers
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    serveFile(res, path.join(__dirname, 'service-worker.js'));
    return;
  }
  
  if (req.url === '/manifest.json') {
    // Serve the manifest file
    res.setHeader('Cache-Control', 'max-age=86400');
    serveFile(res, path.join(__dirname, 'manifest.json'));
    return;
  }
  
  // Serve static files
  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'simple-test.html');
  } else if (req.url === '/admin') {
    // Serve admin login page
    filePath = path.join(__dirname, 'admin.html');
  } else {
    filePath = path.join(__dirname, req.url);
  }
  
  serveFile(res, filePath);
});

// Parse request body helper function
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Sample mock data for when Supabase is unavailable
// In-memory storage for analytics requests
let analyticsRequests = [];

const MOCK_DATA = {
  competitions: [
    {
      id: 'mock-comp-1',
      title: 'Logo Design Challenge',
      description: 'Create a modern logo for a tech startup',
      prize: '$500',
      deadline: '2025-04-30',
      category: 'design',
      business_id: 'mock-business-1',
      created_at: '2025-03-15',
      status: 'active'
    },
    {
      id: 'mock-comp-2',
      title: 'Mobile App UI Challenge',
      description: 'Design an intuitive mobile interface for a fitness app',
      prize: '$750',
      deadline: '2025-05-15',
      category: 'design',
      business_id: 'mock-business-2',
      created_at: '2025-03-10',
      status: 'active'
    },
    {
      id: 'mock-comp-3',
      title: 'Marketing Campaign Concept',
      description: 'Develop a creative marketing campaign for an eco-friendly product line',
      prize: '$1000',
      deadline: '2025-06-01',
      category: 'marketing',
      business_id: 'mock-business-1',
      created_at: '2025-03-05',
      status: 'active'
    }
  ],
  
  // Mock submissions data
  submissions: [
    {
      id: 'submission-1',
      competition_id: 'mock-comp-1',
      user_id: 'user-1',
      title: 'Modern Tech Logo',
      description: 'A sleek, minimalist logo representing innovation',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-18',
      votes: 12
    },
    {
      id: 'submission-2',
      competition_id: 'mock-comp-1',
      user_id: 'user-2',
      title: 'Geometric Startup Brand',
      description: 'A geometric approach to modern branding',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-19',
      votes: 8
    },
    {
      id: 'submission-3',
      competition_id: 'mock-comp-1',
      user_id: 'user-3',
      title: 'Colorful Tech Identity',
      description: 'Vibrant colors representing diverse technology',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-20',
      votes: 15
    },
    {
      id: 'submission-4',
      competition_id: 'mock-comp-2',
      user_id: 'user-1',
      title: 'Clean Fitness App UI',
      description: 'Intuitive interface for workout tracking',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-15',
      votes: 6
    },
    {
      id: 'submission-5',
      competition_id: 'mock-comp-2',
      user_id: 'user-4',
      title: 'Energetic Exercise Tracker',
      description: 'Bold and motivational fitness interface',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-16',
      votes: 9
    },
    {
      id: 'submission-6',
      competition_id: 'mock-comp-3',
      user_id: 'user-2',
      title: 'Eco-Friendly Brand Campaign',
      description: 'Green marketing strategy emphasizing sustainability',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-10',
      votes: 11
    },
    {
      id: 'submission-7',
      competition_id: 'mock-comp-3',
      user_id: 'user-5',
      title: 'Natural World Connection',
      description: 'Connecting product with environmental values',
      image_url: 'https://via.placeholder.com/300',
      created_at: '2025-03-12',
      votes: 7
    }
  ],
  
  // Mock analytics data for business users
  analytics: {
    'mock-business-1': {
      totalCompetitions: 2,
      totalSubmissions: 42,
      totalViews: '865',
      avgEngagement: '32%',
      competitions: [
        { title: 'Logo Design Challenge', submissions: 24, views: 487, engagementRate: '4.9%' },
        { title: 'Marketing Campaign Concept', submissions: 18, views: 378, engagementRate: '4.8%' }
      ],
      demographics: {
        '18-24': 25,
        '25-34': 42,
        '35-44': 18,
        '45-54': 10,
        '55+': 5
      },
      timeline: {
        dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        submissions: [5, 12, 18, 23, 29, 42],
        views: [120, 250, 380, 470, 580, 865]
      },
      // Enhanced engagement analytics data
      engagement: {
        daily: [15, 22, 18, 25, 30, 28, 32],
        weekly: [105, 129, 154, 178, 210],
        monthly: [410, 485, 560, 620],
        weeklyTrend: 15,
        conversionRate: 3.8,
        avgTimeSpent: 4.5,
        bounceRate: 25,
        interactionRate: 68
      },
      trafficSources: [
        { name: 'Organic Search', percentage: 45 },
        { name: 'Direct', percentage: 25 },
        { name: 'Social Media', percentage: 20 },
        { name: 'Referral', percentage: 10 }
      ],
      userBehavior: {
        returningUsers: '68%',
        votesPerUser: '8.2',
        submissionQuality: '4.2★',
        userRetention: '71%',
        userGrowth: '12%',
        activeDays: 4,
        commentFrequency: '2.7'
      },
      peakActivity: '2pm - 6pm',
      sessionDuration: '4.5 min',
      geographicData: {
        regions: [
          { name: 'North America', percentage: 55 },
          { name: 'Europe', percentage: 30 },
          { name: 'Asia', percentage: 10 },
          { name: 'Other', percentage: 5 }
        ]
      },
      competitionPerformance: {
        averageSubmissionsPerCompetition: '21.0',
        submissionCompletionRate: '85%',
        averageCompetitionDuration: '24 days',
        topPerformingCategory: 'Design'
      },
      deviceData: {
        mobile: 65,
        desktop: 30,
        tablet: 5
      }
    },
    'mock-business-2': {
      totalCompetitions: 1,
      totalSubmissions: 12,
      totalViews: '295',
      avgEngagement: '24%',
      competitions: [
        { title: 'Mobile App UI Challenge', submissions: 12, views: 295, engagementRate: '4.1%' }
      ],
      demographics: {
        '18-24': 32,
        '25-34': 38,
        '35-44': 15,
        '45-54': 10,
        '55+': 5
      },
      timeline: {
        dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        submissions: [0, 0, 4, 7, 10, 12],
        views: [0, 0, 90, 152, 217, 295]
      },
      // Enhanced engagement analytics data
      engagement: {
        daily: [8, 12, 10, 14, 17, 15, 18],
        weekly: [60, 75, 85, 95, 110],
        monthly: [180, 240, 290, 340],
        weeklyTrend: 9,
        conversionRate: 2.5,
        avgTimeSpent: 3.2,
        bounceRate: 32,
        interactionRate: 57
      },
      trafficSources: [
        { name: 'Organic Search', percentage: 35 },
        { name: 'Direct', percentage: 30 },
        { name: 'Social Media', percentage: 25 },
        { name: 'Referral', percentage: 10 }
      ],
      userBehavior: {
        returningUsers: '52%',
        votesPerUser: '5.1',
        submissionQuality: '3.8★',
        userRetention: '62%',
        userGrowth: '8%',
        activeDays: 3,
        commentFrequency: '1.5'
      },
      peakActivity: '3pm - 7pm',
      sessionDuration: '3.8 min',
      geographicData: {
        regions: [
          { name: 'North America', percentage: 50 },
          { name: 'Europe', percentage: 25 },
          { name: 'Asia', percentage: 15 },
          { name: 'Other', percentage: 10 }
        ]
      },
      competitionPerformance: {
        averageSubmissionsPerCompetition: '12.0',
        submissionCompletionRate: '72%',
        averageCompetitionDuration: '20 days',
        topPerformingCategory: 'Technology'
      },
      deviceData: {
        mobile: 70,
        desktop: 22,
        tablet: 8
      }
    }
  }
};

// Handle API requests
async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = url.pathname.replace('/api', '');
  
  res.setHeader('Content-Type', 'application/json');
  
  // GET /api/competitions
  if (endpoint === '/competitions' && req.method === 'GET') {
    if (!supabase) {
      console.log('Supabase not available, using mock competition data');
      res.writeHead(200);
      res.end(JSON.stringify(MOCK_DATA.competitions));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*');
        
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to mock data
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_DATA.competitions));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching competitions:', error);
      // Fallback to mock data
      res.writeHead(200);
      res.end(JSON.stringify(MOCK_DATA.competitions));
    }
    return;
  }
  
  // GET /api/competitions/:id
  if (endpoint.match(/^\/competitions\/[\w-]+$/) && req.method === 'GET') {
    const competitionId = endpoint.split('/').pop();
    console.log(`Fetching details for competition: ${competitionId}`);
    
    if (!supabase) {
      console.log('Supabase not available, using mock competition data');
      const competition = MOCK_DATA.competitions.find(c => c.id === competitionId);
      
      if (!competition) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Competition not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(competition));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();
        
      if (error) {
        console.error('Supabase error fetching competition:', error);
        // Try to find in mock data as fallback
        const competition = MOCK_DATA.competitions.find(c => c.id === competitionId);
        
        if (!competition) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Competition not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(competition));
        return;
      }
      
      if (!data) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Competition not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching competition details:', error);
      // Try mock data as fallback
      const competition = MOCK_DATA.competitions.find(c => c.id === competitionId);
      
      if (!competition) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Competition not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(competition));
    }
    return;
  }
  
  // GET /api/competitions/:id/submissions
  if (endpoint.match(/^\/competitions\/[\w-]+\/submissions$/) && req.method === 'GET') {
    const competitionId = endpoint.split('/')[2];
    console.log(`Fetching submissions for competition: ${competitionId}`);
    
    if (!supabase) {
      console.log('Supabase not available, using mock submission data');
      // Filter submissions for this competition from mock data
      const submissions = MOCK_DATA.submissions.filter(s => s.competition_id === competitionId);
      
      if (submissions.length === 0) {
        res.writeHead(200);
        res.end(JSON.stringify([]));
        return;
      }
      
      // Sort by votes (highest first)
      submissions.sort((a, b) => b.votes - a.votes);
      
      res.writeHead(200);
      res.end(JSON.stringify(submissions));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('competition_id', competitionId)
        .order('votes', { ascending: false });
        
      if (error) {
        console.error('Supabase error fetching submissions:', error);
        // Fallback to mock data
        const submissions = MOCK_DATA.submissions.filter(s => s.competition_id === competitionId);
        submissions.sort((a, b) => b.votes - a.votes);
        
        res.writeHead(200);
        res.end(JSON.stringify(submissions));
        return;
      }
      
      if (!data || data.length === 0) {
        res.writeHead(200);
        res.end(JSON.stringify([]));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Fallback to mock data
      const submissions = MOCK_DATA.submissions.filter(s => s.competition_id === competitionId);
      submissions.sort((a, b) => b.votes - a.votes);
      
      res.writeHead(200);
      res.end(JSON.stringify(submissions));
    }
    return;
  }

  // POST /api/auth/signin
  if (endpoint === '/auth/signin' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, password } = body;
      
      if (!email || !password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email and password are required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, using simulated authentication');
        // Simulate authentication for demo purposes
        // Allow several test accounts with different roles
        const validUsers = {
          'demo@example.com': { name: 'Demo User', role: 'business' },
          'admin@example.com': { name: 'Admin User', role: 'admin' },
          'business@example.com': { name: 'Business User', role: 'business' },
          'user@example.com': { name: 'Regular User', role: 'user' }
        };
        
        if (validUsers[email]) {
          const userInfo = validUsers[email];
          const mockUser = {
            user: {
              id: `mock-user-id-${email.split('@')[0]}`,
              email: email,
              user_metadata: {
                full_name: userInfo.name,
                role: userInfo.role
              }
            },
            session: {
              access_token: 'mock-token',
              expires_at: Date.now() + 3600000
            }
          };
          console.log(`Demo login successful for ${email} with role ${userInfo.role}`);
          res.writeHead(200);
          res.end(JSON.stringify(mockUser));
        } else {
          console.log(`Demo login failed for ${email}`);
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid email or password' }));
        }
        return;
      }
      
      console.log(`Attempting to sign in user: ${email}`);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Authentication error:', error);
          res.writeHead(401);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        console.log('User authenticated successfully');
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } catch (supabaseError) {
        console.error('Supabase error during auth:', supabaseError);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Authentication service unavailable' }));
      }
    } catch (error) {
      console.error('Error signing in:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Authentication failed' }));
    }
    return;
  }
  
  // POST /api/auth/signup
  if (endpoint === '/auth/signup' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, password, name } = body;
      
      if (!email || !password || !name) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email, password, and name are required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, using simulated registration');
        
        // Determine user role based on email
        const isAdmin = email.includes('admin');
        const isBusiness = email.includes('business') || email === 'demo@example.com';
        const userRole = isAdmin ? 'admin' : (isBusiness ? 'business' : 'user');
        
        // Simulate registration for demo purposes
        const mockUser = {
          user: {
            id: `mock-user-id-${email.split('@')[0]}-${Date.now()}`,
            email: email,
            user_metadata: {
              full_name: name,
              role: userRole
            }
          },
          session: {
            access_token: 'mock-token',
            expires_at: Date.now() + 3600000
          }
        };
        
        console.log(`Demo registration successful for ${email} with role ${userRole}`);
        res.writeHead(200);
        res.end(JSON.stringify(mockUser));
        return;
      }
      
      try {
        // Determine user role based on email
        const isAdmin = email.includes('admin');
        const isBusiness = email.includes('business') || email === 'demo@example.com';
        const userRole = isAdmin ? 'admin' : (isBusiness ? 'business' : 'user');
        
        console.log(`Attempting to register user: ${email} with role: ${userRole}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: userRole
            }
          }
        });
        
        if (error) {
          console.error('Registration error:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        // Create a user profile
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              full_name: name,
              email: email
            }]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (profileError) {
          console.error('Failed to create profile:', profileError);
        }
        
        console.log('User registered successfully');
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } catch (supabaseError) {
        console.error('Supabase error during registration:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Registration service unavailable' }));
      }
    } catch (error) {
      console.error('Error signing up:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Registration failed' }));
    }
    return;
  }
  
  // POST /api/category/suggest
  if (endpoint === '/category/suggest' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { name, description } = body;
      
      if (!name || !description) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Category name and description are required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, simulating category suggestion');
        // Simulate category suggestion for demo purposes
        res.writeHead(200);
        res.end(JSON.stringify({ 
          id: 'mock-category-' + Date.now(),
          name: name,
          description: description,
          status: 'pending'
        }));
        return;
      }
      
      try {
        console.log(`Submitting category suggestion: ${name}`);
        const { data, error } = await supabase
          .from('category_suggestions')
          .insert([{ 
            name: name,
            description: description,
            status: 'pending'
          }])
          .select();
          
        if (error) {
          console.error('Category suggestion error:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        console.log('Category suggestion submitted successfully');
        res.writeHead(200);
        res.end(JSON.stringify(data[0]));
      } catch (supabaseError) {
        console.error('Supabase error during category suggestion:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Category suggestion service unavailable' }));
      }
    } catch (error) {
      console.error('Error submitting category suggestion:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Category suggestion failed' }));
    }
    return;
  }
  
  // POST /api/submission
  if (endpoint === '/submission' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { competitionId, title, description, userId, timestamp } = body;
      
      if (!competitionId || !title || !description) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Competition ID, title, and description are required' }));
        return;
      }
      
      // Additional logging for offline sync requests
      if (timestamp) {
        console.log(`Processing submission from offline queue, timestamp: ${timestamp}`);
      }
      
      if (!supabase) {
        console.log('Supabase not available, simulating submission');
        // Simulate submission for demo purposes
        res.writeHead(200);
        res.end(JSON.stringify({ 
          id: 'mock-submission-' + Date.now(),
          competition_id: competitionId,
          title: title,
          description: description,
          user_id: userId || 'anonymous',
          created_at: timestamp || new Date().toISOString(),
          status: 'submitted',
          votes: 0
        }));
        return;
      }
      
      try {
        console.log(`Submitting entry for competition: ${competitionId}`);
        const { data, error } = await supabase
          .from('submissions')
          .insert([{ 
            competition_id: competitionId,
            title: title,
            description: description,
            user_id: userId || null,
            created_at: timestamp || new Date().toISOString(),
            status: 'submitted',
            votes: 0
          }])
          .select();
          
        if (error) {
          console.error('Submission error:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        console.log('Submission submitted successfully');
        res.writeHead(200);
        res.end(JSON.stringify(data[0]));
      } catch (supabaseError) {
        console.error('Supabase error during submission:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Submission service unavailable' }));
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Submission failed' }));
    }
    return;
  }
  
  // POST /api/vote
  if (endpoint === '/vote' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { submissionId } = body;
      
      if (!submissionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Submission ID is required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, simulating vote');
        // Simulate voting for demo purposes
        // Find the submission in our mock data
        const submissionIndex = MOCK_DATA.submissions.findIndex(s => s.id === submissionId);
        
        if (submissionIndex === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Submission not found' }));
          return;
        }
        
        // Increment votes
        MOCK_DATA.submissions[submissionIndex].votes += 1;
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          votes: MOCK_DATA.submissions[submissionIndex].votes
        }));
        return;
      }
      
      try {
        console.log(`Recording vote for submission: ${submissionId}`);
        
        // First get current vote count
        const { data: submission, error: getError } = await supabase
          .from('submissions')
          .select('votes')
          .eq('id', submissionId)
          .single();
          
        if (getError) {
          console.error('Error getting submission votes:', getError);
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Submission not found' }));
          return;
        }
        
        // Increment votes
        const newVoteCount = (submission.votes || 0) + 1;
        
        // Update the vote count
        const { error: updateError } = await supabase
          .from('submissions')
          .update({ votes: newVoteCount })
          .eq('id', submissionId);
          
        if (updateError) {
          console.error('Error updating vote count:', updateError);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to record vote' }));
          return;
        }
        
        console.log('Vote recorded successfully');
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          votes: newVoteCount
        }));
      } catch (supabaseError) {
        console.error('Supabase error during voting:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Voting service unavailable' }));
      }
    } catch (error) {
      console.error('Error recording vote:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Voting failed' }));
    }
    return;
  }

  // GET /api/analytics/business/:id
  if (endpoint.match(/^\/analytics\/business\/[\w-]+$/) && req.method === 'GET') {
    const businessId = endpoint.split('/').pop();
    console.log(`Fetching analytics for business: ${businessId}`);
    
    // Log analytics request for debugging
    console.log(`Analytics request for business ID: ${businessId}`);
    
    if (!supabase) {
      console.log('Supabase not available, using mock analytics data');
      const analytics = MOCK_DATA.analytics[businessId];
      
      if (!analytics) {
        console.log(`No mock analytics found for business ID: ${businessId}`);
        // If no exact match, return the first mock business as fallback
        const fallbackAnalytics = MOCK_DATA.analytics['mock-business-1'];
        if (fallbackAnalytics) {
          console.log('Using fallback mock analytics data');
          res.writeHead(200);
          res.end(JSON.stringify(fallbackAnalytics));
          return;
        }
        
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Business analytics not found' }));
        return;
      }
      
      console.log('Sending mock analytics data');
      res.writeHead(200);
      res.end(JSON.stringify(analytics));
      return;
    }
    
    try {
      // In a real implementation, we would query Supabase for analytics data
      console.log('Attempting to fetch real analytics data from Supabase');
      
      // 1. Get competitions for this business
      const { data: competitions, error: competitionsError } = await supabase
        .from('competitions')
        .select('*')
        .eq('business_id', businessId);
        
      if (competitionsError) {
        console.error('Supabase error fetching business competitions:', competitionsError);
        console.log('Falling back to mock analytics data due to Supabase error');
        // Fall back to mock data
        const mockAnalytics = MOCK_DATA.analytics[businessId] || MOCK_DATA.analytics['mock-business-1'];
        if (mockAnalytics) {
          res.writeHead(200);
          res.end(JSON.stringify(mockAnalytics));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Business analytics not found' }));
        }
        return;
      }
      
      // For now, if no real data is available, fall back to mock data
      if (!competitions || competitions.length === 0) {
        console.log('No competitions found for business, using mock data');
        const mockAnalytics = MOCK_DATA.analytics[businessId] || MOCK_DATA.analytics['mock-business-1'];
        if (mockAnalytics) {
          res.writeHead(200);
          res.end(JSON.stringify(mockAnalytics));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Business analytics not found' }));
        }
        return;
      }
      
      // If we got this far, we have real competition data
      console.log(`Found ${competitions.length} competitions for business, generating analytics`);
      
      // Generate more realistic analytics data based on real competitions
      const totalSubmissions = competitions.reduce((sum, comp) => sum + (Math.floor(Math.random() * 20) + 5), 0);
      const totalViews = competitions.reduce((sum, comp) => sum + (Math.floor(Math.random() * 300) + 100), 0);
      
      const analyticsData = {
        totalCompetitions: competitions.length,
        totalSubmissions: totalSubmissions,
        totalViews: totalViews.toString(),
        avgEngagement: Math.floor((totalSubmissions / totalViews) * 100) + '%',
        competitions: competitions.map(comp => {
          const submissions = Math.floor(Math.random() * 30) + 5;
          const views = Math.floor(Math.random() * 500) + 100;
          return {
            title: comp.title,
            submissions: submissions,
            views: views,
            engagementRate: ((submissions / views) * 100).toFixed(1) + '%'
          };
        }),
        demographics: {
          '18-24': Math.floor(Math.random() * 30) + 10,
          '25-34': Math.floor(Math.random() * 30) + 20,
          '35-44': Math.floor(Math.random() * 20) + 10,
          '45-54': Math.floor(Math.random() * 15) + 5,
          '55+': Math.floor(Math.random() * 10) + 5
        },
        timeline: {
          dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          submissions: [5, 12, 18, 23, 29, totalSubmissions].map(v => Math.floor(v * (Math.random() * 0.5 + 0.75))),
          views: [120, 250, 380, 470, 580, totalViews].map(v => Math.floor(v * (Math.random() * 0.5 + 0.75)))
        },
        // Enhanced engagement analytics data
        engagement: {
          daily: [15, 22, 18, 25, 30, 28, 32].map(v => Math.floor(v * (Math.random() * 0.5 + 0.75))),
          weekly: [105, 129, 154, 178, 210].map(v => Math.floor(v * (Math.random() * 0.3 + 0.85))),
          monthly: [410, 485, 560, 620].map(v => Math.floor(v * (Math.random() * 0.2 + 0.9))),
          weeklyTrend: Math.floor(Math.random() * 10) + 5,
          conversionRate: (Math.random() * 2 + 2).toFixed(1),
          avgTimeSpent: (Math.random() * 2 + 3).toFixed(1),
          bounceRate: Math.floor(Math.random() * 10) + 20,
          interactionRate: Math.floor(Math.random() * 15) + 55
        },
        trafficSources: [
          { name: 'Organic Search', percentage: Math.floor(Math.random() * 20) + 30 },
          { name: 'Direct', percentage: Math.floor(Math.random() * 15) + 20 },
          { name: 'Social Media', percentage: Math.floor(Math.random() * 15) + 15 },
          { name: 'Referral', percentage: Math.floor(Math.random() * 10) + 5 },
          { name: 'Email', percentage: Math.floor(Math.random() * 10) + 5 }
        ],
        userBehavior: {
          returningUsers: Math.floor(Math.random() * 15) + 55 + '%',
          votesPerUser: (Math.random() * 4 + 5).toFixed(1),
          submissionQuality: (Math.random() * 1 + 3.5).toFixed(1) + '★',
          userRetention: Math.floor(Math.random() * 15) + 60 + '%',
          userGrowth: Math.floor(Math.random() * 10) + 5 + '%',
          activeDays: Math.floor(Math.random() * 2) + 3,
          commentFrequency: (Math.random() * 2 + 1).toFixed(1)
        },
        peakActivity: `${Math.floor(Math.random() * 4) + 1}pm - ${Math.floor(Math.random() * 4) + 5}pm`,
        sessionDuration: (Math.random() * 2 + 3).toFixed(1) + ' min',
        geographicData: {
          regions: [
            { name: 'North America', percentage: Math.floor(Math.random() * 20) + 40 },
            { name: 'Europe', percentage: Math.floor(Math.random() * 15) + 25 },
            { name: 'Asia', percentage: Math.floor(Math.random() * 10) + 15 },
            { name: 'Other', percentage: Math.floor(Math.random() * 10) + 5 }
          ]
        },
        competitionPerformance: {
          averageSubmissionsPerCompetition: (totalSubmissions / competitions.length).toFixed(1),
          submissionCompletionRate: Math.floor(Math.random() * 20) + 70 + '%',
          averageCompetitionDuration: Math.floor(Math.random() * 10) + 20 + ' days',
          topPerformingCategory: ['Design', 'Marketing', 'Technology', 'Creative Writing'][Math.floor(Math.random() * 4)]
        },
        deviceData: {
          mobile: Math.floor(Math.random() * 20) + 50,
          desktop: Math.floor(Math.random() * 20) + 30,
          tablet: Math.floor(Math.random() * 10) + 5
        }
      };
      
      console.log('Sending generated analytics data');
      res.writeHead(200);
      res.end(JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      console.log('Using mock data as fallback due to error');
      
      // Try mock data as fallback
      const mockAnalytics = MOCK_DATA.analytics[businessId] || MOCK_DATA.analytics['mock-business-1'];
      
      if (mockAnalytics) {
        res.writeHead(200);
        res.end(JSON.stringify(mockAnalytics));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Business analytics not found' }));
      }
    }
    return;
  }

  // POST /api/submission/:id/vote
  if (endpoint.match(/^\/submission\/[\w-]+\/vote$/) && req.method === 'POST') {
    const submissionId = endpoint.split('/')[2];
    console.log(`Processing vote for submission: ${submissionId}`);
    
    try {
      const body = await parseRequestBody(req);
      const { userId } = body;
      
      if (!userId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID is required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, simulating vote submission');
        // Simulate vote processing for demo purposes
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          res.writeHead(200);
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Vote recorded successfully',
            submissionId: submissionId,
            currentVotes: Math.floor(Math.random() * 50) + 1 // Random vote count for demo
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ 
            success: false, 
            error: 'You have already voted for this submission' 
          }));
        }
        return;
      }
      
      // Real implementation with Supabase
      try {
        console.log(`Recording vote for submission ${submissionId} by user ${userId}`);
        
        // First check if user already voted for this submission
        const { data: existingVote, error: voteCheckError } = await supabase
          .from('votes')
          .select('*')
          .eq('submission_id', submissionId)
          .eq('user_id', userId);
          
        if (voteCheckError) {
          console.error('Error checking for existing vote:', voteCheckError);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to process vote' }));
          return;
        }
        
        if (existingVote && existingVote.length > 0) {
          console.log('User already voted for this submission');
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'You have already voted for this submission' }));
          return;
        }
        
        // Record the vote
        const { error: voteError } = await supabase
          .from('votes')
          .insert([{ 
            submission_id: submissionId,
            user_id: userId,
            created_at: new Date().toISOString()
          }]);
          
        if (voteError) {
          console.error('Error recording vote:', voteError);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to record vote' }));
          return;
        }
        
        // Get current vote count
        const { data: voteCount, error: countError } = await supabase
          .from('votes')
          .select('count')
          .eq('submission_id', submissionId);
          
        if (countError) {
          console.error('Error getting vote count:', countError);
        }
        
        const count = voteCount ? voteCount.count : 1;
        
        console.log('Vote recorded successfully');
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Vote recorded successfully',
          submissionId: submissionId,
          currentVotes: count
        }));
      } catch (supabaseError) {
        console.error('Supabase error during vote submission:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Vote submission service unavailable' }));
      }
    } catch (error) {
      console.error('Error processing vote:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Vote processing failed' }));
    }
    return;
  }
  
  // GET /api/submission/:id/votes
  if (endpoint.match(/^\/submission\/[\w-]+\/votes$/) && req.method === 'GET') {
    const submissionId = endpoint.split('/')[2];
    console.log(`Getting votes for submission: ${submissionId}`);
    
    if (!supabase) {
      console.log('Supabase not available, returning mock vote count');
      // Return mock vote count for demo
      const voteCount = Math.floor(Math.random() * 50) + 1; // Random between 1-50
      res.writeHead(200);
      res.end(JSON.stringify({ 
        submissionId: submissionId,
        votes: voteCount
      }));
      return;
    }
    
    try {
      // Get current vote count
      const { data, error } = await supabase
        .from('votes')
        .select('count')
        .eq('submission_id', submissionId);
        
      if (error) {
        console.error('Error getting vote count:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to get vote count' }));
        return;
      }
      
      const count = data ? data.count : 0;
      
      console.log(`Retrieved ${count} votes for submission ${submissionId}`);
      res.writeHead(200);
      res.end(JSON.stringify({ 
        submissionId: submissionId,
        votes: count
      }));
    } catch (error) {
      console.error('Error getting votes:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to get votes' }));
    }
    return;
  }

  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});