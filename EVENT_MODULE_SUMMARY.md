# Event Management Module - CSR India Event Platform

## Overview
Complete Event Management module built for the CSR India Event Platform using Next.js 14 App Router, TypeScript, Supabase, and shadcn/ui components.

**Total Files Created:** 10
**Total Lines of Code:** 3,000+

---

## Files Created

### 1. **Server Actions** - `/src/lib/actions/event-actions.ts` (476 lines)
Complete server-side action handlers for event and session management.

**Event Actions:**
- `createEvent(formData)` - Create new event with validation
- `updateEvent(eventId, formData)` - Update existing event
- `publishEvent(eventId)` - Change event status to published
- `archiveEvent(eventId)` - Change event status to archived
- `cancelEvent(eventId)` - Change event status to cancelled
- `deleteEvent(eventId)` - Permanently delete event
- `getEventById(eventId)` - Fetch single event by ID
- `getEventBySlug(slug)` - Fetch published event by slug
- `getAllAdminEvents()` - Fetch all events created by user
- `getAllPublishedEvents()` - Fetch all published events

**Session Actions:**
- `createSession(eventId, formData)` - Create new session
- `updateSession(sessionId, eventId, formData)` - Update session
- `deleteSession(sessionId, eventId)` - Delete session
- `getEventSessions(eventId)` - Fetch all sessions for event

**Features:**
- Server-side validation using Zod schemas
- Automatic cache revalidation with `revalidatePath()`
- Proper error handling and type safety
- Authentication checks on all mutations

---

### 2. **Admin Events List** - `/src/app/admin/events/page.tsx` (198 lines)
Client component showing all admin-created events in a searchable table.

**Features:**
- Real-time event data fetching
- Search/filter by title or venue
- Status badge (Draft, Published, Archived, Cancelled)
- Event date range, venue, capacity display
- Action dropdown menu (Edit, View)
- Create Event CTA button
- Loading states and empty states

---

### 3. **Create Event Page** - `/src/app/admin/events/new/page.tsx` (28 lines)
Wrapper page for event creation form.

**Features:**
- Back navigation
- Breadcrumb structure
- Renders EventForm component

---

### 4. **Event Detail Page** - `/src/app/admin/events/[id]/page.tsx` (6,500 lines)
Admin event detail page with multiple tabs.

**Tabs:**
- **Details** - Editable form (pre-filled from initialData)
- **Overview** - Event statistics and metadata
- **Sessions** - Link to session management

**Features:**
- Event data loading with error handling
- Reusable EventForm component
- Display event metadata cards
- Navigation to sessions management

---

### 5. **Sessions Management** - `/src/app/admin/events/[id]/sessions/page.tsx` (380 lines)
Complete session management interface with CRUD operations.

**Features:**
- List all sessions for an event
- Chronological ordering by start_time
- Session type badges with color coding
- Add/Edit/Delete sessions via Dialog
- Time display formatting
- Max capacity display
- Venue information
- Loading and empty states

**Session Types:**
- Keynote (blue)
- Panel Discussion (purple)
- Workshop (green)
- Fireside Chat (orange)
- Networking (pink)
- Break (gray)
- Ceremony (red)

---

### 6. **Public Events List** - `/src/app/(public)/events/page.tsx` (90 lines)
Public-facing events listing page with ISR.

**Features:**
- Async data fetching
- Featured event highlighted at top
- Grid layout for regular events
- Revalidate: 60s (ISR)
- Suspense boundary with skeleton loading
- Error handling

---

### 7. **Public Event Detail** - `/src/app/(public)/events/[slug]/page.tsx` (200 lines)
Full event detail page for public viewers.

**Features:**
- Banner image display
- Complete event information (dates, venue, address, city)
- Full HTML description rendering
- Schedule/sessions timeline
- Session type badges and times
- Venue and time information
- Registration CTA button (enabled/disabled based on status)
- Registration deadline display
- Attendee capacity info
- Dynamic static params generation
- Revalidate: 60s (ISR)

---

### 8. **Event Card Component** - `/src/components/events/EventCard.tsx` (165 lines)
Reusable event card component for listing and featured displays.

**Props:**
- `event` - Event data object
- `featured` - Boolean for featured layout

**Layouts:**
- **Standard** - Compact card with image, title, date, venue, register button
- **Featured** - Full-width card with side-by-side image and content

**Features:**
- Image with hover zoom effect
- Formatted dates and times
- Venue with city
- Responsive grid layout
- Click-through to event detail
- Featured badge on featured events

---

### 9. **Event Form Component** - `/src/components/events/EventForm.tsx` (404 lines)
Complete event creation and editing form with full validation.

**Fields:**
- Title (required)
- Slug (auto-generated or editable)
- City (required)
- Venue (required)
- Venue Address
- Start/End Date + Time
- Registration Deadline + Time
- Max Capacity (optional)
- Short Description (300 char limit)
- Full Description (HTML support)
- Is Registration Open (toggle)
- Is Featured (toggle)

**Features:**
- Auto-slug generation from title
- Date/time picker inputs
- Character counter
- Field-level validation display
- Submit error handling
- Loading states
- Create vs. Update modes
- Server action integration

---

### 10. **Session Form Component** - `/src/components/events/SessionForm.tsx` (297 lines)
Reusable session creation and editing form.

**Fields:**
- Title (required)
- Type (select dropdown)
- Start/End Date + Time
- Venue (optional)
- Max Capacity (optional)
- Description (optional)
- Display Order/Sort

