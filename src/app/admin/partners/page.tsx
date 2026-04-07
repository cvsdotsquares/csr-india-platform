import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

type Partner = {
  id: string;
  name: string;
  tier: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export default async function AdminPartnersPage() {
  const supabase = createAdminClient();
  const { data: partners, error } = await supabase
    .from('partners')
    .select('id, name, tier, website_url, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const rows = (partners || []) as Partner[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
        <p className="text-gray-600 mt-1">View and manage partner records</p>
      </div>

      <Card className="p-4 text-sm text-gray-600">
        Partner creation and editing screens are not built yet. This page shows the current partner data in the database.
      </Card>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-600">
                  Failed to load partners
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell className="capitalize">{partner.tier || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={partner.is_active ? 'success' : 'secondary'}>
                      {partner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-500 hover:underline"
                      >
                        Open link
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{partner.sort_order}</TableCell>
                  <TableCell>{formatDate(partner.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No partners found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
