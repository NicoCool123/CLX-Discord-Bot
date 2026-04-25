import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });
import { db, AutomodRuleType, AutomodAction } from '@clx/database';
import { invalidateAutomodCache } from '../../automod/index';
import type { Command } from '../../types';

const RULE_LABEL: Record<string, string> = {
  SPAM: 'Spam Detection',
  WORD_FILTER: 'Word Filter',
  LINK_DETECTION: 'Link Detection',
};

const ACTION_EMOJI: Record<string, string> = {
  WARN: '⚠️', TIMEOUT: '⏱️', KICK: '👢', BAN: '🔨', DELETE: '🗑️',
};

export default {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('View and toggle automod rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    // /automod status
    .addSubcommand((sub) =>
      sub
        .setName('status')
        .setDescription('Show the current automod configuration'),
    )

    // /automod toggle <rule> <enabled>
    .addSubcommand((sub) =>
      sub
        .setName('toggle')
        .setDescription('Enable or disable an automod rule')
        .addStringOption((o) =>
          o
            .setName('rule')
            .setDescription('Which rule to toggle')
            .setRequired(true)
            .addChoices(
              { name: 'Spam Detection',  value: AutomodRuleType.SPAM },
              { name: 'Word Filter',     value: AutomodRuleType.WORD_FILTER },
              { name: 'Link Detection',  value: AutomodRuleType.LINK_DETECTION },
            ),
        )
        .addBooleanOption((o) =>
          o.setName('enabled').setDescription('Turn the rule on or off').setRequired(true),
        ),
    )

    // /automod master <enabled>
    .addSubcommand((sub) =>
      sub
        .setName('master')
        .setDescription('Toggle the automod master switch for this server')
        .addBooleanOption((o) =>
          o.setName('enabled').setDescription('Enable or disable automod entirely').setRequired(true),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    // ── /automod status ───────────────────────────────────────────────
    if (sub === 'status') {
      await interaction.deferReply();

      const [settings, rules] = await Promise.all([
        db.guildSettings.findUnique({ where: { guildId } }),
        db.automodRule.findMany({ where: { guildId } }),
      ]);

      if (!settings) {
        return void interaction.editReply(err('No settings found for this server. Configure automod in the dashboard first.'));
      }

      const ruleMap = Object.fromEntries(rules.map((r) => [r.type, r]));
      const masterOn = settings.automodEnabled !== false;

      const ruleLines = (Object.values(AutomodRuleType) as string[]).map((type) => {
        const rule = ruleMap[type];
        const label = RULE_LABEL[type] ?? type;
        const status = rule?.enabled ? '🟢 **ON**' : '🔴 OFF';
        const action = rule?.action ? ` — ${ACTION_EMOJI[rule.action] ?? ''} ${rule.action}` : '';
        return `${status}  ${label}${action}`;
      }).join('\n');

      const configLines = [
        `Spam: \`${settings.spamThreshold ?? 5} msgs / ${settings.spamInterval ?? 5}s\``,
        `Blacklisted words: \`${settings.blacklistedWords?.length ?? 0}\``,
        `Allowed domains: \`${settings.allowedLinks?.length ?? 0}\``,
      ].join('\n');

      const embed = new EmbedBuilder()
        .setColor(masterOn ? Colors.Green : Colors.Red)
        .setTitle(`Automod — ${interaction.guild!.name}`)
        .addFields(
          { name: 'Master Switch', value: masterOn ? '🟢 **Enabled**' : '🔴 **Disabled**', inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: 'Rules', value: ruleLines || 'No rules configured.' },
          { name: 'Config', value: configLines },
        )
        .setFooter({ text: 'Use /automod toggle to change rules · Manage in the dashboard for full config' })
        .setTimestamp();

      return void interaction.editReply({ embeds: [embed] });
    }

    // ── /automod toggle ───────────────────────────────────────────────
    if (sub === 'toggle') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const ruleType = interaction.options.getString('rule', true) as AutomodRuleType;
      const enabled  = interaction.options.getBoolean('enabled', true);

      await db.automodRule.upsert({
        where: { guildId_type: { guildId, type: ruleType } },
        create: { guildId, type: ruleType, enabled, action: AutomodAction.WARN },
        update: { enabled },
      });

      invalidateAutomodCache(guildId);

      const label = RULE_LABEL[ruleType] ?? ruleType;
      const embed = new EmbedBuilder()
        .setColor(enabled ? Colors.Green : Colors.Orange)
        .setDescription(`${enabled ? '🟢' : '🔴'} **${label}** has been **${enabled ? 'enabled' : 'disabled'}**.`);

      return void interaction.editReply({ embeds: [embed] });
    }

    // ── /automod master ───────────────────────────────────────────────
    if (sub === 'master') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const enabled = interaction.options.getBoolean('enabled', true);

      await db.guildSettings.upsert({
        where: { guildId },
        create: { guildId, automodEnabled: enabled },
        update: { automodEnabled: enabled },
      });

      invalidateAutomodCache(guildId);

      const embed = new EmbedBuilder()
        .setColor(enabled ? Colors.Green : Colors.Red)
        .setDescription(`${enabled ? '🟢' : '🔴'} Automod master switch is now **${enabled ? 'ON' : 'OFF'}** for this server.`);

      return void interaction.editReply({ embeds: [embed] });
    }
  },
} satisfies Command;
