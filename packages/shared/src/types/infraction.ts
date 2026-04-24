export enum InfractionType {
  WARN = 'WARN',
  MUTE = 'MUTE',
  BAN = 'BAN',
  KICK = 'KICK',
  UNBAN = 'UNBAN',
  AUTOMOD = 'AUTOMOD',
}

export interface InfractionRecord {
  id: string;
  userId: string;
  guildId: string;
  type: InfractionType;
  reason: string;
  moderatorId: string;
  duration?: number | null;
  createdAt: Date;
}
