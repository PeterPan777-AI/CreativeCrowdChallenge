/**
 * Database Schema for CreativeCrowdChallenge
 * This file contains the schema design for the subscription and payment system
 */

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