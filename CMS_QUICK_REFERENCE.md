# CMS Module - Quick Reference Guide

## File Structure at a Glance

```
src/
├── lib/actions/
│   └── content-actions.ts          (800 lines) Server actions for all CMS operations
│
├── components/cms/
│   ├── TiptapEditor.tsx            (400 lines) Rich text editor component
│   └── MediaPicker.tsx             (450 lines) Media selection dialog
│
├── app/admin/content/
│   ├── pages/
│   │   ├── page.tsx                (80 lines) List all pages
│   │   ├── new/page.tsx            (350 lines) Create page form
│   │   └── [id]/page.tsx           (400 lines) Edit page form
│   │
│   ├── blog/
│   │   ├── page.tsx                (140 lines) List all blog posts
│   │   ├── new/page.tsx            (400 lines) Create blog form
│   │   └── [id]/page.tsx           (450 lines) Edit blog form
│   │
│   └── media/
│       └── page.tsx                (400 lines) Media library
│
└── app/(public)/
    ├── blog/
    │   ├── page.tsx                (300 lines) Blog listing
    │   └── [slug]/page.tsx         (350 lines) Blog post detail
    │
    └── [slug]/page.tsx             (171 lines) Dynamic CMS page
```

## Key Paths

### Admin Dashboard
- `/admin/content/pages` - CMS Pages list
- `/admin/content/pages/new` - Create page
- `/admin/content/pages/[id]` - Edit page
- `/admin/content/blog` - Blog posts list
- `/admin/content/blog/new` - Create post
- `/admin/content/blog/[id]` - Edit post
- `/admin/content/media` - Media library

### Public Routes
- `/blog` - Blog listing
- `/blog/[slug]` - Blog post detail
- `/[slug]` - Dynamic CMS page

## Function Reference

### CMS Pages Actions
```typescript
createPage(formData: FormData)           // Create new page
updatePage(pageId: string, formData)    // Update existing page
publishPage(pageId: string)             // Publish page
unpublishPage(pageId: string)           // Unpublish to draft
archivePage(pageId: string)             // Archive page
deletePage(pageId: string)              // Delete permanently
```

### Blog Actions
```typescript
createBlogPost(formData: FormData)          // Create post
updateBlogPost(postId: string, formData)   // Update post
publishBlogPost(postId: string)            // Publish post
unpublishBlogPost(postId: string)          // Unpublish post
archiveBlogPost(postId: string)            // Archive post
deleteBlogPost(postId: string)             // Delete post
createBlogCategory(formData: FormData)     // Create category
updateBlogCategory(catId, formData)       // Update category
deleteBlogCategory(categoryId: string)    // Delete category
```

### Media Actions
```typescript
uploadMedia(formData: FormData)     // Upload file
deleteMedia(mediaId: string)        // Delete file
```

## Component Props

### TiptapEditor
```typescript
<TiptapEditor
  content={string}           // Initial HTML content
  onChange={(html) => void}  // Called on content change
  placeholder="..."          // Editor placeholder
/>
```

### MediaPicker
```typescript
<MediaPicker
  onSelect={(url) => void}   // Called when media selected
  isOpen={boolean}           // Dialog open state
  onClose={() => void}       // Close handler
  mediaAssets={Asset[]}      // List of uploaded assets
  isLoading={boolean}        // Loading state
/>
```

## Database Tables

### cms_pages
```
id, title, slug, content, meta_title, meta_description,
template, featured_image_url, status, created_by, published_at,
sort_order, created_at, updated_at
```

### blog_posts
```
id, title, slug, content, excerpt, featured_image_url,
category_id, author_id, meta_title, meta_description,
status, is_featured, published_at, created_at, updated_at
```

### blog_categories
```
id, name, slug, description, sort_order, created_at
```

### media_assets
```
id, filename, original_filename, file_url, file_size,
mime_type, media_type, alt_text, uploaded_by, created_at
```

## Status Values
- `draft` - Not yet published
- `published` - Live on website
- `archived` - Hidden but not deleted

