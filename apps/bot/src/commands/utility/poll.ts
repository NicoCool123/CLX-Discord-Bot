import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import type { Command } from '../../types';

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with up to 4 options')
    .addStringOption((o) =>
      o.setName('question').setDescription('The poll question').setRequired(true).setMaxLength(200),
    )
    .addStringOption((o) =>
      o.setName('option1').setDescription('First option').setRequired(true).setMaxLength(100),
    )
    .addStringOption((o) =>
      o.setName('option2').setDescription('Second option').setRequired(true).setMaxLength(100),
    )
    .addStringOption((o) =>
      o.setName('option3').setDescription('Third option').setMaxLength(100),
    )
    .addStringOption((o) =>
      o.setName('option4').setDescription('Fourth option').setMaxLength(100),
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question', true);
    const rawOptions = [
      interaction.options.getString('option1', true),
      interaction.options.getString('option2', true),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter((o): o is string => o !== null);

    const optionLines = rawOptions.map((opt, i) => `${EMOJIS[i]} ${opt}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle('📊 ' + question)
      .setDescription(optionLines)
      .setFooter({ text: `Poll by ${interaction.user.username} · React to vote` })
      .setTimestamp();

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < rawOptions.length; i++) {
      await reply.react(EMOJIS[i]);
    }
  },
} satisfies Command;
