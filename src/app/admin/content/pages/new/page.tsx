'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPage } from '@/lib/actions/content-actions';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import TiptapEditor from '@/components/cms/TiptapEditor';
import MediaPicker from '@/components/cms/MediaPicker';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function NewPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setFormData(prev => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleEditorChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, featuredImageUrl: url }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, publish = false) => {
    e.preventDefault();
    setLoading(true);
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

      const result = (await createPage(form)) as {
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
        router.push(`/admin/content/pages/${result.data.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Page</h1>
        <p className="text-gray-600 mt-1">Add a new page to your website</p>
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
                placeholder="auto-generated-slug"
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
              {errors.sortOrder && (
                <p className="text-xs text-red-600">{errors.sortOrder[0]}</p>
              )}
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
              {errors.metaTitle && (
                <p className="text-xs text-red-600">{errors.metaTitle[0]}</p>
              )}
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
              {errors.metaDescription && (
                <p className="text-xs text-red-600">{errors.metaDescription[0]}</p>
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
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            variant="secondary"
          >
            {loading ? (
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
            disabled={loading}
          >
            {loading ? (
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
