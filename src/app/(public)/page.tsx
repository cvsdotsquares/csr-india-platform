import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 60;

type FeaturedEvent = {
  slug: string;
  title: string;
};

type RecentPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
};

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  tier: string | null;
  website_url: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const featuredEventResult = await supabase
    .from('events')
    .select('slug, title')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  const featuredEvent = featuredEventResult.data as FeaturedEvent | null;

  const recentPostsResult = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3);
  const recentPosts = (recentPostsResult.data ?? []) as RecentPost[];

  const partnersResult = await supabase
    .from('partners')
    .select('id, name, logo_url, tier, website_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  const partners = (partnersResult.data ?? []) as Partner[];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-500 py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl font-bold">CSR India</h1>
          <p className="mt-4 text-xl text-brand-100">
            India's Premier Platform for CSR Events &amp; Knowledge Sharing
          </p>
          {featuredEvent && (
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="mt-8 inline-block rounded-lg bg-accent-500 px-8 py-4 text-lg font-semibold text-white hover:bg-accent-600 transition-colors"
            >
              Register for {featuredEvent.title}
            </Link>
          )}
        </div>
      </section>

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-brand-500">Latest Updates</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-heading text-xl font-semibold group-hover:text-brand-500">{post.title}</h3>
                  {post.excerpt && <p className="mt-2 text-gray-600 line-clamp-3">{post.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-brand-500">Our Partners</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              {partners.map((partner) => (
                <div key={partner.id} className="text-gray-600">{partner.name}</div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
