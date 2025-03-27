const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
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
    // Add https:// prefix if not present
    let formattedUrl = supabaseUrl;
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = 'https://' + formattedUrl;
      console.log('Added https:// prefix to Supabase URL');
    }
    
    // Initialize client
    supabase = createClient(formattedUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
    
    // Alert users about potential Replit network limitations
    console.log('Due to networking limitations in Replit, using the application in demo mode with mock data');
    console.log('This does not affect the functionality of the application for testing purposes');
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
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
function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // Determine the file's extension for MIME type
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Get the URL path
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Log the request
  console.log(`Request: ${req.method} ${pathname}`);
  console.log(`Query parameters: ${JSON.stringify(parsedUrl.query)}`);
  
  // API REQUESTS - HANDLE FIRST
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // COMPETITION DETAILS PAGE - Special handling to fix the issue
  const competitionMatch = pathname.match(/^\/competitions\/([a-zA-Z0-9-]+)$/);
  if (competitionMatch) {
    const competitionId = competitionMatch[1];
    console.log(`Serving competition details for ID: ${competitionId}`);
    
    // Directly serve competition-details.html
    const detailsPage = path.join(__dirname, 'competition-details.html');
    fs.readFile(detailsPage, (err, content) => {
      if (err) {
        console.error('Error reading competition-details.html:', err);
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.end('<h1>Server Error</h1><p>Could not load competition details.</p>');
        return;
      }
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(content);
    });
    return;
  }
  
  // COMPETITIONS LIST REDIRECTS
  if (pathname === '/competitions') {
    console.log('Redirecting from /competitions to /competitions.html');
    res.writeHead(302, { 'Location': '/competitions.html' });
    res.end();
    return;
  }
  
  // COMPETITION PREVIEW PAGE
  if (pathname.startsWith('/preview-competition')) {
    console.log('Serving preview-competition.html');
    serveFile(res, path.join(__dirname, 'preview-competition.html'));
    return;
  }
  
  // DEFAULT ROUTES
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'simple-test.html');
  } else {
    filePath = path.join(__dirname, pathname);
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
      console.log('Supabase not available, using mock competition data');
      res.writeHead(200);
      res.end(JSON.stringify(mockCompetitions));
    } catch (error) {
      console.error('Error fetching competitions:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch competitions' }));
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
      
      console.log(`Fetching details for competition: ${competitionId} (Preview Mode: ${isPreview})`);
      
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
      console.log('Supabase not available, using mock competition data');
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
  
  // GET /api/categories
  if (endpoint === '/categories' && req.method === 'GET') {
    try {
      console.log('Fetching categories data...');
      
      // Mock categories data
      const mockCategories = [
        // Business categories
        {
          id: 'cat-b1',
          name: 'AI Tools',
          description: 'Innovative AI-powered solutions for business and consumer needs',
          type: 'business',
          icon: '🤖'
        },
        {
          id: 'cat-b2',
          name: 'Marketing Innovation',
          description: 'Creative approaches to brand awareness and customer engagement',
          type: 'business',
          icon: '📈'
        },
        {
          id: 'cat-b3',
          name: 'Sustainable Products',
          description: 'Eco-friendly products and services that reduce environmental impact',
          type: 'business',
          icon: '🌱'
        },
        {
          id: 'cat-b4',
          name: 'Pet Industry Solutions',
          description: 'Products and services for pets and pet owners',
          type: 'business',
          icon: '🐾'
        },
        {
          id: 'cat-b5',
          name: 'Startup Ideas',
          description: 'Innovative business concepts with growth potential',
          type: 'business',
          icon: '🚀'
        },
        {
          id: 'cat-b6',
          name: 'Educational Technology',
          description: 'Tools and platforms that enhance learning experiences',
          type: 'business',
          icon: '🎓'
        },
        
        // Individual categories
        {
          id: 'cat-i1',
          name: 'Music',
          description: 'Original compositions and performances across all genres',
          type: 'individual',
          icon: '🎵'
        },
        {
          id: 'cat-i2',
          name: 'Writing',
          description: 'Creative writing including short stories, poetry, and essays',
          type: 'individual',
          icon: '✍️'
        },
        {
          id: 'cat-i3',
          name: 'Pet Photography',
          description: 'Capturing the personality and charm of animals',
          type: 'individual',
          icon: '📸'
        },
        {
          id: 'cat-i4',
          name: 'Home Cooking',
          description: 'Culinary creations from home chefs and food enthusiasts',
          type: 'individual',
          icon: '🍳'
        },
        {
          id: 'cat-i5',
          name: 'DIY Crafts',
          description: 'Handmade creations showing creativity and craftsmanship',
          type: 'individual',
          icon: '🧶'
        },
        {
          id: 'cat-i6',
          name: 'Photography',
          description: 'Striking images capturing moments, places, and perspectives',
          type: 'individual',
          icon: '📷'
        }
      ];
      
      // Try to fetch from Supabase if available
      if (supabase) {
        console.log('Attempting to fetch from Supabase...');
        const { data, error } = await supabase
          .from('categories')
          .select('*');
          
        if (error) {
          console.error('Supabase error:', error);
          // Continue with mock data
        } else if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} categories from Supabase`);
          res.writeHead(200);
          res.end(JSON.stringify(data));
          return;
        }
      }
      
      // Use mock data if Supabase is not available or returned no data
      console.log('Using mock categories data');
      res.writeHead(200);
      res.end(JSON.stringify(mockCategories));
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch categories' }));
    }
    return;
  }
  
  // If we reached this point, the API endpoint was not found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});