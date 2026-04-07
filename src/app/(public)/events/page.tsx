import { Suspense } from 'react';
import { getAllPublishedEvents } from '@/lib/actions/event-actions';
import { EventCard } from '@/components/events/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const revalidate = 60;

type Event = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  city: string;
  thumbnail_image_url: string | null;
  is_featured: boolean;
  status: string;
};

async function EventsList() {
  const result = (await getAllPublishedEvents()) as {
    data?: Event[];
    error?: string;
  };

  if (result.error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">Failed to load events</p>
      </div>
    );
  }

  const events = result.data || [];

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No events available at the moment</p>
      </div>
    );
  }

  const featured = events.find((event) => event.is_featured);
  const regular = events.filter((event) => !event.is_featured);

  return (
    <div className="space-y-12">
      {featured && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured Event</h2>
          <EventCard event={featured} featured />
        </div>
      )}

      {regular.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">All Events</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsListSkeleton() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured Event</h2>
        <Card className="h-96 overflow-hidden" />
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">All Events</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">CSR Events</h1>
          <p className="mt-2 text-gray-600">
            Discover and register for our upcoming CSR initiatives
          </p>
        </div>

        <Suspense fallback={<EventsListSkeleton />}>
          <EventsList />
        </Suspense>
      </div>
    </div>
  );
}
