import Link from 'next/link';
import Image from 'next/image';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/dict';

export async function MarketingFooter() {
  const locale = await getLocale();
  const t = getDict(locale).footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e5e7eb]/10 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <Image src="/icons/clx-icon.png" alt="CLX" width={28} height={28} className="rounded-lg" />
              <span className="font-bold text-white">CLX</span>
            </div>
            <p className="text-sm text-[#e5e7eb]/50 max-w-xs">{t.description}</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-wide mb-3">{t.sections.product}</p>
            <ul className="space-y-2">
              {[
                { href: '/docs',   label: t.links.docs },
                { href: '/team',   label: t.links.team },
                { href: '/status', label: t.links.status },
                ...(process.env.NEXT_PUBLIC_DISCORD_INVITE_URL
                  ? [{ href: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL, label: t.links.support, external: true }]
                  : [{ href: '/support', label: t.links.support }]),
              ].map(({ href, label, external }: { href: string; label: string; external?: boolean }) =>
                external ? (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#e5e7eb]/50 hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ) : (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#e5e7eb]/50 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-wide mb-3">{t.sections.legal}</p>
            <ul className="space-y-2">
              <li><Link href="/legal/tos"        className="text-sm text-[#e5e7eb]/50 hover:text-white transition-colors">{t.legal.tos}</Link></li>
              <li><Link href="/legal/privacy"    className="text-sm text-[#e5e7eb]/50 hover:text-white transition-colors">{t.legal.privacy}</Link></li>
              <li><Link href="/legal/impressum"  className="text-sm text-[#e5e7eb]/50 hover:text-white transition-colors">{t.legal.impressum}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e5e7eb]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#e5e7eb]/30">© {year} CraftLabsX. {t.rights}</p>
          <div className="flex items-center gap-4">
            <Link href="/legal/tos"       className="text-xs text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">{t.legal.tos}</Link>
            <Link href="/legal/privacy"   className="text-xs text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">{t.legal.privacy}</Link>
            <Link href="/legal/impressum" className="text-xs text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">{t.legal.impressum}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
