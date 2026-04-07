import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getAllPublishedEvents, getEventBySlug, getEventSessions } from '@/lib/actions/event-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { MapPin, Calendar, Users, ChevronLeft } from 'lucide-react';

export const revalidate = 60;

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string | null;
  city: string;
  max_capacity: number | null;
  registration_end_date: string | null;
  registration_open: boolean;
  banner_image_url: string | null;
  status: string;
};

type Session = {
  id: string;
  title: string;
  description: string | null;
  session_type: string;
  start_time: string;
  end_time: string;
  room: string | null;
  max_seats: number | null;
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

function formatSessionTime(value: string) {
  const normalized = /^\d{2}:\d{2}(:\d{2})?$/.test(value)
    ? `1970-01-01T${value}`
    : value;

  return new Date(normalized).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function EventContent({ slug }: { slug: string }) {
  const result = (await getEventBySlug(slug)) as {
    data?: Event;
    error?: string;
  };

  if (result.error || !result.data) {
    notFound();
  }

  const event = result.data as Event;
  const sessionsResult = (await getEventSessions(event.id)) as {
    data?: Session[];
    error?: string;
  };
  const sessions = sessionsResult.data || [];

  return (
    <div className="space-y-12">
      <Link href="/events" className="mb-4 inline-block">
        <Button variant="ghost">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      {event.banner_image_url && (
        <div className="relative h-96 overflow-hidden rounded-lg">
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
        {event.short_description && (
          <p className="text-lg text-gray-600">{event.short_description}</p>
        )}

        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-5 w-5 text-[#1B3A5C]" />
            <div>
              <div className="font-medium">{formatDate(event.start_date)}</div>
              {event.end_date !== event.start_date && (
                <div className="text-sm text-gray-500">to {formatDate(event.end_date)}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-5 w-5 text-[#1B3A5C]" />
            <div>
              <div className="font-medium">{event.venue_name}</div>
              {event.venue_address && (
                <div className="text-sm text-gray-500">{event.venue_address}</div>
              )}
              <div className="text-sm text-gray-500">{event.city}</div>
            </div>
          </div>

          {event.max_capacity && (
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-[#1B3A5C]" />
              <div className="font-medium">Up to {event.max_capacity} attendees</div>
            </div>
          )}
        </div>

        {event.registration_end_date && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-700">
            <Calendar className="h-5 w-5" />
            <div>Registration deadline: {formatDate(event.registration_end_date)}</div>
          </div>
        )}
      </div>

      {event.registration_open ? (
        <Link href={`/events/${event.slug}/register`}>
          <Button className="px-8 py-6 text-lg text-white bg-[#1B3A5C] hover:bg-[#152a47]">
            Register Now
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="px-8 py-6 text-lg text-white bg-[#1B3A5C] hover:bg-[#1B3A5C]"
        >
          Registrations Closed
        </Button>
      )}

      {event.description && (
        <Card className="p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">About This Event</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </Card>
      )}

      {sessions.length > 0 && (
        <Card className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Event Schedule</h2>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                <div className="min-w-24 text-sm font-medium text-[#1B3A5C]">
                  {formatSessionTime(session.start_time)}
                  <br />
                  <span className="text-gray-500">{formatSessionTime(session.end_time)}</span>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {SESSION_TYPE_LABELS[session.session_type] || session.session_type}
                    </Badge>
                  </div>
                  {session.description && (
                    <p className="mb-2 text-sm text-gray-600">{session.description}</p>
                  )}
                  {session.room && (
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {session.room}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-96 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-20 w-40" />
          <Skeleton className="h-20 w-40" />
        </div>
      </div>
      <Skeleton className="h-14 w-32" />
    </div>
  );
}

export async function generateStaticParams() {
  const result = (await getAllPublishedEvents()) as {
    data?: Event[];
    error?: string;
  };
  const events = result.data || [];

  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<EventSkeleton />}>
          <EventContent slug={params.slug} />
        </Suspense>
      </div>
    </div>
  );
}
