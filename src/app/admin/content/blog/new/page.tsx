'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createBlogPost } from '@/lib/actions/content-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import TiptapEditor from '@/components/cms/TiptapEditor';
import MediaPicker from '@/components/cms/MediaPicker';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);
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
    const fetchCategories = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
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

      const result = (await createBlogPost(form)) as {
        success?: boolean;
        error?: string | Record<string, string[]>;
        data?: { id: string };
      };

      if (result.error) {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: [result.error] });
        }
      } else if (result.success && result.data?.id) {
        router.push(`/admin/content/blog/${result.data.id}`);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Blog Post</h1>
        <p className="text-gray-600 mt-1">Write a new blog post</p>
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
                placeholder="auto-generated-slug"
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
                Select Image
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
              {errors.excerpt && (
                <p className="text-xs text-red-600">{errors.excerpt[0]}</p>
              )}
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

            {/* Featured Toggle */}
            <Card className="p-6">
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
              <p className="text-xs text-gray-500 mt-2">
                Featured posts will be displayed prominently
              </p>
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
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            variant="secondary"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Draft'
            )}
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
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
    </div>
  );
}
