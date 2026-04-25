import { Code2, Globe } from 'lucide-react';
import { MarketingNav } from '../../components/MarketingNav';
import { MarketingFooter } from '../../components/MarketingFooter';

const team = [
  {
    name: 'RedCrafter',
    role: 'Founder & Lead Developer',
    desc: 'Full-stack developer behind CLX. Built the bot, dashboard, and infrastructure from scratch.',
    initials: 'RC',
    color: 'bg-indigo-500/20 text-indigo-300',
  },
];

export default function TeamPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">The Team</h1>
          <p className="text-[#e5e7eb]/55 mt-3 max-w-md mx-auto">
            The people building and maintaining CLX.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-[#111116] border border-[#e5e7eb]/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${member.color}`}>
                {member.initials}
              </div>
              <div>
                <p className="font-semibold text-white">{member.name}</p>
                <p className="text-xs text-indigo-400 mt-0.5">{member.role}</p>
              </div>
              <p className="text-sm text-[#e5e7eb]/55">{member.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#111116] border border-[#e5e7eb]/10 rounded-2xl p-8 text-center">
          <Globe size={24} className="text-indigo-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Want to Join the Team?</h2>
          <p className="text-sm text-[#e5e7eb]/55 mt-2 max-w-sm mx-auto">
            Interested in contributing to CLX? Reach out to us on Discord.
          </p>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL && (
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Code2 size={15} /> Join our Discord
            </a>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
