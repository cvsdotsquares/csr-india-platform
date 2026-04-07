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
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'CMS Pages',
  description: 'Manage website pages',
};

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const roles = await getUserRoles(user.id);
  if (!canManageContent(roles)) redirect('/dashboard');

  const params = await searchParams;
  const statusFilter = params.status || 'all';

  let query = supabase
    .from('cms_pages')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: pages, error } = await query;

  if (error) {
    console.error('Error fetching pages:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-gray-600 mt-1">Manage your website pages</p>
        </div>
        <Link href="/admin/content/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/admin/content/pages?status=all">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
        </Link>
        <Link href="/admin/content/pages?status=draft">
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
          >
            Draft
          </Button>
        </Link>
        <Link href="/admin/content/pages?status=published">
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
          >
            Published
          </Button>
        </Link>
        <Link href="/admin/content/pages?status=archived">
          <Button
            variant={statusFilter === 'archived' ? 'default' : 'outline'}
            size="sm"
          >
            Archived
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        {(!pages || pages.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <p>No pages found. Create your first page to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page: any) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <p className="truncate">{page.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {page.slug}
                    </TableCell>
                    <TableCell className="text-sm">
                      {page.metadata?.template || 'default'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(page.status)}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(page.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/content/pages/${page.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {page.status === 'published' && (
                          <Link href={`/${page.slug}`} target="_blank">
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
