# Admin Utility Pages and Server Actions - Created Files

## Server Actions & Utilities

### 1. src/lib/actions/admin-actions.ts
Complete admin server actions for user role management, site settings, audit logs, and event statistics.

Functions:
- addUserRole() - Add a role to a user
- removeUserRole() - Remove a role from a user
- updateSiteSettings() - Update site configuration
- getSiteSettings() - Retrieve grouped site settings
- getAuditLogs() - Fetch audit logs with filtering
- getEventStats() - Get event registration statistics

### 2. src/app/api/export/[type]/route.ts
CSV export API endpoint supporting:
- registrations - Export event registrations
- users - Export user directory with roles

## Admin Pages

### 3. src/app/admin/users/page.tsx
User management page with:
- Search functionality (name/email)
- User listing with profile details
- Role management integration
- Pagination
- Organization information

### 4. src/app/admin/email-templates/page.tsx
Email template management with:
- Template listing table
- Create new templates button
- Edit templates in modal dialog
- Preview functionality
- Status toggle (active/inactive)
- Delete operation
- Variable template support ({{variable}} syntax)

### 5. src/app/admin/settings/page.tsx
Site settings management with:
- Grouped settings by category
- Editable key-value configuration
- Descriptions for each setting
- Save all changes button
- Real-time state management

### 6. src/app/admin/reports/page.tsx
Event analytics dashboard with:
- Event selector dropdown
- Total registration statistics
- Status breakdown chart
- Category breakdown visualization
- Top organizations ranking table
- CSV export functionality

### 7. src/app/admin/audit-log/page.tsx
Audit trail viewer with:
- Complete activity log
- Filter by action type
- Detailed modal view with old/new data
- User information display
- Color-coded action badges
- Pagination

## Client Components

### 8. src/components/admin/UserRoleManager.tsx
Interactive user role management component with:
- Display current roles as removable badges
- Dropdown to add available roles
- Loading states
- Error handling
- Direct role add/remove operations

## Public Pages

### 9. src/app/(public)/contact/page.tsx
Public contact page with:
- Contact form component
- Contact information sidebar (email, phone, address)
- Newsletter signup CTA
- FAQ quick link
- Responsive layout
- SEO metadata

### 10. src/app/(public)/faq/page.tsx
FAQ page with:
- Accordion-based Q&A
- Category grouping
- Active item filtering
- HTML content support
- ISR revalidation (300s)
- Contact support CTA

## Forms

### 11. src/components/forms/ContactForm.tsx
Contact form component with:
- Full validation
- All fields (name, email, phone, organization, subject, message)
- Success/error states
- Loading indicator
- Form reset on success
- Accessibility labels

### 12. src/components/forms/NewsletterForm.tsx
Newsletter subscription form with:
- Email input
- Subscribe button
- Success/error messages
- Variant support (default/white)
- Auto-dismiss success message
- Automatic form reset

## UI Components

### 13. src/components/ui/accordion.tsx
Accordion component (Radix UI based) with:
- Collapsible items
- Smooth animations
- Chevron icon rotation
- Accessibility features

## Key Features

- Complete RBAC implementation
- Audit logging for all admin actions
- CSV export for data analysis
- Email template system with variables
- Site-wide configuration management
- Public contact and FAQ management
- Newsletter subscription system
- Responsive design
- Production-ready error handling
- TypeScript throughout
- Supabase integration
- shadcn/ui components
- Tailwind CSS styling

## Database Integration

All components are fully integrated with Supabase:
- audit_logs: Complete audit trail
- email_templates: Template management
- email_logs: Email delivery tracking
- contact_submissions: Contact form submissions
- newsletter_subscribers: Newsletter subscriptions
- site_settings: Configuration storage
- faq_items: FAQ content
- profiles: User management
- user_roles + roles: Role-based access control
- registrations: Event registration data
- events: Event information

## Styling

- Brand color: #1B3A5C
- Hover states: #152a47
- Tailwind CSS responsive design
- Consistent with existing design system
- Dark mode ready
- Accessible color contrasts

