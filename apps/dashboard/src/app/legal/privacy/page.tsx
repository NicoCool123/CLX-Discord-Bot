function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="text-sm text-[#e5e7eb]/65 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

function DataRow({ field, value, retention }: { field: string; value: string; retention: string }) {
  return (
    <tr className="border-b border-[#e5e7eb]/5 hover:bg-[#1c1c24] transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{field}</td>
      <td className="px-4 py-3 text-xs text-[#e5e7eb]/65">{value}</td>
      <td className="px-4 py-3 text-xs text-[#e5e7eb]/50">{retention}</td>
    </tr>
  );
}

export default function PrivacyPage() {
  return (
    <article className="space-y-10">
      <header className="border-b border-[#e5e7eb]/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-[#e5e7eb]/40 mt-2">Last updated: April 2025</p>
      </header>

      <Section title="1. Introduction">
        <p>
          This Privacy Policy explains what data CLX (&quot;the Bot&quot;) and the CLX Dashboard collect,
          why it is collected, how it is stored, and your rights regarding that data.
        </p>
        <p>
          We collect the minimum data necessary to provide moderation and automod functionality.
          We do not sell or share your data with third parties.
        </p>
      </Section>

      <Section title="2. Data We Collect">
        <p>The following data is collected automatically when CLX is active in a server:</p>

        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Field</th>
                <th className="px-4 py-3 text-left font-medium">Purpose</th>
                <th className="px-4 py-3 text-left font-medium">Retention</th>
              </tr>
            </thead>
            <tbody>
              <DataRow field="Guild ID"        value="Identifies the Discord server"                         retention="Until bot is removed" />
              <DataRow field="Guild Name"      value="Displayed in the dashboard"                           retention="Until bot is removed" />
              <DataRow field="User ID"         value="Identifies members who have been moderated"           retention="Until deletion requested" />
              <DataRow field="Username"        value="Displayed in dashboard and infraction logs"           retention="Until deletion requested" />
              <DataRow field="Infraction Type" value="Classifies the action (warn, mute, ban, etc.)"       retention="Until case is deleted" />
              <DataRow field="Infraction Reason" value="Describes why the action was taken"                retention="Until case is deleted" />
              <DataRow field="Moderator ID"    value="Records which moderator issued the infraction"        retention="Until case is deleted" />
              <DataRow field="Timestamps"      value="Records when infractions occurred"                   retention="Until case is deleted" />
              <DataRow field="Duration"        value="Mute duration in seconds"                            retention="Until case is deleted" />
            </tbody>
          </table>
        </div>

        <p className="mt-2">
          We also temporarily process message content to run automod checks (spam, word filter, link
          detection). <strong className="text-white">Message content is never stored.</strong>
        </p>
      </Section>

      <Section title="3. Dashboard Login">
        <p>
          When you log in to the Dashboard via Discord OAuth, we receive your Discord user ID,
          username, and avatar URL. This information is used only to authenticate your session
          and verify your guild permissions. We do not store OAuth tokens beyond the session lifetime.
        </p>
      </Section>

      <Section title="4. Data Storage">
        <p>
          All data is stored in a PostgreSQL database hosted within the EU. Access is restricted
          to the CLX service and authorised administrators.
        </p>
        <p>
          We do not use cookies beyond what is necessary for session management and your language preference.
        </p>
      </Section>

      <Section title="5. Your Rights (GDPR)">
        <p>
          If you are located in the European Economic Area, you have the following rights under the
          General Data Protection Regulation (GDPR):
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-white">Right of access</strong> — request a copy of your data.</li>
          <li><strong className="text-white">Right to rectification</strong> — request correction of inaccurate data.</li>
          <li><strong className="text-white">Right to erasure</strong> — request deletion of your data.</li>
          <li><strong className="text-white">Right to restriction</strong> — request that we limit processing of your data.</li>
          <li><strong className="text-white">Right to data portability</strong> — receive your data in a structured format.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us via our{' '}
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ? (
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              Discord server
            </a>
          ) : (
            <span>Discord server</span>
          )}
          {' '}or at the email address listed in the Impressum.
        </p>
      </Section>

      <Section title="6. Data Deletion">
        <p>
          Server administrators can delete individual infraction cases through the Dashboard
          at any time. To request full data deletion for your server or user account,
          contact us directly.
        </p>
        <p>
          When the bot is removed from a server, data is not automatically deleted — contact us
          to request manual deletion.
        </p>
      </Section>

      <Section title="7. Third Parties">
        <p>
          CLX uses the Discord API to function. Discord&apos;s own{' '}
          <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Privacy Policy
          </a>{' '}
          applies to data processed through their platform. No other third-party services receive your data.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top
          of this page will reflect when changes were made. Continued use of CLX after changes
          constitutes acceptance.
        </p>
      </Section>
    </article>
  );
}
