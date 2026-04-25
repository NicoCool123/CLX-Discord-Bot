import { Message } from 'discord.js';
import { db, AutomodRuleType, AutomodAction, type GuildSettings, type AutomodRule } from '@clx/database';
import { checkSpam } from './spamDetector';
import { checkWordFilter } from './wordFilter';
import { checkLinks } from './linkDetector';
import { executeAction } from './actions';

interface GuildAutomodCache {
  settings: GuildSettings;
  rules: AutomodRule[];
  wordFilterRegex: RegExp | null;
  expiresAt: number;
}

const cache = new Map<string, GuildAutomodCache>();
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

function buildWordFilterRegex(words: string[]): RegExp | null {
  if (words.length === 0) return null;
  const escaped = words
    .map((w) => w.toLowerCase().replace(/[​-‍﻿]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return null;
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');
}

async function getGuildAutomod(guildId: string): Promise<GuildAutomodCache | null> {
  const cached = cache.get(guildId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }

  const [settings, rules] = await Promise.all([
    db.guildSettings.findUnique({ where: { guildId } }),
    db.automodRule.findMany({ where: { guildId, enabled: true } }),
  ]);
  if (!settings) return null;

  const entry: GuildAutomodCache = {
    settings,
    rules,
    wordFilterRegex: buildWordFilterRegex(settings.blacklistedWords),
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

  const { settings, rules, wordFilterRegex } = automod;

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
        triggerReason = checkWordFilter(message, wordFilterRegex);
        break;

      case AutomodRuleType.LINK_DETECTION:
        triggerReason = checkLinks(message, settings.allowedLinks);
        break;
    }

    if (triggerReason) {
      await executeAction(rule.action as AutomodAction, message, triggerReason, settings);
      return; // Apply only the first matched rule
    }
  }
}
