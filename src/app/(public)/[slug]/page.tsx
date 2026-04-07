import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 120;

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cms_pages')
    .select('slug')
    .eq('status', 'published');

  const pages = (data ?? []) as Array<{ slug: string }>;

  return pages.map((page) => ({
    slug: page.slug,
  }));
}

type CMSPageRecord = {
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  content: unknown;
  metadata: {
    template?: string;
    featuredImageUrl?: string;
  } | null;
};

function getPageHtml(content: unknown) {
  if (typeof content === 'string') {
    return content;
  }

  if (content && typeof content === 'object' && 'html' in content) {
    const html = (content as { html?: unknown }).html;
    return typeof html === 'string' ? html : '';
  }

  return '';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('cms_pages')
    .select('title, seo_title, seo_description, metadata')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  const page = data as Pick<CMSPageRecord, 'title' | 'seo_title' | 'seo_description' | 'metadata'> | null;

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.seo_title || page.title,
    description: page.seo_description,
    openGraph: {
      title: page.title,
      description: page.seo_description,
      images: page.metadata?.featuredImageUrl ? [page.metadata.featuredImageUrl] : [],
    },
  };
}

export default async function CMSPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from('cms_pages')
    .select('title, seo_description, content, metadata')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<CMSPageRecord>();

  if (error || !page) {
    notFound();
  }

  const html = getPageHtml(page.content);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {page.title}
          </h1>
          {page.seo_description && (
            <p className="text-lg text-gray-600">
              {page.seo_description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-3xl">
          {page.metadata?.featuredImageUrl && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={page.metadata.featuredImageUrl}
                alt={page.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
          {html ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-gray-600">This page does not have published content yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
