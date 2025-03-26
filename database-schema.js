/**
 * Database Schema for CreativeCrowdChallenge (VoteNest)
 * This file contains the schema design for the subscription, payment, and voting/leaderboard system
 */

// Users Table
const usersSchema = {
  id: 'uuid, primary key',
  username: 'string, not null, unique',
  email: 'string, not null, unique',
  password_hash: 'string, not null',
  full_name: 'string',
  profile_image_url: 'string',
  bio: 'text',
  is_verified: 'boolean, default false',
  is_premium: 'boolean, default false',
  is_business: 'boolean, default false',
  is_admin: 'boolean, default false',
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  last_login: 'timestamp with time zone'
};

// Competition Categories
const categoriesSchema = {
  id: 'uuid, primary key',
  name: 'string, not null, unique',
  description: 'text',
  icon: 'string', // Icon identifier or URL
  is_active: 'boolean, default true',
  created_at: 'timestamp with time zone, default now()',
  created_by: 'uuid, foreign key to users',
  priority_order: 'integer, default 0', // For ordering categories in the UI
  submission_count: 'integer, default 0' // Counter of submissions in this category
};

// Competitions
const competitionsSchema = {
  id: 'uuid, primary key',
  title: 'string, not null',
  description: 'text',
  category_id: 'uuid, foreign key to categories, not null',
  start_date: 'timestamp with time zone, not null',
  end_date: 'timestamp with time zone, not null',
  created_by: 'uuid, foreign key to users, not null',
  is_active: 'boolean, default true',
  is_featured: 'boolean, default false',
  rules: 'text',
  prize_description: 'text',
  submission_limit: 'integer, default 1', // Number of submissions allowed per user
  voting_enabled: 'boolean, default true',
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  type: 'string, not null', // 'individual' or 'business'
  view_count: 'integer, default 0',
  submission_count: 'integer, default 0',
  vote_count: 'integer, default 0'
};

// Submissions
const submissionsSchema = {
  id: 'uuid, primary key',
  competition_id: 'uuid, foreign key to competitions, not null',
  user_id: 'uuid, foreign key to users, not null',
  title: 'string, not null',
  description: 'text',
  media_url: 'string', // URL to submitted media (image, video, etc.)
  media_type: 'string', // Type of media (image, video, document, etc.)
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  status: 'string, default pending', // pending, approved, rejected
  is_disqualified: 'boolean, default false',
  disqualification_reason: 'text',
  view_count: 'integer, default 0',
  vote_count: 'integer, default 0', // Total number of votes received
  total_rating: 'decimal, default 0', // Sum of all ratings received
  average_rating: 'decimal, default 0', // Average rating (total_rating / vote_count)
  rank: 'integer', // Current rank in the competition (updated periodically)
  featured_position: 'integer' // Position in featured list, if featured
};

// Votes
const votesSchema = {
  id: 'uuid, primary key',
  submission_id: 'uuid, foreign key to submissions, not null',
  user_id: 'uuid, foreign key to users, not null',
  rating: 'integer, not null', // Rating from 0-10
  comment: 'text',
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  weight: 'decimal, default 1.0', // Weight factor for premium/verified users
  ip_address: 'string', // For abuse prevention
  user_agent: 'string', // For analytics
  is_verified: 'boolean, default false' // Whether this vote has been verified (optional)
};

// Leaderboards (updated periodically)
const leaderboardsSchema = {
  id: 'uuid, primary key',
  competition_id: 'uuid, foreign key to competitions, not null',
  category_id: 'uuid, foreign key to categories, not null',
  updated_at: 'timestamp with time zone, default now()',
  update_frequency: 'string, default real-time', // real-time, hourly, daily
  entries: 'json[]', // Array of top submissions with their stats
  last_recalculation: 'timestamp with time zone, default now()'
};

// User Badges/Achievements
const userAchievementsSchema = {
  id: 'uuid, primary key',
  user_id: 'uuid, foreign key to users, not null',
  achievement_type: 'string, not null', // e.g., 'first_place', 'top_voter', etc.
  competition_id: 'uuid, foreign key to competitions',
  category_id: 'uuid, foreign key to categories',
  achieved_at: 'timestamp with time zone, default now()',
  badge_image_url: 'string',
  description: 'text'
};

// Notification Settings
const notificationSettingsSchema = {
  id: 'uuid, primary key',
  user_id: 'uuid, foreign key to users, not null',
  leaderboard_updates: 'boolean, default true',
  new_votes: 'boolean, default true',
  rank_changes: 'boolean, default true',
  new_competitions: 'boolean, default true',
  email_notifications: 'boolean, default true',
  push_notifications: 'boolean, default false'
};

