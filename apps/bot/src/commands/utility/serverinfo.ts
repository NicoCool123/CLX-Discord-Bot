import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { db } from '@clx/database';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show information about this server'),

  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild!;
    await guild.fetch();

    const totalInfractions = await db.infraction.count({ where: { guildId: guild.id } });

    const owner = await guild.fetchOwner().catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: 'Boosts', value: guild.premiumSubscriptionCount?.toString() ?? '0', inline: true },
        { name: 'Infractions (CLX)', value: totalInfractions.toString(), inline: true },
        {
          name: 'Verification Level',
          value: ['None', 'Low', 'Medium', 'High', 'Very High'][guild.verificationLevel] ?? 'Unknown',
          inline: true,
        },
      );

    if (guild.description) {
      embed.setDescription(guild.description);
    }

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
