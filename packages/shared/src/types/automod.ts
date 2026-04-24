export enum AutomodRuleType {
  SPAM = 'SPAM',
  WORD_FILTER = 'WORD_FILTER',
  LINK_DETECTION = 'LINK_DETECTION',
}

export enum AutomodAction {
  WARN = 'WARN',
  TIMEOUT = 'TIMEOUT',
  KICK = 'KICK',
  BAN = 'BAN',
  DELETE = 'DELETE',
}

export interface AutomodRuleConfig {
  threshold?: number;
  interval?: number;
  words?: string[];
  allowList?: string[];
  blockList?: string[];
}
