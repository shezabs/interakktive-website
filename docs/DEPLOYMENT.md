# Deployment Guide

This guide covers deploying the Interakktive website to Vercel (recommended) and other platforms.

## Prerequisites

- GitHub account with repository set up
- Vercel account (free tier works)
- Supabase project configured (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
- Domain name (optional, Vercel provides free subdomain)

## Deployment to Vercel (Recommended)

### Step 1: Push Code to GitHub

1. Initialize git repository (if not already):

```bash
cd interakktive-website
git init
git add .
git commit -m "Initial commit"
```

2. Create repository on GitHub

3. Push code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/interakktive-website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

5. Add Environment Variables:

Click "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? interakktive-website
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `interakktive.com`)
4. Follow DNS configuration instructions:

For **interakktive.com**:
```
Type: A
Name: @
Value: 76.76.21.21
```

For **www.interakktive.com**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Wait for DNS propagation (can take up to 48 hours)

### Step 4: Update Supabase Settings

1. Go to Supabase dashboard → **Authentication** → **Settings**
2. Update these fields:
   - **Site URL**: `https://interakktive.com` (your production domain)
   - **Redirect URLs**: Add `https://interakktive.com/auth/callback`

3. Update SMTP email sender (optional but recommended):
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure production email provider

### Step 5: Test Production Deployment

1. Visit your deployed site
2. Test critical flows:
   - [ ] Homepage loads correctly
   - [ ] Free indicators page works
   - [ ] Individual indicator pages load
   - [ ] ATLAS PRO page displays
   - [ ] Sign up flow (email verification)
   - [ ] Sign in flow
   - [ ] Dashboard loads
   - [ ] Pro access request submission
   - [ ] Mobile responsiveness

## Environment Variables Reference

| Variable | Where to Get It | Purpose |
|----------|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | Server-side secret key |
| `NEXT_PUBLIC_SITE_URL` | Your domain | Used for redirects and emails |
| `RESEND_API_KEY` | Resend.com dashboard | Email notifications (optional) |

## Post-Deployment Checklist

- [ ] Custom domain configured and working
- [ ] SSL certificate active (automatic with Vercel)
- [ ] All environment variables set correctly
- [ ] Supabase auth redirects updated
- [ ] Email templates tested
- [ ] Sign up/Sign in flow tested
- [ ] Pro access request tested
- [ ] Mobile experience verified
- [ ] Social links updated (Discord, Twitter, YouTube)
- [ ] Analytics configured (optional)
- [ ] Error monitoring set up (optional)

## Updating Community Links

Before launch, update these files with your actual community links:

### Footer Links
Edit [app/components/Footer.tsx](../app/components/Footer.tsx):

```typescript
// Line ~35-45
<a href="YOUR_DISCORD_INVITE_URL" ...>
<a href="https://twitter.com/YOUR_HANDLE" ...>
<a href="https://youtube.com/@YOUR_CHANNEL" ...>
```

### Navigation (if needed)
Edit [app/components/Navigation.tsx](../app/components/Navigation.tsx) if you want to add community links to the header.

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Main branch** → Production deployment
2. **Other branches** → Preview deployments

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically build and deploy within 1-2 minutes.

## Alternative Deployment Platforms

### Netlify

1. Connect GitHub repository
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Add environment variables
4. Deploy

### Self-Hosted (VPS/Cloud)

Requirements:
- Node.js 18+
- PM2 or similar process manager

```bash
# Build
npm run build

# Start
npm run start

# Or with PM2
pm2 start npm --name "interakktive" -- start
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t interakktive-website .
docker run -p 3000:3000 --env-file .env.local interakktive-website
```

## Performance Optimization

### Image Optimization
Vercel automatically optimizes images. For self-hosted, configure:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['tradingview.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Caching
Vercel handles caching automatically. For custom caching:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/indicators/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ]
  },
}
```

## Monitoring & Analytics

### Vercel Analytics (Built-in)

Enable in Vercel dashboard:
1. Project → Analytics
2. Enable "Vercel Analytics"
3. Free tier: 100k events/month

### PostHog (Open Source Alternative)

```bash
npm install posthog-js
```

```typescript
// app/lib/posthog.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init('YOUR_API_KEY', {
    api_host: 'https://app.posthog.com'
  })
}

export default posthog
```

### Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 1.0,
})
```

## Troubleshooting

### Build Fails

Check:
- Node version (use 18+)
- All dependencies installed
- Environment variables set
- No TypeScript errors: `npm run build` locally

### Authentication Not Working

Check:
- Supabase URL and keys correct
- Redirect URLs configured in Supabase
- Site URL matches production domain

### Images Not Loading

Check:
- Image domains configured in `next.config.js`
- External URLs accessible
- CORS headers if self-hosted

### Slow Performance

- Enable caching headers
- Use Vercel CDN (automatic)
- Optimize images
- Check bundle size: `npm run build` shows sizes

## Rollback

If something goes wrong:

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual
```bash
git revert HEAD
git push origin main
```

## Security Checklist

- [ ] Environment variables not in git
- [ ] Service role key kept secret
- [ ] RLS enabled on all Supabase tables
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Email verification enabled
- [ ] Strong password requirements set
- [ ] Rate limiting configured (Supabase auto-handles)

## Support

Deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)

---

**Ready to launch!** 🚀

Once deployed, don't forget to:
1. Announce on Discord/Twitter
2. Update TradingView profile with website link
3. Publish ATLAS - CIPHER PRO
4. Send invite emails to approved users
