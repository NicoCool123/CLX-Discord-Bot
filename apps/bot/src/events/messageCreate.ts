import { Message } from 'discord.js';
import { runAutomod } from '../automod';
import type { Event } from '../types';

export default {
  name: 'messageCreate',
  async execute(...args: unknown[]) {
    const message = args[0] as Message;
    if (message.author.bot || !message.guild) return;
    await runAutomod(message).catch(console.error);
  },
} satisfies Event;
