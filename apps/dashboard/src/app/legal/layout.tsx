import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MarketingNav } from '../../components/MarketingNav';
import { MarketingFooter } from '../../components/MarketingFooter';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />
      <div className="max-w-4xl mx-auto w-full px-8 py-12 flex gap-10 flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-48 flex-shrink-0 sticky top-24 self-start">
          <p className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-wide mb-3">Legal</p>
          <nav className="space-y-0.5">
            {[
              { href: '/legal/tos',        label: 'Terms of Service' },
              { href: '/legal/privacy',    label: 'Privacy Policy' },
              { href: '/legal/impressum',  label: 'Impressum' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#e5e7eb]/50 hover:text-white hover:bg-[#1f2937] transition-colors"
              >
                <ChevronRight size={12} className="text-indigo-400 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <MarketingFooter />
    </div>
  );
}
