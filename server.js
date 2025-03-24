const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Handle API requests
async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = url.pathname.replace('/api', '');
  
  res.setHeader('Content-Type', 'application/json');
  
  // GET /api/competitions
  if (endpoint === '/competitions' && req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*');
        
      if (error) throw error;
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching competitions:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch competitions' }));
    }
    return;
  }

  // Handle user authentication
  if (endpoint === '/auth/signin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error('Error signing in:', error);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Authentication failed' }));
      }
    });
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