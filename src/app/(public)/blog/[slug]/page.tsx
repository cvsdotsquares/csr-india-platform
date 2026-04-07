import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type BlogPostMeta = {
  title: string;
  slug: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
};

type BlogPostPageRecord = BlogPostMeta & {
  id: string;
  content: string;
  published_at: string | null;
  category_id: string | null;
  blog_categories?: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  auth?: {
    email: string;
  } | null;
};

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  const posts = (data ?? []) as Array<{ slug: string }>;

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  const post = data as BlogPostMeta | null;

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: postData, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(id, name, slug),
      auth:author_id(email)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  const post = postData as BlogPostPageRecord | null;

  if (error || !post) {
    notFound();
  }

  let relatedPostsData: BlogPostPageRecord[] = [];

  if (post.category_id) {
    const { data } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name)
      `)
      .eq('status', 'published')
      .neq('id', post.id)
      .eq('category_id', post.category_id)
      .order('published_at', { ascending: false })
      .limit(3);

    relatedPostsData = (data ?? []) as BlogPostPageRecord[];
  }
  const relatedPosts = relatedPostsData;
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-3xl">
            {post.blog_categories && (
              <Badge variant="secondary" className="mb-3">
                {post.blog_categories.name}
              </Badge>
            )}
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">{post.auth?.email || 'Author'}</p>
                <p>{formatDate(post.published_at!)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="border-t pt-12">
                <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Card key={related.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {related.featured_image_url && (
                        <div className="relative h-40">
                          <Image
                            src={related.featured_image_url}
                            alt={related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {related.blog_categories && (
                          <Badge variant="secondary" className="mb-2">
                            {related.blog_categories.name}
                          </Badge>
                        )}
                        <h3 className="font-bold mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {related.excerpt}
                        </p>
                        <Link href={`/blog/${related.slug}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Info */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Post Info</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium text-brand-600">
                    {post.blog_categories?.name || 'Uncategorized'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Published</p>
                  <p className="font-medium">
                    {formatDate(post.published_at!)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Reading Time</p>
                  <p className="font-medium">
                    {Math.ceil((post.content?.split(/\s+/).length || 0) / 200)} min read
                  </p>
                </div>
              </div>
            </Card>

            {/* Share */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Share</h3>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link
                    href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`}
                  >
                    Share via Email
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
