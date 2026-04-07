import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROLE_LABELS } from '@/config/roles';
import { formatDate } from '@/lib/utils';
import UserRoleManager from '@/components/admin/UserRoleManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  created_at: string;
};

type RoleRow = {
  id: string;
  name: string;
};

type UserRoleRow = {
  user_id: string;
  role_id: string;
  roles: RoleRow | null;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createAdminClient();
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  let q = supabase
    .from('profiles')
    .select('id, email, full_name, organization, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (query) {
    q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data: users, count } = await q;
  const { data: allRoles } = await supabase
    .from('roles')
    .select('id, name')
    .order('name');
  const userIds = (users || []).map((user) => user.id);
  const { data: userRoleRows } = userIds.length > 0
    ? await supabase
        .from('user_roles')
        .select('user_id, role_id, roles(id, name)')
        .in('user_id', userIds)
    : { data: [] as UserRoleRow[] };

  const rolesByUserId = (userRoleRows || []).reduce<Record<string, UserRoleRow[]>>(
    (acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = [];
      }
      acc[row.user_id].push(row);
      return acc;
    },
    {}
  );

  const hydratedUsers = ((users || []) as ProfileRow[]).map((user) => ({
    ...user,
    user_roles: rolesByUserId[user.id] || [],
  }));

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage user accounts and roles</p>
      </div>

      <form className="flex gap-3">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search by name or email..."
          className="flex-1"
        />
        <Button
          type="submit"
          className="bg-[#1B3A5C] hover:bg-[#152a47] text-white"
        >
          Search
        </Button>
      </form>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hydratedUsers.length > 0 ? (
              hydratedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.user_roles && user.user_roles.length > 0 ? (
                        user.user_roles.map((ur) => (
                          <Badge key={ur.role_id} variant="secondary">
                            {ROLE_LABELS[ur.roles?.name] ||
                              ur.roles?.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No roles
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.organization || '-'}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <UserRoleManager
                      userId={user.id}
                      currentRoles={
                        user.user_roles?.map((ur) => ur.roles?.name).filter(Boolean) ||
                        []
                      }
                      allRoles={allRoles || []}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {hydratedUsers.length} of {count || 0} users
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <a href={`?q=${query}&page=${page - 1}`}>
              <Button variant="outline">Previous</Button>
            </a>
          )}
          <span className="px-3 py-2 text-sm">
            Page {page} of {totalPages || 1}
          </span>
          {page < (totalPages || 1) && (
            <a href={`?q=${query}&page=${page + 1}`}>
              <Button variant="outline">Next</Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
