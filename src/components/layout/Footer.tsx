import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="border-t bg-brand-500 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold">CSR India</h3>
            <p className="mt-2 text-sm text-brand-100">{siteConfig.description}</p>
          </div>
          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="mt-2 space-y-1 text-sm text-brand-100">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-2 space-y-1 text-sm text-brand-100">
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Contact</h4>
            <p className="mt-2 text-sm text-brand-100">{siteConfig.contact.email}</p>
            <p className="text-sm text-brand-100">{siteConfig.contact.address}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-brand-400 pt-8 text-center text-sm text-brand-200">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
