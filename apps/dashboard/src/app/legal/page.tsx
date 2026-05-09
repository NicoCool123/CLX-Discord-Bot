import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, Building2, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal documents for CLX — terms of service, privacy policy, and impressum.',
};

export default function LegalIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Legal</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-2">Terms, privacy information, and legal notices.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          {
            href: '/legal/tos',
            Icon: FileText,
            title: 'Terms of Service',
            desc: 'The rules and conditions for using CLX and its associated services.',
          },
          {
            href: '/legal/privacy',
            Icon: Shield,
            title: 'Privacy Policy',
            desc: 'What data we collect, why we collect it, and how long we keep it.',
          },
          {
            href: '/legal/impressum',
            Icon: Building2,
            title: 'Impressum',
            desc: 'Legal disclosure required under German law (§ 5 TMG).',
          },
        ].map(({ href, Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-5 bg-[#111116] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-xl p-5 transition-all hover:bg-[#1c1c24]"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Icon size={17} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-[#e5e7eb]/50 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#e5e7eb]/30 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
