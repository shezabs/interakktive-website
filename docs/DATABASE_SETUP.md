# Database Setup Guide

This guide will help you set up the Supabase database for the Interakktive website.

## Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com))
- Project created in Supabase

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: interakktive-website (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (1-2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following credentials:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire schema below
4. Click "Run" or press Cmd/Ctrl + Enter

### Database Schema SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  tradingview_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Pro access requests table
CREATE TABLE public.pro_access_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  tradingview_username TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on pro_access_requests
ALTER TABLE public.pro_access_requests ENABLE ROW LEVEL SECURITY;

-- Pro access requests policies
CREATE POLICY "Users can view own requests"
  ON public.pro_access_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests"
  ON public.pro_access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policy (you'll need to create an admin role)
-- For now, this allows service role to manage all requests
CREATE POLICY "Service role can manage all requests"
  ON public.pro_access_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User analytics table
CREATE TABLE public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_views INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  indicators_viewed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- User analytics policies
CREATE POLICY "Users can view own analytics"
  ON public.user_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON public.user_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.user_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tradingview_username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'tradingview_username'
  );

  INSERT INTO public.user_analytics (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
  BEFORE UPDATE ON public.pro_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_analytics
  BEFORE UPDATE ON public.user_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_pro_access_requests_user_id ON public.pro_access_requests(user_id);
CREATE INDEX idx_pro_access_requests_status ON public.pro_access_requests(status);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
```

## Step 4: Configure Authentication

### Email Settings

1. Go to **Authentication** → **Email Templates**
2. Customize email templates (optional):
   - **Confirm Signup**: Welcome email with verification link
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email

3. Configure email provider (optional, but recommended for production):
   - Go to **Settings** → **Auth**
   - Scroll to "SMTP Settings"
   - Configure your SMTP provider (e.g., SendGrid, Mailgun, Resend)

### Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure these settings:
   - **Site URL**: Set to your production URL (e.g., `https://interakktive.com`)
   - **Redirect URLs**: Add:
     - `http://localhost:3000/auth/callback` (development)
     - `https://interakktive.com/auth/callback` (production)
   - **Email Confirmation**: Enable "Confirm email" (recommended)
   - **Password Requirements**: Configure as needed

## Step 5: Test the Connection

1. In your Next.js project, create a test file:

```typescript
// test-supabase.ts
import { supabase } from './app/lib/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Connection successful!', data);
  }
}

testConnection();
```

2. Run: `npx ts-node test-supabase.ts`

## Step 6: Create Admin User (Optional)

To create an admin user who can manage access requests:

1. Sign up for an account through your website
2. Get the user ID from Supabase dashboard: **Authentication** → **Users**
3. In SQL Editor, run:

```sql
-- Grant admin privileges to a user
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.admin_users (user_id)
VALUES ('YOUR_USER_ID_HERE');
```

4. Update RLS policies to grant admin access:

```sql
-- Admin can view all requests
CREATE POLICY "Admins can view all requests"
  ON public.pro_access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin can update all requests
CREATE POLICY "Admins can update all requests"
  ON public.pro_access_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );
```

## Database Tables Overview

### `profiles`
- Extends Supabase auth.users
- Stores user profile information
- Fields: id, email, tradingview_username, created_at, updated_at

### `pro_access_requests`
- Stores ATLAS PRO access requests
- Fields: id, user_id, user_email, tradingview_username, message, status, created_at, updated_at, reviewed_by, reviewed_at
- Statuses: pending, approved, rejected

### `user_analytics`
- Tracks user activity
- Fields: id, user_id, page_views, last_active, indicators_viewed, created_at, updated_at

### `admin_users` (optional)
- Stores admin user IDs
- Used for access control in admin panel

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Users can only access their own data
3. Service role has full access (use carefully!)
4. Admin policies can be customized based on your needs

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all SQL commands
- Check table names are correct (case-sensitive)

### RLS blocking requests
- Verify policies are created correctly
- Check user is authenticated (auth.uid() is set)
- For testing, you can temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```

### Email not sending
- Check SMTP configuration in Supabase
- Verify email templates are enabled
- Check spam folder
- For development, use Supabase's built-in email (limited to 4 emails/hour)

## Next Steps

1. Test user signup flow
2. Test Pro access request submission
3. Set up admin panel to manage requests
4. Configure production email provider
5. Set up monitoring and analytics

---

Need help? Check the [Supabase documentation](https://supabase.com/docs) or ask in their Discord community.
