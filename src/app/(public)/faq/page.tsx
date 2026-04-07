import { createClient } from '@/lib/supabase/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const revalidate = 300;

export const metadata = {
  title: 'FAQ - CSR India Event Platform',
  description:
    'Frequently asked questions about CSR India events and programs',
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export default async function FAQPage() {
  const supabase = await createClient();
  const { data: faqItems } = await supabase
    .from('faq_items')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('sort_order');

  // Group by category
  const groupedFAQ = (faqItems || []).reduce(
    (acc, item: FAQItem) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our events and services
          </p>
        </div>

        {Object.entries(groupedFAQ).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedFAQ).map(
              ([category, items]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {category
                      .split('_')
                      .map(
                        word =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1)
                      )
                      .join(' ')}
                  </h2>

                  <Accordion
                    type="single"
                    collapsible
                    className="space-y-2"
                  >
                    {items.map(item => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border border-gray-200 rounded-lg px-4 bg-white"
                      >
                        <AccordionTrigger className="hover:text-[#1B3A5C]">
                          <span className="text-left font-semibold">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pt-2">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: item.answer,
                            }}
                            className="prose prose-sm max-w-none"
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No FAQ items available at the moment
            </p>
            <a
              href="/contact"
              className="inline-block bg-[#1B3A5C] text-white px-6 py-2 rounded-lg hover:bg-[#152a47] transition-colors"
            >
              Contact Us
            </a>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Didn't find your answer?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help. Get in touch with us
            today.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#1B3A5C] text-white px-6 py-2 rounded-lg hover:bg-[#152a47] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
