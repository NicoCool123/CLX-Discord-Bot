import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency'),

  async execute(interaction) {
    const response = await interaction.reply({ content: 'Pinging...', withResponse: true });
    const sent = response.resource!.message!;
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `Pong! Round-trip: **${latency}ms** | API: **${apiLatency}ms**`,
    );
  },
} satisfies Command;
