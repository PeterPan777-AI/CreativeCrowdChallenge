const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log credentials for debugging (without exposing full values)
console.log(`Supabase URL available: ${Boolean(supabaseUrl)}`);
console.log(`Supabase Anon Key available: ${Boolean(supabaseAnonKey)}`);

// Make sure we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Using mock data only.');
}

// Initialize Supabase client only if credentials are available
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    // Check if URL is valid
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Invalid Supabase URL:', error.message);
  }
}

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

// Helper function to parse JSON body
const parseRequestBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
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
    req.on('error', reject);
  });
};

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    try {
      await handleApiRequest(req, res);
    } catch (error) {
      console.error('API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }
  
  // Serve static files - default to simple-test.html for the root
  let filePath;
  
  // Check for competitions route (without .html) to redirect
  if (req.url === '/competitions') {
    console.log('Redirecting from /competitions to /competitions.html');
    res.writeHead(302, { 'Location': '/competitions.html' });
    res.end();
    return;
  } else if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'simple-test.html');
  } else {
    filePath = path.join(__dirname, req.url);
  }
  
  // Check for analytics demo mode in query parameters
  if (req.url.includes('analyticsDemo=true')) {
    console.log('Analytics demo mode detected!');
    const queryParams = new URLSearchParams(req.url.split('?')[1] || '');
    const params = {};
    for(const [key, value] of queryParams.entries()) {
      params[key] = value;
    }
    console.log(`Serving HTML file with query parameters: ${JSON.stringify(params)}`);
  }
  
  serveFile(res, filePath);
});

