# Forthix: Professional Trading & Market Intelligence Platform

> **Insight first. Then action.**  
> A production-grade, full-stack trading platform delivering real-time market data, advanced charting, and community-driven intelligence—all secured with enterprise-grade authentication and serverless architecture.

---

## Executive Overview 📈

In today's hyper-volatile markets, traders suffer from **data fragmentation**, **delayed insights**, and **fragile toolchains**. Forthix eliminates these pain points by unifying **real-time Yahoo Finance data**, **social sentiment**, and **personalized analytics** into a single, secure, and infinitely scalable platform.

Built on a **zero-trust, serverless architecture**, Forthix ensures:
- **Zero credential exposure**: All API keys remain server-side.
- **Millisecond data freshness**: Intelligent caching with sub-minute TTLs.
- **Audit-ready security**: Supabase RLS + JWT validation on every endpoint.
- **Global scalability**: Vercel Edge Network with automatic regional deployment.

This isn't just another dashboard—it's a **professional-grade market intelligence terminal** that grows with your portfolio, your team, and your strategies.

---

## Key Features 🔥

### Real-Time Market Data Engine
- **Live indices, stocks, crypto, forex, and commodities** with <2-second refresh
- **Multi-timeframe charts** (1m to 1Y) with 20+ technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- **Global market movers** (gainers, losers, most active) across all asset classes
- **Economic calendar integration** for event-driven trading

### Advanced Charting & Analysis
- **Interactive Recharts** with zoom, pan, and crosshair
- **Custom indicator overlays** and drawing tools
- **Save & share chart configurations** as reusable templates
- **Multi-symbol comparison** with normalized price scaling

### Community Intelligence Hub
- **Trading ideas** with markdown support, code blocks for strategies, and image uploads
- **Real-time likes/comments** with threaded discussions
- **Creator reputation system** and verified analyst badges
- **Idea performance tracking** (post-market outcome verification)

### Personalization & Security
- **Dark/Light/System theme** with persistent preferences
- **Custom watchlists** with live price tracking and alerts
- **Per-device session management** with JWT rotation
- **Two-factor authentication** (2FA) ready via Supabase Auth

### Production-Ready Infrastructure
- **Serverless API** with built-in caching (Redis-ready)
- **Rate limiting** and DDoS protection at Edge
- **Automated CI/CD** via Vercel Git Integration
- **Structured logging** and error tracking (Sentry-ready)

---

## Target Users & Value Proposition 👥

| User Persona | Primary Needs | Forthix Solution | ROI Driver |
|--------------|---------------|------------------|------------|
| **Retail Traders** | Affordable real-time data, educational content | Free tier with delayed data + community ideas | Conversion to premium subscriptions |
| **Day Traders** | Sub-second data, hotkeys, multiple monitors | WebSocket-ready architecture, keyboard shortcuts | Reduced slippage, faster execution |
| **Portfolio Managers** | Multi-asset tracking, historical analysis, reporting | Unified dashboard across equities/crypto/forex | Time savings, better risk-adjusted returns |
| **Financial Educators** | Classroom tools, student tracking, white-labeling | Embeddable widgets, team accounts | New revenue streams via B2B licensing |
| **FinTech Developers** | Reliable APIs, clean documentation, webhooks | Open API spec (Swagger), OAuth2 integration | Faster integration, reduced maintenance |

---

## Technical Architecture 🏗️

### High-Level System Diagram
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Vercel      │────▶│  Yahoo      │
│  (React)    │     │  Serverless  │     │  Finance    │
│             │◀────│  Functions   │◀────│  API        │
└─────────────┘     └──────────────┘     └─────────────┘
        │                     │
        │                     ▼
        │             ┌──────────────┐
        └────────────▶│   Supabase   │
                      │  (PostgreSQL)│
                      └──────────────┘