## Template Types (CMS Pages)
- `default` - Centered max-width content
- `full-width` - Full-width layout
- `sidebar` - 2-column with sidebar

## Media Types (Automatic)
- `image` - For image/* MIME types
- `video` - For video/* MIME types
- `document` - For PDF and other files

## Validation Rules

### Slugs
- Pattern: `/^[a-z0-9-]+$/`
- Lowercase, numbers, hyphens only
- Auto-generated from title

### SEO Fields
- Meta Title: max 70 characters
- Meta Description: max 160 characters

### Content
- Minimum 1 character required
- Stored as HTML from Tiptap
- Supports images, links, all text formatting

## Server Actions Features
✓ User authentication check
✓ Role-based access control
✓ Input validation with Zod
✓ Automatic revalidation
✓ Error handling and messages
✓ Successful operation confirmation

## Revalidation Strategy

**CMS Pages**:
- `revalidatePath('/admin/content/pages')`
- `revalidateTag('cms-pages')`
- `revalidatePath('/[slug]', 'page')`

**Blog Posts**:
- `revalidatePath('/admin/content/blog')`
- `revalidateTag('blog-posts')`
- `revalidatePath('/blog')`
- `revalidatePath('/blog/[slug]', 'page')`

## ISR Configuration

**Blog Pages**: `revalidate = 60` (60 seconds)
**CMS Pages**: `revalidate = 120` (120 seconds)

## Security Requirements

All admin operations require:
1. User authentication (`auth.getUser()`)
2. `content_admin` or `super_admin` role
3. Valid input validation
4. CORS headers configured

## Usage Examples

### Create CMS Page
```typescript
const form = new FormData();
form.append('title', 'About Us');
form.append('slug', 'about-us');
form.append('content', '<h1>About</h1><p>...</p>');
form.append('template', 'default');
form.append('metaTitle', 'About Us - CSR India');
form.append('metaDescription', 'Learn more about us');

const result = await createPage(form);
```

### Create Blog Post
```typescript
const form = new FormData();
form.append('title', 'Latest News');
form.append('slug', 'latest-news');
form.append('content', '<p>Post content...</p>');
form.append('categoryId', 'category-uuid');
form.append('excerpt', 'Brief summary');
form.append('isFeatured', 'true');

const result = await createBlogPost(form);
```

### Upload Media
```typescript
const form = new FormData();
form.append('file', fileInputElement.files[0]);
form.append('altText', 'Image description');

const result = await uploadMedia(form);
// Returns: { success: true, data: { file_url, ... } }
```

## Error Handling

All actions return:
```typescript
{
  success: true,
  data: { /* returned object */ }
}
// or
{
  error: 'Error message' | Record<string, string[]>
}
```

Validation errors include field-specific messages:
```typescript
{
  error: {
    title: ['Title is required'],
    slug: ['Invalid slug format']
  }
}
```

## Performance Tips

1. **Drafts**: Save as draft during creation
2. **Images**: Optimize before uploading (< 2MB ideal)
3. **Content**: Use Tiptap sparingly (large HTML = slow pages)
4. **Categories**: Limit to < 50 for performance
5. **Related Posts**: Already optimized in blog detail

## Troubleshooting Checklist

- [ ] User has `content_admin` role
- [ ] Supabase bucket 'content' exists and is public
- [ ] Database tables created with correct schema
- [ ] Page/post slug is unique
- [ ] Meta title < 70 characters
- [ ] Meta description < 160 characters
- [ ] Content is not empty
- [ ] File upload < storage limit
- [ ] Browser cache cleared

## Related Files to Review

- `/src/lib/validations/content.ts` - Zod schemas
- `/src/lib/auth/helpers.ts` - Auth utilities
- `/src/config/navigation.ts` - Admin navigation
- `/tailwind.config.ts` - Color configuration
- Supabase RLS policies for tables

---

**Last Updated**: April 6, 2026
**Version**: 1.0 - Production Ready