// Handle API requests
async function handleApiRequest(req, res) {
  const urlParts = req.url.split('?');
  const endpoint = urlParts[0].replace('/api', '');
  
  res.setHeader('Content-Type', 'application/json');
  
  // GET /api/competitions
  if (endpoint === '/competitions' && req.method === 'GET') {
    try {
      console.log('Fetching competitions data...');
      
      // Mock data for competitions
      const mockCompetitions = [
        {
          id: 'photo-contest',
          title: 'Summer Photography Contest',
          deadline: 'April 15, 2025',
          entries: 24,
          categories: ['Photography'],
          description: 'Capture the essence of summer in a single photograph...',
        },
        {
          id: 'writing-challenge',
          title: 'Creative Writing Challenge',
          deadline: 'April 30, 2025',
          entries: 18,
          categories: ['Writing'],
          description: 'Write a short story on the theme "New Beginnings"...',
        },
        {
          id: 'music-competition',
          title: 'Melody Makers Music Competition',
          deadline: 'May 10, 2025',
          entries: 7,
          categories: ['Music'],
          description: 'Compose an original 2-minute piece in any genre...',
        }
      ];
      
      // Try to fetch from Supabase if available
      if (supabase) {
        console.log('Attempting to fetch from Supabase...');
        const { data, error } = await supabase
          .from('competitions')
          .select('*');
          
        if (error) {
          console.error('Supabase error:', error);
          // Continue with mock data
        } else if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} competitions from Supabase`);
          res.writeHead(200);
          res.end(JSON.stringify(data));
          return;
        }
      }
      
      // Use mock data if Supabase is not available or returned no data
      console.log('Using mock competition data');
      res.writeHead(200);
      res.end(JSON.stringify(mockCompetitions));
    } catch (error) {
      console.error('Error fetching competitions:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch competitions' }));
    }
    return;
  }

  // GET /api/competition/:id
  if (endpoint.match(/^\/competition\/[a-zA-Z0-9-]+$/) && req.method === 'GET') {
    try {
      const competitionId = endpoint.split('/')[2];
      console.log(`Fetching competition with ID: ${competitionId}`);
      
      // Mock competition data for demo purposes
      const mockCompetitions = {
        'photo-contest': {
          id: 'photo-contest',
          title: 'Summer Photography Contest',
          deadline: 'April 15, 2025',
          entries: 24,
          categories: ['Photography'],
          description: 'Capture the essence of summer in a single photograph. We\'re looking for vibrant colors, creative compositions, and images that tell a story about summer activities, nature, or emotions.',
          prizes: [
            'First place: $250 + Featured exhibition',
            'Second place: $100',
            'Third place: $50',
            'People\'s Choice: Professional camera accessory kit'
          ],
          rules: [
            'Images must be taken within the last 12 months',
            'Basic editing allowed (color correction, cropping)',
            'No AI-generated images or extensive compositing',
            'Maximum file size: 8MB, formats: JPG, PNG',
            'One submission per participant'
          ]
        },
        'writing-challenge': {
          id: 'writing-challenge',
          title: 'Creative Writing Challenge',
          deadline: 'April 30, 2025',
          entries: 18,
          categories: ['Writing'],
          description: 'Write a short story on the theme "New Beginnings." Explore what new beginnings mean to you or your characters. This could be about starting a new chapter in life, rebirth, transformation, or any interpretation that inspires you.',
          prizes: [
            'First place: Publication in Literary Magazine + $150',
            'Second place: $75',
            'Third place: $25',
            'All finalists: Online anthology inclusion'
          ],
          rules: [
            'Word count: 1,500-3,000 words',
            'Must be original and unpublished work',
            'Plain text or PDF submissions only',
            'One submission per participant',
            'Judging based on creativity, writing quality, and theme interpretation'
          ]
        },
        'music-competition': {
          id: 'music-competition',
          title: 'Melody Makers Music Competition',
          deadline: 'May 10, 2025',
          entries: 7,
          categories: ['Music'],
          description: 'Compose an original 2-minute piece in any genre. Show your musical creativity without boundaries - whether you prefer classical compositions, electronic beats, folk tunes, or experimental soundscapes.',
          prizes: [
            'First place: 8 hours of professional studio time + $200',
            'Second place: $100 + Professional mixing of your track',
            'Third place: $50 + Online feature',
            'All finalists: Inclusion in competition playlist'
          ],
          rules: [
            'Composition must be original',
            'Duration: 1-3 minutes',
            'All genres accepted',
            'MP3 or WAV format only',
            'No copyrighted samples unless you have rights',
            'One submission per participant'
          ]
        }
      };
      
      // Try to fetch from Supabase if available
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .eq('id', competitionId)
            .single();
            
          if (error) {
            console.error('Supabase error:', error);
            // Continue with mock data
          } else if (data) {
            console.log(`Retrieved competition data from Supabase for ID: ${competitionId}`);
            res.writeHead(200);
            res.end(JSON.stringify(data));
            return;
          }
        } catch (supabaseError) {
          console.error('Error querying Supabase:', supabaseError);
          // Continue with mock data
        }
      }
      
      // Use mock data if Supabase is not available or returned no data
      console.log(`Using mock data for competition ID: ${competitionId}`);
      res.writeHead(200);
      
      if (mockCompetitions[competitionId]) {
        res.end(JSON.stringify(mockCompetitions[competitionId]));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Competition not found' }));
      }
    } catch (error) {
      console.error('Error fetching competition details:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch competition details' }));
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
      
      try {
        // Create a user profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name: name,
              email: email
            }
          ]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } catch (profileError) {
        console.error('Failed to create profile:', profileError);
      }
      
      console.log('User registered successfully');
      res.writeHead(200);
      res.end(JSON.stringify(data));
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
        console.log(`Suggested category: ${name} - ${description}`);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          message: 'Category suggestion received (demo mode)'
        }));
        return;
      }
      
      console.log(`Suggesting new category: ${name}`);
      try {
        const { data, error } = await supabase
          .from('category_suggestions')
          .insert([
            { 
              name: name,
              description: description 
            }
          ]);
        
        if (error) {
          console.error('Error suggesting category:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
      } catch (supabaseError) {
        console.error('Supabase error when suggesting category:', supabaseError);
        // Continue with simulated success
      }
      
      console.log('Category suggestion submitted successfully');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Error suggesting category:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to submit category suggestion' }));
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
        console.log(`Mock submission for competition ${competitionId}: ${title}`);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          message: 'Submission received (demo mode)',
          submissionId: 'mock-submission-' + Date.now()
        }));
        return;
      }
      
      // Check for authentication
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Authentication required' }));
          return;
        }
        
        console.log(`Submitting entry for competition: ${competitionId}`);
        const { data, error } = await supabase
          .from('submissions')
          .insert([
            { 
              competition_id: competitionId,
              title: title,
              description: description,
              user_id: session.user.id
            }
          ]);
        
        if (error) {
          console.error('Error submitting entry:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
      } catch (supabaseError) {
        console.error('Supabase error when submitting entry:', supabaseError);
        // Fall back to mock response
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          message: 'Submission processed (demo mode)',
          submissionId: 'mock-submission-' + Date.now()
        }));
        return;
      }
      
      console.log('Entry submitted successfully');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Error submitting entry:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to submit entry' }));
    }
    return;
  }
  
  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Use port 5000 to be consistent with other workflows
const PORT = 5000;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Server base directory: ${__dirname}`);
  console.log(`Supabase URL: ${supabaseUrl ? "Connected" : "Not connected"}`);
  console.log(`Supabase Anon Key: ${supabaseAnonKey ? "Available" : "Not available"}`);
});