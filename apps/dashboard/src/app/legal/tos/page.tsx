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
        <p className="text-sm text-[#e5e7eb]/40 mt-2">Last updated: May 2025</p>
      </header>

      <Section title="1. Scope and Provider">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern the use of the CLX Discord bot
          (&quot;the Bot&quot;) and the CLX Dashboard at clx.gg (&quot;the Dashboard&quot;),
          collectively referred to as &quot;the Service&quot;.
        </p>
        <p>
          The provider is identified in the{' '}
          <a href="/legal/impressum" className="text-indigo-400 hover:underline">Impressum</a>.
          The contract language is English. These Terms do not affect any mandatory rights you
          have under applicable law.
        </p>
      </Section>

      <Section title="2. Acceptance of Terms">
        <p>
          By adding the Bot to your Discord server or using the Dashboard, you agree to these Terms.
          If you do not agree, you must not use the Service.
        </p>
        <p>
          These Terms apply to server administrators, moderators, and all users who interact with
          the Bot or Dashboard.
        </p>
      </Section>

      <Section title="3. Description of Service">
        <p>
          CLX is a Discord moderation bot providing moderation commands, automated content
          moderation (automod), infraction logging, ticket management, and a web-based
          management dashboard.
        </p>
        <p>
          The Service is provided free of charge. We reserve the right to modify, suspend, or
          discontinue the Service or any part thereof, giving reasonable advance notice where
          practicable. We are not liable for any interruption or discontinuation.
        </p>
      </Section>

      <Section title="4. Permitted Use">
        <p>
          You may only use the Service for lawful purposes and in accordance with Discord&apos;s{' '}
          <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Community Guidelines
          </a>.
        </p>
        <p>
          You are responsible for all moderation actions taken through your use of the Service,
          including actions taken by moderators you have granted permissions to.
        </p>
      </Section>

      <Section title="5. Prohibited Activities">
        <p>You must not use the Service to:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Harass, abuse, threaten, or harm any individual or group.</li>
          <li>Conduct, facilitate, or promote illegal activities under German or applicable law.</li>
          <li>Attempt to reverse-engineer, exploit, or compromise the bot or dashboard infrastructure.</li>
          <li>Use automated scripts or bots to interact with the Service in a way that causes undue load.</li>
          <li>Impersonate CLX developers or staff with intent to deceive.</li>
          <li>Process sensitive personal data (Art. 9 GDPR) of Discord members through the Service beyond what is necessary for moderation purposes.</li>
        </ul>
        <p>
          Violations may result in immediate removal of access without notice.
        </p>
      </Section>

      <Section title="6. Data Protection">
        <p>
          Please refer to our{' '}
          <a href="/legal/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>{' '}
          for full details on what data we collect and how it is handled in accordance with the GDPR
          and the German Federal Data Protection Act (BDSG).
        </p>
        <p>
          By using the Service, you acknowledge that certain data (guild IDs, user IDs, usernames,
          and infraction records) is stored to provide core moderation functionality.
        </p>
        <p>
          As a server administrator, you are jointly responsible for ensuring that the use of CLX
          within your server complies with applicable data protection law, including informing your
          members about the data processing that takes place.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          To the extent permitted by mandatory German law (in particular § 521, § 599 BGB for
          gratuitous services), we are only liable for damages caused by wilful misconduct
          (<em>Vorsatz</em>) or gross negligence (<em>grobe Fahrlässigkeit</em>).
          Liability for ordinary negligence is excluded except in cases involving injury to
          life, body, or health, or breach of a cardinal contractual obligation
          (<em>wesentliche Vertragspflicht</em>), in which case liability is limited to
          foreseeable, typical damage.
        </p>
        <p>
          Because the Service is provided free of charge, liability is further limited in
          accordance with § 521 BGB (liability limited to wilful misconduct for gratuitous
          services).
        </p>
        <p>
          We do not guarantee uninterrupted availability or error-free operation. Data stored
          within the Service may be lost in the event of technical failure; we recommend that
          server administrators keep their own records of important moderation actions.
        </p>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available.&quot; To the extent permitted
          by applicable law, we disclaim all implied warranties, including fitness for a particular
          purpose and non-infringement. This disclaimer does not affect any mandatory statutory
          rights you may have under German law.
        </p>
      </Section>

      <Section title="9. Changes to These Terms">
        <p>
          We may update these Terms to reflect changes in the Service or applicable law. We will
          announce material changes via our Discord server at least 30 days before they take effect.
          If you do not agree with the updated Terms, you must stop using the Service before the
          changes take effect. Continued use after that date constitutes acceptance of the revised Terms.
        </p>
        <p>
          For minor changes (corrections, clarifications) that do not affect your rights, the
          updated Terms take effect immediately upon publication.
        </p>
      </Section>

      <Section title="10. Governing Law and Jurisdiction">
        <p>
          These Terms and any disputes arising from or in connection with them are governed
          exclusively by the laws of the Federal Republic of Germany, excluding the UN Convention
          on Contracts for the International Sale of Goods (CISG) and conflict-of-law provisions.
        </p>
        <p>
          If you are a consumer within the meaning of § 13 BGB and habitually resident in an EU
          member state, mandatory consumer protection provisions of your country of residence
          remain unaffected.
        </p>
        <p>
          The place of jurisdiction for disputes with merchants (<em>Kaufleute</em>), legal entities
          under public law, or public-law special funds is the registered location of the provider
          as stated in the{' '}
          <a href="/legal/impressum" className="text-indigo-400 hover:underline">Impressum</a>,
          to the extent legally permissible.
        </p>
      </Section>

      <Section title="11. Consumer Dispute Resolution (ODR)">
        <p>
          The European Commission provides an Online Dispute Resolution (ODR) platform for consumers
          at:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          We are not obligated to participate in consumer dispute resolution proceedings before a
          consumer arbitration board (<em>Verbraucherschlichtungsstelle</em>) and do not voluntarily
          participate in such proceedings.
        </p>
      </Section>

      <Section title="12. Severability">
        <p>
          Should any provision of these Terms be or become wholly or partially invalid or
          unenforceable, this shall not affect the validity of the remaining provisions.
          The invalid or unenforceable provision shall be replaced by one that most closely
          approximates the intended economic purpose, in accordance with § 306 BGB.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:contact@craftlabsx.de" className="text-indigo-400 hover:underline">contact@craftlabsx.de</a>{' '}
          or via{' '}
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
