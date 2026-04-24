import { PermissionsBitField } from 'discord.js';

/**
 * Check if a member's permissions include MANAGE_GUILD (admin-equivalent for dashboard).
 */
export function isAdmin(permissions: bigint): boolean {
  const perms = new PermissionsBitField(permissions);
  return perms.has(PermissionsBitField.Flags.Administrator) ||
    perms.has(PermissionsBitField.Flags.ManageGuild);
}

/**
 * Check if a moderator can act on a target (role hierarchy).
 * Both positions are the highest role positions of each member.
 */
export function canModerate(
  moderatorHighestRole: number,
  targetHighestRole: number,
): boolean {
  return moderatorHighestRole > targetHighestRole;
}