// Subscription Plans
const subscriptionPlansSchema = {
  id: 'uuid, primary key',
  name: 'string, not null', // e.g., "Basic", "Pro", "Enterprise"
  description: 'string',
  price: 'decimal, not null', // Monthly price
  annual_price: 'decimal', // Annual price (discounted)
  currency: 'string, default USD',
  features: 'json', // Array of features included in this plan
  max_competitions: 'integer', // Max number of active competitions allowed
  analytics_access: 'boolean, default false', // Whether analytics access is included
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  is_active: 'boolean, default true', // Whether this plan is currently available
  trial_days: 'integer, default 0' // Number of trial days for this plan
};

// User Subscriptions
const userSubscriptionsSchema = {
  id: 'uuid, primary key',
  user_id: 'uuid, foreign key to users, not null',
  plan_id: 'uuid, foreign key to subscription_plans, not null',
  status: 'string, not null', // active, canceled, expired, trial, past_due
  current_period_start: 'timestamp with time zone, not null',
  current_period_end: 'timestamp with time zone, not null',
  cancel_at_period_end: 'boolean, default false',
  canceled_at: 'timestamp with time zone',
  trial_start: 'timestamp with time zone',
  trial_end: 'timestamp with time zone',
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  payment_method_id: 'string', // Reference to payment method (for future use)
  is_fake: 'boolean, default false' // Flag for fake subscriptions used in testing
};

// Payment Transactions
const paymentTransactionsSchema = {
  id: 'uuid, primary key',
  user_id: 'uuid, foreign key to users, not null',
  subscription_id: 'uuid, foreign key to user_subscriptions',
  amount: 'decimal, not null',
  currency: 'string, default USD, not null',
  status: 'string, not null', // succeeded, pending, failed
  payment_method: 'string', // credit_card, paypal, etc.
  payment_intent_id: 'string', // External payment processor reference (for future use)
  invoice_id: 'string',
  description: 'string',
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  is_fake: 'boolean, default false' // Flag for fake payments used in testing
};

// Invoices
const invoicesSchema = {
  id: 'uuid, primary key',
  user_id: 'uuid, foreign key to users, not null',
  subscription_id: 'uuid, foreign key to user_subscriptions',
  amount: 'decimal, not null',
  currency: 'string, default USD, not null',
  status: 'string, not null', // paid, unpaid, void
  due_date: 'timestamp with time zone',
  paid_at: 'timestamp with time zone',
  invoice_number: 'string',
  invoice_pdf_url: 'string', // URL to PDF invoice
  created_at: 'timestamp with time zone, default now()',
  updated_at: 'timestamp with time zone, default now()',
  is_fake: 'boolean, default false' // Flag for fake invoices used in testing
};

// Extended User Profile Fields for Billing
const userProfileBillingFields = {
  // These fields would be added to the existing user profiles table
  billing_address: 'json', // Address object
  business_name: 'string',
  tax_id: 'string',
  payment_methods: 'json[]', // Array of payment methods
  subscription_id: 'uuid, foreign key to user_subscriptions',
  has_active_subscription: 'boolean, default false',
  subscription_status: 'string', // active, trial, canceled, expired
  is_business_account: 'boolean, default false'
};

// Sample subscription plans data (for initial seeding)
const subscriptionPlansData = [
  {
    id: 'plan_basic',
    name: 'Basic Business',
    description: 'Essential features for small businesses',
    price: 29.99,
    annual_price: 299.99,
    currency: 'USD',
    features: [
      'Create up to 3 competitions',
      'Basic analytics',
      'Standard support'
    ],
    max_competitions: 3,
    analytics_access: true,
    trial_days: 14,
    is_active: true
  },
  {
    id: 'plan_pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 79.99,
    annual_price: 799.99,
    currency: 'USD',
    features: [
      'Create up to 10 competitions',
      'Advanced analytics',
      'Priority support',
      'Featured competitions',
      'Custom branding'
    ],
    max_competitions: 10,
    analytics_access: true,
    trial_days: 7,
    is_active: true
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Comprehensive solution for large organizations',
    price: 199.99,
    annual_price: 1999.99,
    currency: 'USD',
    features: [
      'Unlimited competitions',
      'Premium analytics',
      'Dedicated support',
      'Featured competitions',
      'Custom branding',
      'API access',
      'White-label solution'
    ],
    max_competitions: null, // Unlimited
    analytics_access: true,
    trial_days: 7,
    is_active: true
  }
];