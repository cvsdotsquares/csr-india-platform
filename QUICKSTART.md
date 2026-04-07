# Quick Start Guide

Get the CSR India Event Platform running in 5 minutes.

## 1. Clone and Install

```bash
# Navigate to the project
cd csr-india-platform

# Install dependencies
npm install
```

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

## 3. Generate Database Types

```bash
npm run db:types
```

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test Authentication

1. Visit [http://localhost:3000/register](http://localhost:3000/register)
2. Create a test account
3. Check your email for verification link
4. Verify and log in

## 6. Access Admin Panel

To give yourself admin access:

1. Find your user ID in Supabase:
   ```sql
   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. Assign super_admin role:
   ```sql
   INSERT INTO user_roles (user_id, role_id)
   SELECT 'YOUR_USER_ID', id FROM roles WHERE name = 'super_admin';
   ```

3. Visit [http://localhost:3000/admin](http://localhost:3000/admin)

## Project Structure

```
src/
├── app/              # Pages & routes
├── components/       # React components
├── lib/              # Utilities & helpers
├── hooks/            # Custom hooks
├── stores/           # Zustand state
├── config/           # Configuration
└── types/            # TypeScript types
```

## Key Files

- **middleware.ts** - Route protection & authentication
- **src/lib/auth/actions.ts** - Login, signup, password reset
- **src/lib/supabase/** - Supabase client setup
- **src/config/navigation.ts** - Menu & navigation
- **src/types/database.ts** - Database schema types

## Common Tasks

### Add a New Page

Create `src/app/(public)/new-page/page.tsx`:

```typescript
export default function NewPage() {
  return <div>New Page</div>;
}
```

### Create a Server Action

Create `src/lib/actions/my-action.ts`:

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

export async function myAction(formData: FormData) {
  const supabase = await createClient();
  // Do work here
  return { success: true };
}
```

### Send Email

```typescript
import { sendEmail } from '@/lib/email/resend';

await sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Welcome!</h1>',
});
```

### Check User Roles

In components:
```typescript
const { roles, isAdmin } = useRoles();
```

In server components:
```typescript
const roles = await getUserRoles(user.id);
```

## Styling

The project uses Tailwind CSS with custom brand colors:

- **brand-500**: Primary dark blue (#1B3A5C)
- **accent-500**: Gold accent (#E6A800)

### Add shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

```bash
# One-command deployment
vercel
```

### Other Platforms

Works with any Node.js 18+ host. Set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

Full SQL setup in **SETUP.md**

Quick schema:
- **profiles** - User information
- **events** - Event details
- **registrations** - Event registrations
- **roles** - Role definitions
- **user_roles** - User-role assignments
- **blog_posts** - Blog articles
- **partners** - Partner information

## Next Steps

1. Read **README.md** for complete documentation
2. Follow **SETUP.md** for detailed database setup
3. Start building features
4. Deploy when ready

## Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Need Help?

- Check README.md for feature documentation
- Review SETUP.md for configuration issues
- Check Supabase docs for database questions
- Check Next.js docs for framework questions

Happy coding! 🚀
