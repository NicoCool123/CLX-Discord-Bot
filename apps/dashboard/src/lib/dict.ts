export type Locale = 'en' | 'de';

const translations = {
  en: {
    nav: {
      docs: 'Docs',
      team: 'Team',
      status: 'Status',
      support: 'Support',
      login: 'Login with Discord',
      dashboard: 'Dashboard',
      invite: 'Invite Bot',
    },
    hero: {
      badge: 'Professional Discord Bot',
      title1: 'CraftLabsX',
      title2: 'Discord Bot',
      subtitle: 'Advanced moderation, automod, and detailed analytics — all managed from one clean dashboard.',
      ctaDashboard: 'Go to Dashboard',
      ctaLogin: 'Login with Discord',
      ctaInvite: 'Invite Bot',
    },
    features: {
      heading: 'Everything you need',
      subheading: 'Powerful tools to keep your server safe and organised.',
      items: [
        {
          title: 'Advanced Moderation',
          desc: 'Warn, mute, kick, and ban with full infraction history tracked per user.',
        },
        {
          title: 'Smart Automod',
          desc: 'Automatic spam, word filter, and link detection with configurable per-rule actions.',
        },
        {
          title: 'Analytics & Logs',
          desc: 'Full audit trail with trends, top moderators, and detailed infraction breakdowns.',
        },
      ],
    },
    stats: [
      { label: 'Commands', value: '15+' },
      { label: 'Automod Rules', value: '3' },
      { label: 'Dashboard Pages', value: '8+' },
      { label: 'Free to Use', value: 'Always' },
    ],
    community: {
      heading: 'Join our Community',
      subheading:
        'Get support, suggest features, and stay up to date with the latest CLX announcements.',
      join: 'Join Discord Server',
    },
    footer: {
      description: 'A professional Discord moderation bot for communities of all sizes.',
      sections: {
        product: 'Product',
        legal: 'Legal',
      },
      links: {
        docs: 'Documentation',
        team: 'Team',
        status: 'Status',
        support: 'Support',
        invite: 'Invite Bot',
      },
      legal: {
        tos: 'Terms of Service',
        privacy: 'Privacy Policy',
        impressum: 'Impressum',
      },
      rights: 'All rights reserved.',
    },
  },
  de: {
    nav: {
      docs: 'Docs',
      team: 'Team',
      status: 'Status',
      support: 'Support',
      login: 'Mit Discord anmelden',
      dashboard: 'Dashboard',
      invite: 'Bot einladen',
    },
    hero: {
      badge: 'Professioneller Discord-Bot',
      title1: 'CraftLabsX',
      title2: 'Discord Bot',
      subtitle:
        'Fortschrittliche Moderation, Automod und detaillierte Analysen — alles verwaltet über ein übersichtliches Dashboard.',
      ctaDashboard: 'Zum Dashboard',
      ctaLogin: 'Mit Discord anmelden',
      ctaInvite: 'Bot einladen',
    },
    features: {
      heading: 'Alles, was du brauchst',
      subheading: 'Leistungsstarke Tools, um deinen Server sicher und organisiert zu halten.',
      items: [
        {
          title: 'Erweiterte Moderation',
          desc: 'Verwarne, stumm schalte, kicke und banne mit vollständiger Protokollierung pro Nutzer.',
        },
        {
          title: 'Intelligenter Automod',
          desc: 'Automatische Spam-, Wort- und Linkerkennung mit konfigurierbaren Aktionen pro Regel.',
        },
        {
          title: 'Analysen & Logs',
          desc: 'Vollständiger Prüfpfad mit Trends, Top-Moderatoren und detaillierten Aufschlüsselungen.',
        },
      ],
    },
    stats: [
      { label: 'Befehle', value: '15+' },
      { label: 'Automod-Regeln', value: '3' },
      { label: 'Dashboard-Seiten', value: '8+' },
      { label: 'Kostenlos', value: 'Immer' },
    ],
    community: {
      heading: 'Tritt unserer Community bei',
      subheading:
        'Erhalte Support, schlage Funktionen vor und bleibe über die neuesten CLX-Ankündigungen informiert.',
      join: 'Discord-Server beitreten',
    },
    footer: {
      description: 'Ein professioneller Discord-Moderationsbot für Communities jeder Größe.',
      sections: {
        product: 'Produkt',
        legal: 'Rechtliches',
      },
      links: {
        docs: 'Dokumentation',
        team: 'Team',
        status: 'Status',
        support: 'Support',
        invite: 'Bot einladen',
      },
      legal: {
        tos: 'Nutzungsbedingungen',
        privacy: 'Datenschutzerklärung',
        impressum: 'Impressum',
      },
      rights: 'Alle Rechte vorbehalten.',
    },
  },
} as const;

export type Dict = typeof translations.en;

export function getDict(locale: Locale): Dict {
  return (translations[locale] ?? translations.en) as Dict;
}
