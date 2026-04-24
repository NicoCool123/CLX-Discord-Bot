import { Message } from 'discord.js';
import { db, AutomodRuleType, AutomodAction, type GuildSettings, type AutomodRule } from '@clx/database';
import { checkSpam } from './spamDetector';
import { checkWordFilter } from './wordFilter';
import { checkLinks } from './linkDetector';
import { executeAction } from './actions';

interface GuildAutomodCache {
  settings: GuildSettings;
  rules: AutomodRule[];
  expiresAt: number;
}

const cache = new Map<string, GuildAutomodCache>();
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

async function getGuildAutomod(guildId: string): Promise<GuildAutomodCache | null> {
  const cached = cache.get(guildId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }

  const settings = await db.guildSettings.findUnique({ where: { guildId } });
  if (!settings) return null;

  const rules = await db.automodRule.findMany({ where: { guildId, enabled: true } });

  const entry: GuildAutomodCache = {
    settings,
    rules,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  cache.set(guildId, entry);
  return entry;
}

/** Invalidate a guild's automod cache (call this from API route after settings change). */
export function invalidateAutomodCache(guildId: string) {
  cache.delete(guildId);
}

export async function runAutomod(message: Message): Promise<void> {
  const guildId = message.guildId!;

  const automod = await getGuildAutomod(guildId);
  if (!automod || !automod.settings.automodEnabled) return;

  const { settings, rules } = automod;

  for (const rule of rules) {
    let triggerReason: string | null = null;

    switch (rule.type) {
      case AutomodRuleType.SPAM:
        triggerReason = checkSpam(
          message,
          settings.spamThreshold,
          settings.spamInterval,
        );
        break;

      case AutomodRuleType.WORD_FILTER:
        triggerReason = checkWordFilter(message, settings.blacklistedWords);
        break;

      case AutomodRuleType.LINK_DETECTION:
        triggerReason = checkLinks(message, settings.allowedLinks);
        break;
    }

    if (triggerReason) {
      await executeAction(rule.action as AutomodAction, message, triggerReason);
      return; // Apply only the first matched rule
    }
  }
}