```

### Frontend Stack
- **React 18** with Concurrent Mode for smooth interactions
- **Vite 7** for lightning-fast HMR and optimized builds
- **TypeScript 5.5** with strict mode (`strict: true`) for type safety
- **Tailwind CSS 3.4** with custom component layer for design system
- **Recharts 3.6** for composable, responsive SVG charts
- **React Router DOM 7.11** for type-safe route definitions

### Backend Stack
- **Vercel Serverless Functions** (Node.js 20) with `@vercel/node`
- **Supabase Client & Auth** (`@supabase/supabase-js@2.57+`)
- **In-memory caching** with TTLs (extensible to Redis)
- **Middleware pipeline** for auth, validation, rate limiting

### Data Flow Architecture
```typescript
// Example request lifecycle:
1. Client → GET /api/charts/SPY?range=1d
2. Vercel Edge → Middleware: JWT validation, rate limit check
3. Serverless Function → Check in-memory cache (key: `chart:SPY:1d`)
   ├─ Cache hit → Return cached data (60s TTL)
   └─ Cache miss → 
        ├─ Call Yahoo Finance via wrapper (with error retry)
        ├─ Transform to OHLC format
        ├─ Store in cache
        └─ Return to client
```

### Database Schema (Supabase PostgreSQL)
```sql
-- Core tables with Row Level Security (RLS):
profiles(id, username, avatar_url, bio, created_at)
watchlists(id, user_id, name, symbols JSONB, is_public)
ideas(id, user_id, title, content, symbol, sentiment, likes_count)
idea_likes(id, user_id, idea_id) -- Composite unique constraint
idea_comments(id, user_id, idea_id, content)
saved_charts(id, user_id, config JSONB, name)
user_preferences(id, user_id, theme, chart_type, notifications JSONB)
```

All tables have **automatic RLS policies**:
```sql
-- Example: Users can only access their own watchlists
CREATE POLICY "Users can manage own watchlists"
ON watchlists FOR ALL
USING (auth.uid() = user_id);
```

### Security Model
- **JWT Validation**: Every authenticated endpoint verifies Supabase JWT via `middleware.ts`
- **Input Sanitization**: Zod schemas for request validation (inferred from TypeScript types)
- **CORS Headers**: Strict whitelist via Vercel config
- **SQL Injection Prevention**: Supabase parameterized queries only
- **Secret Management**: Environment variables via Vercel Dashboard (never in repo)

---

## Installation & Usage Guide 🚀

### Prerequisites
1. **Node.js 18+** (recommend 20.x LTS)
2. **Supabase account** → [Create free project](https://app.supabase.com)
3. **Vercel account** → [Sign up](https://vercel.com) (for deployment)
4. **Git** for version control

### Step 1: Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/forthix.git
cd forthix

# 2. Install dependencies (includes both frontend & API)
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials (see below)

# 4. Start frontend dev server (http://localhost:5173)
npm run dev

# 5. In another terminal, start Vercel dev for API (http://localhost:3000)
npx vercel dev
```

### Step 2: Supabase Configuration

1. **Create project** in Supabase dashboard (use "Free" tier)
2. **Run schema migrations**:
   - Go to SQL Editor
   - Paste contents of `supabase/schema.sql`
   - Click "Run" (creates tables + RLS policies)
3. **Enable Auth Providers** (Settings → Auth → Providers):
   - ✅ Email (with magic links or password)
   - ✅ GitHub/Google (optional)
4. **Get credentials** (Settings → API):
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJ...` (public anon key)
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJ...` (service role, keep secret)

### Step 3: Environment Variables (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Rate limiting (in-memory by default)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Yahoo Finance API keys (if you have partner access)
# Not needed for free tier (uses public endpoints)
YAHOO_FINANCE_API_KEY=your_key_here
```

### Step 4: Production Build & Preview

```bash
# Type check first
npm run typecheck

# Build for production
npm run build

