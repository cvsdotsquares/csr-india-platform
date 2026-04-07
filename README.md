# CSR India Event Platform

Production-ready Next.js 14 boilerplate for managing CSR events, conferences, and knowledge sharing.

## Tech Stack

- **Framework**: Next.js 14+ App Router with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Email**: Resend
- **Validation**: Zod + React Hook Form
- **State Management**: Zustand
- **Rich Text**: Tiptap Editor
- **QR Codes**: qrcode library

## Quick Start

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Generate TypeScript types from your Supabase schema:

```bash
npm run db:types
```

This will populate `src/types/database.ts` with your schema.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── (public)/                 # Public pages with header/footer
│   ├── (auth)/                   # Auth pages (login, register, etc)
│   ├── admin/                    # Admin dashboard
│   ├── dashboard/                # User dashboard
│   ├── api/                      # API routes & webhooks
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── layout/                   # Header, Footer, AdminLayout
│   ├── ui/                       # shadcn/ui components (add as needed)
│   ├── forms/                    # Form components
│   ├── events/                   # Event-related components
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Shared utility components
├── lib/
│   ├── supabase/                 # Supabase client setup
│   ├── auth/                     # Authentication helpers & actions
│   ├── email/                    # Email sending (Resend)
│   ├── qr/                       # QR code generation
│   ├── validations/              # Zod schemas
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   └── useRoles.ts               # User roles hook
├── stores/                       # Zustand stores
│   ├── auth-store.ts             # Auth state
│   └── ui-store.ts               # UI state
├── config/                       # Configuration
│   ├── navigation.ts             # Navigation menus
│   ├── roles.ts                  # Role hierarchy & permissions
│   └── site.ts                   # Site configuration
├── types/
│   ├── database.ts               # Supabase types (auto-generated)
│   ├── auth.ts                   # Auth types
│   └── api.ts                    # API response types
├── middleware.ts                 # Next.js middleware (auth guards)
└── public/
    ├── images/
    ├── icons/
    └── fonts/
```

## Key Features

### Authentication
- Email/Password signup & login
- Google OAuth integration
- Password reset flow
- Session management with Supabase SSR

### Authorization
- Role-based access control (RBAC)
- Admin, Event Admin, Content Admin, Reviewer, Check-in Staff roles
- Route protection via middleware
- Permission checking helpers

### Event Management
- Event creation & editing
- Session scheduling
- Registration management
- Capacity tracking

### User Management
- User profiles
- Role assignment
- Audit logging

### Content Management
- CMS pages
- Blog posts with rich text editor
- Media library (image/video storage)

### Email
- Transactional emails via Resend
- Email template support

## Development Workflow

### 1. Create Server Actions

For data mutations, create server actions in `src/lib/actions/`:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export async function myAction(formData: FormData) {
  const supabase = await createClient();
  const parsed = schema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Do work with Supabase
  return { success: true };
}
```

### 2. Create API Routes

For external integrations, create API routes in `src/app/api/`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Handle request
  return NextResponse.json({ success: true });
}
```

### 3. Create Components

Use shadcn/ui for UI consistency:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
```

### 4. Add Validations

Define Zod schemas in `src/lib/validations/`:

```typescript
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type EventInput = z.infer<typeof eventSchema>;
```

## Database Setup

### Create Supabase Tables

Use the Supabase dashboard or SQL editor to create tables. Key tables:

```sql
-- Profiles (auto-created with auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT,
  designation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  venue TEXT,
  max_capacity INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  status event_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES auth.users(id),
  category registration_category NOT NULL,
  status registration_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row-Level Security (RLS)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to read own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to read published events
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  USING (status = 'published');
```

## Environment Variables

Key environment variables to configure:

```
NEXT_PUBLIC_SUPABASE_URL        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY       # Service role key (for admin operations)
RESEND_API_KEY                  # Resend email API key
RESEND_FROM_EMAIL               # Default from email
NEXT_PUBLIC_SITE_URL            # Your app's URL
```

## Authentication Flow

1. User signs up → Email verification sent
2. User clicks verification link → Account activated
3. User logs in → Session created (stored in cookie)
4. Middleware validates session on each request
5. User can access protected routes & perform actions

Protected routes are enforced in `middleware.ts`. Update the `publicRoutes` and `authRoutes` arrays as needed.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+ runtime
- Edge functions (optional, for middleware)
- Environment variables

## Common Tasks

### Add a New Role

1. Add to `system_role` enum in Supabase
2. Update `src/config/roles.ts` with permissions
3. Use `useRoles()` hook or `getUserRoles()` helper to check roles

### Send Transactional Email

```typescript
import { sendEmail } from '@/lib/email/resend';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to CSR India',
  html: '<h1>Welcome!</h1>',
});
```

### Generate QR Code

```typescript
import { generateQRCode } from '@/lib/qr/generator';

const qrImage = await generateQRCode('https://example.com/verify?token=abc');
```

## Troubleshooting

### "Invalid Credentials" on Login

- Ensure user exists in Supabase auth
- Check email/password are correct
- Verify email is confirmed

### Middleware Not Protecting Routes

- Ensure route is not in `publicRoutes` array in `middleware.ts`
- Check session cookies are being set (check browser DevTools)

### Supabase Connection Error

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check internet connectivity
- Verify Supabase project is not paused

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/docs)

## License

Private project - All rights reserved.
