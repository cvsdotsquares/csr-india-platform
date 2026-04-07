import { submitContactForm } from '@/lib/actions/contact-actions';
import ContactForm from '@/components/forms/ContactForm';
import NewsletterForm from '@/components/forms/NewsletterForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us - CSR India Event Platform',
  description:
    'Get in touch with CSR India. We are here to help with any questions about our events and programs.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about our events or want to partner with us? We
            would love to hear from you. Send us a message and we will respond
            as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#1B3A5C]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:contact@csrindia.org"
                    className="text-[#1B3A5C] hover:text-[#152a47] break-all"
                  >
                    contact@csrindia.org
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#1B3A5C]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Phone
                  </h3>
                  <a
                    href="tel:+919876543210"
                    className="text-[#1B3A5C] hover:text-[#152a47]"
                  >
                    +91 (987) 654-3210
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#1B3A5C]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Address
                  </h3>
                  <p className="text-gray-600 text-sm">
                    CSR India Foundation
                    <br />
                    New Delhi, India
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-[#1B3A5C] text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Get updates about our latest events and news
              </p>
              <NewsletterForm variant="white" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Have other questions?
          </h2>
          <p className="text-gray-600 mb-4">
            Check out our frequently asked questions for quick answers
          </p>
          <a
            href="/faq"
            className="inline-block bg-[#1B3A5C] text-white px-6 py-2 rounded-lg hover:bg-[#152a47] transition-colors"
          >
            View FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
