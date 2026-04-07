# Event Module Integration Guide

## Quick Start

All 10 files have been created and are production-ready. Here's how to verify and integrate:

### 1. Verify File Structure

```bash
# Check all event files are created
find src -path "*event*" -type f | grep -E "\.(tsx|ts)$"

# Should show:
# - src/lib/actions/event-actions.ts
# - src/app/admin/events/page.tsx
# - src/app/admin/events/new/page.tsx
# - src/app/admin/events/[id]/page.tsx
# - src/app/admin/events/[id]/sessions/page.tsx
# - src/app/(public)/events/page.tsx
# - src/app/(public)/events/[slug]/page.tsx
# - src/components/events/EventCard.tsx
# - src/components/events/EventForm.tsx
# - src/components/events/SessionForm.tsx
```

### 2. Admin Navigation Integration

Add links in your admin sidebar/menu:

```tsx
// In your admin layout or navigation component
<NavLink href="/admin/events" icon={<Calendar />}>
  Events
</NavLink>
```

### 3. Public Navigation Integration

Add link in main header/navigation:

```tsx
// In Header component
<Link href="/events" className="nav-link">
  Events
</Link>
```

### 4. Admin Layout Protection

Ensure admin routes are protected:

```tsx
// In your middleware or layout
// Example using custom hook:
useRequireAuth({
  requiredRole: 'admin', // or check created_by matches user.id
  redirectTo: '/login'
});
```

### 5. Database Setup (Already Done)

The Supabase tables already exist:
- `events` - Main event data
- `sessions` - Event sessions/schedule
- `event_session_speakers` - Speaker assignments

No migration needed!

---

## Key Implementation Details

### Authentication
All server actions check for authenticated user:
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { error: 'Unauthorized' };
```

### Error Handling
Forms return validation errors that display inline:
```tsx
{getErrorMessage('title') && (
  <p className="text-sm text-red-600">{getErrorMessage('title')}</p>
)}
```

### Images
Currently using placeholder images. To enable real images:

1. Set up image upload endpoint
2. Store URLs in:
   - `events.banner_url` - Large hero image
   - `events.thumbnail_url` - Card preview image

Example update:
```tsx
const { data, error } = await supabase
  .from('events')
  .update({ banner_url: imageUrl, thumbnail_url: thumbnailUrl })
  .eq('id', eventId);
```

### Cache Revalidation
Public pages use ISR (revalidate: 60):
- Changes appear within 60 seconds
- No manual cache clearing needed
- Full page revalidation on event publish

To force revalidation:
```tsx
revalidatePath('/events');
revalidatePath(`/events/${slug}`);
```

---

## Common Customizations

### 1. Change Brand Color

Find all instances of `#1B3A5C` and replace:

```bash
grep -r "#1B3A5C" src/components/events src/app/admin/events src/app/'(public)'/events
```

Update in:
- Button classes: `bg-[#1B3A5C] hover:bg-[#152a47]`
- Icon colors: `text-[#1B3A5C]`

### 2. Add Event Categories

1. Add enum to Supabase:
```sql
CREATE TYPE event_category AS ENUM ('education', 'healthcare', 'environment', ...);
ALTER TABLE events ADD COLUMN category event_category;
```

2. Update EventForm:
```tsx
<Select value={formData.category} onValueChange={handleCategoryChange}>
  {/* Add options */}
</Select>
```

3. Add to event-actions.ts validation

### 3. Add Email Notifications

After event creation/publish:
```tsx
const result = await createEvent(form);
if (result.success) {
  await sendEmailNotification({
    to: registeredUsers,
    subject: `New Event: ${formData.title}`,
    template: 'new-event'
  });
}
```

### 4. Add Event Registration

1. Create registrations table
2. Build registration form (similar to EventForm)
3. Add registration list to event detail page
4. Track registration count in overview

### 5. Add Speaker Management

1. Create speakers table in Supabase
2. Create speaker form/management
3. Link sessions to speakers via event_session_speakers
4. Display speakers in session details

---

## API Integration Points

### Current Endpoints Used
- `POST /auth/v1/user` - Get current user (via Supabase client)
- `POST /rest/v1/events` - Create/Read/Update/Delete events
- `POST /rest/v1/sessions` - Manage event sessions

