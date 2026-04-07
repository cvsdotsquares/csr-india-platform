import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Blog',
  description: 'Read our latest articles and updates',
};

export const revalidate = 60;

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
};

type BlogListPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  blog_categories?: {
    name: string;
    slug: string;
  } | null;
  auth?: {
    email: string;
  } | null;
};

function formatPublishedDate(date: string | null) {
  return date ? formatDate(date) : 'Unpublished';
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const categoryFilter = params.category || '';
  const page = parseInt(params.page || '1');
  const postsPerPage = 6;
  const offset = (page - 1) * postsPerPage;

  // Fetch featured post
  const { data: featuredPostData } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name, slug),
      auth:author_id(email)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();
  const featuredPost = featuredPostData as BlogListPost | null;

  // Fetch posts
  let postsQuery = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name, slug),
      auth:author_id(email)
    `)
    .eq('status', 'published');

  if (categoryFilter) {
    postsQuery = postsQuery.eq('category_id', categoryFilter);
  }

  const { data: postsData, error: postsError } = await postsQuery
    .order('published_at', { ascending: false })
    .range(offset, offset + postsPerPage - 1);
  const posts = (postsData ?? []) as BlogListPost[];

  // Fetch total count
  let countQuery = supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  if (categoryFilter) {
    countQuery = countQuery.eq('category_id', categoryFilter);
  }

  const { count: totalPosts } = await countQuery;
  const totalPages = Math.ceil((totalPosts || 0) / postsPerPage);

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  const categories = (categoriesData ?? []) as BlogCategory[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-brand-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-brand-100">
            Stay updated with our latest news, insights, and stories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Post */}
            {featuredPost && !categoryFilter && (
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {featuredPost.featured_image_url && (
                    <div className="relative h-64 md:h-80">
                      <Image
                        src={featuredPost.featured_image_url}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col justify-center">
                    <Badge className="w-fit mb-3" variant="default">
                      Featured
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {featuredPost.blog_categories && (
                        <span className="text-brand-600 font-medium">
                          {featuredPost.blog_categories.name}
                        </span>
                      )}
                      <span>{formatPublishedDate(featuredPost.published_at)}</span>
                    </div>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button>
                        Read More
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image_url && (
                    <div className="relative h-48">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {post.blog_categories && (
                      <Badge variant="secondary" className="mb-2">
                        {post.blog_categories.name}
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                      {formatPublishedDate(post.published_at)}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link href={`/blog?page=${page - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  >
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                    >
                      {p}
                    </Button>
                  </Link>
                ))}

                {page < totalPages && (
                  <Link href={`/blog?page=${page + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  <Link href="/blog">
                    <Button
                      variant={!categoryFilter ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      All Posts
                    </Button>
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/blog?category=${cat.id}`}>
                      <Button
                        variant={categoryFilter === cat.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        {cat.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Newsletter */}
            <Card className="p-6 bg-brand-50 border-brand-200">
              <h3 className="text-lg font-bold mb-2">Subscribe</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get the latest posts delivered to your inbox
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                />
                <Button className="w-full" type="submit">
                  Subscribe
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
