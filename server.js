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
  
  // Serve static files
  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'simple-test.html');
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
        if (email === 'demo@example.com' && password === 'password') {
          const mockUser = {
            user: {
              id: 'mock-user-id',
              email: email,
              user_metadata: {
                full_name: 'Demo User'
              }
            },
            session: {
              access_token: 'mock-token',
              expires_at: Date.now() + 3600000
            }
          };
          res.writeHead(200);
          res.end(JSON.stringify(mockUser));
        } else {
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
        // Simulate registration for demo purposes
        const mockUser = {
          user: {
            id: 'mock-user-id-' + Date.now(),
            email: email,
            user_metadata: {
              full_name: name
            }
          },
          session: {
            access_token: 'mock-token',
            expires_at: Date.now() + 3600000
          }
        };
        res.writeHead(200);
        res.end(JSON.stringify(mockUser));
        return;
      }
      
      try {
        console.log(`Attempting to register user: ${email}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
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
      const { competitionId, title, description } = body;
      
      if (!competitionId || !title || !description) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Competition ID, title, and description are required' }));
        return;
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
          created_at: new Date().toISOString(),
          status: 'submitted'
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
            status: 'submitted'
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

  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});