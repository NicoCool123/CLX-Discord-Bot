import { Message } from 'discord.js';

// Normalize text: lowercase, remove zero-width chars, strip repeated chars
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/[^a-z0-9\s]/g, ' ')          // strip punctuation/special chars
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkWordFilter(
  message: Message,
  blacklistedWords: string[],
): string | null {
  if (blacklistedWords.length === 0) return null;

  const normalized = normalize(message.content);

  for (const word of blacklistedWords) {
    const normalizedWord = normalize(word);
    if (!normalizedWord) continue;

    // Word boundary match
    const pattern = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
    if (pattern.test(normalized)) {
      return `Message contains blacklisted word`;
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
