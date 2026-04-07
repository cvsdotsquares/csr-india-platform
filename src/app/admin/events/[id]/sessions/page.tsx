'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventSessions, deleteSession } from '@/lib/actions/event-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SessionForm } from '@/components/events/SessionForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, Plus, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Session = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  session_type: string;
  session_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
  max_seats: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  keynote: 'Keynote',
  panel: 'Panel Discussion',
  workshop: 'Workshop',
  fireside_chat: 'Fireside Chat',
  networking: 'Networking',
  break: 'Break',
  ceremony: 'Ceremony',
};

export default function SessionsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, [eventId]);

  async function loadSessions() {
    setLoading(true);
    try {
      const result = (await getEventSessions(eventId)) as {
        data?: Session[];
        error?: string;
      };
      if (result.error) {
        console.error(result.error);
      } else {
        setSessions(result.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(sessionId: string) {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    const result = (await deleteSession(sessionId, eventId)) as {
      success?: boolean;
      error?: string;
    };
    if (result.error) {
      console.error(result.error);
    } else {
      loadSessions();
    }
  }

  const handleSessionCreated = () => {
    setDialogOpen(false);
    setEditingSession(null);
    loadSessions();
  };

  const getSessionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      keynote: 'bg-blue-100 text-blue-800',
      panel: 'bg-purple-100 text-purple-800',
      workshop: 'bg-green-100 text-green-800',
      fireside_chat: 'bg-orange-100 text-orange-800',
      networking: 'bg-pink-100 text-pink-800',
      break: 'bg-gray-100 text-gray-800',
      ceremony: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[type] || colors.keynote}>
        {SESSION_TYPE_LABELS[type] || type}
      </Badge>
    );
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Event
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Sessions</h1>
          <p className="text-gray-600 mt-1">Manage sessions and speakers for this event</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B3A5C] hover:bg-[#152a47]">
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSession ? 'Edit Session' : 'Create New Session'}
              </DialogTitle>
              <DialogDescription>
                {editingSession
                  ? 'Update the session details below.'
                  : 'Add a new session to this event.'}
              </DialogDescription>
            </DialogHeader>
            <SessionForm
              eventId={eventId}
              initialData={editingSession || undefined}
              onSuccess={handleSessionCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No sessions added yet</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1B3A5C] hover:bg-[#152a47]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Session</DialogTitle>
                    <DialogDescription>
                      Add the first session to this event.
                    </DialogDescription>
                  </DialogHeader>
                  <SessionForm
                    eventId={eventId}
                    onSuccess={handleSessionCreated}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>{getSessionTypeBadge(session.session_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(session.start_time)}</div>
                        <div className="text-gray-500">
                          {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{session.room || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingSession(session);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(session.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {sessions.length > 0 && (
        <div className="text-sm text-gray-600">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled
        </div>
      )}
    </div>
  );
}
