# CMS Module Implementation Guide

Complete CMS Module (Pages + Blog + Media Library) for CSR India Event Platform - Build Date: April 6, 2026

## Overview

This implementation provides a production-ready, feature-complete CMS system with:
- **CMS Pages**: Create, edit, publish, and manage static website pages
- **Blog System**: Full-featured blog with categories, featured posts, and author tracking
- **Media Library**: Upload, organize, and manage media assets (images, videos, documents)

## Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Editor**: Tiptap (headless rich text editor)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (with role-based access control)

### Database Tables

#### cms_pages
```sql
id (uuid)
title (text)
slug (text) - unique
content (text) - HTML from Tiptap
meta_title (text, optional)
meta_description (text, optional)
template (text) - 'default', 'full-width', 'sidebar'
featured_image_url (text, optional)
status (text) - 'draft', 'published', 'archived'
created_by (uuid) - references auth.users
published_at (timestamp, optional)
sort_order (integer)
created_at (timestamp)
updated_at (timestamp)
```

#### blog_posts
```sql
id (uuid)
title (text)
slug (text) - unique
content (text) - HTML from Tiptap
excerpt (text, optional)
featured_image_url (text, optional)
category_id (uuid, optional) - references blog_categories
author_id (uuid) - references auth.users
meta_title (text, optional)
meta_description (text, optional)
status (text) - 'draft', 'published', 'archived'
is_featured (boolean)
published_at (timestamp, optional)
created_at (timestamp)
updated_at (timestamp)
```

#### blog_categories
```sql
id (uuid)
name (text)
slug (text) - unique
description (text, optional)
sort_order (integer)
created_at (timestamp)
```

#### media_assets
```sql
id (uuid)
filename (text)
original_filename (text)
file_url (text)
file_size (integer)
mime_type (text)
media_type (enum) - 'image', 'video', 'document'
alt_text (text, optional)
uploaded_by (uuid) - references auth.users
created_at (timestamp)
```

## File Structure

### Server Actions (Content Management)
**File**: `/src/lib/actions/content-actions.ts`

Server-side actions with security checks and validation:

#### CMS Pages
- `createPage(formData)` - Create new page with draft status
- `updatePage(pageId, formData)` - Update page content
- `publishPage(pageId)` - Publish page and set published_at
- `unpublishPage(pageId)` - Revert published page to draft
- `archivePage(pageId)` - Archive page (soft delete)
- `deletePage(pageId)` - Permanently delete page

#### Blog Posts
- `createBlogPost(formData)` - Create new blog post
- `updateBlogPost(postId, formData)` - Update blog post
- `publishBlogPost(postId)` - Publish blog post
- `unpublishBlogPost(postId)` - Revert to draft
- `archiveBlogPost(postId)` - Archive blog post
- `deleteBlogPost(postId)` - Delete blog post

#### Blog Categories
- `createBlogCategory(formData)` - Create category
- `updateBlogCategory(categoryId, formData)` - Update category
- `deleteBlogCategory(categoryId)` - Delete category

#### Media Management
- `uploadMedia(formData)` - Upload file to Supabase Storage
- `deleteMedia(mediaId)` - Delete file from storage and database

**Features**:
- Role-based access control (requires 'content_admin' or 'super_admin')
- Input validation using Zod schemas
- Automatic revalidation of cache tags
- Error handling and user feedback
- Automatic slug generation from title

### Components

#### TiptapEditor (`/src/components/cms/TiptapEditor.tsx`)
Rich text editor component with full formatting toolbar:

**Features**:
- Text formatting: Bold, Italic, Strikethrough, Code
- Headings: H1, H2, H3
- Lists: Bullet, Ordered
- Blocks: Blockquote, Horizontal Rule
- Media: Image insertion with URL
- Links: Add/remove links
- Undo/Redo functionality
- Syntax highlighting for code blocks

**Props**:
```typescript
interface TiptapEditorProps {
  content?: string;              // Initial HTML content
  onChange: (html: string) => void; // Called on content change
  placeholder?: string;          // Editor placeholder text
}
```

#### MediaPicker (`/src/components/cms/MediaPicker.tsx`)
Dialog-based media selection and upload component:

**Features**:
- Drag & drop file upload
- File type filtering (Images, Videos, Documents)
- Media preview with thumbnails
- Copy URL to clipboard
- Direct file selection
- Shows file size and information

**Props**:
```typescript
interface MediaPickerProps {
  onSelect: (url: string) => void;    // Called when media selected
  isOpen: boolean;                     // Dialog open state
  onClose: () => void;                 // Close dialog
  mediaAssets?: MediaAsset[];         // List of uploaded assets
  isLoading?: boolean;                // Loading state
}
```

