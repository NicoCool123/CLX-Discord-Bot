import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import { db, InfractionType } from '@clx/database';
import { formatDuration } from '@clx/shared';
import type { Command } from '../../types';

const TYPE_EMOJI: Record<string, string> = {
  WARN: '⚠️', MUTE: '🔇', BAN: '🔨', KICK: '👢', UNBAN: '✅', AUTOMOD: '🤖',
};

const TYPE_COLOR: Record<string, number> = {
  WARN: 0xfbbf24, MUTE: 0xf97316, BAN: 0xef4444,
  KICK: 0xfca5a5, UNBAN: 0x22c55e, AUTOMOD: 0xa855f7,
};

export default {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderation utilities')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    // /mod history <user> [page]
    .addSubcommand((sub) =>
      sub
        .setName('history')
        .setDescription("View a user's infraction history")
        .addUserOption((o) =>
          o.setName('user').setDescription('Target user').setRequired(true),
        )
        .addIntegerOption((o) =>
          o.setName('page').setDescription('Page number').setMinValue(1),
        ),
    )

    // /mod stats
    .addSubcommand((sub) =>
      sub
        .setName('stats')
        .setDescription('Server-wide moderation statistics'),
    )

    // /mod clearwarns <user>
    .addSubcommand((sub) =>
      sub
        .setName('clearwarns')
        .setDescription('Remove all WARN infractions for a user')
        .addUserOption((o) =>
          o.setName('user').setDescription('Target user').setRequired(true),
        ),
    )

    // /mod reason <caseid> <reason>
    .addSubcommand((sub) =>
      sub
        .setName('reason')
        .setDescription('Edit the reason for an existing case')
        .addStringOption((o) =>
          o.setName('caseid').setDescription('Case ID (last 6 characters)').setRequired(true),
        )
        .addStringOption((o) =>
          o.setName('reason').setDescription('New reason').setRequired(true),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    // ── /mod history ─────────────────────────────────────────────────
    if (sub === 'history') {
      await interaction.deferReply();
      const target = interaction.options.getUser('user', true);
      const page   = interaction.options.getInteger('page') ?? 1;
      const PAGE   = 10;
      const skip   = (page - 1) * PAGE;

      const [records, total] = await Promise.all([
        db.infraction.findMany({
          where: { userId: target.id, guildId },
          orderBy: { createdAt: 'desc' },
          take: PAGE,
          skip,
        }),
        db.infraction.count({ where: { userId: target.id, guildId } }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / PAGE));
      const embed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setAuthor({ name: `${target.username} — Infraction History`, iconURL: target.displayAvatarURL() })
        .setFooter({ text: `Page ${page}/${totalPages} · ${total} total infraction${total !== 1 ? 's' : ''}` });

      if (records.length === 0) {
        embed.setDescription('✅ No infractions on record.');
      } else {
        const lines = records.map((inf) => {
          const caseId = inf.id.slice(-6).toUpperCase();
          const emoji  = TYPE_EMOJI[inf.type] ?? '•';
          const ts     = Math.floor(inf.createdAt.getTime() / 1000);
          const dur    = inf.duration ? ` (${formatDuration(inf.duration)})` : '';
          return `${emoji} \`#${caseId}\` **${inf.type}**${dur} — ${inf.reason.slice(0, 70)}\n  <t:${ts}:R> · <@${inf.moderatorId}>`;
        });
        embed.setDescription(lines.join('\n\n'));
      }

      return void interaction.editReply({ embeds: [embed] });
    }

    // ── /mod stats ────────────────────────────────────────────────────
    if (sub === 'stats') {
      await interaction.deferReply();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [total, last30, byType, topMods] = await Promise.all([
        db.infraction.count({ where: { guildId } }),
        db.infraction.count({ where: { guildId, createdAt: { gte: thirtyDaysAgo } } }),
        db.infraction.groupBy({ by: ['type'], where: { guildId }, _count: { id: true } }),
        db.infraction.groupBy({
          by: ['moderatorId'],
          where: { guildId, createdAt: { gte: thirtyDaysAgo } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
      ]);

      const typeLines = (Object.values(InfractionType) as string[]).map((t) => {
        const count = byType.find((b) => b.type === t)?._count.id ?? 0;
        return count > 0 ? `${TYPE_EMOJI[t] ?? '•'} **${t}**: ${count}` : null;
      }).filter(Boolean).join('\n') || 'None';

      const modLines = topMods.length > 0
        ? topMods.map((m, i) => `\`${i + 1}.\` <@${m.moderatorId}> — **${m._count.id}** action${m._count.id !== 1 ? 's' : ''}`).join('\n')
        : 'No activity.';

      const embed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setTitle(`Moderation Stats — ${interaction.guild!.name}`)
        .addFields(
          { name: 'Total Infractions', value: String(total), inline: true },
          { name: 'Last 30 Days', value: String(last30), inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: 'By Type', value: typeLines, inline: true },
          { name: 'Top Moderators (30d)', value: modLines, inline: true },
        )
        .setTimestamp();

      return void interaction.editReply({ embeds: [embed] });
    }

    // ── /mod clearwarns ───────────────────────────────────────────────
    if (sub === 'clearwarns') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const target = interaction.options.getUser('user', true);

      const { count } = await db.infraction.deleteMany({
        where: { userId: target.id, guildId, type: InfractionType.WARN },
      });

      const embed = new EmbedBuilder()
        .setColor(count > 0 ? Colors.Green : Colors.Grey)
        .setDescription(
          count > 0
            ? `✅ Cleared **${count}** warning${count !== 1 ? 's' : ''} for **${target.username}**.`
            : `ℹ️ **${target.username}** has no warnings to clear.`,
        );

      return void interaction.editReply({ embeds: [embed] });
    }

    // ── /mod reason ───────────────────────────────────────────────────
    if (sub === 'reason') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const input  = interaction.options.getString('caseid', true).toUpperCase().replace('#', '');
      const reason = interaction.options.getString('reason', true);

      const all = await db.infraction.findMany({ where: { guildId }, orderBy: { createdAt: 'desc' } });
      const infraction = all.find((i) => i.id.slice(-6).toUpperCase() === input);

      if (!infraction) {
        return void interaction.editReply(`No case found with ID \`#${input}\`.`);
      }

      await db.infraction.update({ where: { id: infraction.id }, data: { reason } });

      const embed = new EmbedBuilder()
        .setColor(TYPE_COLOR[infraction.type] ?? Colors.Grey)
        .setDescription(`✅ Updated reason for case \`#${input}\` (**${infraction.type}**).\n> ${reason}`);

      return void interaction.editReply({ embeds: [embed] });
    }
  },
} satisfies Command;