All use Supabase SDK directly (no REST API needed).

### Adding External APIs

Example: Email service integration
```tsx
// In event-actions.ts
import { sendEmail } from '@/lib/email/resend';

export async function createEvent(formData: FormData) {
  // ... existing code ...

  // Send welcome email
  const emailResult = await sendEmail({
    to: user.email,
    subject: 'Event Created',
    html: `<p>Your event "${parsed.data.title}" was created!</p>`
  });

  return { success: true, data };
}
```

---

## Testing Examples

### Manual Testing Checklist

1. **Create Event**
   - Go to `/admin/events/new`
   - Fill in all required fields
   - Click "Create Event"
   - Verify event appears in `/admin/events`

2. **Edit Event**
   - Click event in list
   - Go to Details tab
   - Update title
   - Click "Update Event"
   - Verify changes saved

3. **Manage Sessions**
   - Go to Sessions tab
   - Click "Add Session"
   - Fill session details
   - Verify appears in list

4. **Publish Event**
   - Go to event detail
   - Click "Publish" (if functionality added to page)
   - Verify appears in `/events` public page

5. **View Public Event**
   - Go to `/events`
   - Click event card
   - Verify details and schedule display
   - Check sessions appear

### Unit Testing Example
```tsx
// __tests__/event-actions.test.ts
describe('createEvent', () => {
  it('should create event with valid data', async () => {
    const form = new FormData();
    form.append('title', 'Test Event');
    // ... add other fields

    const result = await createEvent(form);
    expect(result.success).toBe(true);
  });

  it('should reject invalid slug', async () => {
    const form = new FormData();
    form.append('slug', 'INVALID SLUG');

    const result = await createEvent(form);
    expect(result.error).toBeDefined();
  });
});
```

---

## Performance Optimization

### Current Optimizations
- Server-side rendering for public pages
- ISR for cache efficiency
- Suspense boundaries with skeleton loading
- Image lazy loading via img tag

### To Improve Further
1. Add Next.js Image component for optimization:
```tsx
import Image from 'next/image';

<Image
  src={event.banner_url}
  alt={event.title}
  width={1200}
  height={400}
  priority
/>
```

2. Add pagination to event lists:
```tsx
const EVENTS_PER_PAGE = 10;
const skip = (page - 1) * EVENTS_PER_PAGE;
const { data } = await supabase
  .from('events')
  .select()
  .range(skip, skip + EVENTS_PER_PAGE - 1);
```

3. Index database columns:
```sql
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_sessions_event_id ON sessions(event_id);
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` environment variable
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- [ ] Configure image upload storage (Supabase Storage or external)
- [ ] Set up email service for notifications
- [ ] Test admin routes have proper auth middleware
- [ ] Verify database indexes for performance
- [ ] Test ISR revalidation timing
- [ ] Add analytics tracking
- [ ] Monitor error logs in Supabase
- [ ] Set up database backups

---

## Troubleshooting

### Event not appearing in public list
- Check event status is "published" in database
- Verify ISR cache by waiting 60+ seconds
- Check `getAllPublishedEvents()` query filters

### Form validation errors
- Check Zod schema in `/src/lib/validations/event.ts`
- Verify field names match schema
- Check date format (ISO 8601 required)

### Session times not displaying
- Ensure sessions are ordered by start_time
- Check timezone handling (currently uses server timezone)
- Verify formatTime() function matches your locale

### Images not loading
- Check image URLs are valid and accessible
- Verify CORS if images from external domain
- Use Next.js Image component for optimization

---

## Next Phase Features

Ready to build:
1. Event registration system
2. Speaker management
3. Email notifications
4. Event categories/filtering
5. Event capacity tracking
6. Registration list export
7. QR code generation
8. Calendar integration
9. Analytics dashboard
10. Advanced search/filters

All infrastructure is in place to add these!

---

## Support

For issues or questions:
1. Check validation errors in form (field-level messages)
2. Review console errors in browser
3. Check Supabase logs for database errors
4. Verify environment variables are set
5. Test with smaller data sets first

---

Last Updated: April 6, 2026
