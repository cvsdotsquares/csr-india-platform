'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllAdminEvents } from '@/lib/actions/event-actions';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MoreHorizontal, Plus, Search, Eye, Edit2 } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  status: string;
  created_at: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = (await getAllAdminEvents()) as {
        data?: Event[];
        error?: string;
      };
      if (result.error) {
        console.error(result.error);
      } else {
        setEvents(result.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Manage your CSR events and activities</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="bg-[#1B3A5C] hover:bg-[#152a47]">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search events by title or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No events found</p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(event.start_date)}</div>
                        {event.end_date !== event.start_date && (
                          <div className="text-gray-500">
                            to {formatDate(event.end_date)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{event.venue_name}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/events/${event.id}`} className="cursor-pointer">
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.slug}`} target="_blank" className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
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

      {events.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      )}
    </div>
  );
}
