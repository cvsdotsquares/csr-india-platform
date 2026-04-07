'use client';

import { useState, useTransition } from 'react';
import { searchForCheckIn, manualCheckIn } from '@/lib/actions/checkin-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ManualCheckInProps {
  eventId: string;
  onCheckIn: () => void;
}

export default function ManualCheckIn({ eventId, onCheckIn }: ManualCheckInProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startSearch(async () => {
      const data = await searchForCheckIn(eventId, query.trim());
      setResults(data);
    });
  }

  async function handleCheckIn(registrationId: string) {
    setCheckingIn(registrationId);
    const res = await manualCheckIn(registrationId, eventId);
    if (res.success) {
      toast.success(`${res.attendee?.full_name} checked in!`);
      setResults(prev => prev.filter(r => r.id !== registrationId));
      onCheckIn();
    } else {
      toast.error(res.error || 'Check-in failed');
    }
    setCheckingIn(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10"
          />
        </div>
        <Button
          type="submit"
          disabled={isSearching}
          className="bg-[#1B3A5C] hover:bg-[#152d47]"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.profiles?.full_name}</TableCell>
                  <TableCell className="text-sm">{r.profiles?.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.organization}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(r.id)}
                      disabled={checkingIn === r.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      {checkingIn === r.id ? 'Checking in...' : 'Check In'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {results.length === 0 && query && !isSearching && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No approved registrations found matching &quot;{query}&quot;</p>
        </div>
      )}

      {!query && results.length === 0 && !isSearching && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Enter a name or email to search for attendees</p>
        </div>
      )}
    </div>
  );
}
