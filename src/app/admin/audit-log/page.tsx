'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAuditLogs } from '@/lib/actions/admin-actions';
import { formatDate } from '@/lib/utils';
import { Loader2, Eye } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-blue-100 text-blue-800',
  update: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  waitlist: 'bg-purple-100 text-purple-800',
  checkin: 'bg-indigo-100 text-indigo-800',
  publish: 'bg-green-100 text-green-800',
  archive: 'bg-gray-100 text-gray-800',
  login: 'bg-cyan-100 text-cyan-800',
  role_assign: 'bg-blue-100 text-blue-800',
  role_revoke: 'bg-red-100 text-red-800',
  export: 'bg-orange-100 text-orange-800',
  bulk_action: 'bg-pink-100 text-pink-800',
};

const ACTIONS = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'waitlist',
  'checkin',
  'publish',
  'archive',
  'login',
  'role_assign',
  'role_revoke',
  'export',
  'bulk_action',
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [selectedAction, page]);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const result = (await getAuditLogs(
        {
          action: selectedAction === 'all' ? undefined : selectedAction,
        },
        page,
        20
      )) as {
        success?: boolean;
        error?: string;
        data?: AuditLog[];
        totalPages?: number;
      };

      if (result.success) {
        setLogs(result.data || []);
        setTotalPages(result.totalPages || 1);
      } else if (result.error) {
        setLogs([]);
        setTotalPages(1);
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  const getActionBadge = (action: string) => {
    return (
      <Badge className={ACTION_COLORS[action] || 'bg-gray-100'}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">
          Track all system activities and changes
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="w-72">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Action
          </label>
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map(action => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-center">
                    More
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDate(log.created_at, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            System
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="font-medium capitalize">
                          {log.entity_type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {log.entity_id ? `ID: ${log.entity_id.slice(0, 8)}...` : '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.new_data &&
                          Object.keys(log.new_data).length >
                            0 ? (
                          <p>
                            {Object.keys(
                              log.new_data
                            )[0]
                              .replace(/_/g, ' ')
                              .substring(0, 30)}
                            ...
                          </p>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setPage(p =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog?.action.replace(/_/g, ' ')} on{' '}
              {selectedLog?.entity_type}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Timestamp
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedLog.created_at, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    User
                  </p>
                  <p className="text-sm text-gray-600">
                    System
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Action
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedLog.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Entity ID
                  </p>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedLog.entity_id || '-'}
                  </p>
                </div>
              </div>

              {selectedLog.old_data &&
                Object.keys(selectedLog.old_data).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Previous Values
                    </p>
                    <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(
                        selectedLog.old_data,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

              {selectedLog.new_data &&
                Object.keys(selectedLog.new_data).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      New Values
                    </p>
                    <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(
                        selectedLog.new_data,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
