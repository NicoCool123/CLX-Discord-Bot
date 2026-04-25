import { Message } from 'discord.js';
import { createHash } from 'crypto';

interface UserHistory {
  timestamps: number[];
  contentHashes: string[];
}

const history = new Map<string, UserHistory>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, data] of history.entries()) {
    const validIndices = data.timestamps
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t > cutoff);
    data.timestamps = validIndices.map(({ t }) => t);
    data.contentHashes = validIndices.map(({ i }) => data.contentHashes[i]);
    if (data.timestamps.length === 0) {
      history.delete(key);
    }
  }
}, 5 * 60_000);

function hashContent(content: string): string {
  return createHash('md5').update(content.toLowerCase().trim()).digest('hex');
}

export function checkSpam(
  message: Message,
  threshold: number,
  intervalSeconds: number,
): string | null {
  const key = `${message.author.id}:${message.guildId}`;
  const now = Date.now();
  const windowMs = intervalSeconds * 1_000;

  if (!history.has(key)) {
    history.set(key, { timestamps: [], contentHashes: [] });
  }

  const data = history.get(key)!;
  const cutoff = now - windowMs;

  // Prune old entries
  const validIndices = data.timestamps
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t > cutoff);

  data.timestamps = validIndices.map(({ t }) => t);
  data.contentHashes = validIndices.map(({ i }) => data.contentHashes[i]);

  // Add current message
  data.timestamps.push(now);
  data.contentHashes.push(hashContent(message.content));

  // Rate check
  if (data.timestamps.length > threshold) {
    return `Sending messages too fast (${data.timestamps.length} in ${intervalSeconds}s)`;
  }

  // Duplicate check (same content 3+ times in window)
  const currentHash = hashContent(message.content);
  const duplicateCount = data.contentHashes.filter((h) => h === currentHash).length;
  if (duplicateCount >= 3) {
    return `Duplicate message spam detected`;
  }

  return null;
}
