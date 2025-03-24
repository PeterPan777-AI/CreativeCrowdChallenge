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
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log credentials availability (without exposing values)
console.log(`Supabase URL available: ${Boolean(supabaseUrl)}`);
console.log(`Supabase Anon Key available: ${Boolean(supabaseAnonKey)}`);

// Only initialize Supabase if we have valid credentials
if (createClient && supabaseUrl && supabaseAnonKey) {
  try {
    // Validate URL format
    if (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase client initialized successfully');
    } else {
      console.error('Invalid Supabase URL format. URL must start with http:// or https://');
    }
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
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
    filePath = path.join(__dirname, 'basic.html');
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
  ]
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
  
  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});