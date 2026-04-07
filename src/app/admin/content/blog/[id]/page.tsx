'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  deleteBlogPost,
} from '@/lib/actions/content-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import TiptapEditor from '@/components/cms/TiptapEditor';
import MediaPicker from '@/components/cms/MediaPicker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Loader2, Trash2, Eye, EyeOff, Archive } from 'lucide-react';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  featured_image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postData, setPostData] = useState<BlogPostData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    featuredImageUrl: '',
  });

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const p = await params;
      setPostId(p.id);

      const supabase = createClient();

      // Fetch post
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', p.id)
        .single();
      const post = data as BlogPostData | null;

      if (error || !post) {
        router.push('/admin/content/blog');
        return;
      }

      setPostData(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        categoryId: post.category_id || '',
        metaTitle: post.seo_title || '',
        metaDescription: post.seo_description || '',
        isFeatured: post.is_featured,
        featuredImageUrl: post.featured_image_url || '',
      });

      // Fetch categories
      const { data: cats } = await supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (cats) setCategories(cats);

      setLoading(false);
    };

    initializeData();
  }, [params, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditorChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, featuredImageUrl: url }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('slug', formData.slug);
      form.append('content', formData.content);
      form.append('excerpt', formData.excerpt);
      form.append('categoryId', formData.categoryId);
      form.append('metaTitle', formData.metaTitle);
      form.append('metaDescription', formData.metaDescription);
      form.append('isFeatured', formData.isFeatured.toString());
      form.append('featuredImageUrl', formData.featuredImageUrl);

      const result = await updateBlogPost(postId, form);

      if (result.error) {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: [result.error] });
        }
      } else if (result.success) {
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setSubmitting(true);
    const result = await publishBlogPost(postId);
    if (result.success) {
      setPostData(prev => prev ? { ...prev, status: 'published' } : null);
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleUnpublish = async () => {
    setSubmitting(true);
    const result = await unpublishBlogPost(postId);
    if (result.success) {
      setPostData(prev => prev ? { ...prev, status: 'draft' } : null);
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleArchive = async () => {
    setSubmitting(true);
    const result = await archiveBlogPost(postId);
    if (result.success) {
      router.push('/admin/content/blog');
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setSubmitting(true);
    const result = await deleteBlogPost(postId);
    if (result.success) {
      router.push('/admin/content/blog');
      router.refresh();
    }
    setSubmitting(false);
  };

  if (!postData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600 mt-1">{formData.title}</p>
        </div>
        <div className="flex gap-2">
          {postData.status === 'published' && (
            <Button
              onClick={handleUnpublish}
              disabled={submitting}
              variant="outline"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          )}
          {postData.status === 'draft' && (
            <Button
              onClick={handlePublish}
              disabled={submitting}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          {postData.status !== 'archived' && (
            <Button
              onClick={handleArchive}
              disabled={submitting}
              variant="outline"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={submitting}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Errors */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-600">
            {errors.general.join(', ')}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Title */}
            <Card className="p-6">
              <Label htmlFor="title" className="block text-sm font-medium mb-2">
                Post Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
                className="mb-1"
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title[0]}</p>
              )}
            </Card>

            {/* Slug */}
            <Card className="p-6">
              <Label htmlFor="slug" className="block text-sm font-medium mb-2">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="post-slug"
                className="mb-1"
              />
              {errors.slug && (
                <p className="text-xs text-red-600">{errors.slug[0]}</p>
              )}
            </Card>

            {/* Category */}
            <Card className="p-6">
              <Label htmlFor="categoryId" className="block text-sm font-medium mb-2">
                Category
              </Label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Card>

            {/* Featured Image */}
            <Card className="p-6">
              <Label className="block text-sm font-medium mb-2">
                Featured Image
              </Label>
              {formData.featuredImageUrl && (
                <div className="mb-3">
                  <img
                    src={formData.featuredImageUrl}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowMediaPicker(true)}
              >
                Change Image
              </Button>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Excerpt */}
            <Card className="p-6">
              <Label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief summary of the post"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/300
              </p>
            </Card>

            {/* Meta Title */}
            <Card className="p-6">
              <Label htmlFor="metaTitle" className="block text-sm font-medium mb-2">
                Meta Title (SEO)
              </Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="Leave empty to use post title"
                className="mb-1 text-sm"
              />
              <p className="text-xs text-gray-500">
                {formData.metaTitle.length}/70
              </p>
            </Card>

            {/* Meta Description */}
            <Card className="p-6">
              <Label htmlFor="metaDescription" className="block text-sm font-medium mb-2">
                Meta Description (SEO)
              </Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="Leave empty to auto-generate"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160
              </p>
            </Card>

            {/* Featured Toggle & Status */}
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured" className="text-sm font-medium">
                    Feature this post
                  </Label>
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Featured posts will be displayed prominently
                </p>
              </div>
            </Card>

            {/* Status Info */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
              <p className="text-sm text-gray-600 capitalize">
                {postData.status}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(postData.created_at).toLocaleDateString()}
              </p>
              {postData.published_at && (
                <p className="text-xs text-gray-500">
                  Published: {new Date(postData.published_at).toLocaleDateString()}
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Content Editor */}
        <Card className="p-6">
          <Label className="block text-sm font-medium mb-3">Post Content</Label>
          <TiptapEditor
            content={formData.content}
            onChange={handleEditorChange}
            placeholder="Write your blog post here..."
          />
          {errors.content && (
            <p className="text-xs text-red-600 mt-2">{errors.content[0]}</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/admin/content/blog">
            <Button type="button" variant="outline">
              Back
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>

      {/* Media Picker */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleImageSelect}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The blog post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
