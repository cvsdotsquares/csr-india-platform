'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

type EventCardProps = {
  event: {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    start_date: string;
    end_date: string;
    venue_name: string;
    city: string;
    thumbnail_image_url: string | null;
    is_featured?: boolean;
  };
  featured?: boolean;
};

export function EventCard({ event, featured = false }: EventCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop';
  const imageUrl = event.thumbnail_image_url || defaultImage;

  if (featured) {
    return (
      <Link href={`/events/${event.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
              <img
                src={imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#1B3A5C] text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </Badge>
              </div>
            </div>

            <div className="p-6 md:p-8 w-full md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>

              {event.short_description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.short_description}
                </p>
              )}

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#1B3A5C]" />
                  <span>{formatDate(event.start_date)}</span>
                  {event.end_date !== event.start_date && (
                    <span className="text-gray-500">to {formatDate(event.end_date)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-[#1B3A5C]" />
                  <span>{event.venue_name}, {event.city}</span>
                </div>
              </div>

              <Button className="bg-[#1B3A5C] hover:bg-[#152a47] text-white w-full md:w-auto">
                Register Now
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>

          {event.short_description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {event.short_description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-[#1B3A5C] flex-shrink-0" />
              <span className="line-clamp-1">{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-[#1B3A5C] flex-shrink-0" />
              <span className="line-clamp-1">{event.venue_name}</span>
            </div>
          </div>

          <Button className="bg-[#1B3A5C] hover:bg-[#152a47] text-white w-full">
            Register
          </Button>
        </div>
      </Card>
    </Link>
  );
}