# Preview locally
npm run preview
# → http://localhost:4173
```

### Step 5: Deployment to Vercel

```bash
# 1. Install Vercel CLI globally (if not installed)
npm install -g vercel

# 2. Login (opens browser)
vercel login

# 3. Link project (creates .vercel/project.json)
vercel link

# 4. Set environment variables in Vercel (MUST DO)
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 5. Deploy to production
vercel --prod
```

**Alternative: GitHub Integration** (Recommended)
1. Push to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/new)
3. Add env vars in "Environment Variables" section
4. Automatic deployments on `main` branch

---

## API Reference 📚

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register with email/password | ❌ |
| `POST` | `/api/auth/login` | Login (returns JWT + refresh token) | ❌ |
| `POST` | `/api/auth/logout` | Invalidate session | ✅ |
| `GET`  | `/api/auth/me` | Get current user profile | ✅ |
| `POST` | `/api/auth/refresh` | Refresh access token | ✅ |

**Response Example** (`/api/auth/me`):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "trader_joe",
  "avatar_url": "https://...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Market Data Endpoints (Public)

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| `GET` | `/api/markets/summary` | — | Major indices, top movers, market status |
| `GET` | `/api/indices/[symbol]` | `?range=1d,5d,1mo,3mo,6mo,1y,5y` | Index data + chart |
| `GET` | `/api/stocks/[symbol]` | — | Real-time quote, company info |
| `GET` | `/api/stocks/search` | `q=query&limit=10` | Symbol/company search |
| `GET` | `/api/charts/[symbol]` | `?range=1d&interval=1m,2m,5m,15m,1h,1d` | OHLC data for charting |
| `GET` | `/api/news` | `?limit=20&category=business,technology` | Latest market news |
| `GET` | `/api/ideas` | `?page=1&limit=10&sort=hot` | Community trading ideas |

**Chart Data Response** (`/api/charts/SPY?range=1d`):
```json
{
  "symbol": "SPY",
  "currency": "USD",
  "regularMarketPrice": 512.34,
  "chart": {
    "timestamps": [1704067200, 1704067260, ...],
    "indicators": {
      "quote": [
        {
          "close": [512.1, 512.3, ...],
          "open": [511.8, 512.0, ...],
          "high": [512.5, 512.7, ...],
          "low": [511.5, 511.9, ...],
          "volume": [15000, 18000, ...]
        }
      ]
    }
  }
}
```

### User Data Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET,POST` | `/api/watchlist` | List/create watchlists |
| `GET,PUT,DELETE` | `/api/watchlist/[id]` | Manage single watchlist |
| `GET,POST` | `/api/ideas` | List/create trading ideas |
| `GET,PUT,DELETE` | `/api/ideas/[id]` | Manage idea + like/comment |
| `GET,PUT` | `/api/preferences` | User settings (theme, alerts) |
| `GET,POST` | `/api/charts/saved` | Save/load chart configs |

---

## Usage Examples 💡

### 1. Fetch Real-Time Stock Quote
```typescript
// src/lib/api.ts
import { fetcher } from './fetcher';

export async function getStockQuote(symbol: string) {
  const response = await fetcher(`/api/stocks/${symbol}`);
  return response.json(); // { symbol, price, change, changePercent, ... }
}

// Usage in component:
const { data: quote, isLoading } = useQuery({
  queryKey: ['stock', 'AAPL'],
  queryFn: () => getStockQuote('AAPL'),
  refetchInterval: 10000 // Refresh every 10s
});
```

### 2. Interactive Chart with Multiple Indicators
```tsx
// src/components/Chart/StockChart.tsx
import { StockChart } from './StockChart';

export function AAPLChart() {
  return (
    <StockChart
      symbol="AAPL"
      range="3mo"
      indicators={['SMA20', 'SMA50', 'RSI', 'Volume']}
      height={500}
    />
  );
}

// Custom hook for chart data:
const { chartData, indicators } = useChartData('AAPL', '3mo');
```

