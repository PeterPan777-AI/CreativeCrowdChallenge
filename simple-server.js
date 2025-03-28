const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log credentials for debugging (without exposing full values)
console.log(`Supabase URL available: ${Boolean(supabaseUrl)}`);
console.log(`Supabase Anon Key available: ${Boolean(supabaseAnonKey)}`);

// Make sure we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Using mock data only.');
}

// Validate and fix Supabase URL if needed
if (supabaseUrl && !supabaseUrl.match(/^https?:\/\//)) {
  supabaseUrl = 'https://' + supabaseUrl;
  console.log(`Added https:// prefix to Supabase URL: ${supabaseUrl}`);
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
    console.log('Using mock data due to invalid Supabase URL');
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

// Category image mapping - will be served from the client-side using category-images.js
const categoryNames = {
  'cat-i1': 'Music Competition',
  'cat-i2': 'Writing Competition',
  'cat-i3': 'Photography Competition',
  'cat-i4': 'Art Competition',
  'cat-i5': 'Design Competition',
  'cat-i6': 'Film Competition',
  'cat-b1': 'AI & Tech Competition',
  'cat-b2': 'Product Innovation',
  'cat-b3': 'Marketing Competition',
  'cat-b4': 'Sustainability Challenge',
  'cat-b5': 'Social Impact Challenge',
  'cat-b6': 'Startup Challenge'
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

// Create the HTTP server with improved routing
const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Parse the URL to get the path and query params
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const queryParams = parsedUrl.searchParams;
  
  console.log(`Request: ${req.method} ${pathname}`);
  console.log(`Query parameters: ${JSON.stringify(Object.fromEntries(queryParams))}`);
  
  try {
    // Handle API requests
    if (pathname.startsWith('/api/')) {
      await handleApiRequest(req, res);
      return;
    }
    
    // Pattern matching for competition detail pages
    const competitionDetailMatch = pathname.match(/^\/competitions\/([a-zA-Z0-9-]+)$/);
    if (competitionDetailMatch) {
      const competitionId = competitionDetailMatch[1];
      console.log(`Serving competition details page for ID: ${competitionId}`);
      
      // Serve the competition details HTML directly
      const detailsPath = path.join(__dirname, 'competition-details.html');
      fs.readFile(detailsPath, 'utf8', (err, content) => {
        if (err) {
          console.error('Error reading competition-details.html:', err);
          res.writeHead(500, {'Content-Type': 'text/html'});
          res.end('<h1>Server Error</h1><p>Could not load competition details page.</p>');
          return;
        }
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(content);
      });
      return;
    }
    
    // Handle other special routes
    if (pathname === '/competitions') {
      console.log('Redirecting from /competitions to /competitions.html');
      res.writeHead(302, { 'Location': '/competitions.html' });
      res.end();
      return;
    } 
    
    if (pathname === '/admin') {
      console.log('Redirecting from /admin to /admin.html');
      res.writeHead(302, { 'Location': '/admin.html' });
      res.end();
      return;
    }
    
    if (pathname === '/leaderboard') {
      console.log('Redirecting from /leaderboard to /leaderboard.html');
      res.writeHead(302, { 'Location': '/leaderboard.html' });
      res.end();
      return;
    }
    
    if (pathname.startsWith('/preview-competition')) {
      console.log('Serving preview-competition.html with query parameters');
      const previewPath = path.join(__dirname, 'preview-competition.html');
      serveFile(res, previewPath);
      return;
    }
    
    // Default route handling
    let filePath;
    if (pathname === '/' || pathname === '/index.html') {
      filePath = path.join(__dirname, 'simple-test.html');
    } else {
      filePath = path.join(__dirname, pathname);
    }
    
    // Check for analytics demo mode
    if (queryParams.has('analyticsDemo') && queryParams.get('analyticsDemo') === 'true') {
      console.log('Analytics demo mode detected!');
      console.log(`Serving HTML file with query parameters: ${JSON.stringify(Object.fromEntries(queryParams))}`);
    }
    
    // Serve the file
    serveFile(res, filePath);
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.end('<h1>Server Error</h1><p>Something went wrong on the server.</p>');
  }
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
          category: 'cat-i6',
          description: 'Capture the essence of summer in a single photograph...',
          type: 'individual'
        },
        {
          id: 'writing-challenge',
          title: 'Creative Writing Challenge',
          deadline: 'April 30, 2025',
          entries: 18,
          categories: ['Writing'],
          category: 'cat-i2',
          description: 'Write a short story on the theme "New Beginnings"...',
          type: 'individual'
        },
        {
          id: 'music-competition',
          title: 'Melody Makers Music Competition',
          deadline: 'May 10, 2025',
          entries: 7,
          categories: ['Music'],
          category: 'cat-i1',
          description: 'Compose an original 2-minute piece in any genre...',
          type: 'individual'
        },
        {
          id: 'mock-comp-1',
          title: 'AI Tool Innovation Challenge',
          deadline: 'May 20, 2025',
          entries: 15,
          categories: ['Technology', 'AI'],
          category: 'cat-b1',
          description: 'Create an innovative AI tool that solves a real-world problem...',
          type: 'business',
          prize: '$5,000'
        },
        {
          id: 'mock-comp-2',
          title: 'Eco-Friendly Product Design',
          deadline: 'June 5, 2025',
          entries: 22,
          categories: ['Sustainability', 'Product Design'],
          category: 'cat-b3',
          description: 'Design a sustainable product that reduces environmental impact...',
          type: 'business',
          prize: '$3,500'
        },
        {
          id: 'mock-comp-5',
          title: 'Pet Innovation Challenge',
          deadline: 'May 30, 2025',
          entries: 18,
          categories: ['Pets', 'Innovation'],
          category: 'cat-b4',
          description: 'Create a new product or service that improves pet well-being...',
          type: 'business',
          prize: '$2,800'
        },
        {
          id: 'mock-comp-10',
          title: 'Cutest Cat Photo Contest',
          deadline: 'April 25, 2025',
          entries: 47,
          categories: ['Pets', 'Photography'],
          category: 'cat-i3',
          description: 'Submit your cutest cat photos for a chance to win prizes...',
          type: 'individual'
        },
        {
          id: 'mock-comp-13',
          title: 'Startup Pitch Competition',
          deadline: 'June 15, 2025',
          entries: 10,
          categories: ['Business', 'Entrepreneurship'],
          category: 'cat-b5',
          description: 'Pitch your innovative startup idea to a panel of investors and experts...',
          type: 'business',
          prize: '$10,000'
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
  
  // GET /api/categories
  if (endpoint === '/categories' && req.method === 'GET') {
    try {
      console.log('Fetching categories data...');
      
      // Create category data for API response
      const categoryData = Object.keys(categoryNames).map(id => {
        const isBusinessCat = id.startsWith('cat-b');
        return {
          id,
          name: categoryNames[id],
          type: isBusinessCat ? 'business' : 'individual',
          imagePath: `/assets/images/categories/${id.startsWith('cat-b') ? 
            ['tech', 'product', 'marketing', 'sustainability', 'social', 'startup'][parseInt(id.slice(5))-1] : 
            ['music', 'writing', 'photography', 'art', 'design', 'film'][parseInt(id.slice(5))-1]
          }.svg`
        };
      });
      
      res.writeHead(200);
      res.end(JSON.stringify(categoryData));
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch categories' }));
    }
    return;
  }
  
  // POST /api/auth/login - Handle admin authentication
  if (endpoint === '/auth/login' && req.method === 'POST') {
    try {
      console.log('Processing login request...');
      
      // Parse the request body
      const requestBody = await parseRequestBody(req);
      console.log('Received body:', requestBody);
      
      // Handle potential JSON parsing issues
      let email, password;
      try {
        const parsedBody = JSON.parse(requestBody);
        email = parsedBody.email;
        password = parsedBody.password;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Try to handle form data if not JSON
        const formDataParams = new URLSearchParams(requestBody);
        email = formDataParams.get('email');
        password = formDataParams.get('password');
      }
      
      if (!email || !password) {
        console.error('Missing email or password');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Email and password are required'
        }));
        return;
      }
      
      console.log(`Login attempt for: ${email}`);
      
      // Check for admin credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Admin login successful');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: 'admin-123',
            email: email,
            role: 'admin',
            name: 'Admin User',
            avatar: null
          },
          message: 'Login successful'
        }));
        return;
      }
      
      // Check for business user credentials
      if (email === 'business@example.com' && password === 'password123') {
        console.log('Business user login successful');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: 'business-123',
            email: email,
            role: 'business',
            name: 'Business User',
            avatar: null
          },
          message: 'Login successful'
        }));
        return;
      }
      
      // Check for individual user credentials
      if (email === 'user@example.com' && password === 'password123') {
        console.log('Individual user login successful');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: 'user-123',
            email: email,
            role: 'individual',
            name: 'Individual User',
            avatar: null
          },
          message: 'Login successful'
        }));
        return;
      }
      
      // Invalid credentials
      console.log('Login failed: Invalid credentials');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid email or password'
      }));
    } catch (error) {
      console.error('Error processing login:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Server error during login'
      }));
    }
    return;
  }
  
  // GET /api/leaderboards/[competitionId] - Get leaderboard for a competition
  if (endpoint.match(/^\/leaderboards\/[a-zA-Z0-9-]+$/) && req.method === 'GET') {
    try {
      // Extract competition ID from path
      const competitionId = endpoint.split('/')[2];
      console.log(`Fetching leaderboard for competition: ${competitionId}`);
      
      // Mock leaderboard data for demonstration
      const mockLeaderboard = {
        competitionId: competitionId,
        title: "Competition Leaderboard",
        updatedAt: new Date().toISOString(),
        entries: [
          {
            id: 'submission-1',
            rank: 1,
            title: 'Innovative AI Assistant',
            username: 'tech_wizard',
            average_rating: 9.8,
            vote_count: 45
          },
          {
            id: 'submission-2',
            rank: 2,
            title: 'Smart Home Solution',
            username: 'home_innovator',
            average_rating: 9.5,
            vote_count: 38
          },
          {
            id: 'submission-3',
            rank: 3,
            title: 'AR Shopping Experience',
            username: 'future_retail',
            average_rating: 9.3,
            vote_count: 41
          },
          {
            id: 'submission-4',
            rank: 4,
            title: 'AI Code Generator',
            username: 'code_master',
            average_rating: 9.1,
            vote_count: 32
          },
          {
            id: 'submission-5',
            rank: 5,
            title: 'Blockchain Payment System',
            username: 'crypto_genius',
            average_rating: 8.9,
            vote_count: 36
          },
          {
            id: 'submission-6',
            rank: 6,
            title: 'Sustainable Transport App',
            username: 'eco_traveler',
            average_rating: 8.7,
            vote_count: 29
          },
          {
            id: 'submission-7',
            rank: 7,
            title: 'ML-powered Health Monitor',
            username: 'health_tech',
            average_rating: 8.6,
            vote_count: 33
          },
          {
            id: 'submission-8',
            rank: 8,
            title: 'Voice-controlled Smart Office',
            username: 'office_future',
            average_rating: 8.4,
            vote_count: 27
          },
          {
            id: 'submission-9',
            rank: 9,
            title: 'Virtual Reality Workspace',
            username: 'vr_worker',
            average_rating: 8.2,
            vote_count: 30
          },
          {
            id: 'submission-10',
            rank: 10,
            title: 'AI Content Generator',
            username: 'content_creator',
            average_rating: 8.0,
            vote_count: 25
          }
        ]
      };
      
      // Respond with the mock leaderboard data
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockLeaderboard));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Error fetching leaderboard data'
      }));
    }
    return;
  }
  
  // GET /api/leaderboards/category/[categoryId] - Get leaderboard for a category
  if (endpoint.match(/^\/leaderboards\/category\/[a-zA-Z0-9-]+$/) && req.method === 'GET') {
    try {
      // Extract category ID from path
      const categoryId = endpoint.split('/')[3];
      console.log(`Fetching category leaderboard for: ${categoryId}`);
      
      // Create a mock category leaderboard
      const mockCategoryLeaderboard = {
        categoryId: categoryId,
        categoryName: categoryNames[categoryId] || "Unknown Category",
        updatedAt: new Date().toISOString(),
        entries: [
          {
            id: 'submission-c1',
            rank: 1,
            title: 'Category Winner Project',
            username: 'category_expert',
            average_rating: 9.7,
            vote_count: 42
          },
          {
            id: 'submission-c2',
            rank: 2,
            title: 'Runner-up Solution',
            username: 'innovative_mind',
            average_rating: 9.4,
            vote_count: 39
          },
          {
            id: 'submission-c3',
            rank: 3,
            title: 'Top-tier Implementation',
            username: 'skilled_developer',
            average_rating: 9.2,
            vote_count: 35
          },
          {
            id: 'submission-c4',
            rank: 4,
            title: 'Cutting-edge Approach',
            username: 'tech_pioneer',
            average_rating: 9.0,
            vote_count: 31
          },
          {
            id: 'submission-c5',
            rank: 5,
            title: 'Innovative Method',
            username: 'creative_solution',
            average_rating: 8.8,
            vote_count: 29
          }
        ]
      };
      
      // Respond with the mock category leaderboard data
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockCategoryLeaderboard));
    } catch (error) {
      console.error('Error fetching category leaderboard:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Error fetching category leaderboard data'
      }));
    }
    return;
  }

  // GET /api/competitions/:id
  if ((endpoint.match(/^\/competitions\/[a-zA-Z0-9-]+$/) || endpoint.match(/^\/competition\/[a-zA-Z0-9-]+$/)) && req.method === 'GET') {
    try {
      // Extract competition ID from either /competitions/:id or /competition/:id
      const parts = endpoint.split('/');
      const competitionId = parts[2];
      
      // Check if this is a preview request
      const urlParts = req.url.split('?');
      const queryParams = new URLSearchParams(urlParts[1] || '');
      const isPreview = queryParams.get('preview') === 'true';
      
      console.log(`Fetching competition with ID: ${competitionId} (Preview mode: ${isPreview})`);
      
      // Mock competition data for demo purposes
      const mockCompetitions = {
        'photo-contest': {
          id: 'photo-contest',
          title: 'Summer Photography Contest',
          deadline: 'April 15, 2025',
          entries: 24,
          category: 'cat-i6',
          type: 'individual',
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
          category: 'cat-i2',
          type: 'individual',
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
          category: 'cat-i1',
          type: 'individual',
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
        },
        'mock-comp-1': {
          id: 'mock-comp-1',
          title: 'AI Tool Innovation Challenge',
          deadline: 'May 20, 2025',
          entries: 15,
          category: 'cat-b1',
          type: 'business',
          categories: ['Technology', 'AI'],
          description: 'Create an innovative AI tool that solves a real-world problem. We\'re looking for practical applications of AI that can make a meaningful difference in people\'s lives or improve business efficiency.',
          prizes: [
            'First place: $5,000 + Investor pitch opportunity',
            'Second place: $2,500 + Software development support',
            'Third place: $1,000 + Industry mentorship',
            'All finalists: Publicity in tech publications'
          ],
          rules: [
            'Tool must use genuine AI/ML technology (not just automation)',
            'Must demonstrate working prototype',
            'All submissions include 5-minute demo video',
            'Must be original work created for this competition',
            'Teams of up to 3 people allowed'
          ],
          prize: '$5,000'
        },
        'mock-comp-2': {
          id: 'mock-comp-2',
          title: 'Eco-Friendly Product Design',
          deadline: 'June 5, 2025',
          entries: 22,
          category: 'cat-b3',
          type: 'business',
          categories: ['Sustainability', 'Product Design'],
          description: 'Design a sustainable product that reduces environmental impact. Focus on innovative use of recyclable materials, energy efficiency, waste reduction, or circular economy principles.',
          prizes: [
            'First place: $3,500 + Product development assistance',
            'Second place: $1,500 + Marketing package',
            'Third place: $750 + Sustainability certification guidance',
            'People\'s Choice: Featured in Eco Business Magazine'
          ],
          rules: [
            'Design must include manufacturing feasibility analysis',
            'Must quantify environmental impact reduction',
            'Submissions include material specifications and production plans',
            'Proof of concept or prototype strongly encouraged',
            'Must be commercially viable'
          ],
          prize: '$3,500'
        },
        'mock-comp-5': {
          id: 'mock-comp-5',
          title: 'Pet Innovation Challenge',
          deadline: 'May 30, 2025',
          entries: 18,
          category: 'cat-b4',
          type: 'business',
          categories: ['Pets', 'Innovation'],
          description: 'Create a new product or service that improves pet well-being. We\'re seeking innovations in pet healthcare, nutrition, enrichment, training, or owner convenience that enhance the lives of pets and their owners.',
          prizes: [
            'First place: $2,800 + Retail distribution opportunity',
            'Second place: $1,200 + Product testing with veterinary partners',
            'Third place: $600 + Marketing consultation',
            'Special mention: Feature in Pet Lovers Magazine'
          ],
          rules: [
            'Must address genuine pet wellness or owner needs',
            'Submissions require veterinary safety assessment',
            'Must include market analysis and pricing strategy',
            'Prototype or detailed design required',
            'Video demonstration recommended'
          ],
          prize: '$2,800'
        },
        'mock-comp-10': {
          id: 'mock-comp-10',
          title: 'Cutest Cat Photo Contest',
          deadline: 'April 25, 2025',
          entries: 47,
          category: 'cat-i3',
          type: 'individual',
          categories: ['Pets', 'Photography'],
          description: 'Submit your cutest cat photos for a chance to win prizes. We\'re looking for charming, funny, or heart-warming moments featuring feline friends that showcase their personality.',
          prizes: [
            'First place: $200 gift card for pet supplies',
            'Second place: $100 gift card for pet supplies',
            'Third place: $50 gift card for pet supplies',
            'People\'s Choice: Custom cat portrait by professional artist'
          ],
          rules: [
            'Photos must be of your own cat',
            'Basic editing allowed (color correction, cropping)',
            'No digital manipulation changing your cat\'s appearance',
            'Maximum 3 entries per participant',
            'Image resolution minimum 1080p'
          ]
        },
        'mock-comp-13': {
          id: 'mock-comp-13',
          title: 'Startup Pitch Competition',
          deadline: 'June 15, 2025',
          entries: 10,
          category: 'cat-b5',
          type: 'business',
          categories: ['Business', 'Entrepreneurship'],
          description: 'Pitch your innovative startup idea to a panel of investors and experts. This competition seeks disruptive business models, innovative solutions to market problems, or unique product ideas with growth potential.',
          prizes: [
            'First place: $10,000 seed funding + Mentorship package',
            'Second place: $5,000 + Investor introductions',
            'Third place: $2,500 + Business strategy consultation',
            'All finalists: Media coverage and networking reception'
          ],
          rules: [
            'Must be pre-revenue or early-stage startups',
            'Submissions include business plan and 10-slide pitch deck',
            'Final round requires live pitch presentation',
            'Market validation evidence required',
            'Must demonstrate innovation and scalability'
          ],
          prize: '$10,000'
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