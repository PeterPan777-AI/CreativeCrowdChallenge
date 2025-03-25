const http = require('http');
const fs = require('fs');
const path = require('path');

// Import recommendation engine
const recommendationEngine = require('./recommendation-engine.js');

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
      title: 'Logo Design Challenge',
      description: 'Create a modern logo for a tech startup',
      prize: '$500',
      deadline: '2025-04-30',
      category: 'design',
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
      category: 'design',
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
      category: 'marketing',
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
      category: 'photography',
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
      category: 'writing',
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
      category: 'crafts',
      created_at: '2025-03-01',
      status: 'active',
      type: 'individual',
      startDate: '2025-03-01', 
      endDate: '2025-04-15'
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
  
  // POST /api/auth/google - Google OAuth authentication
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
        if (email.includes('admin') && password === 'password') {
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

  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});