import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserRoles, canManageContent } from '@/lib/auth/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

export const metadata = {
  title: 'Blog Posts',
  description: 'Manage blog posts',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const roles = await getUserRoles(user.id);
  if (!canManageContent(roles)) redirect('/dashboard');

  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const categoryFilter = params.category || '';

  // Fetch blog posts
  let postsQuery = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name, slug),
      author:auth.users(email)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    postsQuery = postsQuery.eq('status', statusFilter);
  }

  if (categoryFilter) {
    postsQuery = postsQuery.eq('category_id', categoryFilter);
  }

  const { data: posts, error: postsError } = await postsQuery;

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts</p>
        </div>
        <Link href="/admin/content/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-600 self-center">Status:</span>
          <Link href="/admin/content/blog?status=all">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
          </Link>
          <Link href="/admin/content/blog?status=draft">
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
            >
              Draft
            </Button>
          </Link>
          <Link href="/admin/content/blog?status=published">
            <Button
              variant={statusFilter === 'published' ? 'default' : 'outline'}
              size="sm"
            >
              Published
            </Button>
          </Link>
          <Link href="/admin/content/blog?status=archived">
            <Button
              variant={statusFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
            >
              Archived
            </Button>
          </Link>
        </div>

        {categories && categories.length > 0 && (
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-600 self-center">Category:</span>
            <Link href="/admin/content/blog">
              <Button
                variant={!categoryFilter ? 'default' : 'outline'}
                size="sm"
              >
                All
              </Button>
            </Link>
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/admin/content/blog?category=${cat.id}`}>
                <Button
                  variant={categoryFilter === cat.id ? 'default' : 'outline'}
                  size="sm"
                >
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        {(!posts || posts.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <p>No posts found. Create your first post to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post: any) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <p className="truncate">{post.title}</p>
                        {post.is_featured && (
                          <Badge className="mt-1" variant="default">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {post.author?.email || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {post.blog_categories?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(post.status)}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {post.published_at ? formatDate(post.published_at) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/content/blog/${post.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {post.status === 'published' && (
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
