# Quick Start Guide

Get your Interakktive website running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Supabase account (free)

## Step 1: Install Dependencies

```bash
cd interakktive-website
npm install
```

## Step 2: Set Up Supabase

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for provisioning

### Get Credentials
1. Go to Settings → API
2. Copy:
   - Project URL
   - anon/public key
   - service_role key

### Set Up Database
1. Go to SQL Editor
2. Copy all SQL from [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md#database-schema-sql)
3. Run the query

## Step 3: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test the Website

1. Visit homepage - should see hero section
2. Click "Free Indicators" - should see 8 indicators
3. Click any indicator - should see details page
4. Click "ATLAS PRO" - should see pro page
5. Try signing up - should receive verification email

## You're Done! 🎉

Your website is running locally.

## Next Steps

### Before Launch

1. **Update Community Links**
   - Edit `app/components/Footer.tsx`
   - Add Discord, Twitter, YouTube URLs

2. **Configure Email (Production)**
   - Go to Supabase → Authentication → Email Templates
   - Configure SMTP provider

3. **Deploy to Vercel**
   - See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Optional Enhancements

- Add logo to `public/` folder
- Customize colors in `tailwind.config.ts`
- Add more content to About page
- Create admin panel for managing requests

## Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection fails
- Check Supabase credentials in `.env.local`
- Verify SQL schema ran successfully
- Check Supabase project is running

### Build errors
```bash
npm run build
```
Fix any TypeScript errors shown

## Need Help?

- Read full [README.md](./README.md)
- Check [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)
- See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

**Happy coding!** 🚀
