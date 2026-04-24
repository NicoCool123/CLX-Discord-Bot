import { Message } from 'discord.js';

const URL_PATTERN = /https?:\/\/[^\s]+|(?:www\.)[^\s]+/gi;

function extractDomain(url: string): string {
  try {
    const withProtocol = url.startsWith('http') ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace(/^www\./, '');
  } catch {
    return url.toLowerCase();
  }
}

export function checkLinks(
  message: Message,
  allowedLinks: string[],
): string | null {
  const urls = message.content.match(URL_PATTERN);
  if (!urls || urls.length === 0) return null;

  // No allowlist = block all links
  if (allowedLinks.length === 0) {
    return 'Unauthorized link detected';
  }

  const normalizedAllowList = allowedLinks.map((d) =>
    d.toLowerCase().replace(/^www\./, ''),
  );

  for (const url of urls) {
    const domain = extractDomain(url);
    const isAllowed = normalizedAllowList.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
    );
    if (!isAllowed) {
      return `Unauthorized link detected: ${domain}`;
    }
  }

  return null;
}
