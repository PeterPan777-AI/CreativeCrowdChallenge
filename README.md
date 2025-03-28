# VoteNest Platform

A competition platform where users can submit creative content across various categories and rate others' submissions to determine weekly/monthly winners.

## Features

- User registration and authentication
- Multiple creative categories (Photography, Video, Music, Lyrics)
- Submission creation and management
- Rating system (0-10 scale)
- Leaderboard with top-rated submissions
- Category suggestion system for community-driven expansion

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI components
- **Backend**: Node.js, Express
- **Database**: In-memory storage (can be easily migrated to PostgreSQL)

## Deployment Instructions

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

3. Access the application through the provided URL.

## Environment Variables

The following environment variables are optional for enhanced functionality:

- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (for payment features)
- `STRIPE_SECRET_KEY`: Stripe secret key (for payment processing)

## License

MIT
