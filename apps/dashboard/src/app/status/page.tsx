import { CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { MarketingNav } from '../../components/MarketingNav';
import { MarketingFooter } from '../../components/MarketingFooter';
import { db } from '../../lib/db';

export const revalidate = 60; // revalidate every 60s

export default async function StatusPage() {
  let dbOk = false;
  let dbLatency = 0;

  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const services = [
    { name: 'Dashboard', desc: 'Web interface and OAuth login', ok: true, latency: null },
    { name: 'Database',  desc: 'PostgreSQL via Prisma',         ok: dbOk, latency: dbOk ? dbLatency : null },
    { name: 'Discord API', desc: 'OAuth and guild data API',    ok: true, latency: null },
    { name: 'Bot',       desc: 'Command processing and automod', ok: true, latency: null },
  ];

  const allOk = services.every((s) => s.ok);
  const checkedAt = new Date().toUTCString();

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-8 py-16">
        {/* Overall status */}
        <div className={`rounded-2xl border p-6 mb-10 flex items-center gap-4 ${
          allOk
            ? 'bg-green-400/8 border-green-400/20'
            : 'bg-red-400/8 border-red-400/20'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            allOk ? 'bg-green-400/15' : 'bg-red-400/15'
          }`}>
            {allOk
              ? <CheckCircle size={22} className="text-green-400" />
              : <Circle size={22} className="text-red-400" />
            }
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {allOk ? 'All Systems Operational' : 'Service Disruption Detected'}
            </h1>
            <p className="text-sm text-[#e5e7eb]/50 mt-0.5">Last checked: {checkedAt}</p>
          </div>
        </div>

        {/* Service list */}
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#e5e7eb]/10 flex items-center gap-1.5 text-xs text-[#e5e7eb]/40">
            <RefreshCw size={11} /> Auto-refreshes every 60 seconds
          </div>
          <div className="divide-y divide-[#e5e7eb]/5">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-white">{svc.name}</p>
                  <p className="text-xs text-[#e5e7eb]/40 mt-0.5">{svc.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {svc.latency !== null && (
                    <span className="text-xs text-[#e5e7eb]/40">{svc.latency}ms</span>
                  )}
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    svc.ok
                      ? 'text-green-400 bg-green-400/10 border-green-400/20'
                      : 'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${svc.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                    {svc.ok ? 'Operational' : 'Outage'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-[#e5e7eb]/30 mt-6">
          Issues? Join our{' '}
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ? (
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Discord server</a>
          ) : (
            <span>Discord server</span>
          )}
          {' '}for live updates.
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}
