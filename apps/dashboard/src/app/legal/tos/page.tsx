import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for CLX Discord bot and dashboard.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="text-sm text-[#e5e7eb]/65 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TosPage() {
  return (
    <article className="space-y-10">
      <header className="border-b border-[#e5e7eb]/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-[#e5e7eb]/40 mt-2">Last updated: April 2025</p>
      </header>

      <Section title="1. Acceptance of Terms">
        <p>
          By adding CLX (&quot;the Bot&quot;) to your Discord server or using the CLX Dashboard
          (&quot;the Dashboard&quot;), you agree to be bound by these Terms of Service
          (&quot;Terms&quot;). If you do not agree, you must not use CLX or the Dashboard.
        </p>
        <p>
          These Terms apply to all server administrators, moderators, and users who interact
          with CLX in any way.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          CLX is a Discord moderation bot that provides moderation commands, automated content
          moderation (automod), infraction logging, and a web-based management dashboard.
        </p>
        <p>
          The service is provided free of charge and on an &quot;as-is&quot; basis. We reserve the right
          to modify, suspend, or discontinue any part of the service at any time without notice.
        </p>
      </Section>

      <Section title="3. Permitted Use">
        <p>You may use CLX only for lawful purposes and in accordance with Discord&apos;s own{' '}
          <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Community Guidelines
          </a>.
        </p>
        <p>You are responsible for all moderation actions taken through your use of CLX,
          including commands issued by your moderators.</p>
      </Section>

      <Section title="4. Prohibited Activities">
        <p>You must not use CLX to:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Harass, abuse, or harm any individual or group.</li>
          <li>Conduct or facilitate illegal activities of any kind.</li>
          <li>Attempt to reverse-engineer, exploit, or attack the bot or dashboard infrastructure.</li>
          <li>Use automated means to interact with the service in a way that causes undue load.</li>
          <li>Impersonate CLX developers or staff in a way intended to deceive other users.</li>
        </ul>
      </Section>

      <Section title="5. Data">
        <p>
          Please refer to our{' '}
          <a href="/legal/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>{' '}
          for full details on what data we collect and how it is handled.
        </p>
        <p>
          By using CLX, you acknowledge that certain data (guild ID, user IDs, usernames, and
          infraction records) is stored in order to provide the core functionality of the service.
        </p>
      </Section>

      <Section title="6. Disclaimer of Warranties">
        <p>
          CLX is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either
          express or implied, including but not limited to fitness for a particular purpose,
          merchantability, or non-infringement.
        </p>
        <p>
          We do not guarantee that the service will be uninterrupted, error-free, or that any
          data stored will be preserved indefinitely.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, CraftLabsX and its developers shall
          not be liable for any indirect, incidental, special, or consequential damages arising
          from your use of or inability to use CLX or the Dashboard.
        </p>
      </Section>

      <Section title="8. Changes to Terms">
        <p>
          We reserve the right to update these Terms at any time. Continued use of CLX or the
          Dashboard after changes are published constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about these Terms? Reach us on{' '}
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ? (
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              our Discord server
            </a>
          ) : (
            <span>our Discord server</span>
          )}
          .
        </p>
      </Section>
    </article>
  );
}
