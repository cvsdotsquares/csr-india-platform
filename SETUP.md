# CSR India Event Platform - Setup Guide

Complete step-by-step guide to get the project up and running.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available at supabase.com)
- Resend account (optional, for email - resend.com)
- Google OAuth credentials (optional, for Google login)

## Step 1: Supabase Project Setup

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New project"
4. Enter project name: "CSR India"
5. Set a strong database password
6. Choose region closest to you
7. Wait for project to initialize (2-3 minutes)

### 1.2 Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Create Database Tables

Go to **SQL Editor** and run this SQL to create the core tables:

```sql
-- Create enum types
CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'checked_in', 'cancelled');
CREATE TYPE registration_category AS ENUM ('delegate', 'vip', 'corporate', 'government', 'ngo', 'academic', 'media', 'student', 'speaker', 'volunteer', 'other');
CREATE TYPE system_role AS ENUM ('super_admin', 'event_admin', 'content_admin', 'reviewer', 'checkin_staff', 'registered_user');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  venue_address TEXT,
  city TEXT,
  banner_url TEXT,
  thumbnail_url TEXT,
  max_capacity INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_registration_open BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  status event_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category registration_category NOT NULL,
  status registration_status DEFAULT 'pending',
  organization TEXT,
  designation TEXT,
  dietary_preferences TEXT,
  special_requirements TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name system_role UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User roles junction table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, role_id)
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category_id UUID,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  meta_title TEXT,
  meta_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for events
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

-- Policies for registrations
CREATE POLICY "Users can view their own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = reviewed_by);

-- Policies for blog posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

-- Create initial roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('event_admin', 'Manage events and registrations'),
  ('content_admin', 'Manage content, blog, and media'),
  ('reviewer', 'Review applications and registrations'),
  ('checkin_staff', 'Check in attendees'),
  ('registered_user', 'Standard user role');
```

## Step 2: Configure Environment Variables

### 2.1 Create .env.local

```bash
cp .env.example .env.local
```

### 2.2 Fill in values

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend (optional)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@csrindia.org

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=CSR India
NODE_ENV=development
```

## Step 3: Setup Resend (Optional - for Email)

1. Go to [resend.com](https://resend.com)
2. Sign up and create a project
3. Add your domain (or use resend.dev for testing)
4. Copy API key to `RESEND_API_KEY`

## Step 4: Setup Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
6. Copy Client ID and Secret to your `.env.local`

## Step 5: Local Development Setup

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Generate Database Types

```bash
npm run db:types
```

This command generates TypeScript types from your Supabase schema and saves them to `src/types/database.ts`.

### 5.3 Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5.4 Create Test User

Visit [http://localhost:3000/register](http://localhost:3000/register) and create a test account.

## Step 6: Make Your Test User an Admin

1. Go to Supabase dashboard
2. In SQL Editor, run:

```sql
-- Get the user ID (replace with your test email)
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Assign super_admin role (replace user_id with the ID from above)
INSERT INTO user_roles (user_id, role_id)
SELECT 'USER_ID_HERE', id FROM roles WHERE name = 'super_admin';
```

3. Log out and log back in
4. Visit [http://localhost:3000/admin](http://localhost:3000/admin)

## Step 7: Configure Authentication

### Social Login

In Supabase **Authentication** → **Providers**:

1. **Google**: Enable and enter your OAuth credentials
2. **GitHub** (optional): Enable for easier dev/testing

## Next Steps

1. Review the project structure in `README.md`
2. Read the code comments in `src/lib/supabase/`
3. Start building features using the validation schemas as reference
4. Deploy to Vercel when ready

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Regenerate database types
npm run db:types
```

## Database Management

### View Data

1. Go to Supabase dashboard
2. Click **Data Editor**
3. Select any table to view/edit records

### Run SQL Queries

1. Go to **SQL Editor**
2. Write and execute SQL

### Access Control

All data access is controlled by Row Level Security (RLS) policies. To test policies work correctly:

1. Create two test users
2. Have them try to access each other's data
3. Should fail due to RLS policies

## Troubleshooting

### "Project is paused"

- Supabase pauses free projects after 7 days of inactivity
- Click "Resume" in the Supabase dashboard

### Cannot login

- Verify email in Supabase auth users list
- Check email is confirmed
- Verify `.env.local` has correct Supabase keys

### TypeScript errors

- Run `npm run db:types` to regenerate types
- Clear `.next` folder: `rm -rf .next`
- Restart development server

### Middleware not working

- Check `middleware.ts` is in project root
- Verify route is not in `publicRoutes` array
- Check browser cookies (DevTools → Application → Cookies)

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] Database backups configured
- [ ] Email templates tested
- [ ] OAuth credentials configured
- [ ] SSL/HTTPS enabled
- [ ] Database RLS policies reviewed
- [ ] Storage policies configured
- [ ] Monitoring/logging set up
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring

## Support

For questions or issues:

1. Check documentation in `README.md`
2. Review Supabase docs: https://supabase.com/docs
3. Check Next.js docs: https://nextjs.org/docs
