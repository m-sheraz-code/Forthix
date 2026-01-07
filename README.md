# Forthix - Trading Platform

A modern trading and market analysis web application built with React, Vite, TypeScript, Supabase, and Vercel serverless functions with real Yahoo Finance data.

## Features

- **Landing Page**: Dark hero section with real-time market data, community ideas, news, and stock movers
- **Market Dashboard**: Global indices, stocks, crypto, forex, and commodities with live data
- **Index Detail Page**: Interactive price charts with multiple timeframes, technical indicators
- **News Section**: Latest market news with filtering options
- **Community Ideas**: Trading ideas and analysis from the community
- **User Authentication**: Full auth with signup, login, sessions
- **Watchlists**: Create and manage custom watchlists with live prices
- **User Preferences**: Theme, chart settings, notification preferences
- **Serverless API**: Vercel functions for all data access - never exposes credentials to client

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Market Data**: Yahoo Finance API (via yahoo-finance2)

## Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** - Create at https://supabase.com
3. **Vercel account** (optional, for deployment)

### Setup Supabase

1. Create a new Supabase project at https://app.supabase.com
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Settings > API and copy your project URL and keys

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# For testing serverless functions locally
npx vercel dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

### Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Add environment variables in Vercel dashboard or CLI:
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

3. Deploy:
```bash
vercel --prod
```

## API Endpoints

### Market Data (Public)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/markets/summary` | GET | Get market summary with major indices, movers |
| `/api/indices/[symbol]` | GET | Get specific index data with chart |
| `/api/stocks/[symbol]` | GET | Get individual stock data |
| `/api/stocks/search?q=query` | GET | Search for stocks/symbols |
| `/api/charts/[symbol]?range=1d` | GET | Get historical chart data |
| `/api/news` | GET | Get latest market news |
| `/api/ideas` | GET | Get community trading ideas |

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/logout` | POST | Sign out user |
| `/api/auth/me` | GET | Get current user (auth required) |
| `/api/auth/refresh` | POST | Refresh access token |

### User Data (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/watchlist` | GET/POST | List or create watchlists |
| `/api/watchlist/[id]` | GET/PUT/DELETE | Manage single watchlist |
| `/api/ideas/[id]` | GET/PUT/DELETE/POST | Manage ideas, like, comment |
| `/api/preferences` | GET/PUT | Get or update user preferences |
| `/api/charts/saved` | GET/POST | Manage saved chart configs |

## Project Structure

```
├── api/                      # Vercel serverless functions
│   ├── lib/                  # Shared utilities
│   │   ├── supabase.ts       # Supabase client setup
│   │   ├── yahoo-finance.ts  # Yahoo Finance wrapper
│   │   ├── cache.ts          # In-memory cache
│   │   └── middleware.ts     # Auth & validation
│   ├── auth/                 # Auth endpoints
│   ├── markets/              # Market data endpoints
│   ├── stocks/               # Stock endpoints
│   ├── charts/               # Chart data endpoints
│   ├── watchlist/            # Watchlist endpoints
│   ├── preferences/          # Preferences endpoints
│   └── ideas.ts              # Ideas endpoint
├── src/
│   ├── components/           # Reusable components
│   ├── context/              # React contexts (Auth)
│   ├── lib/                  # Client utilities (API)
│   ├── pages/                # Page components
│   ├── router.tsx            # Route configuration
│   └── main.tsx              # App entry point
├── supabase/
│   └── schema.sql            # Database schema
├── .env.example              # Environment template
├── vercel.json               # Vercel configuration
└── package.json
```

## Database Schema

The Supabase database includes:

- **profiles** - User profiles with username, avatar, bio
- **watchlists** - User watchlists with symbol arrays
- **ideas** - Trading ideas with likes count
- **idea_likes** - Like tracking (one per user per idea)
- **idea_comments** - Comments on ideas
- **saved_charts** - Saved chart configurations
- **user_preferences** - Theme, chart type, notifications

All tables have Row Level Security (RLS) policies to ensure users can only access their own data.

## Security

- All API keys are server-side only (never exposed to client)
- Frontend fetches all data through `/api/*` endpoints
- Supabase RLS ensures data isolation per user
- JWT token validation on all authenticated endpoints
- Input validation on all API endpoints
- CORS headers properly configured

## Caching

API responses are cached to reduce Yahoo Finance API calls:
- Real-time data: 60 seconds
- Historical data: 5 minutes
- Search results: 10 minutes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
