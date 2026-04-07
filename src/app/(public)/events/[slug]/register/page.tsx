import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

type EventRegistrationRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  city: string | null;
  max_capacity: number | null;
  registration_open: boolean;
  registration_end_date: string | null;
};

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function EventRegistrationPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('events')
    .select(
      `
      id,
      title,
      slug,
      description,
      short_description,
      start_date,
      end_date,
      venue_name,
      city,
      max_capacity,
      registration_open,
      registration_end_date
    `
    )
    .eq('slug', params.slug)
    .single();
  const event = data as EventRegistrationRecord | null;

  if (!event) {
    redirect('/events');
  }

  let isAlreadyRegistered = false;
  if (user) {
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      isAlreadyRegistered = true;
    }
  }

  const isRegistrationClosed = !event.registration_open;
  const isDeadlinePassed =
    Boolean(event.registration_end_date) &&
    new Date(event.registration_end_date as string) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link
          href={`/events/${event.slug}`}
          className="mb-6 inline-flex items-center text-[#1B3A5C] hover:text-[#1B3A5C]/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>Event Registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-[#1B3A5C]" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {formatDateTime(event.start_date)} at {formatTime(event.start_date)}
                      </p>
                      {event.end_date && event.start_date !== event.end_date && (
                        <p className="mt-1 text-sm text-gray-600">
                          to {formatDateTime(event.end_date)} at {formatTime(event.end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-[#1B3A5C]" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-medium text-gray-900">{event.venue_name}</p>
                      {event.city && <p className="text-sm text-gray-600">{event.city}</p>}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {!user ? (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900">
                        Please{' '}
                        <Link href="/login" className="font-semibold underline hover:text-blue-700">
                          log in
                        </Link>{' '}
                        or{' '}
                        <Link
                          href="/register"
                          className="font-semibold underline hover:text-blue-700"
                        >
                          create an account
                        </Link>{' '}
                        to register for this event.
                      </p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-900">
                        You are already registered for this event. You can view your registrations
                        in your{' '}
                        <Link
                          href="/dashboard/registrations"
                          className="font-semibold underline hover:text-green-700"
                        >
                          dashboard
                        </Link>
                        .
                      </p>
                    </div>
                  ) : isRegistrationClosed || isDeadlinePassed ? (
                    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-900">
                        {isDeadlinePassed
                          ? 'Registration deadline has passed'
                          : 'Registration is currently closed for this event'}
                      </p>
                    </div>
                  ) : null}

                  {user && !isAlreadyRegistered && !isRegistrationClosed && !isDeadlinePassed ? (
                    <RegistrationForm eventId={event.id} eventTitle={event.title} />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Registration Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    {isRegistrationClosed ? (
                      <span className="text-red-600">Closed</span>
                    ) : isDeadlinePassed ? (
                      <span className="text-amber-600">Deadline Passed</span>
                    ) : (
                      <span className="text-green-600">Open</span>
                    )}
                  </p>
                </div>

                {event.registration_end_date && !isDeadlinePassed && (
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Deadline</p>
                    <p className="font-medium">{formatDateTime(event.registration_end_date)}</p>
                  </div>
                )}

                {event.max_capacity && (
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Capacity</p>
                    <p className="font-medium">{event.max_capacity} participants</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    Your registration will be subject to approval by the event organizers. You
                    will receive a confirmation email once your registration is approved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
