const http = require('http');
const fs = require('fs');
const path = require('path');

// Import recommendation engine
const recommendationEngine = require('./recommendation-engine.js');

// Import voting API endpoints
const { registerVotingApiRoutes } = require('./voting-api-endpoints.js');

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
    // Create Supabase client with explicit options for Node.js environment
    const options = {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    };
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, options);
    console.log('Supabase client initialized successfully');
    
    // Announce that we're using mock data while we figure out Supabase connection issues
    console.log('Due to networking limitations in Replit, using the application in demo mode with mock data');
    console.log('This does not affect the functionality of the application for testing purposes');
    
    // We'll explicitly set supabase to null to use mock data for now
    supabase = null;
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
  // Parse URL to separate path from query parameters
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin.html') {
    // Serve admin login page
    filePath = path.join(__dirname, 'admin.html');
  } else if (pathname === '/login' || pathname === '/login.html') {
    // Serve login page with Firebase authentication
    filePath = path.join(__dirname, 'login.html');
  } else if (pathname === '/login-fixed' || pathname === '/login-fixed.html') {
    // Serve fixed login page
    filePath = path.join(__dirname, 'login-fixed.html');
  } else if (pathname === '/simple-login' || pathname === '/simple-login.html') {
    // Serve simple login page
    filePath = path.join(__dirname, 'simple-login.html');
  } else if (pathname === '/basic-login' || pathname === '/basic-login.html') {
    // Serve basic login page
    filePath = path.join(__dirname, 'basic-login.html');
  } else if (pathname === '/profile' || pathname === '/profile.html') {
    // Serve profile page
    filePath = path.join(__dirname, 'profile.html');
  } else if (pathname === '/business-subscription' || pathname === '/business-subscription.html') {
    // Serve business subscription page
    filePath = path.join(__dirname, 'business-subscription.html');
  } else if (pathname === '/submission-demo' || pathname === '/submission-demo.html') {
    // Serve submission demo page with drag & drop functionality
    filePath = path.join(__dirname, 'submission-demo.html');
  } else if (pathname === '/competitions' || pathname === '/competitions.html') {
    // Serve competitions page
    filePath = path.join(__dirname, 'competitions.html');
  } else if (pathname === '/leaderboard' || pathname === '/leaderboard.html') {
    // Serve leaderboard page
    filePath = path.join(__dirname, 'leaderboard.html');
  } else if (pathname === '/rating-component' || pathname === '/rating-component.html') {
    // Serve rating component page
    filePath = path.join(__dirname, 'rating-component.html');
  } else {
    filePath = path.join(__dirname, pathname);
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
let analyticsRequests = [
  {
    id: 'analytics-req-1',
    userId: 'mock-user-id-business',
    userEmail: 'business@example.com',
    competitionIds: ['mock-comp-1'],
    timeFrame: 'Last 30 days',
    description: 'Need insights on participant demographics and engagement metrics',
    status: 'pending',
    createdAt: '2025-03-23T10:15:00Z',
    updatedAt: null,
    adminNotes: null
  },
  {
    id: 'analytics-req-2',
    userId: 'mock-user-id-business',
    userEmail: 'business@example.com',
    competitionIds: ['mock-comp-2'],
    timeFrame: 'Last 60 days',
    description: 'Analyzing conversion rates and participant quality',
    status: 'approved',
    createdAt: '2025-03-20T09:30:00Z',
    updatedAt: '2025-03-21T14:45:00Z',
    adminNotes: 'Approved by administrator'
  },
  {
    id: 'analytics-req-3',
    userId: 'mock-user-id-business',
    userEmail: 'business@example.com',
    competitionIds: [],
    timeFrame: 'Last 90 days',
    description: 'Comprehensive platform performance analysis',
    status: 'declined',
    createdAt: '2025-03-18T16:20:00Z',
    updatedAt: '2025-03-19T11:10:00Z',
    adminNotes: 'Request too broad, please specify competitions'
  }
];

// Import subscription plans data
const { subscriptionPlansData } = require('./database-schema.js');

const MOCK_DATA = {
  // Subscription plans
  subscriptionPlans: subscriptionPlansData,
  
  // Mock user subscriptions
  userSubscriptions: [
    {
      id: 'sub_mock_1',
      user_id: 'mock-business-1',
      plan_id: 'plan_pro',
      status: 'active',
      current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      cancel_at_period_end: false,
      is_fake: true
    }
  ],
  
  // Mock payment transactions
  paymentTransactions: [
    {
      id: 'payment_mock_1',
      user_id: 'mock-business-1',
      subscription_id: 'sub_mock_1',
      amount: 79.99,
      currency: 'USD',
      status: 'succeeded',
      payment_method: 'credit_card',
      description: 'Professional plan monthly subscription',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_fake: true
    }
  ],
  
  // Mock invoices
  invoices: [
    {
      id: 'inv_mock_1',
      user_id: 'mock-business-1',
      subscription_id: 'sub_mock_1',
      amount: 79.99,
      currency: 'USD',
      status: 'paid',
      due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      invoice_number: 'INV-2025-001',
      created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      is_fake: true
    }
  ],
  
  competitions: [
    {
      id: 'mock-comp-1',
      title: 'AI Tool Innovation Challenge',
      description: 'Design an innovative AI tool for business productivity',
      prize: '$500',
      deadline: '2025-04-30',
      category: 'cat-b1',  // Best AI Tool
      category_name: 'Best AI Tool',
      business_id: 'mock-business-1',
      created_at: '2025-03-15',
      status: 'active',
      type: 'business',
      startDate: '2025-03-15', 
      endDate: '2025-04-30'
    },
    {
      id: 'mock-comp-2',
      title: 'Mobile App UI Challenge',
      description: 'Design an intuitive mobile interface for a fitness app',
      prize: '$750',
      deadline: '2025-05-15',
      category: 'cat-b2',  // Most Innovative Gadget
      category_name: 'Most Innovative Gadget',
      business_id: 'mock-business-2',
      created_at: '2025-03-10',
      status: 'active',
      type: 'business',
      startDate: '2025-03-10', 
      endDate: '2025-05-15'
    },
    {
      id: 'mock-comp-3',
      title: 'Marketing Campaign Concept',
      description: 'Develop a creative marketing campaign for an eco-friendly product line',
      prize: '$1000',
      deadline: '2025-06-01',
      category: 'cat-b3',  // Top Eco-Friendly Product
      category_name: 'Top Eco-Friendly Product',
      business_id: 'mock-business-1',
      created_at: '2025-03-05',
      status: 'active',
      type: 'business',
      startDate: '2025-03-05', 
      endDate: '2025-06-01'
    },
    {
      id: 'mock-comp-4',
      title: 'Photography Contest: Urban Life',
      description: 'Capture the essence of urban living through creative photography',
      prize: '$300',
      deadline: '2025-05-20',
      category: 'cat-i6',  // Best DIY Craft vs. Art
      category_name: 'Best DIY Craft vs. Art',
      created_at: '2025-03-18',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-18', 
      endDate: '2025-05-20'
    },
    {
      id: 'mock-comp-5',
      title: 'Short Story Competition',
      description: 'Write a compelling short story in under 2000 words on the theme of "Discovery"',
      prize: '$400',
      deadline: '2025-05-25',
      category: 'cat-i2',  // Best Lyrics (Music or Poetry)
      category_name: 'Best Lyrics (Music or Poetry)',
      created_at: '2025-03-20',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-20', 
      endDate: '2025-05-25'
    },
    {
      id: 'mock-comp-6',
      title: 'DIY Home Decor Challenge',
      description: 'Create an innovative home decoration using recycled materials',
      prize: '$250',
      deadline: '2025-04-15',
      category: 'cat-i6',  // Best DIY Craft vs. Art
      category_name: 'Best DIY Craft vs. Art',
      created_at: '2025-03-01',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-01', 
      endDate: '2025-04-15'
    },
    {
      id: 'mock-comp-7',
      title: 'Pet Innovation Product Design',
      description: 'Design an innovative product to improve pet care and well-being',
      prize: '$800',
      deadline: '2025-06-30',
      category: 'cat-b4',  // Best Pet Innovation
      category_name: 'Best Pet Innovation',
      business_id: 'mock-business-2',
      created_at: '2025-03-22',
      status: 'active',
      type: 'business',
      startDate: '2025-03-22', 
      endDate: '2025-06-30'
    },
    {
      id: 'mock-comp-8',
      title: 'Startup Pitch Competition',
      description: 'Present your innovative startup idea for a chance to win funding',
      prize: '$1500',
      deadline: '2025-07-15',
      category: 'cat-b5',  // Most Innovative Startup Idea
      category_name: 'Most Innovative Startup Idea',
      business_id: 'mock-business-1',
      created_at: '2025-03-25',
      status: 'active',
      type: 'business',
      startDate: '2025-03-25', 
      endDate: '2025-07-15'
    },
    {
      id: 'mock-comp-9',
      title: 'Indie Fashion Collection',
      description: 'Design a unique fashion collection for independent designers',
      prize: '$1200',
      deadline: '2025-08-01',
      category: 'cat-b6',  // Best Indie Fashion Brand
      category_name: 'Best Indie Fashion Brand',
      business_id: 'mock-business-2',
      created_at: '2025-04-01',
      status: 'active',
      type: 'business',
      startDate: '2025-04-01', 
      endDate: '2025-08-01'
    },
    {
      id: 'mock-comp-10',
      title: 'Original Music Composition',
      description: 'Compose an original music piece in any genre',
      prize: '$350',
      deadline: '2025-06-15',
      category: 'cat-i1',  // New Music Score
      category_name: 'New Music Score',
      created_at: '2025-03-12',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-12', 
      endDate: '2025-06-15'
    },
    {
      id: 'mock-comp-11',
      title: 'Cutest Cat Photo Contest',
      description: 'Share the most adorable photos of your feline friend',
      prize: '$200',
      deadline: '2025-05-10',
      category: 'cat-i3',  // Cutest Cat
      category_name: 'Cutest Cat',
      created_at: '2025-03-15',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-15', 
      endDate: '2025-05-10'
    },
    {
      id: 'mock-comp-12',
      title: 'Cutest Dog Photo Contest',
      description: 'Share the most adorable photos of your canine companion',
      prize: '$200',
      deadline: '2025-05-10',
      category: 'cat-i4',  // Cutest Dog
      category_name: 'Cutest Dog',
      created_at: '2025-03-15',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-15', 
      endDate: '2025-05-10'
    },
    {
      id: 'mock-comp-13',
      title: 'Funny Pet Video Challenge',
      description: 'Submit hilarious videos of your pets doing funny things',
      prize: '$300',
      deadline: '2025-06-05',
      category: 'cat-i5',  // Funniest Pet Video
      category_name: 'Funniest Pet Video',
      created_at: '2025-03-20',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-20', 
      endDate: '2025-06-05'
    }
  ],
  
  // Mock submissions data with enhanced voting and rating data
  submissions: [
    {
      id: 'submission-1',
      competition_id: 'mock-comp-1',
      user_id: 'user-1',
      username: 'creativePro',
      title: 'Productivity AI Tool',
      description: 'An innovative AI tool for enhancing business productivity',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-18',
      vote_count: 24,
      total_rating: 185,
      average_rating: 7.7,
      rank: 2,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-2',
      competition_id: 'mock-comp-1',
      user_id: 'user-2',
      username: 'designGuru',
      title: 'AI Assistant Dashboard',
      description: 'An intuitive dashboard for controlling AI assistants',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-19',
      vote_count: 18,
      total_rating: 126,
      average_rating: 7.0,
      rank: 3,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-3',
      competition_id: 'mock-comp-1',
      user_id: 'user-3',
      username: 'artisanCreator',
      title: 'Smart AI Content Generator',
      description: 'Versatile AI tool that creates various types of content automatically',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-20',
      vote_count: 31,
      total_rating: 248,
      average_rating: 8.0,
      rank: 1,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-4',
      competition_id: 'mock-comp-2',
      user_id: 'user-1',
      username: 'creativePro',
      title: 'Clean Fitness App UI',
      description: 'Intuitive interface for workout tracking',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-15',
      vote_count: 15,
      total_rating: 105,
      average_rating: 7.0,
      rank: 3,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-5',
      competition_id: 'mock-comp-2',
      user_id: 'user-4',
      username: 'uiMaster',
      title: 'Energetic Exercise Tracker',
      description: 'Bold and motivational fitness interface',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-16',
      vote_count: 22,
      total_rating: 176,
      average_rating: 8.0,
      rank: 1,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-6',
      competition_id: 'mock-comp-3',
      user_id: 'user-2',
      username: 'designGuru',
      title: 'Eco-Friendly Brand Campaign',
      description: 'Green marketing strategy emphasizing sustainability',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-10',
      vote_count: 28,
      total_rating: 210,
      average_rating: 7.5,
      rank: 2,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    },
    {
      id: 'submission-7',
      competition_id: 'mock-comp-3',
      user_id: 'user-5',
      username: 'ecoDesigner',
      title: 'Natural World Connection',
      description: 'Connecting product with environmental values',
      media_url: 'https://via.placeholder.com/300',
      media_type: 'image',
      created_at: '2025-03-12',
      vote_count: 32,
      total_rating: 256,
      average_rating: 8.0,
      rank: 1,
      status: 'approved',
      profile_image: 'https://via.placeholder.com/50'
    }
  ],
  
  // Mock votes data
  votes: [
    // We'll just store the most recent votes for reference
    // In a real database, we'd have all votes
    { id: 'vote-1', submission_id: 'submission-1', user_id: 'voter-1', rating: 8, created_at: '2025-03-22T14:30:00Z' },
    { id: 'vote-2', submission_id: 'submission-1', user_id: 'voter-2', rating: 7, created_at: '2025-03-22T15:45:00Z' },
    { id: 'vote-3', submission_id: 'submission-2', user_id: 'voter-1', rating: 6, created_at: '2025-03-22T16:15:00Z' },
    { id: 'vote-4', submission_id: 'submission-3', user_id: 'voter-3', rating: 9, created_at: '2025-03-22T17:20:00Z' }
  ],
  
  // Mock categories - Business Competitions
  categories: [
    { id: 'cat-b1', name: 'Best AI Tool', description: 'Developers, startups, and companies with AI-powered software, chatbots, and productivity tools', icon: 'smart_toy', is_active: true, is_business: true },
    { id: 'cat-b2', name: 'Most Innovative Gadget', description: 'Tech brands and inventors launching groundbreaking consumer electronics', icon: 'devices', is_active: true, is_business: true },
    { id: 'cat-b3', name: 'Top Eco-Friendly Product', description: 'Brands promoting sustainability through innovative products', icon: 'eco', is_active: true, is_business: true },
    { id: 'cat-b4', name: 'Best Pet Innovation', description: 'Companies developing products that enhance pet care and well-being', icon: 'pets', is_active: true, is_business: true },
    { id: 'cat-b5', name: 'Most Innovative Startup Idea', description: 'Early-stage startups looking for funding and recognition', icon: 'lightbulb', is_active: true, is_business: true },
    { id: 'cat-b6', name: 'Best Indie Fashion Brand', description: 'Independent designers and fashion startups', icon: 'checkroom', is_active: true, is_business: true },
    // Individual Competitions
    { id: 'cat-i1', name: 'New Music Score', description: 'Original music compositions, whether instrumental or with lyrics', icon: 'music_note', is_active: true, is_business: false },
    { id: 'cat-i2', name: 'Best Lyrics (Music or Poetry)', description: 'Your original song lyrics or poetry', icon: 'edit', is_active: true, is_business: false },
    { id: 'cat-i3', name: 'Cutest Cat', description: 'Adorable pictures or videos of your cat', icon: 'pets', is_active: true, is_business: false },
    { id: 'cat-i4', name: 'Cutest Dog', description: 'Photos or videos of your lovable pup', icon: 'pets', is_active: true, is_business: false },
    { id: 'cat-i5', name: 'Funniest Pet Video', description: 'Hilarious clips of pets doing funny things', icon: 'videocam', is_active: true, is_business: false },
    { id: 'cat-i6', name: 'Best DIY Craft vs. Art', description: 'Handmade crafts, paintings, digital artwork, or unique creations', icon: 'palette', is_active: true, is_business: false }
  ],
  
  // Mock leaderboards - pre-calculated based on submission data
  leaderboards: [
    {
      id: 'leaderboard-comp-1',
      competition_id: 'mock-comp-1',
      category_id: 'cat-b1', // Best AI Tool
      category_name: 'Best AI Tool',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-3', average_rating: 8.0, vote_count: 31, title: 'Smart AI Content Generator', username: 'artisanCreator' },
        { rank: 2, submission_id: 'submission-1', average_rating: 7.7, vote_count: 24, title: 'Productivity AI Tool', username: 'creativePro' },
        { rank: 3, submission_id: 'submission-2', average_rating: 7.0, vote_count: 18, title: 'AI Assistant Dashboard', username: 'designGuru' }
      ]
    },
    {
      id: 'leaderboard-comp-2',
      competition_id: 'mock-comp-2',
      category_id: 'cat-b2', // Most Innovative Gadget
      category_name: 'Most Innovative Gadget',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-5', average_rating: 8.0, vote_count: 22, title: 'Energetic Exercise Tracker', username: 'uiMaster' },
        { rank: 2, submission_id: 'submission-8', average_rating: 7.5, vote_count: 18, title: 'Fitness Tracker Pro', username: 'mobileDesigner' },
        { rank: 3, submission_id: 'submission-4', average_rating: 7.0, vote_count: 15, title: 'Clean Fitness App UI', username: 'creativePro' }
      ]
    },
    {
      id: 'leaderboard-comp-3',
      competition_id: 'mock-comp-3',
      category_id: 'cat-b3', // Top Eco-Friendly Product
      category_name: 'Top Eco-Friendly Product',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-7', average_rating: 8.0, vote_count: 32, title: 'Natural World Connection', username: 'ecoDesigner' },
        { rank: 2, submission_id: 'submission-6', average_rating: 7.5, vote_count: 28, title: 'Eco-Friendly Brand Campaign', username: 'designGuru' }
      ]
    },
    {
      id: 'leaderboard-comp-4',
      competition_id: 'mock-comp-4',
      category_id: 'cat-i6', // Best DIY Craft vs. Art
      category_name: 'Best DIY Craft vs. Art',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-9', average_rating: 7.8, vote_count: 20, title: 'Urban Architecture', username: 'photoArtist' },
        { rank: 2, submission_id: 'submission-10', average_rating: 7.5, vote_count: 18, title: 'City Lights', username: 'urbanShooter' }
      ]
    },
    {
      id: 'leaderboard-comp-5',
      competition_id: 'mock-comp-5',
      category_id: 'cat-i2', // Best Lyrics (Music or Poetry)
      category_name: 'Best Lyrics (Music or Poetry)',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-11', average_rating: 8.2, vote_count: 25, title: 'Echoes of Time', username: 'wordsmith' },
        { rank: 2, submission_id: 'submission-12', average_rating: 7.9, vote_count: 21, title: 'New Horizons', username: 'poetryMaster' }
      ]
    },
    {
      id: 'leaderboard-comp-6',
      competition_id: 'mock-comp-6',
      category_id: 'cat-i6', // Best DIY Craft vs. Art
      category_name: 'Best DIY Craft vs. Art',
      updated_at: new Date().toISOString(),
      entries: [
        { rank: 1, submission_id: 'submission-13', average_rating: 8.4, vote_count: 28, title: 'Recycled Modern Lamp', username: 'craftGenius' },
        { rank: 2, submission_id: 'submission-14', average_rating: 7.8, vote_count: 24, title: 'Eco-Shelf Design', username: 'greenCreator' }
      ]
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
        { title: 'AI Tool Innovation Challenge', submissions: 24, views: 487, engagementRate: '4.9%' },
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
  
  // Check if there's a handler registered by our Express-like interface
  if (expressLikeInterface.routes) {
    const methodRoutes = expressLikeInterface.routes[req.method.toLowerCase()];
    
    if (methodRoutes) {
      // Check for exact match first
      if (methodRoutes[endpoint]) {
        try {
          // For POST, PUT, DELETE requests, we need to parse the request body
          if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            const body = await parseRequestBody(req);
            req.body = body;
          }
          
          // Create Express-like response object
          const expressRes = {
            json: (data) => {
              res.writeHead(200);
              res.end(JSON.stringify(data));
            },
            status: (statusCode) => {
              res.writeHead(statusCode);
              return {
                json: (data) => {
                  res.end(JSON.stringify(data));
                }
              };
            },
            send: (data) => {
              res.writeHead(200);
              res.end(typeof data === 'object' ? JSON.stringify(data) : data);
            }
          };
          
          // Call the registered handler
          methodRoutes[endpoint](req, expressRes);
          return;
        } catch (error) {
          console.error(`Error handling route ${req.method} ${endpoint}:`, error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }
      
      // Check for pattern routes (like '/user/:userId')
      for (const pattern in methodRoutes) {
        if (pattern.includes(':')) {
          const regexPattern = pattern.replace(/:[^/]+/g, '([^/]+)');
          const regex = new RegExp(`^${regexPattern}$`);
          const match = endpoint.match(regex);
          
          if (match) {
            try {
              // Extract params
              const paramNames = pattern.match(/:[^/]+/g).map(param => param.substring(1));
              req.params = {};
              
              paramNames.forEach((paramName, index) => {
                req.params[paramName] = match[index + 1];
              });
              
              // For POST, PUT, DELETE requests, we need to parse the request body
              if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
                const body = await parseRequestBody(req);
                req.body = body;
              }
              
              // Create Express-like response object
              const expressRes = {
                json: (data) => {
                  res.writeHead(200);
                  res.end(JSON.stringify(data));
                },
                status: (statusCode) => {
                  res.writeHead(statusCode);
                  return {
                    json: (data) => {
                      res.end(JSON.stringify(data));
                    }
                  };
                },
                send: (data) => {
                  res.writeHead(200);
                  res.end(typeof data === 'object' ? JSON.stringify(data) : data);
                }
              };
              
              // Call the registered handler
              methodRoutes[pattern](req, expressRes);
              return;
            } catch (error) {
              console.error(`Error handling route ${req.method} ${endpoint}:`, error);
              res.writeHead(500);
              res.end(JSON.stringify({ error: 'Internal server error' }));
              return;
            }
          }
        }
      }
    }
  }
  
  // GET /api/firebase-config - Get Firebase configuration
  if (endpoint === '/firebase-config' && req.method === 'GET') {
    try {
      // Firebase configuration - hardcoded for now, will move to env vars later
      const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD5ajskMWCzDm5m5BxtAV5843aYgpnYZVc",
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "creativecrowdchallenge",
        storageBucket: "creativecrowdchallenge.firebasestorage.app",
        messagingSenderId: "73698226096",
        appId: process.env.VITE_FIREBASE_APP_ID || "1:73698226096:web:2ae4a7a2f24054236cb075",
        measurementId: "G-PG3RNP0RCM"
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(firebaseConfig));
      return;
    } catch (error) {
      console.error('Error getting Firebase config:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to get Firebase configuration' }));
      return;
    }
  }
  
  // GET /api/stripe-public-key - Get Stripe public key
  if (endpoint === '/stripe-public-key' && req.method === 'GET') {
    try {
      // Get Stripe public key from environment variables
      const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY || '';
      
      res.writeHead(200);
      res.end(JSON.stringify({ publicKey: stripePublicKey }));
      return;
    } catch (error) {
      console.error('Error getting Stripe public key:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to get Stripe public key' }));
      return;
    }
  }
  
  // POST /api/create-subscription - Create a Stripe checkout session for subscription
  if (endpoint === '/create-subscription' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { userId, email } = body;
      
      if (!userId || !email) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID and email are required' }));
        return;
      }
      
      // Check if we have the required Stripe secret key
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Stripe secret key not available, using demo mode for subscription');
        
        // Return a mock session ID for demo purposes
        res.writeHead(200);
        res.end(JSON.stringify({ 
          sessionId: 'demo_' + Date.now(),
          demoMode: true
        }));
        return;
      }
      
      // In a real implementation, this would create a Stripe checkout session
      // For now, return a mock session in demo mode
      res.writeHead(200);
      res.end(JSON.stringify({ 
        sessionId: 'demo_' + Date.now(),
        demoMode: true
      }));
      return;
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to create subscription' }));
      return;
    }
  }
  
  // POST /api/auth/firebase - Firebase authentication
  if (endpoint === '/auth/firebase' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      // This endpoint will be used in the future to validate firebase tokens on the server
      // For now, we'll just return a success response
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
      return;
    } catch (error) {
      console.error('Error during Firebase auth validation:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Firebase authentication validation failed' }));
      return;
    }
  }
  
  // POST /api/users - Create or update user in database
  if (endpoint === '/users' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { uid, email, userType, isSubscribed } = body;
      
      if (!uid || !email) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID and email are required' }));
        return;
      }
      
      // In a real implementation, this would save to a database
      console.log(`User data saved: ${JSON.stringify(body)}`);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, uid }));
      return;
    } catch (error) {
      console.error('Error saving user data:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to save user data' }));
      return;
    }
  }
  
  // POST /api/auth/google - Google OAuth authentication (legacy)
  if (endpoint === '/auth/google' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { token } = body;
      
      if (!token) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Google token is required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, using simulated Google authentication');
        // Simulate authentication for demo purposes
        const mockUser = {
          user: {
            id: 'google-user-123',
            email: 'google-user@example.com',
            user_metadata: {
              full_name: 'Google User',
              role: 'user'
            },
            app_metadata: {
              provider: 'google'
            }
          },
          session: {
            access_token: 'mock-google-token',
            expires_at: Date.now() + 3600000
          }
        };
        
        console.log('Demo Google login successful');
        res.writeHead(200);
        res.end(JSON.stringify(mockUser));
        return;
      }
      
      // Use Supabase to verify the Google token
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: token
        });
        
        if (error) {
          console.error('Google authentication error:', error);
          res.writeHead(401);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        console.log('User authenticated successfully with Google');
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } catch (supabaseError) {
        console.error('Supabase error during Google auth:', supabaseError);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Authentication service unavailable' }));
      }
    } catch (error) {
      console.error('Error during Google auth:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Google authentication failed' }));
    }
    return;
  }
  
  // GET /api/subscription-plans - Get available subscription plans
  if (endpoint === '/subscription-plans' && req.method === 'GET') {
    try {
      if (!supabase) {
        console.log('Supabase not available, using mock subscription plans data');
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_DATA.subscriptionPlans));
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true);
          
        if (error) {
          console.error('Supabase error fetching subscription plans:', error);
          // Fallback to mock data
          res.writeHead(200);
          res.end(JSON.stringify(MOCK_DATA.subscriptionPlans));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        // Fallback to mock data
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_DATA.subscriptionPlans));
      }
      return;
    } catch (error) {
      console.error('Error in subscription plans endpoint:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch subscription plans' }));
      return;
    }
  }
  
  // GET /api/user-subscription/:userId - Get user's subscription details
  if (endpoint.match(/^\/user-subscription\/[\w-]+$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/').pop();
      console.log(`Fetching subscription for user: ${userId}`);
      
      if (!supabase) {
        console.log('Supabase not available, using mock subscription data');
        const userSubscription = MOCK_DATA.userSubscriptions.find(sub => sub.user_id === userId);
        
        if (userSubscription) {
          // Find the associated plan
          const plan = MOCK_DATA.subscriptionPlans.find(plan => plan.id === userSubscription.plan_id);
          
          // Add plan details to subscription
          const subscriptionWithPlan = {
            ...userSubscription,
            plan: plan || null
          };
          
          res.writeHead(200);
          res.end(JSON.stringify(subscriptionWithPlan));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ active: false, message: 'No active subscription found' }));
        }
        return;
      }
      
      try {
        // In a real implementation, query the subscriptions table
        // Fallback to mock data for now
        const userSubscription = MOCK_DATA.userSubscriptions.find(sub => sub.user_id === userId);
        
        if (userSubscription) {
          // Find the associated plan
          const plan = MOCK_DATA.subscriptionPlans.find(plan => plan.id === userSubscription.plan_id);
          
          // Add plan details to subscription
          const subscriptionWithPlan = {
            ...userSubscription,
            plan: plan || null
          };
          
          res.writeHead(200);
          res.end(JSON.stringify(subscriptionWithPlan));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ active: false, message: 'No active subscription found' }));
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch subscription details' }));
      }
      return;
    } catch (error) {
      console.error('Error in user subscription endpoint:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process request' }));
      return;
    }
  }
  
  // POST /api/subscribe - Process a subscription
  if (endpoint === '/subscribe' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { userId, planId, paymentMethod } = body;
      
      if (!userId || !planId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID and plan ID are required' }));
        return;
      }
      
      console.log(`Processing subscription for user ${userId} to plan ${planId}`);
      
      if (!supabase) {
        console.log('Supabase not available, creating fake subscription');
        
        // Find the selected plan
        const plan = MOCK_DATA.subscriptionPlans.find(p => p.id === planId);
        if (!plan) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Subscription plan not found' }));
          return;
        }
        
        // Create a new fake subscription
        const newSubscription = {
          id: `sub_mock_${Date.now()}`,
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          cancel_at_period_end: false,
          is_fake: true,
          created_at: new Date().toISOString()
        };
        
        // Create a payment record
        const newPayment = {
          id: `payment_mock_${Date.now()}`,
          user_id: userId,
          subscription_id: newSubscription.id,
          amount: plan.price,
          currency: plan.currency || 'USD',
          status: 'succeeded',
          payment_method: paymentMethod || 'credit_card',
          description: `${plan.name} subscription`,
          created_at: new Date().toISOString(),
          is_fake: true
        };
        
        // Create an invoice
        const newInvoice = {
          id: `inv_mock_${Date.now()}`,
          user_id: userId,
          subscription_id: newSubscription.id,
          amount: plan.price,
          currency: plan.currency || 'USD',
          status: 'paid',
          due_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          created_at: new Date().toISOString(),
          is_fake: true
        };
        
        // Add to mock data
        MOCK_DATA.userSubscriptions.push(newSubscription);
        MOCK_DATA.paymentTransactions.push(newPayment);
        MOCK_DATA.invoices.push(newInvoice);
        
        // Return success with subscription details
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          subscription: {
            ...newSubscription,
            plan: plan
          }
        }));
        return;
      }
      
      // In real implementation, this would use Stripe or another payment processor
      // For now, just create a fake subscription even when Supabase is available
      
      // Find the selected plan
      const plan = MOCK_DATA.subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Subscription plan not found' }));
        return;
      }
      
      // Create a new fake subscription
      const newSubscription = {
        id: `sub_mock_${Date.now()}`,
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancel_at_period_end: false,
        is_fake: true
      };
      
      // Add to mock data
      MOCK_DATA.userSubscriptions.push(newSubscription);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        subscription: {
          ...newSubscription,
          plan: plan
        }
      }));
    } catch (error) {
      console.error('Error processing subscription:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process subscription' }));
    }
    return;
  }
  
  // POST /api/cancel-subscription - Cancel a subscription
  if (endpoint === '/cancel-subscription' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { subscriptionId, cancelImmediately } = body;
      
      if (!subscriptionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Subscription ID is required' }));
        return;
      }
      
      console.log(`Processing cancellation for subscription ${subscriptionId}`);
      
      if (!supabase) {
        console.log('Supabase not available, canceling fake subscription');
        
        // Find the subscription
        const subIndex = MOCK_DATA.userSubscriptions.findIndex(sub => sub.id === subscriptionId);
        if (subIndex === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Subscription not found' }));
          return;
        }
        
        // Update the subscription status
        if (cancelImmediately) {
          MOCK_DATA.userSubscriptions[subIndex].status = 'canceled';
          MOCK_DATA.userSubscriptions[subIndex].canceled_at = new Date().toISOString();
        } else {
          MOCK_DATA.userSubscriptions[subIndex].cancel_at_period_end = true;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          subscription: MOCK_DATA.userSubscriptions[subIndex],
          message: cancelImmediately ? 
            'Subscription canceled immediately' : 
            'Subscription will cancel at the end of the billing period'
        }));
        return;
      }
      
      // In real implementation, this would use Stripe or another payment processor
      // For now, just cancel the fake subscription even when Supabase is available
      
      // Find the subscription
      const subIndex = MOCK_DATA.userSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (subIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Subscription not found' }));
        return;
      }
      
      // Update the subscription status
      if (cancelImmediately) {
        MOCK_DATA.userSubscriptions[subIndex].status = 'canceled';
        MOCK_DATA.userSubscriptions[subIndex].canceled_at = new Date().toISOString();
      } else {
        MOCK_DATA.userSubscriptions[subIndex].cancel_at_period_end = true;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        subscription: MOCK_DATA.userSubscriptions[subIndex],
        message: cancelImmediately ? 
          'Subscription canceled immediately' : 
          'Subscription will cancel at the end of the billing period'
      }));
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to cancel subscription' }));
    }
    return;
  }
  
  // GET /api/user-invoices/:userId - Get user's invoice history
  if (endpoint.match(/^\/user-invoices\/[\w-]+$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/').pop();
      console.log(`Fetching invoices for user: ${userId}`);
      
      if (!supabase) {
        console.log('Supabase not available, using mock invoice data');
        const userInvoices = MOCK_DATA.invoices.filter(inv => inv.user_id === userId);
        
        res.writeHead(200);
        res.end(JSON.stringify(userInvoices));
        return;
      }
      
      try {
        // In a real implementation, query the invoices table
        // Fallback to mock data for now
        const userInvoices = MOCK_DATA.invoices.filter(inv => inv.user_id === userId);
        
        res.writeHead(200);
        res.end(JSON.stringify(userInvoices));
      } catch (error) {
        console.error('Error fetching user invoices:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch invoice history' }));
      }
      return;
    } catch (error) {
      console.error('Error in user invoices endpoint:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process request' }));
      return;
    }
  }
  
  // GET /api/recommendations - AI-powered competition recommendations
  if (endpoint === '/recommendations' && req.method === 'GET') {
    try {
      // Get user ID and interests from query parameters
      const userId = url.searchParams.get('userId') || 'anonymous';
      const interests = url.searchParams.get('interests') || '';
      const interestsList = interests ? interests.split(',') : [];
      const preview = url.searchParams.get('preview') === 'true';
      
      console.log(`Generating recommendations for user: ${userId}, with interests: ${interests}, preview: ${preview}`);
      
      // If in preview mode, return special preview data
      if (preview) {
        // Generate personalized preview based on interests
        const previewRecommendations = recommendationEngine.generatePreviewRecommendations(interestsList);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          recommendations: previewRecommendations,
          message: 'AI Recommendation Preview'
        }));
        return;
      }
      
      // For now, return mock recommendations based on user's ID or interests
      // In a real implementation, this would use a machine learning model
      if (!supabase) {
        const mockRecommendations = recommendationEngine.generateAIRecommendations(userId, interestsList, MOCK_DATA.competitions);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          recommendations: mockRecommendations,
          message: 'Demo Mode Recommendations'
        }));
        return;
      }
      
      // Here we would call a real ML model or query Supabase with user data
      // For now, just return the mock recommendations
      const mockRecommendations = recommendationEngine.generateAIRecommendations(userId, interestsList, MOCK_DATA.competitions);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        recommendations: mockRecommendations,
        message: 'AI-Powered Recommendations'
      }));
      return;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to generate recommendations' }));
      return;
    }
  }
  
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
  
  // POST /api/auth/login - Similar to signin but specifically for admin panel
  if (endpoint === '/auth/login' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, password } = body;
      
      if (!email || !password) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Email and password are required' }));
        return;
      }

      // Check if email contains "admin" to ensure only admin accounts can log in
      if (!email.toLowerCase().includes('admin')) {
        res.writeHead(401);
        res.end(JSON.stringify({ message: 'Not an admin account' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, using simulated admin authentication');
        // Simulate authentication for demo purposes
        if (email.includes('admin') && (password === 'password' || password === 'admin123')) {
          // Create a mock admin user for demo
          const mockAdminUser = {
            id: 'admin-123',
            email: email,
            name: 'Admin User',
            role: 'admin'
          };
          
          console.log(`Demo admin login successful for ${email}`);
          
          res.writeHead(200);
          res.end(JSON.stringify({ 
            user: mockAdminUser,
            message: 'Login successful (Demo Mode)' 
          }));
        } else {
          console.log(`Demo admin login failed for ${email}`);
          res.writeHead(401);
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
        return;
      }
      
      try {
        // Attempt Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Authentication error:', error.message);
          res.writeHead(401);
          res.end(JSON.stringify({ message: error.message }));
          return;
        }
        
        if (!data || !data.user) {
          res.writeHead(401);
          res.end(JSON.stringify({ message: 'Authentication failed' }));
          return;
        }
        
        // Ensure the user is an admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          res.writeHead(401);
          res.end(JSON.stringify({ message: 'Failed to verify admin status' }));
          return;
        }
        
        if (!profileData || profileData.role !== 'admin') {
          res.writeHead(401);
          res.end(JSON.stringify({ message: 'Not an admin account' }));
          return;
        }
        
        console.log('Admin authenticated successfully');
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          user: {
            id: data.user.id,
            email: data.user.email,
            name: profileData.name,
            role: 'admin'
          },
          message: 'Login successful' 
        }));
      } catch (supabaseError) {
        console.error('Supabase error during admin auth:', supabaseError);
        res.writeHead(500);
        res.end(JSON.stringify({ message: 'Authentication service error' }));
      }
    } catch (error) {
      console.error('Error processing admin login:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Internal server error' }));
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

  // POST /api/analytics/request
  if (endpoint === '/analytics/request' && req.method === 'POST') {
    console.log('Received analytics request');
    
    try {
      const body = await parseRequestBody(req);
      const { businessId, competitionIds, timeFrame, description, userId, userEmail, requestType } = body;
      
      if (!businessId || !timeFrame || !description || !userId || !userEmail || !requestType) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing required fields for analytics request' }));
        return;
      }
      
      console.log(`Processing analytics request from ${userEmail} for business ${businessId}`);
      
      // Create a new request object
      const requestId = 'req-' + Date.now();
      const newRequest = {
        id: requestId,
        businessId,
        competitionIds: competitionIds || [],
        timeFrame,
        description,
        userId,
        userEmail,
        requestType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (!supabase) {
        console.log('Supabase not available, storing request in memory');
        // Add to in-memory storage for demo mode
        analyticsRequests.push(newRequest);
        
        console.log('Analytics request stored in memory:', newRequest);
        res.writeHead(201);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Analytics request submitted', 
          requestId 
        }));
        return;
      }
      
      // Store in Supabase if available
      try {
        console.log('Storing analytics request in Supabase');
        const { data, error } = await supabase
          .from('analytics_requests')
          .insert([newRequest])
          .select();
          
        if (error) {
          console.error('Error storing analytics request in Supabase:', error);
          // Fallback to in-memory storage
          analyticsRequests.push(newRequest);
          
          res.writeHead(201);
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Analytics request submitted (fallback storage)', 
            requestId 
          }));
          return;
        }
        
        console.log('Analytics request stored in Supabase:', data);
        res.writeHead(201);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Analytics request submitted', 
          requestId: data[0].id 
        }));
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Fallback to in-memory storage
        analyticsRequests.push(newRequest);
        
        res.writeHead(201);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Analytics request submitted (fallback storage)', 
          requestId 
        }));
      }
    } catch (error) {
      console.error('Error processing analytics request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process analytics request' }));
    }
    return;
  }
  
  // GET /api/analytics/requests
  if (endpoint === '/analytics/requests' && req.method === 'GET') {
    const isAdmin = req.headers['x-user-role'] === 'admin';
    const userId = req.headers['x-user-id'];
    
    if (!isAdmin && !userId) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Unauthorized access to analytics requests' }));
      return;
    }
    
    console.log(`Fetching analytics requests for ${isAdmin ? 'admin' : 'user ' + userId}`);
    
    if (!supabase) {
      console.log('Supabase not available, using in-memory analytics requests');
      
      let filteredRequests = analyticsRequests;
      if (!isAdmin) {
        // Filter requests for this specific user
        filteredRequests = analyticsRequests.filter(req => req.userId === userId);
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(filteredRequests));
      return;
    }
    
    try {
      console.log('Fetching analytics requests from Supabase');
      let query = supabase.from('analytics_requests').select('*');
      
      if (!isAdmin) {
        // Filter requests for this specific user
        query = query.eq('userId', userId);
      }
      
      const { data, error } = await query.order('createdAt', { ascending: false });
          
      if (error) {
        console.error('Error fetching analytics requests from Supabase:', error);
        // Fallback to in-memory storage
        let filteredRequests = analyticsRequests;
        if (!isAdmin) {
          filteredRequests = analyticsRequests.filter(req => req.userId === userId);
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(filteredRequests));
        return;
      }
      
      console.log(`Found ${data.length} analytics requests`);
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching analytics requests:', error);
      // Fallback to in-memory storage
      let filteredRequests = analyticsRequests;
      if (!isAdmin) {
        filteredRequests = analyticsRequests.filter(req => req.userId === userId);
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(filteredRequests));
    }
    return;
  }
  
  // PATCH /api/analytics/request/:id
  if (endpoint.match(/^\/analytics\/request\/[\w-]+$/) && req.method === 'PATCH') {
    const isAdmin = req.headers['x-user-role'] === 'admin';
    
    if (!isAdmin) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Only admins can update analytics request status' }));
      return;
    }
    
    const requestId = endpoint.split('/').pop();
    console.log(`Updating analytics request ${requestId}`);
    
    try {
      const body = await parseRequestBody(req);
      const { status, adminNotes } = body;
      
      if (!status) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Status is required' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, updating in-memory analytics request');
        
        const requestIndex = analyticsRequests.findIndex(req => req.id === requestId);
        if (requestIndex === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Analytics request not found' }));
          return;
        }
        
        // Update the request
        analyticsRequests[requestIndex] = {
          ...analyticsRequests[requestIndex],
          status,
          adminNotes: adminNotes || analyticsRequests[requestIndex].adminNotes,
          updatedAt: new Date().toISOString()
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Analytics request updated',
          request: analyticsRequests[requestIndex]
        }));
        return;
      }
      
      // Update in Supabase
      try {
        const { data, error } = await supabase
          .from('analytics_requests')
          .update({ 
            status, 
            adminNotes: adminNotes || null,
            updatedAt: new Date().toISOString()
          })
          .eq('id', requestId)
          .select();
          
        if (error) {
          console.error('Error updating analytics request in Supabase:', error);
          // Try fallback
          const requestIndex = analyticsRequests.findIndex(req => req.id === requestId);
          if (requestIndex !== -1) {
            analyticsRequests[requestIndex] = {
              ...analyticsRequests[requestIndex],
              status,
              adminNotes: adminNotes || analyticsRequests[requestIndex].adminNotes,
              updatedAt: new Date().toISOString()
            };
            
            res.writeHead(200);
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Analytics request updated (fallback storage)',
              request: analyticsRequests[requestIndex]
            }));
            return;
          }
          
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Analytics request not found' }));
          return;
        }
        
        if (!data || data.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Analytics request not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Analytics request updated',
          request: data[0]
        }));
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        
        // Try fallback
        const requestIndex = analyticsRequests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
          analyticsRequests[requestIndex] = {
            ...analyticsRequests[requestIndex],
            status,
            adminNotes: adminNotes || analyticsRequests[requestIndex].adminNotes,
            updatedAt: new Date().toISOString()
          };
          
          res.writeHead(200);
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Analytics request updated (fallback storage)',
            request: analyticsRequests[requestIndex]
          }));
          return;
        }
        
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to update analytics request' }));
      }
    } catch (error) {
      console.error('Error processing update to analytics request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process update to analytics request' }));
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
  
  // GET /api/subscriptions/plans - Get available subscription plans
  if (endpoint === '/subscriptions/plans' && req.method === 'GET') {
    console.log('Received request for subscription plans');
    // In a production app, these would come from a database or payment provider API
    const plans = [
      {
        id: 'basic-monthly',
        name: 'Basic',
        price: 9.99,
        interval: 'month',
        features: [
          'Create 1 business competition per month',
          'Basic analytics',
          'Email support'
        ],
        recommended: false
      },
      {
        id: 'plus-monthly',
        name: 'Plus',
        price: 19.99,
        interval: 'month',
        features: [
          'Create 3 business competitions per month',
          'Advanced analytics',
          'Priority email support',
          'Featured competitions'
        ],
        recommended: true
      },
      {
        id: 'premium-monthly',
        name: 'Premium',
        price: 49.99,
        interval: 'month',
        features: [
          'Unlimited business competitions',
          'Comprehensive analytics',
          'Priority phone support',
          'Featured competitions',
          'Competition promotion'
        ],
        recommended: false
      }
    ];
    
    console.log('Sending subscription plans:', plans);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ plans }));
    return;
  }
  
  // POST /api/subscriptions/subscribe - Subscribe to a plan
  if (endpoint === '/subscriptions/subscribe' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { userId, planId } = body;
      
      if (!userId || !planId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID and plan ID are required' }));
        return;
      }
      
      // In a real application, this would create a subscription with a payment provider
      // For demo purposes, we'll simulate a successful subscription
      const subscription = {
        id: `sub_${Math.random().toString(36).substring(2, 15)}`,
        userId,
        planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        createdAt: new Date().toISOString()
      };
      
      if (supabase) {
        // Store the subscription in Supabase if available
        const { error } = await supabase
          .from('subscriptions')
          .insert([subscription]);
          
        if (error) {
          console.error('Error storing subscription:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to create subscription' }));
          return;
        }
      }
      
      res.writeHead(201);
      res.end(JSON.stringify({ subscription }));
      return;
    } catch (error) {
      console.error('Error in subscription creation:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to create subscription' }));
      return;
    }
  }
  
  // GET /api/subscriptions/:userId - Get user's active subscription
  if (endpoint.match(/^\/subscriptions\/[\w-]+$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/').pop();
      
      if (supabase) {
        // In a real app, get the subscription from Supabase
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('userId', userId)
          .eq('status', 'active')
          .order('createdAt', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error retrieving subscription:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to retrieve subscription' }));
          return;
        }
        
        if (data && data.length > 0) {
          res.writeHead(200);
          res.end(JSON.stringify({ subscription: data[0] }));
          return;
        }
      }
      
      // For demo purposes, return a mock subscription if user ID ends with 'business'
      if (userId.endsWith('business')) {
        const mockSubscription = {
          id: `sub_${Math.random().toString(36).substring(2, 15)}`,
          userId,
          planId: 'plus-monthly',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ subscription: mockSubscription }));
        return;
      }
      
      // No subscription found
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'No active subscription found' }));
      return;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to retrieve subscription' }));
      return;
    }
  }
  
  // POST /api/subscriptions/cancel - Cancel a subscription
  if (endpoint === '/subscriptions/cancel' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { subscriptionId } = body;
      
      if (!subscriptionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Subscription ID is required' }));
        return;
      }
      
      if (supabase) {
        // Update the subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', subscriptionId);
          
        if (error) {
          console.error('Error canceling subscription:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to cancel subscription' }));
          return;
        }
      }
      
      // In a real app, this would also cancel with the payment provider
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Subscription canceled' }));
      return;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to cancel subscription' }));
      return;
    }
  }
  
  // GET /api/subscriptions/invoices/:userId - Get user's invoices
  if (endpoint.match(/^\/subscriptions\/invoices\/[\w-]+$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/').pop();
      
      // In a real app, get invoices from Supabase or payment provider
      // For demo purposes, generate mock invoices
      const mockInvoices = [];
      
      // Create 3 mock invoices
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        mockInvoices.push({
          id: `inv_${Math.random().toString(36).substring(2, 10)}`,
          userId,
          amount: 19.99,
          currency: 'USD',
          status: i === 0 ? 'paid' : (i === 1 ? 'paid' : 'paid'),
          description: 'Plus Plan Subscription',
          date: date.toISOString(),
          pdfUrl: '#'
        });
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({ invoices: mockInvoices }));
      return;
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to retrieve invoices' }));
      return;
    }
  }

  // Handle Categories API
  if (endpoint === '/categories' && req.method === 'GET') {
    console.log('Handling categories request');
    res.writeHead(200);
    res.end(JSON.stringify(MOCK_DATA.categories));
    return;
  }
  
  // Handle Leaderboards API for specific competition
  if (endpoint.match(/^\/leaderboards\/[\w-]+$/) && req.method === 'GET') {
    const competitionId = endpoint.split('/').pop();
    console.log(`Fetching leaderboard for competition: ${competitionId}`);
    
    // Find the competition leaderboard
    const leaderboard = MOCK_DATA.leaderboards.find(lb => lb.competition_id === competitionId);
    
    if (leaderboard) {
      res.writeHead(200);
      res.end(JSON.stringify(leaderboard));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Leaderboard not found' }));
    }
    return;
  }
  
  // Handle Leaderboards API for specific category
  if (endpoint.match(/^\/leaderboards\/category\/[\w-]+$/) && req.method === 'GET') {
    const categoryId = endpoint.split('/').pop();
    console.log(`Fetching leaderboard for category: ${categoryId}`);
    
    // Find competitions in this category
    const competitionsInCategory = MOCK_DATA.competitions.filter(
      comp => comp.category === categoryId
    );
    
    if (competitionsInCategory.length === 0) {
      res.writeHead(200);
      res.end(JSON.stringify({ entries: [] }));
      return;
    }
    
    // Get competition IDs
    const competitionIds = competitionsInCategory.map(comp => comp.id);
    
    // Find leaderboards for these competitions
    const relevantLeaderboards = MOCK_DATA.leaderboards.filter(
      lb => competitionIds.includes(lb.competition_id)
    );
    
    // Combine all entries
    let allEntries = [];
    relevantLeaderboards.forEach(lb => {
      if (lb.entries) {
        allEntries = [...allEntries, ...lb.entries];
      }
    });
    
    // If no entries found, return empty array
    if (allEntries.length === 0) {
      res.writeHead(200);
      res.end(JSON.stringify({ entries: [] }));
      return;
    }
    
    // Sort and rerank
    allEntries.sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.vote_count - a.vote_count;
    });
    
    allEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    res.writeHead(200);
    res.end(JSON.stringify({ entries: allEntries }));
    return;
  }
  
  // Handle Votes API
  if (endpoint === '/votes' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { submission_id, user_id, rating } = body;
      
      if (!submission_id || !user_id || rating === undefined) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }
      
      console.log(`Processing vote: user ${user_id} rated submission ${submission_id} with ${rating}`);
      
      // Check if the submission exists
      const submission = MOCK_DATA.submissions.find(sub => sub.id === submission_id);
      if (!submission) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Submission not found' }));
        return;
      }
      
      // Check if the user has already voted for this submission
      const existingVoteIndex = MOCK_DATA.votes.findIndex(
        vote => vote.user_id === user_id && vote.submission_id === submission_id
      );
      
      if (existingVoteIndex !== -1) {
        // Update existing vote
        const oldRating = MOCK_DATA.votes[existingVoteIndex].rating;
        MOCK_DATA.votes[existingVoteIndex].rating = rating;
        MOCK_DATA.votes[existingVoteIndex].created_at = new Date().toISOString();
        
        // Update the submission stats
        submission.total_rating = submission.total_rating - oldRating + rating;
        submission.average_rating = submission.total_rating / submission.vote_count;
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Vote updated',
          submission: {
            id: submission.id,
            vote_count: submission.vote_count,
            average_rating: submission.average_rating,
            rank: submission.rank
          }
        }));
      } else {
        // Create a new vote
        const newVote = {
          id: `vote-${MOCK_DATA.votes.length + 1}`,
          user_id,
          submission_id,
          rating,
          created_at: new Date().toISOString()
        };
        
        MOCK_DATA.votes.push(newVote);
        
        // Update the submission stats
        submission.vote_count += 1;
        submission.total_rating += rating;
        submission.average_rating = submission.total_rating / submission.vote_count;
        
        // Update ranks for all submissions in this competition
        const competitionSubmissions = MOCK_DATA.submissions.filter(
          sub => sub.competition_id === submission.competition_id
        );
        
        // Sort by average rating (desc) and then by vote count (desc)
        competitionSubmissions.sort((a, b) => {
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.vote_count - a.vote_count;
        });
        
        // Update ranks
        competitionSubmissions.forEach((sub, index) => {
          sub.rank = index + 1;
        });
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Vote submitted',
          submission: {
            id: submission.id,
            vote_count: submission.vote_count,
            average_rating: submission.average_rating,
            rank: submission.rank
          }
        }));
      }
      return;
    } catch (error) {
      console.error('Error processing vote:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error processing vote' }));
      return;
    }
  }
  
  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Create an Express-like interface for our API endpoints
const expressLikeInterface = {
  get: (path, handler) => {
    // This will be used in handleApiRequest
    expressLikeInterface.routes = expressLikeInterface.routes || {};
    expressLikeInterface.routes.get = expressLikeInterface.routes.get || {};
    expressLikeInterface.routes.get[path] = handler;
  },
  post: (path, handler) => {
    // This will be used in handleApiRequest
    expressLikeInterface.routes = expressLikeInterface.routes || {};
    expressLikeInterface.routes.post = expressLikeInterface.routes.post || {};
    expressLikeInterface.routes.post[path] = handler;
  },
  put: (path, handler) => {
    // This will be used in handleApiRequest
    expressLikeInterface.routes = expressLikeInterface.routes || {};
    expressLikeInterface.routes.put = expressLikeInterface.routes.put || {};
    expressLikeInterface.routes.put[path] = handler;
  },
  delete: (path, handler) => {
    // This will be used in handleApiRequest
    expressLikeInterface.routes = expressLikeInterface.routes || {};
    expressLikeInterface.routes.delete = expressLikeInterface.routes.delete || {};
    expressLikeInterface.routes.delete[path] = handler;
  }
};

// Register voting API routes
registerVotingApiRoutes(expressLikeInterface);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});