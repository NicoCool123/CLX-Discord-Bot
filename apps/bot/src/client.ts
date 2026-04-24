import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Command } from './types';

export class BotClient extends Client {
  public commands: Collection<string, Command> = new Collection();
  public cooldowns: Collection<string, Collection<string, number>> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
    });
  }
}

export const client = new BotClient();
