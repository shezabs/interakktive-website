# Interakktive Website

A modern, AI-powered trading indicators website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Landing Page**: Stunning hero section with gradient effects and feature showcase
- **Free Indicators**: 8 professional-grade indicators with detailed pages
- **ATLAS PRO**: Invite-only premium indicator suite showcase
- **Authentication**: Sign up/Sign in with Supabase Auth
- **User Dashboard**: Manage account and request ATLAS PRO access
- **Admin Panel**: (To be implemented) Manage access requests
- **Responsive Design**: Mobile-first, fully responsive
- **Modern UI**: Glass-morphism effects, gradients, smooth animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Project Structure

```
interakktive-website/
├── app/
│   ├── components/         # Reusable components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── lib/               # Utilities and data
│   │   ├── indicators-data.ts
│   │   └── supabase.ts
│   ├── types/             # TypeScript types
│   │   └── indicator.ts
│   ├── about/             # About page
│   ├── atlas-pro/         # ATLAS PRO showcase
│   ├── dashboard/         # User dashboard
│   ├── indicators/        # Free indicators
│   │   ├── [id]/         # Individual indicator pages
│   │   └── page.tsx      # Indicators listing
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── public/               # Static assets
├── .env.local.example    # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier works)
- Vercel account (for deployment)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd interakktive-website
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Set up Supabase database**

See [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for detailed instructions.

Run the SQL schema in your Supabase SQL editor to create the necessary tables.

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for emails, redirects) | Yes |
| `RESEND_API_KEY` | Resend API key for transactional emails | Optional |

## Key Pages

### Homepage (/)
- Hero section with gradient effects
- Feature highlights (AI-powered, Regime Detection, etc.)
- Free indicators showcase (6 featured)
- ATLAS PRO CTA section

### Free Indicators (/indicators)
- Grid layout showing all 8 free indicators
- Stats (favorites, uses, views)
- Feature previews
- Direct links to TradingView

### Individual Indicator (/indicators/[id])
- Full indicator description
- Complete feature list
- Use cases
- Technical details
- TradingView integration button
- Related indicators

### ATLAS PRO (/atlas-pro)
- Premium suite showcase
- CIPHER PRO details
- Feature breakdown
- Access request flow
- Coming soon badge

### Dashboard (/dashboard)
- Account overview
- ATLAS PRO access request form
- Request status tracking (pending/approved/rejected)
- Quick links to indicators

### Authentication
- Sign Up (/signup) - Email verification flow
- Sign In (/signin) - Password authentication

## Data Structure

### Indicators
All indicator data is stored in [app/lib/indicators-data.ts](./app/lib/indicators-data.ts):

- **8 Free Indicators**: Publicly available, no auth required
- **1 Pro Indicator**: ATLAS - CIPHER PRO (invite-only, unpublished)

Each indicator includes:
- Title, description, features, use cases
- TradingView URL and stats
- Publication dates
- Category (free/pro)

## Customization

### Colors
Edit [tailwind.config.ts](./tailwind.config.ts) to change the color scheme:

```typescript
colors: {
  primary: { ... }, // Blue gradient
  accent: { ... },  // Purple gradient
}
```

### Content
- **Indicators**: Edit `app/lib/indicators-data.ts`
- **Homepage**: Edit `app/page.tsx`
- **Footer links**: Edit `app/components/Footer.tsx`
- **Navigation**: Edit `app/components/Navigation.tsx`

### Community Links
Update social links in `app/components/Footer.tsx`:

```typescript
// Add your Discord invite
<a href="YOUR_DISCORD_INVITE">...</a>

// Add your Twitter/X
<a href="YOUR_TWITTER_URL">...</a>

// Add your YouTube
<a href="YOUR_YOUTUBE_URL">...</a>
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

Vercel will automatically detect Next.js and configure build settings.

### Manual Deployment

```bash
npm run build
npm run start
```

## Next Steps

### Required Before Launch

1. **Set up Supabase**
   - Create project
   - Run database schema
   - Configure authentication
   - Set up email templates

2. **Update Environment Variables**
   - Add production Supabase credentials
   - Set production site URL

3. **Add Community Links**
   - Discord invite URL
   - Twitter/X profile
   - YouTube channel

4. **Test Authentication Flow**
   - Sign up → Email verification → Sign in
   - Pro access request → Admin review

5. **Domain Setup**
   - Point interakktive.com to Vercel
   - Configure DNS
   - Set up SSL

### Future Enhancements

- [ ] Admin panel for managing access requests
- [ ] Email notifications (Resend integration)
- [ ] User analytics tracking
- [ ] Blog/Education section
- [ ] Video tutorials
- [ ] Indicator comparison tool
- [ ] User testimonials
- [ ] Performance tracking dashboard

## Support

For issues or questions:
- GitHub Issues: (Add your repo URL)
- Email: (Add support email)
- Discord: (Add Discord invite)

## License

© 2026 Interakktive Ltd. All Rights Reserved.

---

Built with Next.js, TypeScript, Tailwind CSS, and Supabase.
