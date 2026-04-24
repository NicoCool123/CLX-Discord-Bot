import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
  GuildMember,
} from 'discord.js';
import { db, InfractionType } from '@clx/database';
import { parseDuration, formatDuration } from '@clx/shared';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to mute').setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 1d — max 28d)')
        .setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the mute').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const durationStr = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      return void interaction.editReply(
        'Invalid duration format. Use: `10s`, `5m`, `2h`, `1d`',
      );
    }

    // Max 28 days (Discord limit)
    if (durationMs > 28 * 24 * 60 * 60 * 1_000) {
      return void interaction.editReply('Maximum timeout duration is 28 days.');
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return void interaction.editReply('Could not find that member in this server.');
    }
    if (!member.moderatable) {
      return void interaction.editReply(
        'I cannot mute this member (missing permissions or higher role).',
      );
    }

    await member.timeout(durationMs, reason);

    const durationSecs = Math.floor(durationMs / 1_000);

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.MUTE,
        reason,
        moderatorId: interaction.user.id,
        duration: durationSecs,
      },
    });

    const caseId = infraction.id.slice(-6).toUpperCase();

    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle('You have been muted')
      .addFields(
        { name: 'Server', value: guild.name },
        { name: 'Duration', value: formatDuration(durationSecs) },
        { name: 'Reason', value: reason },
        { name: 'Case', value: `#${caseId}` },
      )
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => null);

    await interaction.editReply(
      `Muted **${target.username}** for **${formatDuration(durationSecs)}** — Case \`#${caseId}\``,
    );
  },
} satisfies Command;
