export type MediaType = 'none' | 'image' | 'video' | 'audio';

export interface ForceJoinChannel {
  id: string;
  channelId: string; // e.g. "@prime_channel" or "-100123456789"
  title: string;
  inviteLink: string;
  type: 'channel' | 'group';
  required: boolean;
  memberCount?: number;
  addedAt: string;
}

export interface PostPayload {
  text: string;
  mediaType: MediaType;
  mediaUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface ClaimCode {
  id: string;
  code: string; // e.g. "VIP2025"
  title: string;
  postContent: PostPayload;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  claimedByUsers: string[]; // telegramIds
}

export interface VerificationPost {
  enabled: boolean;
  text: string;
  mediaType: MediaType;
  mediaUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  type: 'instant' | 'scheduled' | 'auto_join';
  postContent: PostPayload;
  scheduledTimeIST?: string; // YYYY-MM-DD HH:mm:ss in IST
  status: 'draft' | 'scheduled' | 'sent' | 'processing';
  targetAudience: 'all' | 'verified_only' | 'unverified_only';
  sentCount: number;
  totalRecipients: number;
  createdAt: string;
  executedAt?: string;
}

export interface AdminUser {
  id: string;
  telegramId: string;
  username: string;
  name: string;
  role: 'owner' | 'superadmin' | 'moderator';
  addedAt: string;
}

export interface BotUser {
  telegramId: string;
  username?: string;
  firstName: string;
  isVerified: boolean;
  joinedChannels: string[]; // array of channel ids
  joinedAt: string;
  lastActiveAt: string;
  hasLeftRequired: boolean;
  leftChannelsAlertCount: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  bonusBalance: number;
  lastBonusClaimDate?: string;
  claimedCodes: string[];
}

export type ButtonColor = 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'cyan' | 'dark';

export const getTelegramButtonClass = (color?: ButtonColor, defaultColor: ButtonColor = 'blue'): string => {
  const c = color || defaultColor;
  switch (c) {
    case 'blue':
      return 'bg-gradient-to-r from-[#2481cc] via-[#2888d8] to-[#1d6cb0] hover:from-[#2e93e6] hover:to-[#2481cc] text-white border border-[#5ab2fc]/70 shadow-lg shadow-blue-600/35 ring-1 ring-blue-400/25 active:scale-[0.98] transition-all';
    case 'red':
      return 'bg-gradient-to-r from-[#e53935] via-[#ef4444] to-[#c62828] hover:from-[#f87171] hover:to-[#e53935] text-white border border-[#fca5a5]/70 shadow-lg shadow-red-600/35 ring-1 ring-red-400/25 active:scale-[0.98] transition-all';
    case 'green':
      return 'bg-gradient-to-r from-[#2ea043] via-[#34ad4a] to-[#238636] hover:from-[#3fb950] hover:to-[#2ea043] text-white border border-[#7ee787]/70 shadow-lg shadow-emerald-600/35 ring-1 ring-emerald-400/25 active:scale-[0.98] transition-all';
    case 'purple':
      return 'bg-gradient-to-r from-[#8a3ffc] to-[#6929c4] hover:from-[#a56eff] hover:to-[#8a3ffc] text-white border border-[#d4bbff]/60 shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all';
    case 'amber':
      return 'bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white border border-[#fde68a]/60 shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all';
    case 'cyan':
      return 'bg-gradient-to-r from-[#0891b2] to-[#0e7490] hover:from-[#06b6d4] hover:to-[#0891b2] text-white border border-[#a5f3fc]/60 shadow-lg shadow-cyan-600/30 active:scale-[0.98] transition-all';
    case 'dark':
      return 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-100 border border-slate-700 shadow-md active:scale-[0.98] transition-all';
    default:
      return 'bg-gradient-to-r from-[#2481cc] via-[#2888d8] to-[#1d6cb0] text-white border border-[#5ab2fc]/70 shadow-lg shadow-blue-600/35 active:scale-[0.98] transition-all';
  }
};

export interface BotConfig {
  botToken: string;
  botUsername: string;
  botName: string;
  isPollingActive: boolean;
  welcomeMessage: string;
  leaveAlertMessage: string;
  joinButtonText: string;
  joinButtonColor?: ButtonColor;
  checkJoinButtonText: string;
  checkButtonColor?: ButtonColor;
  bonusButtonText: string;
  bonusButtonColor?: ButtonColor;
  codeButtonText?: string;
  codeButtonColor?: ButtonColor;
  showBonusButton: boolean;
  dailyBonusAmount: number;
  referralBonusAmount: number;
  backupGroupId?: string;
  backupGroupName?: string;
  autoBackupToGroup?: boolean;
  lastBackupTimestamp?: string;
  lastBackupMessageId?: number;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'join' | 'leave' | 'verify' | 'claim' | 'bonus' | 'broadcast' | 'admin';
  user: string;
  details: string;
}
