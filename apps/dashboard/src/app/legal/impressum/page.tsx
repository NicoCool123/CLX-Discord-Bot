import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum / legal notice for CLX.',
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[#e5e7eb]/50 uppercase tracking-wide">{title}</h2>
      <div className="text-sm text-[#e5e7eb]/75 leading-relaxed space-y-1">{children}</div>
    </section>
  );
}

export default function ImpressumPage() {
  return (
    <article className="space-y-10">
      <header className="border-b border-[#e5e7eb]/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Impressum</h1>
        <p className="text-xs text-[#e5e7eb]/40 mt-2">
          Angaben gemäß § 5 TMG / Information according to § 5 TMG (German Telemedia Act)
        </p>
      </header>

      {/* DE */}
      <div className="space-y-7">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">DE</span>
          <p className="text-xs text-[#e5e7eb]/40">Deutsch</p>
        </div>

        <Block title="Angaben gemäß § 5 TMG">
          <p>[VORNAME NACHNAME / FIRMENNAME]</p>
          <p>[STRAßE HAUSNUMMER]</p>
          <p>[PLZ ORT]</p>
          <p>[LAND]</p>
        </Block>

        <Block title="Kontakt">
          <p>E-Mail: <a href="mailto:contact@craftlabsx.de" className="text-indigo-400 hover:underline">contact@craftlabsx.de</a></p>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL && (
            <p>Discord: <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Server beitreten</a></p>
          )}
        </Block>

        <Block title="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV">
          <p>[VORNAME NACHNAME]</p>
          <p>[STRAßE HAUSNUMMER]</p>
          <p>[PLZ ORT]</p>
        </Block>

        <Block title="Haftungsausschluss">
          <p className="text-[#e5e7eb]/60">
            Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </Block>

        <Block title="Urheberrecht">
          <p className="text-[#e5e7eb]/60">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
            bzw. Erstellers.
          </p>
        </Block>
      </div>

      <div className="border-t border-[#e5e7eb]/10 pt-8 space-y-7">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">EN</span>
          <p className="text-xs text-[#e5e7eb]/40">English</p>
        </div>

        <Block title="Legal Disclosure (§ 5 TMG)">
          <p>[FIRST NAME LAST NAME / COMPANY NAME]</p>
          <p>[STREET ADDRESS]</p>
          <p>[POSTAL CODE CITY]</p>
          <p>[COUNTRY]</p>
        </Block>

        <Block title="Contact">
          <p>Email: <a href="mailto:contact@craftlabsx.de" className="text-indigo-400 hover:underline">contact@craftlabsx.de</a></p>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL && (
            <p>Discord: <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Join server</a></p>
          )}
        </Block>

        <Block title="Disclaimer">
          <p className="text-[#e5e7eb]/60">
            The contents of these pages have been created with the greatest care. However, we cannot
            guarantee the accuracy, completeness, or timeliness of the content. As a service provider,
            we are responsible for our own content on these pages in accordance with § 7 para. 1 TMG.
          </p>
        </Block>

        <div className="bg-yellow-400/8 border border-yellow-400/20 rounded-xl px-5 py-4">
          <p className="text-xs text-yellow-400/80">
            <strong className="text-yellow-400">Note:</strong> Fields marked with [BRACKETS] are placeholders
            and must be replaced with your real legal information before publishing.
            An Impressum with incorrect or incomplete information may violate German law (§ 5 TMG).
          </p>
        </div>
      </div>
    </article>
  );
}
