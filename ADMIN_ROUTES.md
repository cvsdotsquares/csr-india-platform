# CSR India Event Platform - Admin & Public Routes

## Admin Routes

### User Management
- **Route:** `/admin/users`
- **File:** `src/app/admin/users/page.tsx`
- **Features:** User listing, role management, search, pagination

### Email Templates
- **Route:** `/admin/email-templates`
- **File:** `src/app/admin/email-templates/page.tsx`
- **Features:** Template CRUD, preview, variable support, status management

### Site Settings
- **Route:** `/admin/settings`
- **File:** `src/app/admin/settings/page.tsx`
- **Features:** Configuration management, grouped by category, bulk save

### Reports & Analytics
- **Route:** `/admin/reports`
- **File:** `src/app/admin/reports/page.tsx`
- **Features:** Event statistics, registration breakdown, top organizations, CSV export

### Audit Log
- **Route:** `/admin/audit-log`
- **File:** `src/app/admin/audit-log/page.tsx`
- **Features:** Activity tracking, action filtering, detailed views, pagination

## Public Routes

### Contact
- **Route:** `/contact`
- **File:** `src/app/(public)/contact/page.tsx`
- **Features:** Contact form, contact info, newsletter signup

### FAQ
- **Route:** `/faq`
- **File:** `src/app/(public)/faq/page.tsx`
- **Features:** Accordion FAQs, category grouping, search

## API Routes

### Export Registrations
- **Route:** `GET /api/export/registrations?eventId={eventId}`
- **File:** `src/app/api/export/[type]/route.ts`
- **Returns:** CSV file with event registrations

### Export Users
- **Route:** `GET /api/export/users`
- **File:** `src/app/api/export/[type]/route.ts`
- **Returns:** CSV file with user directory

## Server Actions

### Admin Actions
- **File:** `src/lib/actions/admin-actions.ts`

Functions:
- `addUserRole(userId, roleId)` - Assign role to user
- `removeUserRole(userId, roleId)` - Revoke role from user
- `updateSiteSettings(settings)` - Update configuration
- `getSiteSettings()` - Retrieve all settings
- `getAuditLogs(filters, page, pageSize)` - Get audit trail
- `getEventStats(eventId)` - Get event statistics

## Components

### Admin Components
- **UserRoleManager** (`src/components/admin/UserRoleManager.tsx`)
  - Interactive role management
  - Supports add/remove operations
  - Displays current roles as badges

### Form Components
- **ContactForm** (`src/components/forms/ContactForm.tsx`)
  - Contact form with validation
  - All fields: name, email, phone, organization, subject, message
  - Success/error states

- **NewsletterForm** (`src/components/forms/NewsletterForm.tsx`)
  - Email newsletter signup
  - Variant support (default/white)
  - Success messaging

### UI Components
- **Accordion** (`src/components/ui/accordion.tsx`)
  - Radix UI based accordion
  - Smooth animations
  - Used in FAQ page

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `audit_logs` | Track all admin actions |
| `email_templates` | Store email templates |
| `email_logs` | Track email deliveries |
| `contact_submissions` | Store contact form submissions |
| `newsletter_subscribers` | Store newsletter subscriptions |
| `site_settings` | Store site configuration |
| `faq_items` | Store FAQ content |
| `profiles` | User profile information |
| `user_roles` | User role assignments |
| `roles` | Available roles |
| `registrations` | Event registrations |
| `events` | Event information |

## Authentication & Authorization

All admin routes require authentication and appropriate role-based permissions.

## Error Handling

- All server actions return `{ error: string }` or `{ success: true }`
- Client components display user-friendly error messages
- Loading states provided for async operations

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Admin API key
- `RESEND_API_KEY` - Email service
- `RESEND_FROM_EMAIL` - Email sender address
- `CONTACT_ADMIN_EMAIL` - Admin email for contact submissions

## Performance Optimizations

- ISR (Incremental Static Regeneration) on FAQ (300s)
- Pagination on list pages (20 items per page)
- Optimized database queries
- Client-side search and filtering

## Security Features

- Authorization checks on all server actions
- Audit logging for all modifications
- Input validation on all forms
- Error messages don't expose sensitive data
- RBAC enforcement via user_roles table

## Testing Checklist

- [ ] Admin user can manage other users and roles
- [ ] Email templates can be created, edited, previewed
- [ ] Settings updates persist and group correctly
- [ ] Reports load accurate statistics
- [ ] Audit log tracks all actions correctly
- [ ] Contact form sends emails successfully
- [ ] FAQ loads and filters correctly
- [ ] Newsletter signup works
- [ ] CSV exports contain correct data
- [ ] All pages are responsive on mobile

