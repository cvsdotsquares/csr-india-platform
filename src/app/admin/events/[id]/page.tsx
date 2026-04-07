'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventById, publishEvent } from '@/lib/actions/event-actions';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChevronLeft, ClipboardList, Clock, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  is_featured: boolean;
  status: string;
  banner_image_url: string | null;
  thumbnail_image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    setLoading(true);
    try {
      const result = (await getEventById(eventId)) as {
        data?: Event;
        error?: string;
      };
      if (result.error) {
        console.error(result.error);
      } else {
        setEvent(result.data || null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);

    try {
      const result = await publishEvent(eventId);
      if (result.error) {
        setPublishError(result.error);
        return;
      }

      await loadEvent();
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-gray-500">Event not found</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
        <p className="text-gray-600 mt-1">Edit event details and manage sessions</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
          {event.status}
        </Badge>
        {event.status !== 'published' && (
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-[#1B3A5C] hover:bg-[#152a47]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {publishing ? 'Publishing...' : 'Publish Event'}
          </Button>
        )}
        {event.status === 'published' && (
          <Link href={`/events/${event.slug}`} target="_blank">
            <Button variant="outline">View Public Page</Button>
          </Link>
        )}
        <Link href={`/admin/events/${eventId}/registrations`}>
          <Button variant="outline">
            <ClipboardList className="w-4 h-4 mr-2" />
            View Registrations
          </Button>
        </Link>
      </div>

      {publishError && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {publishError}
        </Card>
      )}

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <EventForm initialData={event} eventId={eventId} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(event.start_date)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(event.end_date)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Venue</h3>
                  <p className="text-lg font-semibold text-gray-900">{event.venue_name}</p>
                  {event.venue_address && (
                    <p className="text-sm text-gray-600">{event.venue_address}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">City</h3>
                  <p className="text-lg font-semibold text-gray-900">{event.city}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Max Capacity</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.max_capacity ? `${event.max_capacity} attendees` : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p className="text-lg font-semibold capitalize text-gray-900">
                    {event.status}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Featured</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.is_featured ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Registration Open</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.registration_open ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card className="p-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Sessions management coming soon</p>
              <Link href={`/admin/events/${eventId}/sessions`}>
                <Button className="bg-[#1B3A5C] hover:bg-[#152a47]">
                  Manage Sessions
                </Button>
              </Link>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
