import Link from 'next/link';
import { Terminal, Shield, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { MarketingNav } from '../../components/MarketingNav';
import { MarketingFooter } from '../../components/MarketingFooter';

const CMD_STYLE = 'font-mono text-sm bg-[#09090b] border border-[#e5e7eb]/10 rounded px-1.5 py-0.5 text-indigo-300';
const PARAM_STYLE = 'font-mono text-xs text-yellow-400';
const OPT_PARAM_STYLE = 'font-mono text-xs text-[#e5e7eb]/40';

function Badge({ children, color = 'indigo' }: { children: React.ReactNode; color?: 'indigo' | 'yellow' | 'green' | 'red' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    yellow: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    green:  'bg-green-400/10 text-green-400 border-green-400/20',
    red:    'bg-red-400/10 text-red-400 border-red-400/20',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}

function CommandCard({ name, desc, usage, params, perms, note }: {
  name: string;
  desc: string;
  usage: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  perms?: string;
  note?: string;
}) {
  return (
    <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb]/10 flex items-start justify-between gap-4">
        <div>
          <code className={CMD_STYLE}>/{name}</code>
          <p className="text-sm text-[#e5e7eb]/70 mt-2">{desc}</p>
        </div>
        {perms && <Badge color="yellow">{perms}</Badge>}
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs text-[#e5e7eb]/40 uppercase tracking-wide font-medium mb-1.5">Usage</p>
          <code className="text-sm font-mono text-[#e5e7eb]/80 bg-[#09090b] block px-3 py-2 rounded-lg border border-[#e5e7eb]/10">
            /{usage}
          </code>
        </div>
        {params && params.length > 0 && (
          <div>
            <p className="text-xs text-[#e5e7eb]/40 uppercase tracking-wide font-medium mb-2">Parameters</p>
            <div className="space-y-1.5">
              {params.map((p) => (
                <div key={p.name} className="flex items-start gap-3 text-sm">
                  <span className={p.required ? PARAM_STYLE : OPT_PARAM_STYLE}>
                    {p.required ? `<${p.name}>` : `[${p.name}]`}
                  </span>
                  <span className="text-xs text-[#e5e7eb]/50">{p.type}</span>
                  <span className="text-xs text-[#e5e7eb]/60 flex-1">{p.desc}</span>
                  {!p.required && <span className="text-[10px] text-[#e5e7eb]/30 bg-[#e5e7eb]/5 px-1.5 py-0.5 rounded">optional</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {note && (
          <div className="flex gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2.5">
            <HelpCircle size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-200/80">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      <div className="max-w-5xl mx-auto w-full px-8 py-12 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-24 self-start">
          <p className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-wide mb-3">Contents</p>
          <nav className="space-y-0.5">
            {[
              { href: '#getting-started',        label: 'Getting Started' },
              { href: '#moderation-commands',     label: 'Moderation' },
              { href: '#utility-commands',        label: 'Utility' },
              { href: '#automod',                 label: 'Automod' },
              { href: '#dashboard',               label: 'Dashboard' },
              { href: '#permissions',             label: 'Permissions' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#e5e7eb]/50 hover:text-white hover:bg-[#111116] transition-colors"
              >
                <ChevronRight size={12} className="text-indigo-400 flex-shrink-0" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-14 min-w-0">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Terminal size={18} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Documentation</h1>
                <p className="text-[#e5e7eb]/50 text-sm">CLX Discord Bot — Command Reference</p>
              </div>
            </div>
          </div>

          {/* Getting started */}
          <section id="getting-started" className="space-y-5">
            <h2 className="text-xl font-bold text-white border-b border-[#e5e7eb]/10 pb-3">Getting Started</h2>
            <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white">1. Invite the Bot</h3>
              <p className="text-sm text-[#e5e7eb]/65">
                Use the <strong>Invite Bot</strong> button to add CLX to your Discord server. Make sure to grant all
                requested permissions so moderation and automod features work correctly.
              </p>
              <h3 className="font-semibold text-white">2. Set Up Logging</h3>
              <p className="text-sm text-[#e5e7eb]/65">
                In the{' '}
                <Link href="/dashboard" className="text-indigo-400 hover:underline">Dashboard</Link>
                , navigate to <strong>Settings</strong> and enter a <strong>Log Channel ID</strong>.
                All moderation actions will be posted there as embeds.
              </p>
              <h3 className="font-semibold text-white">3. Configure Automod</h3>
              <p className="text-sm text-[#e5e7eb]/65">
                Head to <strong>Automod</strong> to enable spam detection, word filtering, and link blocking.
                Each rule has its own action setting and can be toggled independently.
              </p>
              <h3 className="font-semibold text-white">4. Start Moderating</h3>
              <p className="text-sm text-[#e5e7eb]/65">
                Use slash commands to issue infractions. All moderation actions are stored and viewable
                in the dashboard under <strong>Moderation Log</strong> and per-user profiles.
              </p>
            </div>
          </section>

          {/* Moderation commands */}
          <section id="moderation-commands" className="space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e5e7eb]/10 pb-3">
              <Shield size={16} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Moderation Commands</h2>
            </div>
            <div className="space-y-4">
              <CommandCard
                name="warn"
                desc="Issue a warning to a member. The user receives a DM and the infraction is recorded."
                usage="warn <user> <reason>"
                perms="Moderate Members"
                params={[
                  { name: 'user',   type: 'User mention or ID', required: true,  desc: 'The member to warn.' },
                  { name: 'reason', type: 'Text',               required: true,  desc: 'Reason for the warning, logged and sent to the user.' },
                ]}
              />
              <CommandCard
                name="mute"
                desc="Timeout a member for a specified duration using Discord's built-in timeout. The member cannot send messages or join voice channels."
                usage="mute <user> <duration> [reason]"
                perms="Moderate Members"
                params={[
                  { name: 'user',     type: 'User mention or ID', required: true,  desc: 'The member to mute.' },
                  { name: 'duration', type: 'Duration string',    required: true,  desc: 'e.g. 10s, 5m, 2h, 1d. Max 28 days.' },
                  { name: 'reason',   type: 'Text',               required: false, desc: 'Optional reason, defaults to "No reason provided".' },
                ]}
                note="Discord timeout supports durations from 10 seconds to 28 days. Longer durations are clamped automatically."
              />
              <CommandCard
                name="ban"
                desc="Permanently ban a user from the server. Optionally deletes their recent message history."
                usage="ban <user> [delete_days] [reason]"
                perms="Ban Members"
                params={[
                  { name: 'user',         type: 'User mention or ID', required: true,  desc: 'The user to ban (does not need to be in the server).' },
                  { name: 'delete_days',  type: 'Number (0–7)',       required: false, desc: 'Days of message history to delete.' },
                  { name: 'reason',       type: 'Text',               required: false, desc: 'Reason for the ban.' },
                ]}
              />
              <CommandCard
                name="kick"
                desc="Kick a member from the server. They can rejoin with a new invite."
                usage="kick <user> [reason]"
                perms="Kick Members"
                params={[
                  { name: 'user',   type: 'User mention or ID', required: true,  desc: 'The member to kick.' },
                  { name: 'reason', type: 'Text',               required: false, desc: 'Reason for the kick.' },
                ]}
              />
              <CommandCard
                name="unban"
                desc="Unban a previously banned user by their Discord user ID."
                usage="unban <user_id> [reason]"
                perms="Ban Members"
                params={[
                  { name: 'user_id', type: 'Discord user ID (number)', required: true,  desc: 'The ID of the user to unban.' },
                  { name: 'reason',  type: 'Text',                     required: false, desc: 'Reason for the unban.' },
                ]}
              />
              <CommandCard
                name="purge"
                desc="Bulk-delete between 1 and 100 messages from the current channel. Optionally filter by a specific user."
                usage="purge <amount> [user]"
                perms="Manage Messages"
                params={[
                  { name: 'amount', type: 'Number (1–100)',      required: true,  desc: 'Number of messages to delete.' },
                  { name: 'user',   type: 'User mention or ID',  required: false, desc: 'Only delete messages from this user.' },
                ]}
                note="Discord only allows bulk deletion of messages newer than 14 days. Older messages will be skipped."
              />
              <CommandCard
                name="slowmode"
                desc="Set the slowmode delay for the current channel. Use 0 to disable slowmode."
                usage="slowmode <seconds>"
                perms="Manage Channels"
                params={[
                  { name: 'seconds', type: 'Number (0–21600)', required: true, desc: 'Slowmode delay in seconds. 0 disables it. Max is 6 hours (21600).' },
                ]}
              />
              <CommandCard
                name="lock"
                desc="Lock the current channel — removes the Send Messages permission for @everyone."
                usage="lock [reason]"
                perms="Manage Channels"
                params={[
                  { name: 'reason', type: 'Text', required: false, desc: 'Optional reason shown in the audit log.' },
                ]}
              />
              <CommandCard
                name="unlock"
                desc="Unlock a previously locked channel, restoring Send Messages for @everyone."
                usage="unlock [reason]"
                perms="Manage Channels"
                params={[
                  { name: 'reason', type: 'Text', required: false, desc: 'Optional reason shown in the audit log.' },
                ]}
              />
            </div>
          </section>

          {/* Utility commands */}
          <section id="utility-commands" className="space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e5e7eb]/10 pb-3">
              <Terminal size={16} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Utility Commands</h2>
            </div>
            <div className="space-y-4">
              <CommandCard
                name="infractions"
                desc="View the last 10 infractions for a specific user in this server."
                usage="infractions <user>"
                params={[
                  { name: 'user', type: 'User mention or ID', required: true, desc: 'The user whose infraction history to view.' },
                ]}
              />
              <CommandCard
                name="userinfo"
                desc="Display a user's profile: join date, account age, roles, and an infraction summary with the 3 most recent cases."
                usage="userinfo <user>"
                params={[
                  { name: 'user', type: 'User mention or ID', required: true, desc: 'The user to look up.' },
                ]}
              />
              <CommandCard
                name="case"
                desc="View the full details of a single infraction case by its ID."
                usage="case <case_id>"
                params={[
                  { name: 'case_id', type: 'Case ID string (e.g. ABC123)', required: true, desc: 'The last 6 characters of the infraction ID, shown in logs.' },
                ]}
              />
              <CommandCard
                name="delcase"
                desc="Permanently delete an infraction record from the database."
                usage="delcase <case_id>"
                params={[
                  { name: 'case_id', type: 'Case ID string', required: true, desc: 'The case to delete. This action cannot be undone.' },
                ]}
                note="Deleting a case removes it from both the bot records and the dashboard. Use with caution."
              />
              <CommandCard
                name="serverinfo"
                desc="Display server statistics: member count, channel count, role count, creation date, and boost level."
                usage="serverinfo"
              />
              <CommandCard
                name="ping"
                desc="Check the bot's current API latency."
                usage="ping"
              />
            </div>
          </section>

          {/* Automod section */}
          <section id="automod" className="space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e5e7eb]/10 pb-3">
              <Settings size={16} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Automod</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: 'Spam Detection',
                  desc: 'Tracks how many messages each user sends within a configurable time window. Triggers when the threshold is exceeded or when 3+ identical messages are sent.',
                  config: ['Threshold — max messages before action (default: 5)', 'Interval — rolling window in seconds (default: 5)'],
                },
                {
                  title: 'Word Filter',
                  desc: 'Normalises message content (removes zero-width characters, strips punctuation) and checks against a blacklist using word-boundary regex matching.',
                  config: ['Blacklisted Words — comma-separated list of words and phrases'],
                },
                {
                  title: 'Link Detection',
                  desc: 'Extracts URLs from messages and checks their domain against an allowlist. An empty allowlist blocks all links.',
                  config: ['Allowed Domains — comma-separated list of permitted domains (e.g. discord.com, youtube.com)'],
                },
              ].map((rule) => (
                <div key={rule.title} className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-3">
                  <h3 className="font-semibold text-white">{rule.title}</h3>
                  <p className="text-sm text-[#e5e7eb]/65">{rule.desc}</p>
                  <div>
                    <p className="text-xs text-[#e5e7eb]/40 uppercase tracking-wide font-medium mb-2">Configurable Fields</p>
                    <ul className="space-y-1">
                      {rule.config.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-[#e5e7eb]/60">
                          <span className="text-indigo-400 mt-0.5">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-[#e5e7eb]/40 uppercase tracking-wide font-medium mb-2">Available Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {['Warn', 'Timeout (10m)', 'Kick', 'Ban', 'Delete only'].map((a) => (
                        <Badge key={a}>{a}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dashboard section */}
          <section id="dashboard" className="space-y-5">
            <h2 className="text-xl font-bold text-white border-b border-[#e5e7eb]/10 pb-3">Dashboard</h2>
            <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
              <p className="text-sm text-[#e5e7eb]/65">
                Log in with Discord at <Link href="/" className="text-indigo-400 hover:underline">clx.app</Link> and
                select your server to access the management dashboard. You must have <Badge>Manage Guild</Badge> or{' '}
                <Badge>Administrator</Badge> permission to access a server&apos;s dashboard.
              </p>
              {[
                { page: 'Overview',        desc: 'Infraction stats, week-over-week trend, recent activity, and top actioned users.' },
                { page: 'Moderation Log',  desc: 'Full paginated infraction log with type filter and username search.' },
                { page: 'Users',           desc: 'Browse and search all tracked users. Click any user to see their full infraction history.' },
                { page: 'Automod',         desc: 'Enable/disable rules, set actions, and configure spam thresholds, word lists, and allowed domains — all per-rule.' },
                { page: 'Analytics',       desc: '14-day infraction chart, type breakdown, and top moderators over the last 30 days.' },
                { page: 'Settings',        desc: 'Log channel, mute role, automod master switch, spam settings, and content filter lists.' },
              ].map(({ page, desc }) => (
                <div key={page} className="flex gap-3">
                  <ChevronRight size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{page}</p>
                    <p className="text-xs text-[#e5e7eb]/55">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Permissions */}
          <section id="permissions" className="space-y-5">
            <h2 className="text-xl font-bold text-white border-b border-[#e5e7eb]/10 pb-3">Required Permissions</h2>
            <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Permission</th>
                    <th className="px-5 py-3 text-left font-medium">Required For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]/5">
                  {[
                    { perm: 'Moderate Members', for: '/warn, /mute' },
                    { perm: 'Kick Members',     for: '/kick' },
                    { perm: 'Ban Members',      for: '/ban, /unban' },
                    { perm: 'Manage Messages',  for: '/purge, automod message deletion' },
                    { perm: 'Manage Channels',  for: '/slowmode, /lock, /unlock' },
                    { perm: 'Send Messages',    for: 'All command responses and log embeds' },
                    { perm: 'Read Message History', for: '/purge bulk deletion' },
                  ].map(({ perm, for: f }) => (
                    <tr key={perm} className="hover:bg-[#1c1c24] transition-colors">
                      <td className="px-5 py-3"><Badge>{perm}</Badge></td>
                      <td className="px-5 py-3 text-[#e5e7eb]/60 text-xs">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <MarketingFooter />
    </div>
  );
}
