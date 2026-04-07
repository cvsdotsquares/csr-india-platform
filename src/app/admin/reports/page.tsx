'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getEventStats } from '@/lib/actions/admin-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  start_date: string;
}

interface EventStats {
  total: number;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  topOrganizations: Array<{ name: string; count: number }>;
}

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadStats();
    }
  }, [selectedEventId]);

  async function loadEvents() {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('events')
        .select('id, title, start_date')
        .eq('status', 'published')
        .order('start_date', { ascending: false });
      const events = (data ?? []) as Event[];

      if (events.length > 0) {
        setEvents(events);
        setSelectedEventId(events[0].id);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    setStatsLoading(true);
    try {
      const result = await getEventStats(selectedEventId);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(
        `/api/export/registrations?eventId=${selectedEventId}`
      );
      const csv = await response.text();

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${selectedEventId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Event Reports
          </h1>
          <p className="text-gray-600 mt-1">
            View statistics and analytics for your events
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          disabled={!selectedEventId}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-72">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an event..." />
            </SelectTrigger>
            <SelectContent>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#1B3A5C]">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            {Object.entries(stats.statusBreakdown).map(
              ([status, count]) => (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1B3A5C]">
                      {count}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {((count / stats.total) * 100).toFixed(
                        1
                      )}%
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Category Breakdown */}
          {Object.keys(stats.categoryBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registrations by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.categoryBreakdown).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium capitalize">
                          {category}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#1B3A5C] h-2 rounded-full"
                              style={{
                                width: `${
                                  (count / stats.total) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {count} ({((count / stats.total) * 100).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Organizations */}
          {stats.topOrganizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead className="text-right">
                        Registrations
                      </TableHead>
                      <TableHead className="text-right">
                        Percentage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topOrganizations.map((org, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {org.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {(
                            (org.count / stats.total) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No data available for the selected event
          </p>
        </div>
      )}
    </div>
  );
}