### Admin Pages

#### CMS Pages List (`/src/app/admin/content/pages/page.tsx`)
Server component displaying all pages in table format:

**Features**:
- Table view: Title, Slug, Status, Template, Updated date
- Status filtering (All, Draft, Published, Archived)
- Create button linking to new page form
- Edit and view links
- Server-rendered for performance

**Columns**:
- Title
- Slug
- Template (default/full-width/sidebar)
- Status badge
- Last updated date
- Actions (Edit, View)

#### Create/Edit Page (`/src/app/admin/content/pages/new/page.tsx`, `/[id]/page.tsx`)
Client components with form handling:

**Form Fields**:
- Title (auto-slugifies)
- Slug (editable)
- Template selector
- Sort Order (integer)
- Featured Image (with media picker)
- Meta Title (SEO, max 70 chars)
- Meta Description (SEO, max 160 chars)
- Content editor (Tiptap)

**Actions**:
- Save Draft button
- Publish button (status change + published_at)
- Publish/Unpublish toggle (edit only)
- Archive button
- Delete button (with confirmation)

#### Blog Posts List (`/src/app/admin/content/blog/page.tsx`)
Server component for blog post management:

**Features**:
- Table view: Title, Author, Category, Status, Published date
- Multi-filter: Status + Category
- Featured post badge
- Create button
- Edit and view links

#### Create/Edit Blog Post (`/src/app/admin/content/blog/new/page.tsx`, `/[id]/page.tsx`)
Client components for blog management:

**Form Fields**:
- Title (auto-slugifies)
- Slug (editable)
- Category selector
- Excerpt (textarea, max 300 chars)
- Featured image picker
- Meta Title (SEO)
- Meta Description (SEO)
- Is Featured toggle
- Content editor (Tiptap)

**Actions**:
- Save Draft
- Publish
- Publish/Unpublish toggle
- Archive
- Delete

#### Media Library (`/src/app/admin/content/media/page.tsx`)
Client component for media management:

**Features**:
- Grid view of media assets
- Drag & drop upload zone
- File type filtering
- Image thumbnails / file icons
- Copy URL button
- File info (name, size, type, date)
- Delete buttons with confirmation
- Upload progress indicator

## Public-Facing Pages

### Blog Listing (`/src/app/(public)/blog/page.tsx`)
Server component with ISR (revalidate: 60s):

**Features**:
- Hero section with search
- Featured post highlight
- Grid of blog posts (6 per page)
- Pagination
- Category sidebar filter
- Newsletter signup form
- Responsive design

**Data Fetched**:
- Featured post (is_featured = true)
- Published posts paginated
- Categories for sidebar

### Blog Detail (`/src/app/(public)/blog/[slug]/page.tsx`)
Server component with ISR and static params generation:

**Features**:
- Full post content (HTML from Tiptap)
- Featured image
- Author and publish date
- Category badge
- Related posts (3 from same category)
- Share buttons
- Reading time estimate
- SEO metadata

**Static Generation**:
- Uses `generateStaticParams()` for all published posts
- Revalidates every 60 seconds
- Falls back to on-demand if new post published

### Dynamic CMS Page (`/src/app/(public)/[slug]/page.tsx`)
Server component with template support and ISR:

**Features**:
- Three template layouts:
  - **Default**: Centered content max-width
  - **Full Width**: Full-width content with featured image
  - **Sidebar**: 2-column layout with quick links
- Featured image display
- HTML content rendering
- SEO metadata (meta_title, meta_description)
- Static params generation
- ISR revalidation (120s)

## Security & Validation

### Authentication & Authorization
- All server actions check `auth.getUser()` first
- Role-based access: requires `content_admin` or `super_admin`
- Uses `getUserRoles()` and `canManageContent()` helpers

### Input Validation
- Zod schemas: `cmsPageSchema`, `blogPostSchema`
- Slug validation: `/^[a-z0-9-]+$/`
- Title: 1-200 chars
- Meta title: max 70 chars (SEO)
- Meta description: max 160 chars (SEO)
- Category ID: valid UUID or empty
- File uploads: validated by Supabase Storage rules

### Error Handling
- Try-catch blocks in all server actions
- Validation errors returned to client
- User-friendly error messages
- Graceful error fallbacks

## Usage Guide

### Creating a CMS Page

1. Go to `/admin/content/pages`
2. Click "Create Page"
3. Enter title (slug auto-generates)
4. Select template (default/full-width/sidebar)
5. Set sort order if needed
6. Upload featured image (optional)
7. Fill meta title and description for SEO
8. Write content using Tiptap editor
9. Click "Save Draft" to save without publishing
10. Click "Publish" to make live

