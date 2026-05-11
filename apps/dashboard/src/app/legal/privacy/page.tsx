import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for CLX Discord bot and dashboard.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="text-sm text-[#e5e7eb]/65 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

function DataRow({ field, value, basis, retention }: { field: string; value: string; basis: string; retention: string }) {
  return (
    <tr className="border-b border-[#e5e7eb]/5 hover:bg-[#1c1c24] transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{field}</td>
      <td className="px-4 py-3 text-xs text-[#e5e7eb]/65">{value}</td>
      <td className="px-4 py-3 text-xs text-[#e5e7eb]/50">{basis}</td>
      <td className="px-4 py-3 text-xs text-[#e5e7eb]/50">{retention}</td>
    </tr>
  );
}

export default function PrivacyPage() {
  return (
    <article className="space-y-10">
      <header className="border-b border-[#e5e7eb]/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-[#e5e7eb]/40 mt-2">Last updated: May 2025</p>
      </header>

      <Section title="1. Data Controller (Verantwortlicher)">
        <p>
          The party responsible for data processing within the meaning of the General Data Protection
          Regulation (GDPR) and the German Federal Data Protection Act (BDSG) is identified in the{' '}
          <a href="/legal/impressum" className="text-indigo-400 hover:underline">Impressum</a>.
          Contact for privacy matters: <a href="mailto:contact@craftlabsx.de" className="text-indigo-400 hover:underline">contact@craftlabsx.de</a>
        </p>
        <p>
          A Data Protection Officer is not required under Art. 37 GDPR for this operation.
        </p>
      </Section>

      <Section title="2. Scope and Purpose">
        <p>
          This Privacy Policy describes how CLX (&quot;the Bot&quot;) and the CLX Dashboard
          (&quot;the Dashboard&quot;) collect, process, and store personal data in accordance
          with the GDPR, the German Federal Data Protection Act (BDSG), and the German
          Telecommunications and Telemedia Data Protection Act (TTDSG).
        </p>
        <p>
          We process only the minimum data necessary to provide the service. We do not sell
          your data or share it with third parties outside of what is described in section 8.
        </p>
      </Section>

      <Section title="3. Data We Collect and Legal Basis">
        <p>
          The following personal data is processed when CLX is active in a Discord server.
          The legal basis for each category is indicated in accordance with Art. 6 GDPR:
        </p>

        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Field</th>
                <th className="px-4 py-3 text-left font-medium">Purpose</th>
                <th className="px-4 py-3 text-left font-medium">Legal Basis</th>
                <th className="px-4 py-3 text-left font-medium">Retention</th>
              </tr>
            </thead>
            <tbody>
              <DataRow field="Guild ID"          value="Identifies the Discord server"                    basis="Art. 6(1)(b) GDPR" retention="Until bot is removed" />
              <DataRow field="Guild Name"        value="Displayed in the dashboard"                       basis="Art. 6(1)(b) GDPR" retention="Until bot is removed" />
              <DataRow field="User ID"           value="Identifies members who have been moderated"       basis="Art. 6(1)(b) GDPR" retention="Until deletion requested" />
              <DataRow field="Username"          value="Displayed in dashboard and infraction logs"       basis="Art. 6(1)(b) GDPR" retention="Until deletion requested" />
              <DataRow field="Infraction Type"   value="Classifies the action (warn, mute, ban, etc.)"   basis="Art. 6(1)(b) GDPR" retention="Until case is deleted" />
              <DataRow field="Infraction Reason" value="Describes why the action was taken"              basis="Art. 6(1)(b) GDPR" retention="Until case is deleted" />
              <DataRow field="Moderator ID"      value="Records which moderator issued the infraction"   basis="Art. 6(1)(b) GDPR" retention="Until case is deleted" />
              <DataRow field="Timestamps"        value="Records when infractions occurred"               basis="Art. 6(1)(b) GDPR" retention="Until case is deleted" />
              <DataRow field="Duration"          value="Mute duration in seconds"                        basis="Art. 6(1)(b) GDPR" retention="Until case is deleted" />
            </tbody>
          </table>
        </div>

        <p className="mt-2">
          The legal basis <strong className="text-white">Art. 6(1)(b) GDPR</strong> applies because
          processing is necessary to perform the moderation service as agreed when the bot is added
          to a server.
        </p>
        <p>
          We also temporarily process message content to run automod checks (spam detection, word
          filter, link detection) on the basis of <strong className="text-white">Art. 6(1)(f) GDPR</strong>{' '}
          (legitimate interest in preventing harmful content).{' '}
          <strong className="text-white">Message content is never stored.</strong>
        </p>
      </Section>

      <Section title="4. Dashboard Login and Session Data">
        <p>
          When you log in to the Dashboard via Discord OAuth2, we receive your Discord user ID,
          username, and avatar URL. This data is processed on the basis of{' '}
          <strong className="text-white">Art. 6(1)(b) GDPR</strong> (authentication and permission
          verification are necessary to provide the dashboard service).
        </p>
        <p>
          Session data is stored in a short-lived, server-side session cookie and is not persisted
          beyond the session lifetime. We do not store OAuth access tokens.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          This website uses only technically necessary cookies as permitted under § 25(2) TTDSG:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong className="text-white">Session cookie</strong> — stores your authenticated
            session. Deleted when you close your browser or log out.
          </li>
          <li>
            <strong className="text-white">Language preference cookie</strong> — stores your
            selected display language. Expires after 1 year.
          </li>
        </ul>
        <p>
          No tracking, advertising, or analytics cookies are used. No consent is required for
          technically necessary cookies under § 25(2) TTDSG.
        </p>
      </Section>

      <Section title="6. Data Storage and Security">
        <p>
          All data is stored in a PostgreSQL database hosted on a server located within Germany
          (European Union). Access is restricted to the CLX service and authorised administrators.
        </p>
        <p>
          Data transmission between your browser and our dashboard is encrypted using TLS (HTTPS).
          We implement appropriate technical and organisational measures (TOMs) under Art. 32 GDPR
          to protect your data against unauthorised access, alteration, or loss.
        </p>
      </Section>

      <Section title="7. Your Rights Under GDPR (Art. 15–22)">
        <p>
          You have the following rights regarding your personal data. To exercise them, contact
          us at <a href="mailto:contact@craftlabsx.de" className="text-indigo-400 hover:underline">contact@craftlabsx.de</a>{' '}
          or via our{' '}
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ? (
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              Discord server
            </a>
          ) : (
            <span>Discord server</span>
          )}. We will respond within one month as required by Art. 12(3) GDPR.
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-white">Right of access (Art. 15)</strong> — request a copy of the data we hold about you.</li>
          <li><strong className="text-white">Right to rectification (Art. 16)</strong> — request correction of inaccurate data.</li>
          <li><strong className="text-white">Right to erasure (Art. 17)</strong> — request deletion of your data (&quot;right to be forgotten&quot;).</li>
          <li><strong className="text-white">Right to restriction (Art. 18)</strong> — request that we restrict processing of your data.</li>
          <li><strong className="text-white">Right to data portability (Art. 20)</strong> — receive your data in a machine-readable format.</li>
          <li>
            <strong className="text-white">Right to object (Art. 21)</strong> — object to processing
            based on legitimate interests (Art. 6(1)(f)). We will cease such processing unless we can
            demonstrate compelling legitimate grounds.
          </li>
          <li>
            <strong className="text-white">Right not to be subject to automated decisions (Art. 22)</strong> — no
            automated decision-making or profiling with legal or similarly significant effect takes place.
          </li>
        </ul>
      </Section>

      <Section title="8. Right to Lodge a Complaint">
        <p>
          You have the right to lodge a complaint with a data protection supervisory authority
          at any time under Art. 77 GDPR. The competent supervisory authority depends on
          your place of residence or the location of the alleged infringement. The federal
          authority for Germany is:
        </p>
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl px-5 py-4 mt-2 space-y-1">
          <p className="text-white text-xs font-semibold">Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)</p>
          <p>Graurheindorfer Str. 153, 53117 Bonn</p>
          <p>Telefon: +49 228 997799-0</p>
          <p><a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">www.bfdi.bund.de</a></p>
        </div>
        <p>
          Alternatively you may contact the data protection authority of your German federal state
          (Landesdatenschutzbehörde).
        </p>
      </Section>

      <Section title="9. Data Deletion Requests">
        <p>
          Server administrators can delete individual infraction cases through the Dashboard at any
          time. To request full deletion of all data associated with your server or user account,
          contact us directly. We will process your request within 30 days.
        </p>
        <p>
          When the bot is removed from a server, server-level configuration data is not automatically
          deleted — contact us to request manual deletion.
        </p>
      </Section>

      <Section title="10. Third-Party Services and International Data Transfers">
        <p>
          CLX uses the Discord API (Discord Inc., USA) to function as a bot. When interacting with
          CLX via Discord, your data passes through Discord&apos;s infrastructure. Discord transfers
          data to the US under Standard Contractual Clauses (SCCs) as per Art. 46(2)(c) GDPR.
          Discord&apos;s own{' '}
          <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Privacy Policy
          </a>{' '}
          applies to data processed through their platform.
        </p>
        <p>
          No other third-party services receive your personal data. The CLX dashboard and database
          are hosted within the EU (Germany) and no personal data is transferred outside the EEA
          by our infrastructure.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy to reflect changes in the service or applicable law.
          The &quot;Last updated&quot; date at the top reflects when changes were made.
          Material changes will be announced via our Discord server. Continued use of CLX after
          changes take effect constitutes acceptance unless you object within 30 days.
        </p>
      </Section>
    </article>
  );
}
