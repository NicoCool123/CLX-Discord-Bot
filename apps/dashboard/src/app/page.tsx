import Link from 'next/link';
import Image from 'next/image';
import { auth } from '../auth';

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#e5e7eb]/10 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <Image src="/icons/clx-icon.png" alt="CLX" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-lg tracking-tight text-white">CLX</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/api/auth/signin"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
            >
              Login with Discord
            </Link>
          )}
          {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
            <a
              href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-[#e5e7eb]/20 hover:border-[#e5e7eb]/50 rounded-lg text-sm font-medium transition-colors"
            >
              Invite Bot
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-32 px-8 overflow-hidden"
        style={{ minHeight: '520px' }}
      >
        {/* Banner background */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/icons/banner.png')" }}
        />
        <div className="absolute inset-0 bg-[#111827]/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-2">
            <Image src="/icons/clx-icon.png" alt="CLX" width={64} height={64} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CraftLabsX<br />
            <span className="text-indigo-400">Discord Bot</span>
          </h1>
          <p className="text-[#e5e7eb]/80 text-lg max-w-md">
            Advanced moderation, automod, and detailed logs — all managed from one clean dashboard.
          </p>
          <div className="flex gap-3 mt-2">
            {session ? (
              <Link
                href="/dashboard"
                className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20"
              >
                Login with Discord
              </Link>
            )}
            {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3 border border-[#e5e7eb]/30 hover:border-[#e5e7eb]/60 rounded-xl font-semibold transition-colors"
              >
                Invite Bot
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center py-20 px-8 gap-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Everything you need</h2>
          <p className="text-[#e5e7eb]/60 mt-2">Powerful tools to keep your server safe and organized.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
              🔨
            </div>
            <h3 className="font-semibold text-white">Advanced Moderation</h3>
            <p className="text-[#e5e7eb]/60 text-sm">Warn, mute, kick, and ban with full infraction history tracked per user.</p>
          </div>
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
              🤖
            </div>
            <h3 className="font-semibold text-white">Smart Automod</h3>
            <p className="text-[#e5e7eb]/60 text-sm">Automatic spam, word filter, and link detection with configurable actions.</p>
          </div>
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
              📊
            </div>
            <h3 className="font-semibold text-white">Detailed Logs</h3>
            <p className="text-[#e5e7eb]/60 text-sm">Full audit trail of all moderation actions with user profiles and case management.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-8 py-6 border-t border-[#e5e7eb]/10 text-center text-[#e5e7eb]/40 text-sm">
        CLX Dashboard — CraftLabsX
      </footer>
    </main>
  );
}
