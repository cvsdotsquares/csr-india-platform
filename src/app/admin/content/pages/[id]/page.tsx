'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  updatePage,
  publishPage,
  unpublishPage,
  archivePage,
  deletePage,
} from '@/lib/actions/content-actions';
import { slugify } from '@/lib/utils';
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

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  metadata: {
    template?: string;
    featuredImageUrl?: string;
  } | null;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pageId, setPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    template: 'default',
    featuredImageUrl: '',
    sortOrder: '0',
  });

  useEffect(() => {
    const initializeData = async () => {
      const p = await params;
      setPageId(p.id);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', p.id)
        .single();
      const page = data as PageData | null;

      if (error || !page) {
        router.push('/admin/content/pages');
        return;
      }

      setPageData(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: typeof page.content === 'string' ? page.content : JSON.stringify(page.content || {}),
        metaTitle: page.seo_title || '',
        metaDescription: page.seo_description || '',
        template: page.metadata?.template || 'default',
        featuredImageUrl: page.metadata?.featuredImageUrl || '',
        sortOrder: page.display_order.toString(),
      });
    };

    initializeData();
  }, [params, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      form.append('metaTitle', formData.metaTitle);
      form.append('metaDescription', formData.metaDescription);
      form.append('template', formData.template);
      form.append('sortOrder', formData.sortOrder);
      form.append('featuredImageUrl', formData.featuredImageUrl);

      const result = await updatePage(pageId, form);

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
    const result = await publishPage(pageId);
    if (result.success) {
      setPageData(prev => prev ? { ...prev, status: 'published' } : null);
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleUnpublish = async () => {
    setSubmitting(true);
    const result = await unpublishPage(pageId);
    if (result.success) {
      setPageData(prev => prev ? { ...prev, status: 'draft' } : null);
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleArchive = async () => {
    setSubmitting(true);
    const result = await archivePage(pageId);
    if (result.success) {
      router.push('/admin/content/pages');
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setSubmitting(true);
    const result = await deletePage(pageId);
    if (result.success) {
      router.push('/admin/content/pages');
      router.refresh();
    }
    setSubmitting(false);
  };

  if (!pageData) {
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Page</h1>
          <p className="text-gray-600 mt-1">{formData.title}</p>
        </div>
        <div className="flex gap-2">
          {pageData.status === 'published' && (
            <Button
              onClick={handleUnpublish}
              disabled={submitting}
              variant="outline"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          )}
          {pageData.status === 'draft' && (
            <Button
              onClick={handlePublish}
              disabled={submitting}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          {pageData.status !== 'archived' && (
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
                Page Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter page title"
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
                placeholder="page-slug"
                className="mb-1"
              />
              {errors.slug && (
                <p className="text-xs text-red-600">{errors.slug[0]}</p>
              )}
            </Card>

            {/* Template */}
            <Card className="p-6">
              <Label htmlFor="template" className="block text-sm font-medium mb-2">
                Template
              </Label>
              <select
                id="template"
                name="template"
                value={formData.template}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="default">Default</option>
                <option value="full-width">Full Width</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </Card>

            {/* Sort Order */}
            <Card className="p-6">
              <Label htmlFor="sortOrder" className="block text-sm font-medium mb-2">
                Sort Order
              </Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleInputChange}
                className="mb-1"
              />
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
                placeholder="Leave empty to use page title"
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

            {/* Status Info */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
              <p className="text-sm text-gray-600 capitalize">
                {pageData.status}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(pageData.created_at).toLocaleDateString()}
              </p>
              {pageData.published_at && (
                <p className="text-xs text-gray-500">
                  Published: {new Date(pageData.published_at).toLocaleDateString()}
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Content Editor */}
        <Card className="p-6">
          <Label className="block text-sm font-medium mb-3">Page Content</Label>
          <TiptapEditor
            content={formData.content}
            onChange={handleEditorChange}
            placeholder="Write your page content here..."
          />
          {errors.content && (
            <p className="text-xs text-red-600 mt-2">{errors.content[0]}</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/admin/content/pages">
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
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be permanently deleted.
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
