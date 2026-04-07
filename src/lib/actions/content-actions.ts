'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { cmsPageSchema, blogPostSchema } from '@/lib/validations/content';
import { canManageContent } from '@/lib/auth/helpers';
import { getUserRoles } from '@/lib/auth/helpers';
import type { Database } from '@/types/database';

type CmsPage = Database['public']['Tables']['cms_pages']['Row'];
type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];
type MediaAsset = Database['public']['Tables']['media_assets']['Row'];

type CmsPageMetadata = {
  template?: string;
  featuredImageUrl?: string;
};

// ============================================================================
// CMS PAGES
// ============================================================================

export async function createPage(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = cmsPageSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      template: raw.template,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('cms_pages') as any)
      .insert({
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        seo_title: parsed.data.metaTitle,
        seo_description: parsed.data.metaDescription,
        metadata: {
          template: parsed.data.template,
          featuredImageUrl: raw.featuredImageUrl || null,
        } satisfies CmsPageMetadata,
        display_order: parsed.data.sortOrder,
        status: 'draft',
        author_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidateTag('cms-pages');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function updatePage(pageId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = cmsPageSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      template: raw.template,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('cms_pages') as any)
      .update({
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        seo_title: parsed.data.metaTitle,
        seo_description: parsed.data.metaDescription,
        metadata: {
          template: parsed.data.template,
          featuredImageUrl: raw.featuredImageUrl || null,
        } satisfies CmsPageMetadata,
        display_order: parsed.data.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidatePath(`/[slug]`, 'page');
    revalidateTag('cms-pages');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function publishPage(pageId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('cms_pages') as any)
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidatePath(`/[slug]`, 'page');
    revalidateTag('cms-pages');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function unpublishPage(pageId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('cms_pages') as any)
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidateTag('cms-pages');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function archivePage(pageId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('cms_pages') as any)
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidateTag('cms-pages');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deletePage(pageId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/pages');
    revalidateTag('cms-pages');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export async function createBlogPost(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = blogPostSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      excerpt: raw.excerpt || undefined,
      categoryId: raw.categoryId || undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      isFeatured: raw.isFeatured === 'true',
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .insert({
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        excerpt: parsed.data.excerpt,
        category_id: parsed.data.categoryId || null,
        seo_title: parsed.data.metaTitle,
        seo_description: parsed.data.metaDescription,
        is_featured: parsed.data.isFeatured,
        featured_image_url: raw.featuredImageUrl || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-posts');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function updateBlogPost(postId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const parsed = blogPostSchema.safeParse({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      excerpt: raw.excerpt || undefined,
      categoryId: raw.categoryId || undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      isFeatured: raw.isFeatured === 'true',
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .update({
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        excerpt: parsed.data.excerpt,
        category_id: parsed.data.categoryId || null,
        seo_title: parsed.data.metaTitle,
        seo_description: parsed.data.metaDescription,
        is_featured: parsed.data.isFeatured,
        featured_image_url: raw.featuredImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidatePath(`/blog/[slug]`, 'page');
    revalidateTag('blog-posts');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function publishBlogPost(postId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidatePath('/blog');
    revalidateTag('blog-posts');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function unpublishBlogPost(postId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-posts');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function archiveBlogPost(postId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-posts');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deleteBlogPost(postId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-posts');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

// ============================================================================
// BLOG CATEGORIES
// ============================================================================

export async function createBlogCategory(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const { data, error } = await (supabase
      .from('blog_categories') as any)
      .insert({
        name: raw.name,
        slug: raw.slug,
        description: raw.description || null,
        sort_order: raw.sortOrder ? Number(raw.sortOrder) : 0,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-categories');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function updateBlogCategory(categoryId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const raw = Object.fromEntries(formData);

    const { data, error } = await (supabase
      .from('blog_categories') as any)
      .update({
        name: raw.name,
        slug: raw.slug,
        description: raw.description || null,
        sort_order: raw.sortOrder ? Number(raw.sortOrder) : 0,
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-categories');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deleteBlogCategory(categoryId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/content/blog');
    revalidateTag('blog-categories');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

// ============================================================================
// MEDIA ASSETS
// ============================================================================

export async function uploadMedia(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `media/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    // Determine media type based on MIME type
    let mediaType = 'document';
    if (file.type.startsWith('image/')) mediaType = 'image';
    else if (file.type.includes('video')) mediaType = 'video';
    else if (file.type.includes('pdf')) mediaType = 'document';

    const { data, error: dbError } = await (supabase
      .from('media_assets') as any)
      .insert({
        filename: fileName,
        original_filename: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        media_type: mediaType,
        alt_text: formData.get('altText') as string || null,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      return { error: dbError.message };
    }

    revalidatePath('/admin/content/media');
    revalidateTag('media-assets');
    return { success: true, data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function deleteMedia(mediaId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const roles = await getUserRoles(user.id);
    if (!canManageContent(roles)) {
      return { error: 'Forbidden' };
    }

    // Get the media file first to delete from storage
    const { data: mediaData, error: fetchError } = await supabase
      .from('media_assets')
      .select('filename')
      .eq('id', mediaId)
      .single();
    const media = mediaData as { filename: string } | null;

    if (fetchError || !media) {
      return { error: 'Media not found' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('content')
      .remove([`media/${media.filename}`]);

    if (storageError) {
      return { error: storageError.message };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      return { error: dbError.message };
    }

    revalidatePath('/admin/content/media');
    revalidateTag('media-assets');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred' };
  }
}
