import {
  Message,
  EmbedBuilder,
  Colors,
  TextChannel,
} from 'discord.js';
import { db, InfractionType, AutomodAction, type GuildSettings } from '@clx/database';

const TIMEOUT_DURATION_MS = 10 * 60 * 1_000; // 10 minutes default automod timeout

async function logToChannel(message: Message, action: AutomodAction, reason: string, settings: GuildSettings) {
  try {
    if (!settings.logChannelId) return;

    const channel = message.guild?.channels.cache.get(settings.logChannelId);
    if (!(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.DarkOrange)
      .setTitle('Automod Action')
      .addFields(
        { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: 'Channel', value: `<#${message.channelId}>`, inline: true },
        { name: 'Action', value: action, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Message', value: message.content.slice(0, 512) || '*[no content]*' },
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch {
    // Non-critical
  }
}

async function recordInfraction(message: Message, reason: string) {
  const guildId = message.guildId!;
  await db.user.upsert({
    where: { userId_guildId: { userId: message.author.id, guildId } },
    create: { userId: message.author.id, guildId, username: message.author.username },
    update: { username: message.author.username },
  });

  return db.infraction.create({
    data: {
      userId: message.author.id,
      guildId,
      type: InfractionType.AUTOMOD,
      reason,
      moderatorId: message.client.user!.id,
    },
  });
}

export async function executeAction(
  action: AutomodAction,
  message: Message,
  reason: string,
  settings: GuildSettings,
): Promise<void> {
  await logToChannel(message, action, reason, settings);

  if (action === AutomodAction.DELETE) {
    await message.delete().catch(() => null);
    return;
  }

  await recordInfraction(message, reason);

  const dmContent = `Your message in **${message.guild?.name}** was flagged by automod.\n**Reason:** ${reason}`;

  switch (action) {
    case AutomodAction.WARN:
      await message.delete().catch(() => null);
      await message.author.send(dmContent).catch(() => null);
      break;

    case AutomodAction.TIMEOUT: {
      await message.delete().catch(() => null);
      await message.author.send(dmContent).catch(() => null);
      const member = await message.guild?.members.fetch(message.author.id).catch(() => null);
      if (member?.moderatable) {
        await member.timeout(TIMEOUT_DURATION_MS, reason).catch(() => null);
      }
      break;
    }

    case AutomodAction.KICK: {
      await message.delete().catch(() => null);
      await message.author.send(dmContent).catch(() => null);
      const member = await message.guild?.members.fetch(message.author.id).catch(() => null);
      if (member?.kickable) {
        await member.kick(reason).catch(() => null);
      }
      break;
    }

    case AutomodAction.BAN: {
      await message.author.send(dmContent).catch(() => null);
      await message.delete().catch(() => null);
      const member = await message.guild?.members.fetch(message.author.id).catch(() => null);
      if (member?.bannable) {
        await member.ban({ reason }).catch(() => null);
      }
      break;
    }
  }
}
