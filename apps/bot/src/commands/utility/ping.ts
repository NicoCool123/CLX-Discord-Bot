import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency'),

  async execute(interaction) {
    const response = await interaction.reply({ content: '...', withResponse: true });
    const sent = response.resource?.message;
    const latency = sent ? sent.createdTimestamp - interaction.createdTimestamp : interaction.client.ws.ping;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blurple)
          .setTitle('🏓 Pong!')
          .addFields(
            { name: 'Round-trip', value: `${latency}ms`, inline: true },
            { name: 'API', value: `${apiLatency}ms`, inline: true },
          ),
      ],
    });
  },
} satisfies Command;
