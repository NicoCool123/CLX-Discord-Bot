import { Message } from 'discord.js';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkWordFilter(
  message: Message,
  compiled: RegExp | null,
): string | null {
  if (!compiled) return null;
  return compiled.test(normalize(message.content)) ? 'Message contains blacklisted word' : null;
}