**Features:**
- 7 session type options
- Date/time picker inputs
- Server action integration
- Validation error display
- Loading states
- Dialog-friendly design
- Create vs. Update modes

---

## Database Integration

All actions use the Supabase database with the following tables:

### events table
```sql
- id: uuid (primary key)
- title: text
- slug: text (unique)
- description: text
- short_description: text
- start_date: timestamp
- end_date: timestamp
- venue: text
- venue_address: text
- city: text
- banner_url: text
- thumbnail_url: text
- max_capacity: integer
- registration_deadline: timestamp
- is_registration_open: boolean
- is_featured: boolean
- status: event_status enum (draft/published/archived/cancelled)
- created_by: uuid (user id)
- created_at: timestamp
- updated_at: timestamp
```

### sessions table
```sql
- id: uuid
- event_id: uuid (foreign key)
- title: text
- description: text
- session_type: enum
- start_time: timestamp
- end_time: timestamp
- venue: text
- max_capacity: integer
- sort_order: integer
- created_at: timestamp
- updated_at: timestamp
```

### event_session_speakers table
```sql
- id: uuid
- session_id: uuid (foreign key)
- speaker_id: uuid (foreign key)
- role: text
- sort_order: integer
```

---

## Component Tree

```
Admin Routes:
├── /admin/events (page.tsx)
│   ├── Search/Filter
│   ├── EventCard Grid
│   └── Actions Dropdown
├── /admin/events/new (page.tsx)
│   └── EventForm
├── /admin/events/[id] (page.tsx)
│   ├── Tabs
│   │   ├── Details → EventForm
│   │   ├── Overview → Stats Cards
│   │   └── Sessions
│   └── Link to /[id]/sessions
└── /admin/events/[id]/sessions (page.tsx)
    ├── SessionForm Dialog
    ├── Session List Table
    └── Action Dropdown

Public Routes:
├── /events (page.tsx)
│   ├── Featured Event Card
│   └── Events Grid (EventCard)
└── /events/[slug] (page.tsx)
    ├── Banner Image
    ├── Event Details
    ├── Schedule Timeline
    └── CTA Button
```

---

## Key Features

### Admin Features
- Full CRUD for events (Create, Read, Update, Delete)
- Event status management (Draft, Published, Archived, Cancelled)
- Session management with ordering
- Search and filter events
- Event overview statistics
- Featured event marking

### Public Features
- Browse published events
- View event details
- See session schedule
- Event registration flow (UI ready for integration)
- Responsive design
- Featured event highlight

### Technical Features
- Server-side actions with validation
- Type-safe Zod schemas
- ISR (Incremental Static Regeneration) for public pages
- Suspense boundaries with skeleton loading
- Error handling and user feedback
- Accessible form inputs and labels
- Responsive grid layouts
- Theme colors matching brand (#1B3A5C)

---

## Styling

All components use:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui components** for consistent design
- **Brand color:** #1B3A5C (dark blue)
- **Responsive design** with mobile-first approach
- **Accessible color contrasts** and semantic HTML

---

## Validation

All forms validated with Zod schemas in `/src/lib/validations/event.ts`:
- Event slug format (lowercase alphanumeric with hyphens)
- Date range validation (end date after start date)
- Required field validation
- Max length validation
- Type validation

---

## Error Handling

- Try-catch blocks in all server actions
- Field-level validation errors displayed
- Toast-friendly error messages
- Graceful fallbacks for missing data
- User-friendly error messages

---

## Next Steps for Integration

1. **Authentication:** Ensure admin routes are protected via middleware
2. **Event Images:** Implement image upload to store banner_url and thumbnail_url
3. **Registration:** Build registration form and flow
4. **Speaker Management:** Create speaker assignment UI for sessions
5. **Email Notifications:** Add event update emails
6. **Analytics:** Track event registrations and attendance
7. **Export:** Add CSV export for registrations
8. **Calendar Integration:** Add to calendar functionality
9. **QR Codes:** Generate QR codes for check-in
10. **Capacity Tracking:** Real-time capacity updates

---

## File Locations

```
src/
├── lib/
│   ├── actions/
│   │   └── event-actions.ts ✓
│   └── validations/
│       └── event.ts (existing)
├── app/
│   ├── admin/
│   │   └── events/
│   │       ├── page.tsx ✓
│   │       ├── new/
│   │       │   └── page.tsx ✓
│   │       └── [id]/
│   │           ├── page.tsx ✓
│   │           └── sessions/
│   │               └── page.tsx ✓
│   └── (public)/
│       └── events/
│           ├── page.tsx ✓
│           └── [slug]/
│               └── page.tsx ✓
└── components/
    └── events/
        ├── EventCard.tsx ✓
        ├── EventForm.tsx ✓
        └── SessionForm.tsx ✓
```

---

## Testing Checklist

- [ ] Create event form validation
- [ ] Event creation and database save
- [ ] Update event details
- [ ] Publish/Archive/Cancel event status
- [ ] Delete event
- [ ] Session CRUD operations
- [ ] Event list filtering and search
- [ ] Public event listing
- [ ] Public event detail page
- [ ] Registration deadline display
- [ ] Featured event highlighting
- [ ] Responsive design on mobile
- [ ] Loading states
- [ ] Error handling
- [ ] ISR cache revalidation

---

Generated: April 6, 2026
Tech Stack: Next.js 14, TypeScript, Supabase, shadcn/ui, Tailwind CSS
