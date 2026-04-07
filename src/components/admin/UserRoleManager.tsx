'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addUserRole, removeUserRole } from '@/lib/actions/admin-actions';
import { ROLE_LABELS } from '@/config/roles';
import { ChevronDown, X, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface Role {
  id: string;
  name: string;
}

interface UserRoleManagerProps {
  userId: string;
  currentRoles: string[];
  allRoles: Role[];
}

export default function UserRoleManager({
  userId,
  currentRoles,
  allRoles,
}: UserRoleManagerProps) {
  const [roles, setRoles] = useState<string[]>(currentRoles);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const availableRoles = allRoles.filter(
    role => !roles.includes(role.name)
  );

  const handleAddRole = (roleId: string, roleName: string) => {
    setError(null);
    startTransition(async () => {
      const result = await addUserRole(userId, roleId);
      if (result.error) {
        setError(result.error);
      } else {
        setRoles([...roles, roleName]);
      }
    });
  };

  const handleRemoveRole = (roleId: string, roleName: string) => {
    setError(null);
    startTransition(async () => {
      const result = await removeUserRole(userId, roleId);
      if (result.error) {
        setError(result.error);
      } else {
        setRoles(roles.filter(r => r !== roleName));
      }
    });
  };

  const roleIdMap = allRoles.reduce(
    (acc, role) => {
      acc[role.name] = role.id;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {roles.map(roleName => (
          <Badge
            key={roleName}
            variant="secondary"
            className="flex items-center gap-1 pr-0"
          >
            <span>{ROLE_LABELS[roleName] || roleName}</span>
            <button
              disabled={isPending}
              onClick={() => {
                const roleId = roleIdMap[roleName];
                handleRemoveRole(roleId, roleName);
              }}
              className="ml-1 p-0.5 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {availableRoles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                className="text-xs h-6"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Add Role
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableRoles.map(role => (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => handleAddRole(role.id, role.name)}
                  disabled={isPending}
                >
                  {ROLE_LABELS[role.name] || role.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
