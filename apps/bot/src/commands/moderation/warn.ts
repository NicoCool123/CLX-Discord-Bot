import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
} from 'discord.js';
import { db, InfractionType } from '@clx/database';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to warn').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the warning').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    if (target.bot) {
      return void interaction.editReply(err('You cannot warn a bot.'));
    }
    if (target.id === interaction.user.id) {
      return void interaction.editReply(err('You cannot warn yourself.'));
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return void interaction.editReply(err('That member is not in this server.'));
    }
    if (!member.moderatable) {
      return void interaction.editReply(err('I cannot moderate this member (missing permissions or higher role).'));
    }

    const executor = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (executor && member.roles.highest.position >= executor.roles.highest.position) {
      return void interaction.editReply(err('You cannot warn a member with an equal or higher role.'));
    }

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.WARN,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle('You have been warned')
      .addFields(
        { name: 'Server', value: guild.name },
        { name: 'Reason', value: reason },
        { name: 'Case', value: `#${infraction.caseNumber}` },
      )
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => null);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Yellow)
          .setDescription(`⚠️ Warned **${target.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
