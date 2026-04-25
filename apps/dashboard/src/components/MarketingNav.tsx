import Link from 'next/link';
import Image from 'next/image';
import { auth } from '../auth';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/dict';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function MarketingNav() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  const t = getDict(locale).nav;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-3.5 border-b border-[#e5e7eb]/10 bg-[#0d0d11]/95 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icons/clx-icon.png" alt="CLX" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-white tracking-tight">CLX</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/docs',   label: t.docs },
            { href: '/team',   label: t.team },
            { href: '/status', label: t.status },
            { href: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? '/support', label: t.support, external: !!process.env.NEXT_PUBLIC_DISCORD_INVITE_URL },
          ].map(({ href, label, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm text-[#e5e7eb]/60 hover:text-white transition-colors rounded-lg hover:bg-[#e5e7eb]/5"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm text-[#e5e7eb]/60 hover:text-white transition-colors rounded-lg hover:bg-[#e5e7eb]/5"
              >
                {label}
              </Link>
            )
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
          <a
            href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3 py-1.5 border border-[#e5e7eb]/15 hover:border-[#e5e7eb]/40 rounded-lg text-sm font-medium transition-colors"
          >
            {t.invite}
          </a>
        )}
        {session ? (
          <Link href="/dashboard" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
            {t.dashboard}
          </Link>
        ) : (
          <Link href="/api/auth/signin" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
            {t.login}
          </Link>
        )}
      </div>
    </header>
  );
}
