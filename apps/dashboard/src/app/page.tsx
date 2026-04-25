import Link from 'next/link';
import Image from 'next/image';
import { Shield, Zap, BarChart2, MessageCircle } from 'lucide-react';
import { auth } from '../auth';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/dict';
import { MarketingNav } from '../components/MarketingNav';
import { MarketingFooter } from '../components/MarketingFooter';

const FEATURE_ICONS = [
  <Shield key="shield" size={20} className="text-indigo-400" />,
  <Zap key="zap" size={20} className="text-indigo-400" />,
  <BarChart2 key="bar" size={20} className="text-indigo-400" />,
];

export default async function LandingPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  const t = getDict(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center py-28 px-8 overflow-hidden" style={{ minHeight: '540px' }}>
        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/icons/banner.png')" }} />
        <div className="absolute inset-0 bg-[#111827]/85" />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
          <span className="text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 uppercase tracking-widest">
            {t.hero.badge}
          </span>
          <div className="flex items-center gap-4">
            <Image src="/icons/clx-icon.png" alt="CLX" width={64} height={64} className="rounded-2xl shadow-xl ring-2 ring-white/10" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title1}<br /><span className="text-indigo-400">{t.hero.title2}</span>
          </h1>
          <p className="text-[#e5e7eb]/75 text-lg max-w-md">{t.hero.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {session ? (
              <Link href="/dashboard" className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-indigo-500/25">
                {t.hero.ctaDashboard}
              </Link>
            ) : (
              <Link href="/api/auth/signin" className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-indigo-500/25">
                {t.hero.ctaLogin}
              </Link>
            )}
            {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3 border border-[#e5e7eb]/25 hover:border-[#e5e7eb]/50 rounded-xl font-semibold transition-colors"
              >
                {t.hero.ctaInvite}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#e5e7eb]/10 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-8 py-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#e5e7eb]/10">
          {t.stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-2">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#e5e7eb]/50 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center py-20 px-8 gap-12 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{t.features.heading}</h2>
          <p className="text-[#e5e7eb]/55 mt-2">{t.features.subheading}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {t.features.items.map((f, i) => (
            <div key={f.title} className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                {FEATURE_ICONS[i]}
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-[#e5e7eb]/55 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community / Discord CTA */}
      {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL && (
        <section className="py-16 px-8">
          <div className="max-w-2xl mx-auto bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-10 text-center flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
              <MessageCircle size={26} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t.community.heading}</h2>
              <p className="text-[#e5e7eb]/55 mt-2 max-w-md mx-auto">{t.community.subheading}</p>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20"
            >
              <MessageCircle size={16} />
              {t.community.join}
            </a>
          </div>
        </section>
      )}

      <MarketingFooter />
    </div>
  );
}
