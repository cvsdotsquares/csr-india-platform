'use client';

import { useState, useCallback, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getCheckInStats, getRecentCheckIns, undoCheckIn } from '@/lib/actions/checkin-actions';
import QRScanner from './QRScanner';
import ManualCheckIn from './ManualCheckIn';
import { Users, UserCheck, Clock, TrendingUp, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CheckInDashboardProps {
  event: { id: string; title: string };
  initialStats: { total: number; checkedIn: number; remaining: number; percentage: number };
  initialRecentCheckIns: any[];
}

export default function CheckInDashboard({
  event,
  initialStats,
  initialRecentCheckIns,
}: CheckInDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [recentCheckIns, setRecentCheckIns] = useState(initialRecentCheckIns);
  const [isRefreshing, startRefresh] = useTransition();
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    startRefresh(async () => {
      const newStats = await getCheckInStats(event.id);
      const newCheckIns = await getRecentCheckIns(event.id);
      setStats(newStats);
      setRecentCheckIns(newCheckIns);
    });
  }, [event.id]);

  const handleUndo = async (registrationId: string) => {
    setUndoingId(registrationId);
    const res = await undoCheckIn(registrationId, event.id);
    if (res.success) {
      toast.success('Check-in undone');
      await refreshStats();
    } else {
      toast.error(res.error || 'Failed to undo check-in');
    }
    setUndoingId(null);
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'qr_scan':
        return 'bg-blue-100 text-blue-800';
      case 'manual_search':
        return 'bg-purple-100 text-purple-800';
      case 'manual_override':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'qr_scan':
        return 'QR Scan';
      case 'manual_search':
        return 'Manual Search';
      case 'manual_override':
        return 'Manual Override';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-muted-foreground mt-1">Check-in Management</p>
        </div>
        <Button
          onClick={refreshStats}
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Eligible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold">{stats.checkedIn}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-amber-600" />
              <span className="text-3xl font-bold">{stats.remaining}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-[#1B3A5C]" />
                <span className="text-3xl font-bold">{stats.percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress
              value={stats.percentage}
              className="h-3"
            />
            <p className="text-sm text-muted-foreground">
              {stats.checkedIn} of {stats.total} attendees have checked in
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="qr-scanner" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="qr-scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="manual-search">Manual Search</TabsTrigger>
        </TabsList>

        <TabsContent value="qr-scanner" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>
                Scan attendee QR codes to check them in instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRScanner eventId={event.id} onCheckIn={refreshStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual-search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-in</CardTitle>
              <CardDescription>
                Search for attendees by name or email to check them in manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualCheckIn eventId={event.id} onCheckIn={refreshStats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Last 20 attendees checked in</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {log.registrations?.profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.registrations?.profiles?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMethodBadgeColor(log.method)}>
                        {getMethodLabel(log.method)}
                      </Badge>
                      {log.registrations?.category && (
                        <Badge variant="secondary">
                          {log.registrations.category}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground min-w-fit">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleUndo(log.registrations.id)
                    }
                    disabled={undoingId === log.registrations.id}
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No check-ins yet. Start scanning QR codes or search manually.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
