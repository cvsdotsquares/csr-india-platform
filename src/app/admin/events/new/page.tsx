'use client';

import Link from 'next/link';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-600 mt-1">Add a new CSR event to your platform</p>
      </div>

      <EventForm />
    </div>
  );
}