### 3. Create Watchlist with Live Updates
```typescript
// src/lib/watchlist.ts
export async function createWatchlist(name: string, symbols: string[]) {
  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, symbols })
  });
  return response.json();
}

// Real-time updates via polling or WebSocket (future):
useEffect(() => {
  const interval = setInterval(() => {
    refetchWatchlist();
  }, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, []);
```

### 4. Authenticate with Supabase
```typescript
// src/context/AuthContext.tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Login with magic link (passwordless)
await supabase.auth.signInWithOtp({ email: 'user@example.com' });

// Access session in React:
const { data: { session } } = await supabase.auth.getSession();
```

### 5. Deploy to Vercel with GitHub Actions (CI/CD)
```yaml
# .github/workflows/vercel-deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Dependencies
        run: npm ci
      - name: Type Check
        run: npm run typecheck
      - name: Deploy
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

---

## Future Potential & Roadmap 🛣️

### Q2 2025: Institutional Features
- **FIX Protocol gateway** for broker connectivity
- **White-label dashboard** for financial advisors
- **API rate tiers** (free/developer/pro)
- **WebSocket streaming** for sub-second tick data

### Q3 2025: AI/ML Integration
- **AI-powered idea validation** (historical backtesting auto-generation)
- **Sentiment analysis** on news & social media
- **Personalized watchlist recommendations** via collaborative filtering
- **Anomaly detection** alerts for unusual volatility

### Q4 2025: Ecosystem Expansion
- **Mobile apps** (React Native) with push notifications
- **Browser extension** for quick stock lookups
- **Plugin marketplace** for custom indicators
- **Team collaboration** (shared watchlists, idea boards)

### Long-Term Vision (2026+)
- **Market prediction tournaments** with prize pools
- **DeFi integration** (on-chain data, wallet tracking)
- **Blockchain-verified idea performance** (NFT certificates)
- **Enterprise SaaS licensing** for brokerage firms

**Monetization Strategy**:
- **Freemium**: Free delayed data → $29/mo real-time + advanced charting
- **Enterprise**: Custom data feeds, SSO, SLAs → $500+/mo
- **Revenue sharing**: 10% of tips on verified profitable ideas
- **Data partnerships**: Licensed aggregated sentiment data

---

## Contributing 🤝

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork & clone** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Make changes** with TypeScript strict mode
5. **Lint & typecheck**: `npm run lint && npm run typecheck`
6. **Test locally**: `npm run dev && npx vercel dev`
7. **Commit with conventional commits**: `git commit -m "feat: add RSI indicator"`
8. **Push & open PR** with detailed description

### Code Standards
- **TypeScript**: No `any` types; use proper interfaces
- **Tailwind**: Utility-first; extract components only when repeated
- **API**: All endpoints must have Zod validation (see `api/lib/validation.ts`)
- **Accessibility**: ARIA labels, keyboard navigation, contrast ratios

### Reporting Issues
Use GitHub Issues with template:
- **Bug**:Steps to reproduce, expected vs actual, screenshots, browser/OS
- **Feature**: Use case, proposed API/UI, alternatives considered

---

## License 📄

MIT License. See [LICENSE](LICENSE) file for details.

**Forthix** is open-source because we believe in transparent, auditable trading tools. You are free to:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use in private projects
- ❌ Hold liable (use at your own risk)
- ❌ Sublicense under different terms

---

## Support & Community

- **Documentation**: [docs.forthix.com](https://docs.forthix.com) (coming soon)
- **Discord**: [Join our community](https://discord.gg/forthix)
- **Twitter**: [@ForthixHQ](https://twitter.com/forthixhq)
- **Email**: support@forthix.com for enterprise inquiries

---

<div align="center">
  <sub>Built with ❤️ by the Forthix Team | <strong>Insight first. Then action.</strong></sub>
</div>