**Page is now available at** `/<slug>`

### Creating a Blog Post

1. Go to `/admin/content/blog`
2. Click "Create Post"
3. Enter title (slug auto-generates)
4. Select category
5. Write excerpt (shown in listings)
6. Upload featured image
7. Fill meta title and description
8. Toggle "Feature this post" if prominent placement wanted
9. Write content using Tiptap editor
10. Click "Publish" to make live

**Post is now available at** `/blog/<slug>`

### Managing Media

1. Go to `/admin/content/media`
2. Upload files via:
   - Drag & drop zone
   - Click "Choose File" button
3. Add alt text for images (accessibility)
4. Files appear in grid view
5. Click "Copy" to copy URL
6. Click delete button to remove

**URLs format**: `https://your-domain.com/storage/v1/object/public/content/media/<filename>`

### Creating Blog Categories

Currently managed via database, but can add admin UI:

**SQL to add category**:
```sql
INSERT INTO blog_categories (name, slug, description, sort_order)
VALUES ('Technology', 'technology', 'Tech-related posts', 1);
```

## Customization

### Adding More Templates
Extend `template` field in `cms_pages`:

```typescript
// In [slug]/page.tsx
case 'two-column':
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Your layout */}
    </div>
  );
```

### Customizing Tiptap Toolbar
Edit `/src/components/cms/TiptapEditor.tsx`:
- Add extensions (table, emoji, mentions)
- Customize toolbar buttons
- Add custom formatting options

### Changing Colors
- Brand color defined in Tailwind config
- Current brand-500: #1B3A5C
- Update in `tailwind.config.ts`

### File Upload Storage
- Uses Supabase Storage bucket: `content`
- Path: `media/<filename>`
- Configurable in `uploadMedia()` action
- Max file size: Supabase bucket config

## API Endpoints (Server Actions)

All actions in `/src/lib/actions/content-actions.ts`:

```typescript
// Pages
POST /actions/createPage
POST /actions/updatePage
POST /actions/publishPage
POST /actions/unpublishPage
POST /actions/archivePage
DELETE /actions/deletePage

// Blog Posts
POST /actions/createBlogPost
POST /actions/updateBlogPost
POST /actions/publishBlogPost
POST /actions/unpublishBlogPost
POST /actions/archiveBlogPost
DELETE /actions/deleteBlogPost

// Categories
POST /actions/createBlogCategory
POST /actions/updateBlogCategory
DELETE /actions/deleteBlogCategory

// Media
POST /actions/uploadMedia
DELETE /actions/deleteMedia
```

## Performance Optimizations

1. **ISR (Incremental Static Regeneration)**:
   - CMS Pages: revalidate 120s
   - Blog Listing: revalidate 60s
   - Blog Posts: revalidate 60s
   - Automatic static params generation

2. **Database Queries**:
   - Only select published content on public
   - Efficient joins with categories/authors
   - Pagination to limit results

3. **Image Optimization**:
   - Next.js Image component with optimization
   - Responsive srcset generation
   - Format optimization (WebP where supported)

4. **Caching**:
   - revalidateTag() for targeted invalidation
   - revalidatePath() for route-specific cache
   - Server-side rendering where beneficial

## SEO Features

- Meta titles (custom or defaults to page/post title)
- Meta descriptions (custom or excerpt)
- Open Graph tags (title, description, image)
- Structured data in HTML
- Canonical URLs
- Dynamic sitemap via Next.js

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps for Production

1. **Email Notifications**: Add Resend email on post publish
2. **Comments System**: Add Supabase storage for comments
3. **Advanced Analytics**: Track page views and user engagement
4. **Scheduling**: Allow scheduling posts for future publish
5. **Versioning**: Keep revision history of content
6. **Collaborative Editing**: Real-time editing for multiple admins
7. **Webhooks**: Notify external services on publish
8. **API Documentation**: Create GraphQL/REST API for content

## Troubleshooting

### Media Upload Fails
- Check Supabase Storage bucket exists and is public
- Verify bucket name is `content`
- Check file size limits
- Ensure user has storage permissions

### Pages Not Appearing
- Check status is "published"
- Check slug doesn't have special characters
- Clear Next.js cache: `npm run build`
- Verify ISR revalidation has completed

### Tiptap Editor Not Working
- Check @tiptap packages installed
- Verify TiptapEditor component path
- Check browser console for errors
- Ensure client component directive ('use client')

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify authentication tokens
4. Check file permissions
5. Review validation schemas

---

**Build Date**: April 6, 2026
**Framework**: Next.js 14
**Status**: Production Ready
