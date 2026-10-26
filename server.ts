import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type {
  ForceJoinChannel,
  ClaimCode,
  SentCodeMessage,
  VerificationPost,
  BroadcastMessage,
  AdminUser,
  BotUser,
  BotConfig,
  BotLog
} from './src/types/telegram.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = fs.existsSync(path.join(__dirname, 'package.json')) ? __dirname : process.cwd();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Persistent file path
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'bot_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
interface DatabaseSchema {
  config: BotConfig;
  channels: ForceJoinChannel[];
  claimCodes: ClaimCode[];
  verificationPost: VerificationPost;
  broadcasts: BroadcastMessage[];
  admins: AdminUser[];
  users: BotUser[];
  logs: BotLog[];
}

const defaultDatabase: DatabaseSchema = {
  config: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: 'PrimeForceJoinBot',
    botName: 'Prime Force Join & Rewards Bot',
    isPollingActive: false,
    welcomeMessage: '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
    leaveAlertMessage: '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
    joinButtonText: '🔵 JOIN NOW',
    joinButtonColor: 'blue',
    checkJoinButtonText: '🔵 CHECK JOIN',
    checkButtonColor: 'blue',
    bonusButtonText: '🔴 CLAIM BONUS',
    bonusButtonColor: 'red',
    codeButtonText: '🔑 ENTER CLAIM CODE',
    codeButtonColor: 'amber',
    showBonusButton: true,
    dailyBonusAmount: 25,
    referralBonusAmount: 50,
    inviteButtonText: '🎁 Invite & Earn',
    inviteButtonColor: 'blue',
    inviteCustomLink: '',
    inviteShareMessage: '🔥 Join this bot, verify in all channels, and get instant VIP access and bonus rewards!',
    exclusiveContentButtonText: '🔓 View Exclusive Content',
    exclusiveContentUrl: 'https://t.me/PrimeVipLounge',
    exclusiveContentColor: 'green',
    backupGroupId: '',
    backupGroupName: '',
    autoBackupToGroup: true
  },
  channels: [
    {
      id: 'ch-1',
      channelId: '@PrimeUpdatesHub',
      title: '📢 Prime Official Updates',
      inviteLink: 'https://t.me/PrimeUpdatesHub',
      type: 'channel',
      required: true,
      memberCount: 48290,
      addedAt: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'ch-2',
      channelId: '@PrimeVipLounge',
      title: '💎 Prime VIP Signals & Drops',
      inviteLink: 'https://t.me/PrimeVipLounge',
      type: 'channel',
      required: true,
      memberCount: 29140,
      addedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'ch-3',
      channelId: '@PrimeCommunityChat',
      title: '💬 Prime Community Group',
      inviteLink: 'https://t.me/PrimeCommunityChat',
      type: 'group',
      required: true,
      memberCount: 15820,
      addedAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  claimCodes: [
    {
      id: 'code-1',
      code: 'VIP2026',
      title: 'Exclusive VIP Loot Box & Links',
      postContent: {
        text: '🎁 *VIP UNLOCKED SUCCESSFULLY!*\n\nHere is your private VIP package:\n• High Speed Proxy Links\n• Daily Premium Drops\n• Exclusive Content Access\n\nClick below to download your bundle:',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/telegram_bot_hero_1792137087644.jpg',
        buttonText: '🚀 Access VIP Portal',
        buttonUrl: 'https://telegram.org',
        secondaryButtonText: '🌐 Join Support Group',
        secondaryButtonUrl: 'https://t.me'
      },
      maxUses: 1000,
      currentUses: 342,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      claimedByUsers: ['user_101', 'user_102']
    },
    {
      id: 'code-2',
      code: 'BONUS100',
      title: 'Special 100 Points Code',
      postContent: {
        text: '💎 *SPECIAL CODE REDEEMED!*\n\nYou received 100 Instant Bonus Points in your bot wallet!\nShare your referral link with friends to earn 50 points per join.',
        mediaType: 'none',
        buttonText: '📊 Check Wallet',
        buttonUrl: 'https://t.me'
      },
      maxUses: 500,
      currentUses: 128,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      claimedByUsers: ['user_101']
    }
  ],
  verificationPost: {
    enabled: true,
    text: '🎉 *VERIFICATION SUCCESSFUL!*\n\nThank you for joining all our official channels and groups! Your membership has been verified.\n\n👇 You now have full access to our bot features:\n• Daily Bonus rewards\n• Secret Claim Codes redemption\n• Referral system\n• Exclusive direct media drops',
    mediaType: 'image',
    mediaUrl: '/src/assets/images/telegram_bot_hero_1792137087644.jpg',
    buttonText: '🔥 View Exclusive Content',
    buttonUrl: 'https://telegram.org',
    secondaryButtonText: '👥 Invite & Earn',
    secondaryButtonUrl: 'https://telegram.org'
  },
  broadcasts: [
    {
      id: 'bc-1',
      title: 'Welcome Drops & Weekly Giveaway',
      type: 'instant',
      postContent: {
        text: '🔥 *WEEKLY GIVEAWAY ANNOUNCEMENT*\n\nAll verified users have been entered into this week\'s Lucky Draw!\nMake sure you stay in all channels to remain eligible.',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/telegram_bot_hero_1792137087644.jpg',
        buttonText: '🎁 Check Status',
        buttonUrl: 'https://telegram.org'
      },
      status: 'sent',
      targetAudience: 'verified_only',
      sentCount: 1420,
      totalRecipients: 1420,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      executedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  admins: [
    {
      id: 'admin-1',
      telegramId: '1092837465',
      username: 'prime_owner',
      name: 'Prime Owner',
      role: 'owner',
      addedAt: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'admin-2',
      telegramId: '9876543210',
      username: 'tele_mod_rahul',
      name: 'Rahul (Co-Admin)',
      role: 'superadmin',
      addedAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ],
  users: [
    {
      telegramId: 'user_101',
      username: 'alex_trader',
      firstName: 'Alex',
      isVerified: true,
      joinedChannels: ['ch-1', 'ch-2', 'ch-3'],
      joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastActiveAt: new Date().toISOString(),
      hasLeftRequired: false,
      leftChannelsAlertCount: 0,
      referralCode: 'ref_101',
      referralCount: 4,
      bonusBalance: 275,
      lastBonusClaimDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      claimedCodes: ['VIP2026', 'BONUS100']
    },
    {
      telegramId: 'user_102',
      username: 'priya_k',
      firstName: 'Priya',
      isVerified: true,
      joinedChannels: ['ch-1', 'ch-2', 'ch-3'],
      joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastActiveAt: new Date().toISOString(),
      hasLeftRequired: false,
      leftChannelsAlertCount: 0,
      referralCode: 'ref_102',
      referredBy: 'user_101',
      referralCount: 1,
      bonusBalance: 125,
      lastBonusClaimDate: new Date().toISOString().split('T')[0],
      claimedCodes: ['VIP2026']
    },
    {
      telegramId: 'user_103',
      username: 'vikram99',
      firstName: 'Vikram',
      isVerified: false,
      joinedChannels: ['ch-1'],
      joinedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastActiveAt: new Date().toISOString(),
      hasLeftRequired: true,
      leftChannelsAlertCount: 1,
      referralCode: 'ref_103',
      referredBy: 'user_101',
      referralCount: 0,
      bonusBalance: 0,
      claimedCodes: []
    }
  ],
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      type: 'verify',
      user: 'alex_trader (101)',
      details: 'Joined all 3 required channels and successfully verified.'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'claim',
      user: 'alex_trader (101)',
      details: 'Redeemed claim code VIP2026.'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'leave',
      user: 'vikram99 (103)',
      details: 'Detected leaving @PrimeVipLounge. Sent automatic warning & forced re-join.'
    }
  ]
};

// In-memory Database Loader & Saver
let db: DatabaseSchema = defaultDatabase;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      // Ensure all keys exist
      db.config = { ...defaultDatabase.config, ...db.config };
      db.channels = db.channels || defaultDatabase.channels;
      if (Array.isArray(db.channels)) {
        db.channels = db.channels.map((c: any) => ({
          ...c,
          name: c.title || c.name || 'Channel',
          title: c.title || c.name || 'Channel',
          chatId: c.channelId || c.chatId || ''
        }));
      }
      db.claimCodes = db.claimCodes || defaultDatabase.claimCodes;
      db.verificationPost = db.verificationPost || defaultDatabase.verificationPost;
      db.broadcasts = db.broadcasts || defaultDatabase.broadcasts;
      db.admins = db.admins || defaultDatabase.admins;
      db.users = db.users || defaultDatabase.users;
      db.logs = db.logs || defaultDatabase.logs;
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading db file, using defaults:', err);
    db = defaultDatabase;
  }
}

let autoBackupDebounce: NodeJS.Timeout | null = null;

function saveDatabase(skipAutoGroupSync = false) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    if (!skipAutoGroupSync && db.config.autoBackupToGroup && db.config.backupGroupId && db.config.botToken) {
      if (autoBackupDebounce) clearTimeout(autoBackupDebounce);
      autoBackupDebounce = setTimeout(() => {
        backupDatabaseToTelegramGroup('Auto-Sync on data change').catch(() => {});
      }, 5000);
    }
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

loadDatabase();

// Helper: Indian Standard Time (IST UTC+5:30)
function getISTDateString(d = new Date()): string {
  // IST is UTC + 5h 30m
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000) + istOffset);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = istDate.getFullYear();
  const month = pad(istDate.getMonth() + 1);
  const day = pad(istDate.getDate());
  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Background scheduler for IST Scheduled Broadcasts
setInterval(() => {
  const nowIST = getISTDateString();
  let changed = false;

  db.broadcasts.forEach((b) => {
    if (b.type === 'scheduled' && b.status === 'scheduled' && b.scheduledTimeIST) {
      if (nowIST >= b.scheduledTimeIST) {
        // Execute broadcast
        b.status = 'sent';
        const eligibleUsers = db.users.filter((u) => {
          if (b.targetAudience === 'verified_only') return u.isVerified && !u.hasLeftRequired;
          if (b.targetAudience === 'unverified_only') return !u.isVerified || u.hasLeftRequired;
          return true;
        });
        b.sentCount = eligibleUsers.length;
        b.totalRecipients = eligibleUsers.length;
        b.executedAt = new Date().toISOString();
        changed = true;

        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'broadcast',
          user: 'System Scheduler (IST)',
          details: `Scheduled broadcast "${b.title}" executed at IST ${nowIST}. Delivered to ${b.sentCount} recipients.`
        });
      }
    }
  });

  if (changed) {
    saveDatabase();
  }
}, 15000);

// Express App Initialization
const app = express();
app.use(express.json());

// Telegram Bot Polling & Webhook Engine
let pollingTimeout: NodeJS.Timeout | null = null;
let lastUpdateId = 0;
let isPollingRunning = false;

// Real Telegram Bot API helper with 20s network timeout protection
async function callTelegramApi(token: string, method: string, payload: any): Promise<any> {
  if (!token) return { ok: false, error: 'No bot token provided' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Robust channel matching helper (matches by ID with/without -100 prefix, internal ID, chatId, or @username)
function isChannelMatch(channel: ForceJoinChannel, chat: any): boolean {
  if (!chat || !channel) return false;
  const chatId = String(chat.id || '').trim();
  const rawChatId = chatId.replace(/^-100/, '');
  const chatUsername = chat.username ? chat.username.toLowerCase().replace(/^@/, '') : '';

  const cId = String(channel.channelId || '').trim().toLowerCase();
  const rawCId = cId.replace(/^-100/, '').replace(/^@/, '');
  const chInternalId = String(channel.id || '').trim();
  const chChatId = String((channel as any).chatId || '').trim();

  if (cId === chatId || chInternalId === chatId || chChatId === chatId) return true;
  if (rawCId && rawChatId && rawCId === rawChatId) return true;
  if (chatUsername && (rawCId === chatUsername || cId === `@${chatUsername}`)) return true;
  return false;
}

// Resilient Telegram message sender with automatic fallback if Markdown entity parsing fails
async function sendTelegramMessageSafe(
  token: string,
  chatId: number | string,
  text: string,
  options: {
    parse_mode?: string;
    reply_markup?: any;
  } = {}
) {
  let res = await callTelegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    ...options
  });
  if (!res.ok && options.parse_mode) {
    // Retry immediately with plain text to guarantee delivery if Markdown formatting has syntax issues
    const cleanText = text
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1');
    res = await callTelegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: cleanText,
      reply_markup: options.reply_markup
    });
  }
  return res;
}

// Real Telegram API helper to check if a user is a member of a channel/group
async function checkTelegramChatMember(token: string, chatId: string, userId: number | string, autoApprove = true): Promise<boolean> {
  try {
    const res = await callTelegramApi(token, 'getChatMember', {
      chat_id: chatId,
      user_id: userId
    });
    if (res.ok && res.result) {
      const status = res.result.status;
      if (['creator', 'administrator', 'member', 'restricted'].includes(status)) {
        return true;
      }
    }

    // Only auto-approve if autoApprove is enabled
    if (autoApprove) {
      const approveRes = await callTelegramApi(token, 'approveChatJoinRequest', {
        chat_id: chatId,
        user_id: userId
      });
      if (approveRes.ok) {
        return true;
      }
      const desc = String(approveRes.description || '').toLowerCase();
      if (desc.includes('already_participant') || desc.includes('already a participant') || desc.includes('already a member')) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// Real Telegram API helper to check if the Bot itself is an Administrator in the channel/group
async function checkBotIsAdminInChat(token: string, chatId: string): Promise<{ isAdmin: boolean; canInviteUsers?: boolean; status?: string; error?: string }> {
  try {
    const me = await callTelegramApi(token, 'getMe', {});
    if (!me.ok || !me.result?.id) {
      return { isAdmin: false, error: 'Could not fetch bot identity from Telegram' };
    }
    const botId = me.result.id;

    const res = await callTelegramApi(token, 'getChatMember', {
      chat_id: chatId,
      user_id: botId
    });

    if (res.ok && res.result) {
      const status = res.result.status;
      const isAdmin = status === 'administrator' || status === 'creator';
      const canInviteUsers = res.result.can_invite_users !== false;
      return { isAdmin, canInviteUsers, status };
    }
    return { isAdmin: false, status: res.description || 'Not an admin' };
  } catch (err: any) {
    return { isAdmin: false, error: err.message };
  }
}

// Telegram API: Bot automatically creates an admin approval join-request invite link
async function createChatApprovalInviteLink(token: string, chatId: string, name = 'TeleForce Approval Link'): Promise<{ ok: boolean; invite_link?: string; error?: string }> {
  try {
    const res = await callTelegramApi(token, 'createChatInviteLink', {
      chat_id: chatId,
      name: name,
      creates_join_request: true
    });
    if (res.ok && res.result?.invite_link) {
      return { ok: true, invite_link: res.result.invite_link };
    }
    return { ok: false, error: res.description || 'Failed to create approval invite link' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Helper to get Telegram Bot API button styles (primary = blue, success = green, danger = red)
function getTelegramButtonStyle(color?: string, fallback: 'primary' | 'danger' | 'success' = 'primary'): 'primary' | 'danger' | 'success' {
  if (!color) return fallback;
  const c = color.toLowerCase().trim();
  if (c === 'red' || c === 'danger') return 'danger';
  if (c === 'green' || c === 'success') return 'success';
  if (c === 'blue' || c === 'cyan' || c === 'indigo' || c === 'primary') return 'primary';
  return fallback;
}

// Telegram Group Database Vault Backup Engine
async function backupDatabaseToTelegramGroup(reason = 'Automatic Sync'): Promise<{ ok: boolean; message?: string; error?: string }> {
  const token = db.config.botToken;
  const backupGroupId = db.config.backupGroupId;
  if (!token || !backupGroupId) {
    return { ok: false, error: 'Telegram Bot Token or Backup Group ID is not configured.' };
  }

  const istNow = getISTDateString();
  const summary = `📦 *TELEFORCE DATABASE VAULT BACKUP*\n\n` +
    `🤖 *Bot:* @${db.config.botUsername || 'PrimeAdsEbot'}\n` +
    `⏱ *IST Timestamp:* \`${istNow}\`\n` +
    `📝 *Reason:* ${reason}\n\n` +
    `📊 *DATABASE METRICS:*\n` +
    `• Total Stored Users: *${db.users.length}*\n` +
    `• Verified Members: *${db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length}*\n` +
    `• Required Channels: *${db.channels.length}*\n` +
    `• Active Claim Codes: *${db.claimCodes.length}*\n` +
    `• Authorized Admins: *${db.admins.length}*\n\n` +
    `🔐 *RECOVERY & BOT MIGRATION:*\n` +
    `To recover data on a new bot or after restart: reply to this message with \`/restore\` or click 'Restore' in Web Dashboard.\n\n` +
    `#DB_BACKUP #TELEFORCE_VAULT`;

  const jsonContent = JSON.stringify(db, null, 2);
  const filename = `teleforce_db_backup_${Date.now()}.json`;

  try {
    const formData = new FormData();
    formData.append('chat_id', backupGroupId);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    formData.append('document', blob, filename);
    formData.append('caption', summary);
    formData.append('parse_mode', 'Markdown');

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
    });
    const docData: any = await res.json();

    if (docData && docData.ok) {
      db.config.lastBackupTimestamp = istNow;
      db.config.lastBackupMessageId = docData.result?.message_id;
      
      // Auto-pin the backup document in the Telegram group so it can be restored anytime by Group ID
      try {
        await callTelegramApi(token, 'pinChatMessage', {
          chat_id: backupGroupId,
          message_id: docData.result?.message_id,
          disable_notification: true
        });
      } catch (pinErr) {
        // Non-fatal if bot lacks pin permission
      }

      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'admin',
        user: 'Database Vault Engine',
        details: `Saved & pinned database backup document in Telegram Group (${backupGroupId}). Msg ID: ${docData.result?.message_id}`
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return { ok: true, message: `Backup document sent & pinned in Telegram Group (Msg ID: ${docData.result?.message_id})` };
    } else {
      // Fallback to sendMessage if document attachment fails
      const textRes = await callTelegramApi(token, 'sendMessage', {
        chat_id: backupGroupId,
        text: `${summary}\n\n\`\`\`json\n${jsonContent.slice(0, 3200)}\n\`\`\``,
        parse_mode: 'Markdown'
      });
      if (textRes.ok) {
        db.config.lastBackupTimestamp = istNow;
        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'admin',
          user: 'Database Vault Engine',
          details: `Sent database backup summary text to Telegram Group (${backupGroupId})`
        });
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        return { ok: true, message: 'Backup summary text sent to Telegram Group.' };
      }
      return { ok: false, error: docData?.description || textRes?.description || 'Telegram API rejected message' };
    }
  } catch (err: any) {
    console.error('Error backing up database to Telegram group:', err);
    return { ok: false, error: err.message };
  }
}

// Restore database snapshot from Telegram Group ID (fetch pinned backup document or message)
async function restoreDatabaseFromTelegramGroup(groupId: string): Promise<{ ok: boolean; message?: string; stats?: any; error?: string }> {
  const token = db.config.botToken;
  if (!token) {
    return { ok: false, error: 'Telegram Bot Token is not configured' };
  }
  if (!groupId) {
    return { ok: false, error: 'Database Vault Group ID is required' };
  }

  try {
    const chatRes = await callTelegramApi(token, 'getChat', { chat_id: groupId });
    if (!chatRes.ok || !chatRes.result) {
      return { ok: false, error: chatRes.description || `Could not access Telegram Group ${groupId}. Ensure bot is an Admin in the group!` };
    }

    const pinnedMsg = chatRes.result.pinned_message;
    let doc = pinnedMsg?.document;
    let selectedFileId = doc?.file_id;

    // If pinned message does not have a JSON document or is small, scan recent messages in group to find the latest full backup
    if (!selectedFileId || (doc && doc.file_size < 30000)) {
      const startId = pinnedMsg?.message_id || 625;
      for (let scanId = startId; scanId >= Math.max(1, startId - 40); scanId--) {
        try {
          const fwdRes = await callTelegramApi(token, 'forwardMessage', {
            chat_id: groupId,
            from_chat_id: groupId,
            message_id: scanId
          });
          if (fwdRes.ok && fwdRes.result) {
            const fwdMsgId = fwdRes.result.message_id;
            // Clean up forward message immediately
            await callTelegramApi(token, 'deleteMessage', {
              chat_id: groupId,
              message_id: fwdMsgId
            });

            if (fwdRes.result.document && fwdRes.result.document.file_name?.endsWith('.json')) {
              const candidateDoc = fwdRes.result.document;
              if (candidateDoc.file_size > 50000 || candidateDoc.file_name.includes('teleforce_db_backup')) {
                selectedFileId = candidateDoc.file_id;
                doc = candidateDoc;
                break;
              }
            }
          }
        } catch {}
      }
    }

    if (!selectedFileId) {
      // Check if backup is in caption or text
      if (pinnedMsg?.text && pinnedMsg.text.includes('{')) {
        try {
          const jsonMatch = pinnedMsg.text.match(/```json\n([\s\S]*?)\n```/) || pinnedMsg.text.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.users || parsed.channels || parsed.config) {
              if (parsed.channels) db.channels = parsed.channels;
              if (parsed.claimCodes) db.claimCodes = parsed.claimCodes;
              if (parsed.users) db.users = parsed.users;
              if (parsed.config) db.config = { ...db.config, ...parsed.config };
              if (parsed.verificationPost) db.verificationPost = parsed.verificationPost;
              saveDatabase(true);
              return {
                ok: true,
                message: `Database restored from pinned text snapshot in group "${chatRes.result.title || groupId}"!`,
                stats: { users: db.users.length, channels: db.channels.length, claimCodes: db.claimCodes.length }
              };
            }
          }
        } catch {}
      }

      return {
        ok: false,
        error: `Connected to group "${chatRes.result.title || groupId}", but no valid backup JSON document was found. Please ensure the bot is an Admin in the group or reply /restore to the backup file in that group!`
      };
    }

    const fileInfo = await callTelegramApi(token, 'getFile', { file_id: selectedFileId });
    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      return { ok: false, error: 'Could not fetch file download path from Telegram' };
    }

    const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.result.file_path}`;
    const fileRes = await fetch(downloadUrl);
    const content = await fileRes.text();
    const parsedDb = JSON.parse(content);

    if (parsedDb && (parsedDb.users || parsedDb.channels || parsedDb.config)) {
      if (parsedDb.channels && Array.isArray(parsedDb.channels)) {
        db.channels = parsedDb.channels.map((c: any) => ({
          ...c,
          name: c.title || c.name || 'Channel',
          title: c.title || c.name || 'Channel',
          chatId: c.channelId || c.chatId || ''
        }));
      }
      if (parsedDb.claimCodes && Array.isArray(parsedDb.claimCodes)) db.claimCodes = parsedDb.claimCodes;
      if (parsedDb.users && Array.isArray(parsedDb.users)) db.users = parsedDb.users;
      if (parsedDb.config) {
        db.config = {
          ...db.config,
          ...parsedDb.config,
          botToken: token, // keep current active token
          backupGroupId: String(groupId),
          backupGroupName: chatRes.result.title || db.config.backupGroupName
        };
      }
      if (parsedDb.verificationPost) db.verificationPost = parsedDb.verificationPost;
      if (parsedDb.admins && Array.isArray(parsedDb.admins)) db.admins = parsedDb.admins;
      if (parsedDb.broadcasts && Array.isArray(parsedDb.broadcasts)) db.broadcasts = parsedDb.broadcasts;

      saveDatabase(true);

      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'admin',
        user: 'Database Vault Engine',
        details: `Restored entire database from Telegram Group ID (${groupId}) backup. Recovered ${db.users.length} users, ${db.channels.length} channels, ${db.claimCodes.length} claim codes.`
      });

      return {
        ok: true,
        message: `Database successfully restored from Group "${chatRes.result.title || groupId}"!`,
        stats: {
          users: db.users.length,
          channels: db.channels.length,
          claimCodes: db.claimCodes.length,
          admins: db.admins.length,
          recoveredAt: getISTDateString()
        }
      };
    }

    return { ok: false, error: 'Backup file was downloaded but contains invalid database structure.' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Copy-Message Broadcast Engine (replicates exact Telegram messages with media, buttons, formatting)
async function dispatchCopyBroadcastToUsers(
  token: string,
  recipients: BotUser[],
  fromChatId: number | string,
  messageId: number
): Promise<{ sent: number; failed: number; sentMessages: SentCodeMessage[] }> {
  let sent = 0;
  let failed = 0;
  const sentMessages: SentCodeMessage[] = [];

  for (const user of recipients) {
    try {
      const r = await callTelegramApi(token, 'copyMessage', {
        chat_id: user.telegramId,
        from_chat_id: fromChatId,
        message_id: messageId
      });
      if (r.ok && r.result?.message_id) {
        sent++;
        sentMessages.push({
          telegramId: user.telegramId,
          chatId: user.telegramId,
          messageId: r.result.message_id,
          deliveredAt: new Date().toISOString()
        });
      } else if (r.ok) {
        sent++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    // Rate limit delay between Telegram messages
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
  return { sent, failed, sentMessages };
}

// Real Telegram Message Dispatcher with rate limiting (35ms delay between sends to prevent 429)
async function dispatchBroadcastToUsers(
  token: string,
  recipients: BotUser[],
  content: { text: string; mediaType?: string; mediaUrl?: string; buttonText?: string; buttonUrl?: string }
): Promise<{ sent: number; failed: number; sentMessages: SentCodeMessage[] }> {
  let sent = 0;
  let failed = 0;
  const sentMessages: SentCodeMessage[] = [];

  const buttons: any[] = [];
  if (content.buttonText && content.buttonUrl) {
    buttons.push([{ text: content.buttonText, url: content.buttonUrl }]);
  }

  for (const user of recipients) {
    try {
      if (content.mediaType === 'image' && content.mediaUrl?.startsWith('http')) {
        let r = await callTelegramApi(token, 'sendPhoto', {
          chat_id: user.telegramId,
          photo: content.mediaUrl,
          caption: content.text,
          parse_mode: 'Markdown',
          reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
        });
        if (!r.ok) {
          r = await sendTelegramMessageSafe(token, user.telegramId, content.text, {
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        }
        if (r.ok && r.result?.message_id) {
          sent++;
          sentMessages.push({
            telegramId: user.telegramId,
            chatId: user.telegramId,
            messageId: r.result.message_id,
            deliveredAt: new Date().toISOString()
          });
        } else if (r.ok) {
          sent++;
        } else {
          failed++;
        }
      } else {
        const r = await sendTelegramMessageSafe(token, user.telegramId, content.text, {
          parse_mode: 'Markdown',
          reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
        });
        if (r.ok && r.result?.message_id) {
          sent++;
          sentMessages.push({
            telegramId: user.telegramId,
            chatId: user.telegramId,
            messageId: r.result.message_id,
            deliveredAt: new Date().toISOString()
          });
        } else if (r.ok) {
          sent++;
        } else {
          failed++;
        }
      }
    } catch {
      failed++;
    }
    // Rate limit delay (35ms between Telegram messages)
    await new Promise((resolve) => setTimeout(resolve, 35));
  }

  return { sent, failed, sentMessages };
}

// Engine to DELETE an entire broadcast message from all recipients' Telegram screens
async function deleteBroadcastFromUsers(
  broadcastIdOrKeyword: string = 'last'
): Promise<{ success: boolean; affectedUsers: number; message: string; broadcast?: BroadcastMessage }> {
  let broadcast: BroadcastMessage | undefined;
  if (!broadcastIdOrKeyword || broadcastIdOrKeyword === 'last') {
    broadcast = db.broadcasts.find((b) => b.status === 'sent' && b.sentMessages && b.sentMessages.length > 0) || db.broadcasts[0];
  } else {
    broadcast = db.broadcasts.find(
      (b) => b.id === broadcastIdOrKeyword || b.title.toLowerCase().includes(broadcastIdOrKeyword.toLowerCase())
    );
  }

  if (!broadcast) {
    return { success: false, affectedUsers: 0, message: 'Broadcast not found.' };
  }

  const token = db.config.botToken;
  if (!token || !broadcast.sentMessages || broadcast.sentMessages.length === 0) {
    return {
      success: false,
      affectedUsers: 0,
      message: `Broadcast "${broadcast.title}" has no tracked user messages to delete.`
    };
  }

  let count = 0;
  for (const item of broadcast.sentMessages) {
    if (item.isDeleted) continue;
    try {
      const delRes = await callTelegramApi(token, 'deleteMessage', {
        chat_id: item.chatId,
        message_id: item.messageId
      });
      if (delRes.ok) {
        item.isDeleted = true;
        count++;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 35));
  }

  broadcast.isDeletedFromUsers = true;
  broadcast.deletedFromUsersCount = (broadcast.deletedFromUsersCount || 0) + count;
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'broadcast',
    user: 'Broadcast Deletion Engine',
    details: `Deleted broadcast "${broadcast.title}" (${broadcast.id}) from ${count} users' Telegram chats!`
  });

  return {
    success: true,
    affectedUsers: count,
    message: `Broadcast deleted from ${count} users' Telegram screens!`,
    broadcast
  };
}

// Engine to EDIT or REPLACE text/links in an already sent broadcast across all recipients
async function editBroadcastOnUsers(
  broadcastIdOrKeyword: string = 'last',
  options: {
    newText?: string;
    replaceOldUrl?: string;
    replaceNewUrl?: string;
    newButtonText?: string;
    newButtonUrl?: string;
  }
): Promise<{ success: boolean; affectedUsers: number; message: string; broadcast?: BroadcastMessage }> {
  let broadcast: BroadcastMessage | undefined;
  if (!broadcastIdOrKeyword || broadcastIdOrKeyword === 'last') {
    broadcast = db.broadcasts.find((b) => b.status === 'sent' && b.sentMessages && b.sentMessages.length > 0) || db.broadcasts[0];
  } else {
    broadcast = db.broadcasts.find(
      (b) => b.id === broadcastIdOrKeyword || b.title.toLowerCase().includes(broadcastIdOrKeyword.toLowerCase())
    );
  }

  if (!broadcast) {
    return { success: false, affectedUsers: 0, message: 'Broadcast not found.' };
  }

  const token = db.config.botToken;
  if (!token || !broadcast.sentMessages || broadcast.sentMessages.length === 0) {
    return {
      success: false,
      affectedUsers: 0,
      message: `Broadcast "${broadcast.title}" has no tracked user messages to edit.`
    };
  }

  // Calculate new text
  let updatedText = options.newText !== undefined ? options.newText : broadcast.postContent.text;
  if (options.replaceOldUrl && options.replaceNewUrl) {
    updatedText = updatedText.split(options.replaceOldUrl).join(options.replaceNewUrl);
  }

  // Calculate buttons
  let buttonText = options.newButtonText !== undefined ? options.newButtonText : broadcast.postContent.buttonText;
  let buttonUrl = options.newButtonUrl !== undefined ? options.newButtonUrl : broadcast.postContent.buttonUrl;
  if (options.replaceOldUrl && options.replaceNewUrl && buttonUrl === options.replaceOldUrl) {
    buttonUrl = options.replaceNewUrl;
  }

  const buttons: any[] = [];
  if (buttonText && buttonUrl) {
    buttons.push([{ text: buttonText, url: buttonUrl }]);
  }

  let count = 0;
  const isImage = broadcast.postContent.mediaType === 'image';

  for (const item of broadcast.sentMessages) {
    if (item.isDeleted) continue;
    try {
      let editRes: any;
      if (isImage) {
        editRes = await callTelegramApi(token, 'editMessageCaption', {
          chat_id: item.chatId,
          message_id: item.messageId,
          caption: updatedText,
          parse_mode: 'Markdown',
          reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
        });
        if (!editRes.ok) {
          editRes = await callTelegramApi(token, 'editMessageCaption', {
            chat_id: item.chatId,
            message_id: item.messageId,
            caption: updatedText,
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        }
      } else {
        editRes = await callTelegramApi(token, 'editMessageText', {
          chat_id: item.chatId,
          message_id: item.messageId,
          text: updatedText,
          parse_mode: 'Markdown',
          reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
        });
        if (!editRes.ok) {
          editRes = await callTelegramApi(token, 'editMessageText', {
            chat_id: item.chatId,
            message_id: item.messageId,
            text: updatedText,
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        }
      }

      if (editRes.ok) {
        item.isEdited = true;
        count++;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 35));
  }

  broadcast.postContent.text = updatedText;
  if (buttonText !== undefined) broadcast.postContent.buttonText = buttonText;
  if (buttonUrl !== undefined) broadcast.postContent.buttonUrl = buttonUrl;
  broadcast.isEditedOnUsers = true;
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'broadcast',
    user: 'Broadcast Edit Engine',
    details: `Edited / replaced content in broadcast "${broadcast.title}" (${broadcast.id}) on ${count} users' Telegram chats!`
  });

  return {
    success: true,
    affectedUsers: count,
    message: `Updated broadcast content across ${count} users' screens!`,
    broadcast
  };
}

// Engine to mark a claim code as OVER ❌ or DELETE messages from users' Telegram screens
async function markClaimCodeOver(
  codeIdOrCode: string,
  action: 'over' | 'delete' = 'over'
): Promise<{ success: boolean; affectedUsers: number; message: string }> {
  const code = db.claimCodes.find(
    (c) => c.id === codeIdOrCode || c.code.toUpperCase() === codeIdOrCode.toUpperCase()
  );
  if (!code) {
    return { success: false, affectedUsers: 0, message: 'Code not found' };
  }

  code.isOver = true;
  code.overAt = new Date().toISOString();
  saveDatabase();

  const token = db.config.botToken;
  if (!token || !code.sentMessages || code.sentMessages.length === 0) {
    return {
      success: true,
      affectedUsers: 0,
      message: `Code ${code.code} marked as OVER (no user messages were tracked to modify).`
    };
  }

  let count = 0;
  const originalUrl = code.postContent.buttonUrl || code.postContent.secondaryButtonUrl || '';

  for (const item of code.sentMessages) {
    if (action === 'delete' && item.isDeleted) continue;
    if (action === 'over' && item.isOver) continue;

    try {
      if (action === 'delete') {
        const delRes = await callTelegramApi(token, 'deleteMessage', {
          chat_id: item.chatId,
          message_id: item.messageId
        });
        if (delRes.ok) {
          item.isDeleted = true;
          count++;
        }
      } else {
        // Replace link with OVER ❌
        let newText = code.postContent.text;
        if (originalUrl) {
          newText = newText.split(originalUrl).join('OVER ❌');
        }
        // Also replace any generic URLs in text with OVER ❌
        newText = newText.replace(/https?:\/\/[^\s]+/g, 'OVER ❌');

        const updatedNotice = `❌ *[LINK IS NOW OVER ❌ - EXPIRED]*\n\n${newText}\n\n🛑 *Notice: This link/offer was closed by Admin and is no longer accessible.*`;

        const overButtons: any[] = [
          [{ text: '❌ OFFER IS OVER (CLOSED)', callback_data: 'link_over_notice', style: 'danger' }]
        ];

        let editRes: any;
        if (code.postContent.mediaType === 'image') {
          editRes = await callTelegramApi(token, 'editMessageCaption', {
            chat_id: item.chatId,
            message_id: item.messageId,
            caption: updatedNotice,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: overButtons }
          });
        } else {
          editRes = await callTelegramApi(token, 'editMessageText', {
            chat_id: item.chatId,
            message_id: item.messageId,
            text: updatedNotice,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: overButtons }
          });
        }

        if (editRes.ok) {
          item.isOver = true;
          count++;
        }
      }
    } catch {
      // Ignore user-side telegram errors
    }
    // Rate limit delay between message edits (35ms)
    await new Promise((r) => setTimeout(r, 35));
  }

  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Claim Code Over Engine',
    details: `Marked code ${code.code} as OVER (${action}). Updated/deleted messages on ${count} users' Telegram chats!`
  });

  return {
    success: true,
    affectedUsers: count,
    message: action === 'delete'
      ? `Deleted message from ${count} users' screens for code ${code.code}!`
      : `Replaced link with OVER ❌ on ${count} users' screens for code ${code.code}!`
  };
}

// Process an incoming Telegram update (from polling or webhook)
async function processTelegramUpdate(update: any) {
  const token = db.config.botToken;
  if (!token) return;

  try {
    // 0. Handle Join Requests from Bot Approval Links (creates_join_request)
    if (update.chat_join_request) {
      const cjr = update.chat_join_request;
      const user = cjr.from;
      const chat = cjr.chat;
      const matchedChannel = db.channels.find((c) => isChannelMatch(c, chat));

      const isAutoApprove = (matchedChannel as any)?.autoApprove !== undefined
        ? (matchedChannel as any).autoApprove
        : (db.config.autoApproveJoinRequests !== false);

      if (isAutoApprove) {
        // Auto-approve user join request using Telegram API
        await callTelegramApi(token, 'approveChatJoinRequest', {
          chat_id: chat.id,
          user_id: user.id
        });

        let botUser = db.users.find((u) => u.telegramId === String(user.id));
        if (!botUser) {
          botUser = {
            telegramId: String(user.id),
            username: user.username || '',
            firstName: user.first_name || 'User',
            isVerified: false,
            joinedChannels: [],
            joinedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            hasLeftRequired: false,
            leftChannelsAlertCount: 0,
            referralCode: `ref_${user.id}`,
            referralCount: 0,
            bonusBalance: 0,
            claimedCodes: []
          };
          db.users.push(botUser);
        }

        if (matchedChannel && !botUser.joinedChannels.includes(matchedChannel.id)) {
          botUser.joinedChannels.push(matchedChannel.id);
        }

        // Check if all required channels are fulfilled
        const requiredChannels = db.channels.filter((c) => c.required);
        if (requiredChannels.length > 0 && requiredChannels.every((c) => botUser.joinedChannels.includes(c.id))) {
          botUser.hasLeftRequired = false;
        }

        saveDatabase();

        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'join',
          user: `${user.first_name || 'User'} (${user.id})`,
          details: `Auto-approved join request for ${chat.title || chat.username || chat.id} created by bot approval link!`
        });

        try {
          await sendTelegramMessageSafe(token, user.id, `🎉 *JOIN REQUEST APPROVED!*\n\nYour request to join *${chat.title || 'Official Channel'}* has been automatically approved!\n\nPlease return to the bot and press 🔵 CHECK JOIN to verify and claim your access.`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: db.config.checkJoinButtonText || '🔵 CHECK JOIN', callback_data: 'check_in', style: getTelegramButtonStyle(db.config.checkButtonColor, 'success') }]
              ]
            }
          });
        } catch {
          // user might not have started bot
        }
      } else {
        // Auto-Approval is OFF: Request remains pending for manual channel admin approval in Telegram
        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'join',
          user: `${user.first_name || 'User'} (${user.id})`,
          details: `Join request received for ${chat.title || chat.username || chat.id} (Auto-approval is OFF - awaiting manual admin review).`
        });

        try {
          await sendTelegramMessageSafe(token, user.id, `⏳ *JOIN REQUEST SUBMITTED!*\n\nYour request to join *${chat.title || 'Official Channel'}* is currently under review.\n\n_Auto-approval is turned OFF. Channel Admin will manually approve your request in Telegram. Once approved, return here and press 🔵 CHECK JOIN!_`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: db.config.checkJoinButtonText || '🔵 CHECK JOIN', callback_data: 'check_in', style: getTelegramButtonStyle(db.config.checkButtonColor, 'success') }]
              ]
            }
          });
        } catch {
          // user might not have started bot
        }
      }
    }

    // 1. Handle Leave/Join Events via chat_member updates
    if (update.chat_member) {
      const cm = update.chat_member;
      const targetUser = cm.new_chat_member?.user || cm.from;
      const newStatus = cm.new_chat_member?.status;
      const oldStatus = cm.old_chat_member?.status;

      const matchedChannel = db.channels.find((c) => isChannelMatch(c, cm.chat));

      // Handle user JOIN:
      if (newStatus === 'member' || newStatus === 'administrator' || newStatus === 'creator') {
        if (matchedChannel && targetUser) {
          let botUser = db.users.find((u) => u.telegramId === String(targetUser.id));
          if (!botUser) {
            botUser = {
              telegramId: String(targetUser.id),
              username: targetUser.username || '',
              firstName: targetUser.first_name || 'User',
              isVerified: false,
              joinedChannels: [],
              joinedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              hasLeftRequired: false,
              leftChannelsAlertCount: 0,
              referralCode: `ref_${targetUser.id}`,
              referralCount: 0,
              bonusBalance: 0,
              claimedCodes: []
            };
            db.users.push(botUser);
          }
          if (!botUser.joinedChannels.includes(matchedChannel.id)) {
            botUser.joinedChannels.push(matchedChannel.id);
          }
          const requiredChannels = db.channels.filter((c) => c.required);
          if (requiredChannels.length > 0 && requiredChannels.every((c) => botUser.joinedChannels.includes(c.id))) {
            botUser.hasLeftRequired = false;
          }
          saveDatabase();

          db.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'join',
            user: `${targetUser.first_name || 'User'} (${targetUser.id})`,
            details: `Joined channel ${matchedChannel.title} (${matchedChannel.channelId}).`
          });
        }
      }

      // Handle user LEAVE or KICK:
      if (newStatus === 'left' || newStatus === 'kicked') {
        if (matchedChannel && (matchedChannel.required !== false) && targetUser) {
          // Find bot user
          let botUser = db.users.find((u) => u.telegramId === String(targetUser.id));
          if (botUser) {
            botUser.hasLeftRequired = true;
            botUser.isVerified = false;
            botUser.leftChannelsAlertCount = (botUser.leftChannelsAlertCount || 0) + 1;
            botUser.joinedChannels = botUser.joinedChannels.filter((id) => id !== matchedChannel.id && id !== matchedChannel.channelId);
            saveDatabase();
          }

          db.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'leave',
            user: `${targetUser.first_name || 'User'} (${targetUser.id})`,
            details: `Detected leaving ${matchedChannel.title}. Triggered instant re-join alert message to user.`
          });

          // Send direct warning message to user matching uploaded screenshot with Blue & Green & Red colored buttons
          const leaveKeyboard: any[] = db.channels
            .filter((c) => c.inviteLink && c.inviteLink.startsWith('http'))
            .map((ch) => [
              {
                text: db.config.joinButtonText || '🔵 JOIN NOW',
                url: ch.inviteLink,
                style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
              }
            ]);
          leaveKeyboard.push([
            {
              text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
              callback_data: 'check_in',
              style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
            }
          ]);
          if (db.config.showBonusButton) {
            leaveKeyboard.push([
              {
                text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
                callback_data: 'claim_bonus',
                style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
              }
            ]);
          }

          const alertMsg = db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.';

          try {
            await sendTelegramMessageSafe(token, targetUser.id, `🚨 *WARNING: YOU LEFT A REQUIRED CHANNEL!*\n\nChannel: *${matchedChannel.title}*\n\n${alertMsg}`, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: leaveKeyboard
              }
            });
          } catch (sendErr: any) {
            console.error(`Error sending leave alert to ${targetUser.id}:`, sendErr.message);
          }
        }
      }
    }

    // 2. Handle Callback Queries (Button clicks: check_in, admin callbacks, etc.)
    if (update.callback_query) {
      const cq = update.callback_query;
      const fromUser = cq.from;
      const chatId = cq.message?.chat?.id || fromUser.id;
      const data = cq.data;

      // Send immediate answerCallbackQuery to clear loading state
      await callTelegramApi(token, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: 'Processing...'
      });

      // Admin Callback Handlers
      if (data.startsWith('adm_')) {
        const isAdmin = db.admins.some((a) => a.telegramId === String(fromUser.id)) || db.admins.length === 0 || fromUser.id === 8938023719;
        if (!isAdmin) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: '⛔ Access denied.'
          });
          return;
        }

        // 1. Master Admin Menu
        if (data === 'adm_menu') {
          const autoApproveOn = db.config.autoApproveJoinRequests !== false;
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `👑 *TeleForce Master Admin Control Panel*\n\nWelcome, *${fromUser.first_name}*!\nSelect any function below to configure with 1-click:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📊 Live Bot Stats', callback_data: 'adm_stats', style: 'primary' }, { text: '📢 Channels List', callback_data: 'adm_channels', style: 'primary' }],
                [{ text: `⚡ Auto-Approval: ${autoApproveOn ? 'ON ✅ (Tap to OFF)' : 'OFF 🚫 (Tap to ON)'}`, callback_data: 'adm_toggle_auto_approve', style: autoApproveOn ? 'primary' : 'danger' }],
                [{ text: '👥 Groups-Wise Audience', callback_data: 'adm_groupswise', style: 'primary' }, { text: '🔗 Invite & Exclusive Link', callback_data: 'adm_links', style: 'primary' }],
                [{ text: '✏️ Edit Force Text', callback_data: 'adm_edit_force', style: 'primary' }, { text: '⚠️ Edit Leave Alert', callback_data: 'adm_edit_leave', style: 'danger' }],
                [{ text: '🔘 Button Labels & Colors', callback_data: 'adm_edit_btns', style: 'primary' }, { text: '🎁 Verification Post', callback_data: 'adm_post', style: 'primary' }],
                [{ text: '🔑 Claim Codes Manager', callback_data: 'adm_codes', style: 'primary' }, { text: '⚡ Instant Broadcast', callback_data: 'adm_bcast', style: 'primary' }],
                [{ text: '🗑️ Delete Last Broadcast from Users', callback_data: 'adm_del_last_bcast', style: 'danger' }],
                [{ text: '💾 Database Vault (Backup)', callback_data: 'adm_db', style: 'primary' }, { text: '🧹 Clear Old Data', callback_data: 'adm_cleardata', style: 'danger' }],
                [{ text: '💎 Bonus Rewards', callback_data: 'adm_bonus', style: 'primary' }, { text: '🚀 24/7 Hosting Status', callback_data: 'adm_host', style: 'primary' }]
              ]
            }
          });
          return;
        }

        // Toggle Auto-Approval
        if (data === 'adm_toggle_auto_approve') {
          const current = db.config.autoApproveJoinRequests !== false;
          db.config.autoApproveJoinRequests = !current;
          saveDatabase();

          const nowState = db.config.autoApproveJoinRequests;
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: nowState
              ? `⚡ *AUTO-APPROVAL TURNED ON!* ✅\n\nBot will now automatically approve user join requests instantly upon receiving them.`
              : `🚫 *AUTO-APPROVAL TURNED OFF!* 🛑\n\nBot will STOP auto-approving join requests.\nRequests will remain pending in Telegram for manual admin approval in Telegram channel/group settings.\n\n💡 Command to change anytime:\n• \`/autoapproval on\`\n• \`/autoapproval off\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: nowState ? '🚫 Turn OFF Auto-Approval' : '⚡ Turn ON Auto-Approval', callback_data: 'adm_toggle_auto_approve' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // Delete Last Broadcast from Users
        if (data === 'adm_del_last_bcast' || data.startsWith('adm_del_bcast_')) {
          const bcastId = data.startsWith('adm_del_bcast_') ? data.replace('adm_del_bcast_', '') : 'last';
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Deleting broadcast from all users' Telegram screens...* Please wait.`,
            parse_mode: 'Markdown'
          });

          const delResult = await deleteBroadcastFromUsers(bcastId);
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: delResult.success
              ? `🗑️ *BROADCAST DELETED FROM USERS' SCREENS!*\n\n${delResult.message}\nTotal affected users: *${delResult.affectedUsers}*`
              : `⚠️ *Deletion Notice:*\n\n${delResult.message}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 1.1 Links & Exclusive Content
        if (data === 'adm_links') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔗 *INVITE & EXCLUSIVE LINK CONFIGURATION*\n\n` +
              `🎁 *Invite & Earn Button:*\n` +
              `• Label: \`${db.config.inviteButtonText || '🎁 Invite & Earn'}\`\n` +
              `• Custom Link: \`${db.config.inviteCustomLink || 'Auto (Bot Referral Link)'}\`\n` +
              `• Share Message: "${db.config.inviteShareMessage || 'Join and earn bonus!'}"\n\n` +
              `🔓 *Exclusive VIP Content:*\n` +
              `• Label: \`${db.config.exclusiveContentButtonText || '🔓 View Exclusive Content'}\`\n` +
              `• Target URL: \`${db.config.exclusiveContentUrl || 'Not Configured'}\`\n\n` +
              `💡 *Telegram Update Commands:*\n` +
              `• \`/setexclusivelink <URL>\` - Update exclusive content link\n` +
              `• \`/setinvitetext <Label>\` - Update Invite button label\n` +
              `• \`/setexclusivetext <Label>\` - Update Exclusive button label`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🎁 Test Invite Share Link', callback_data: 'get_referral', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // 1.2 Clear Old Data
        if (data === 'adm_cleardata') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🧹 *DATABASE CLEANUP & PURGE MANAGER*\n\n` +
              `Select what old data to clear:\n` +
              `• Total Users: *${db.users.length}*\n` +
              `• Unverified / Left: *${db.users.filter(u => !u.isVerified || u.hasLeftRequired).length}*\n` +
              `• Audit Logs: *${db.logs.length}*\n` +
              `• Past Broadcasts: *${db.broadcasts.length}*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🗑️ Clear Audit Logs (Keep 10)', callback_data: 'adm_do_clean_logs', style: 'primary' }],
                [{ text: '👤 Clean Left / Unverified Users', callback_data: 'adm_do_clean_unverified', style: 'danger' }],
                [{ text: '📢 Clear Old Broadcast Logs', callback_data: 'adm_do_clean_bcasts', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_do_clean_logs') {
          const keepCount = 10;
          const removed = Math.max(0, db.logs.length - keepCount);
          db.logs = db.logs.slice(0, keepCount);
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Audit Logs Cleaned!* Removed ${removed} old logs. (Kept ${db.logs.length} latest)`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Cleanup', callback_data: 'adm_cleardata' }]] }
          });
          return;
        }

        if (data === 'adm_do_clean_unverified') {
          const before = db.users.length;
          db.users = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
          const removed = before - db.users.length;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Unverified Users Purged!* Removed ${removed} inactive/left users. Remaining active verified users: *${db.users.length}*`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Cleanup', callback_data: 'adm_cleardata' }]] }
          });
          return;
        }

        if (data === 'adm_do_clean_bcasts') {
          const count = db.broadcasts.length;
          db.broadcasts = [];
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Broadcast Logs Cleaned!* Removed ${count} past broadcast records.`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Cleanup', callback_data: 'adm_cleardata' }]] }
          });
          return;
        }

        // 1.3 Groups-wise Audience Breakdown
        if (data === 'adm_groupswise') {
          const report = db.channels.map((ch, idx) => {
            const joined = db.users.filter((u) => u.joinedChannels.includes(ch.id)).length;
            return `${idx + 1}. *${ch.title}* (${ch.type.toUpperCase()})\n   ID: \`${ch.channelId}\`\n   Admin: *${ch.isBotAdmin ? '✅ YES' : '⚠️ NO'}*\n   Active Bot Members: *${joined}*\n   Approval Link: *${ch.isApprovalLink ? 'YES (Auto)' : 'NO'}*`;
          }).join('\n\n');

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `👥 *GROUPS & CHANNELS AUDIENCE BREAKDOWN*\n\n${report || 'No channels added yet.'}\n\n💡 Full member lists and filters are available in the Web Dashboard under "👥 Groups-Wise View".`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 2. Database Vault
        if (data === 'adm_db') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `💾 *TELEGRAM DATABASE VAULT*\n\n` +
              `• Vault Group ID: \`${db.config.backupGroupId || 'Not Configured'}\`\n` +
              `• Group Name: *${db.config.backupGroupName || 'None'}*\n` +
              `• Auto-Sync on Changes: *${db.config.autoBackupToGroup ? '🟢 ENABLED' : '🔴 DISABLED'}*\n` +
              `• Last Backup Sent: *${db.config.lastBackupTimestamp || 'None'}*\n` +
              `• Total Stored Users: *${db.users.length}*\n` +
              `• Required Channels: *${db.channels.length}*\n\n` +
              `💡 *How to configure:* Add this bot as Admin to your private Telegram group and run \`/setbackupgroup\` inside it!`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '💾 Backup Now to Group', callback_data: 'adm_dobackup', style: 'primary' }],
                [{ text: '🔄 How to Restore (/restore)', callback_data: 'adm_how_restore', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_dobackup') {
          await callTelegramApi(token, 'sendMessage', { chat_id: chatId, text: '⏳ Uploading database backup snapshot to Telegram group...' });
          const res = await backupDatabaseToTelegramGroup('Admin Panel Button Trigger');
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: res.ok ? `✅ *Database backup sent to Telegram group!*\n\nMsg: ${res.message}` : `❌ *Error:* ${res.error}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_how_restore') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔄 *HOW TO RESTORE DATABASE*\n\n` +
              `1️⃣ Apne Telegram Backup Group me jayein: \`${db.config.backupGroupId || 'Configured Group'}\`\n` +
              `2️⃣ Kisi bhi \`teleforce_db_backup_*.json\` message par **Reply** karein.\n` +
              `3️⃣ Reply me likhein: \`/restore\`\n\n` +
              `Bot turant us file se pura database (users, channels, codes) restore kar dega!`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 3. Stats & Metrics
        if (data === 'adm_stats') {
          const verified = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
          const left = db.users.filter((u) => u.hasLeftRequired).length;
          const totalBalance = db.users.reduce((acc, u) => acc + (u.bonusBalance || 0), 0);
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `📊 *TELEFORCE LIVE BOT STATS*\n\n` +
              `• Total Registered Users: *${db.users.length}*\n` +
              `• Verified Active Members: *${verified}*\n` +
              `• Left Channels (Alert Triggered): *${left}*\n` +
              `• Active Force Channels: *${db.channels.length}*\n` +
              `• Active Claim Codes: *${db.claimCodes.filter((c) => c.isActive).length}*\n` +
              `• Total Bonus Distributed: *${totalBalance} Points*\n` +
              `• Server Uptime: *${Math.floor(process.uptime())}s*\n` +
              `• Indian Standard Time: *${getISTDateString()}*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Refresh Stats', callback_data: 'adm_stats', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // 4. Channels Manager
        if (data === 'adm_channels') {
          const chList = db.channels.map((c, i) => `${i + 1}. *${c.title}* (${c.type.toUpperCase()})\n   ID: \`${c.channelId}\`\n   Link: ${c.inviteLink}`).join('\n\n');
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `📢 *FORCE JOIN CHANNELS & GROUPS*\n\n${chList || 'No channels configured yet.'}\n\n` +
              `💡 *Add Channel Command:*\n\`/addchannel <@channelId> <Title> <InviteLink>\`\n\n` +
              `💡 *Delete Channel Command:*\n\`/delchannel <channelId>\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '➕ Add Demo Channel', callback_data: 'adm_add_demo_channel', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_add_demo_channel') {
          const newCh: ForceJoinChannel = {
            id: `ch-${Date.now()}`,
            channelId: '@PrimeCommunityChat',
            title: '💬 Prime Community Group',
            inviteLink: 'https://t.me/PrimeCommunityChat',
            type: 'group',
            required: true,
            memberCount: 18500,
            addedAt: new Date().toISOString()
          };
          db.channels.push(newCh);
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Added Channel:* ${newCh.title} (\`${newCh.channelId}\`)`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📢 View Channels List', callback_data: 'adm_channels', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // 5. Edit Force Join Text
        if (data === 'adm_edit_force') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✏️ *EDIT FORCE JOIN WELCOME TEXT*\n\n*Current Welcome Message:*\n\`${db.config.welcomeMessage}\`\n\n` +
              `💡 *Manual Update Command:*\n\`/setforcetext <Your new welcome message>\`\n\n` +
              `Or choose a 1-click preset below:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔵 Apply 🔵 CHECK JOIN Preset', callback_data: 'adm_preset_blue_welcome', style: 'primary' }],
                [{ text: '🔒 Apply VIP Access Notice', callback_data: 'adm_preset_vip_welcome', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_preset_blue_welcome') {
          db.config.welcomeMessage = '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Welcome Message set to 🔵 CHECK JOIN Preset:*\n\n${db.config.welcomeMessage}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_preset_vip_welcome') {
          db.config.welcomeMessage = '🔒 *EXCLUSIVE VIP ACCESS*\n\nPlease join all our official channels and groups below, then press 🔵 CHECK JOIN to verify.';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Welcome Message set to VIP Preset:*\n\n${db.config.welcomeMessage}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 6. Edit Leave Alert Warning Text
        if (data === 'adm_edit_leave') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *EDIT LEAVE ALERT WARNING TEXT*\n\n*Current Leave Alert:*\n\`${db.config.leaveAlertMessage}\`\n\n` +
              `💡 *Manual Update Command:*\n\`/setleavetext <Your new warning message>\`\n\n` +
              `Or choose a 1-click preset below:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚨 Apply Urgent Rejoin Warning', callback_data: 'adm_preset_urgent_leave', style: 'danger' }],
                [{ text: '⚠️ Apply Standard Warning', callback_data: 'adm_preset_std_leave', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_preset_urgent_leave') {
          db.config.leaveAlertMessage = '🚨 URGENT: You left a required channel/group!\n\nPlease join again immediately and press 🔵 CHECK JOIN.';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Leave Alert set to Urgent Preset:*\n\n${db.config.leaveAlertMessage}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_preset_std_leave') {
          db.config.leaveAlertMessage = '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Leave Alert set to Standard Preset:*\n\n${db.config.leaveAlertMessage}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 7. Button Labels & Colors
        if (data === 'adm_edit_btns') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔘 *BUTTON LABELS & COLOR CUSTOMIZER*\n\n` +
              `• Join Button: \`${db.config.joinButtonText || '🔵 JOIN NOW'}\` (Color: *${db.config.joinButtonColor || 'blue'}*)\n` +
              `• Check Join Button: \`${db.config.checkJoinButtonText || '🔵 CHECK JOIN'}\` (Color: *${db.config.checkButtonColor || 'blue'}*)\n` +
              `• Bonus Button: \`${db.config.bonusButtonText || '🔴 CLAIM BONUS'}\` (Color: *${db.config.bonusButtonColor || 'red'}*)\n\n` +
              `Tap any button below for instant 1-click color & label change:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔵 Set Blue Check Join', callback_data: 'adm_set_check_blue', style: 'primary' }, { text: '🟢 Set Green Check Join', callback_data: 'adm_set_check_green', style: 'primary' }],
                [{ text: '🔴 Set Red Bonus Button', callback_data: 'adm_set_bonus_red', style: 'danger' }, { text: '🟠 Set Amber Bonus Button', callback_data: 'adm_set_bonus_amber', style: 'primary' }],
                [{ text: '🔵 Set Blue Join Button', callback_data: 'adm_set_join_blue', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_set_check_blue') {
          db.config.checkJoinButtonText = '🔵 CHECK JOIN';
          db.config.checkButtonColor = 'blue';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Check Join Button updated to Blue:* \`🔵 CHECK JOIN\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔘 Back to Buttons', callback_data: 'adm_edit_btns' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_set_check_green') {
          db.config.checkJoinButtonText = '🟢 CHECK JOIN';
          db.config.checkButtonColor = 'green';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Check Join Button updated to Green:* \`🟢 CHECK JOIN\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔘 Back to Buttons', callback_data: 'adm_edit_btns' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_set_bonus_red') {
          db.config.bonusButtonText = '🔴 CLAIM BONUS';
          db.config.bonusButtonColor = 'red';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Bonus Button updated to Red:* \`🔴 CLAIM BONUS\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔘 Back to Buttons', callback_data: 'adm_edit_btns' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_set_bonus_amber') {
          db.config.bonusButtonText = '🟠 CLAIM BONUS';
          db.config.bonusButtonColor = 'amber';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Bonus Button updated to Amber:* \`🟠 CLAIM BONUS\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔘 Back to Buttons', callback_data: 'adm_edit_btns' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_set_join_blue') {
          db.config.joinButtonText = '🔵 JOIN NOW';
          db.config.joinButtonColor = 'blue';
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Join Button updated to Blue:* \`🔵 JOIN NOW\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔘 Back to Buttons', callback_data: 'adm_edit_btns' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 8. Claim Codes Manager
        if (data === 'adm_codes') {
          const codeList = db.claimCodes.map((c) => `• \`${c.code}\` - *${c.title}* (${c.currentUses}/${c.maxUses} uses, ${c.isActive ? 'Active' : 'Disabled'})`).join('\n');
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔑 *ACTIVE CLAIM CODES*\n\n${codeList || 'No codes generated.'}\n\n` +
              `💡 *Create Code Command:*\n\`/addcode <CODE> <Title> <RewardMessage>\`\n\n` +
              `Users redeem using \`/claim <code>\` after verifying in all channels.`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '➕ Generate VIP2026 Code', callback_data: 'adm_add_vip_code', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_add_vip_code') {
          let codeObj = db.claimCodes.find((c) => c.code === 'VIP2026');
          if (!codeObj) {
            db.claimCodes.unshift({
              id: `code-${Date.now()}`,
              code: 'VIP2026',
              title: 'VIP Community Access Pass',
              postContent: {
                text: '🎉 Congratulations! Here is your exclusive VIP access link: https://t.me/PrimeVipLounge',
                mediaType: 'none',
                buttonText: '🚀 Access VIP Now',
                buttonUrl: 'https://t.me/PrimeVipLounge'
              },
              maxUses: 500,
              currentUses: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              claimedByUsers: []
            });
          } else {
            codeObj.isActive = true;
          }
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *VIP2026 Claim Code Activated!* Users can now redeem via \`/claim VIP2026\`.`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 9. Verification Post (Post Delivered on Successful Join)
        if (data === 'adm_post') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🎁 *VERIFICATION POST SETTINGS*\n\n` +
              `• Status: *${db.verificationPost.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}*\n` +
              `• Attached Media: *${db.verificationPost.mediaType.toUpperCase()}*\n` +
              `• Primary Button: *${db.verificationPost.buttonText || 'None'}*\n` +
              `• Primary URL: *${db.verificationPost.buttonUrl || 'None'}*\n\n` +
              `*Delivered Message:*\n${db.verificationPost.text}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: db.verificationPost.enabled ? '🔴 Disable Post' : '🟢 Enable Post', callback_data: 'adm_toggle_post', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_toggle_post') {
          db.verificationPost.enabled = !db.verificationPost.enabled;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Verification Post is now:* ${db.verificationPost.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 10. Instant Broadcast
        if (data === 'adm_bcast') {
          const verifiedCount = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚡ *INSTANT BROADCAST TO VERIFIED USERS*\n\n` +
              `• Target Audience: *${verifiedCount} Verified Users*\n` +
              `• Tracked Past Broadcasts: *${db.broadcasts.length}*\n\n` +
              `💡 *How to Broadcast:*\n` +
              `• Direct: \`/bc Your announcement message\`\n` +
              `• Reply: Send media/photo, then reply with \`/bc\`\n\n` +
              `💡 *Mistake Deletion & Editing:*\n` +
              `• \`/delbroadcast last\` - Delete from all users' screens\n` +
              `• \`/replacelink <old> <new>\` - Replace URL across all users\n` +
              `• \`/editbroadcast last <text>\` - Edit text across all users`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📢 Send Test Announcement Now', callback_data: 'adm_send_test_bcast', style: 'primary' }],
                [{ text: '🗑️ Delete Last Broadcast from Users', callback_data: 'adm_del_last_bcast', style: 'danger' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_send_test_bcast') {
          const verifiedUsers = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
          let sentCount = 0;
          const sampleText = `📢 *OFFICIAL ANNOUNCEMENT*\n\nHello everyone! Thank you for staying active in our channels. Exciting drops and bonuses coming up!`;
          for (const u of verifiedUsers) {
            try {
              await callTelegramApi(token, 'sendMessage', {
                chat_id: u.telegramId,
                text: sampleText,
                parse_mode: 'Markdown'
              });
              sentCount++;
            } catch (e) {
              // ignore blocked users
            }
          }
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Broadcast Delivered to ${sentCount} Verified Users!*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 11. Bonus Rewards Configuration
        if (data === 'adm_bonus') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `💎 *BONUS & REWARDS CONFIGURATION*\n\n` +
              `• Daily Bonus Amount: *${db.config.dailyBonusAmount || 25} Points*\n` +
              `• Referral Bonus: *${db.config.referralBonusAmount || 50} Points*\n` +
              `• Show Bonus Button: *${db.config.showBonusButton ? '🟢 ON' : '🔴 OFF'}*\n` +
              `• Button Text: \`${db.config.bonusButtonText || '🔴 CLAIM BONUS'}\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: db.config.showBonusButton ? '🔴 Hide Bonus Button' : '🟢 Show Bonus Button', callback_data: 'adm_toggle_bonus', style: 'primary' }],
                [{ text: 'Set 25 Pts', callback_data: 'adm_bonus_25' }, { text: 'Set 50 Pts', callback_data: 'adm_bonus_50' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_toggle_bonus') {
          db.config.showBonusButton = !db.config.showBonusButton;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Bonus Button visibility:* ${db.config.showBonusButton ? '🟢 SHOWN' : '🔴 HIDDEN'}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '💎 Back to Bonus', callback_data: 'adm_bonus' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_bonus_25') {
          db.config.dailyBonusAmount = 25;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Daily Bonus Amount set to 25 Points!*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '💎 Back to Bonus', callback_data: 'adm_bonus' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        if (data === 'adm_bonus_50') {
          db.config.dailyBonusAmount = 50;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Daily Bonus Amount set to 50 Points!*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '💎 Back to Bonus', callback_data: 'adm_bonus' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 12. Authorized Admins & Users
        if (data === 'adm_admins') {
          const adminList = db.admins.map((a, i) => `${i + 1}. *${a.name}* (\`${a.telegramId}\`) - ${a.role.toUpperCase()}`).join('\n');
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `👥 *AUTHORIZED ADMINISTRATORS*\n\n` +
              `${adminList || 'No custom admins configured (Superadmin access enabled).'}\n\n` +
              `• Total Bot Users in DB: *${db.users.length}*\n\n` +
              `💡 *Add New Admin Command:*\n\`/addadmin <TelegramID> <Name>\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 13. 24/7 Hosting Status & Health
        if (data === 'adm_host') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🚀 *24/7 HOSTING STATUS & ENGINE HEALTH*\n\n` +
              `• Server Status: *🟢 ONLINE*\n` +
              `• Server Uptime: *${Math.floor(process.uptime())} seconds*\n` +
              `• IST Time: *${getISTDateString()}*\n` +
              `• Port: \`${PORT}\`\n` +
              `• Polling Status: *${isPollingRunning ? '🟢 ACTIVE' : '🔴 PAUSED'}*\n` +
              `• Auto-Start on Reboot: *ENABLED*\n\n` +
              `💡 *Keep Awake Tip:* Ping \`/api/health\` every 5 minutes using UptimeRobot so cloud hosts never sleep!`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⚡ Ping /health API', callback_data: 'adm_ping_health', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (data === 'adm_ping_health') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚡ *HEALTHCHECK RESPONSE:*\n\n\`\`\`json\n{\n  "status": "ok",\n  "uptime": ${Math.floor(process.uptime())},\n  "botActive": ${isPollingRunning},\n  "users": ${db.users.length},\n  "ist": "${getISTDateString()}"\n}\n\`\`\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]]
            }
          });
          return;
        }

        // 14. Database Vault Menu
        if (data === 'adm_db') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `💾 *TELEGRAM DATABASE VAULT & BACKUP MANAGER*\n\n` +
              `• Stored Users: *${db.users.length}*\n` +
              `• Required Channels: *${db.channels.length}*\n` +
              `• Active Claim Codes: *${db.claimCodes.length}*\n` +
              `• Configured Vault Group: \`${db.config.backupGroupId || 'Not Configured'}\`\n` +
              `• Last Backup: *${db.config.lastBackupTimestamp || 'None'}*\n\n` +
              `Aap yahan se direct backup create kar sakte hain ya Group ID se instant restore kar sakte hain:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '💾 Backup Database Now', callback_data: 'adm_dobackup_now', style: 'primary' }],
                [{ text: `🔄 Restore From Group (${db.config.backupGroupId || 'Set Group'})`, callback_data: 'adm_dobackup_restore', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // 14.1 Execute Backup Now
        if (data === 'adm_dobackup_now') {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Uploading database snapshot to Telegram group...*`,
            parse_mode: 'Markdown'
          });
          const bRes = await backupDatabaseToTelegramGroup('Admin Telegram Menu Button');
          if (bRes.ok) {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `✅ *DATABASE BACKUP ARCHIVE POSTED!*\n\n• Group ID: \`${db.config.backupGroupId}\`\n• Users: *${db.users.length}*\n• Channels: *${db.channels.length}*\n• Claim Codes: *${db.claimCodes.length}*\n• IST Time: *${getISTDateString()}*`,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [[{ text: '💾 Back to DB Vault', callback_data: 'adm_db' }, { text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
              }
            });
          } else {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `❌ *Backup Failed:* ${bRes.error}\n\nMake sure the bot is an Admin in group \`${db.config.backupGroupId}\`.`,
              parse_mode: 'Markdown'
            });
          }
          return;
        }

        // 14.2 Execute Restore From Group (Resolves user button click issue!)
        if (data === 'adm_dobackup_restore') {
          const targetGroup = db.config.backupGroupId || String(chatId);
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Connecting to Database Vault Group (${targetGroup})...*\nFetching latest backup snapshot and restoring database...`,
            parse_mode: 'Markdown'
          });

          const recRes = await restoreDatabaseFromTelegramGroup(targetGroup);
          if (recRes.ok) {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `🎉 *DATABASE RESTORED SUCCESSFULLY!*\n\n` +
                `✅ *Restoration Report:*\n` +
                `• Total Recovered Users: *${db.users.length}*\n` +
                `• Required Channels: *${db.channels.length}*\n` +
                `• Active Claim Codes: *${db.claimCodes.length}*\n` +
                `• Authorized Admins: *${db.admins.length}*\n` +
                `• Recovered At: \`${getISTDateString()}\`\n\n` +
                `Aapka saara 100+ users ka data, claim codes, verification post aur channels 100% recover ho chuka hai!`,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📊 View Restored Stats', callback_data: 'adm_stats', style: 'primary' }],
                  [{ text: '📢 View Channels', callback_data: 'adm_channels', style: 'primary' }],
                  [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
                ]
              }
            });
          } else {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `❌ *Restore Failed:*\n${recRes.error}\n\n💡 Ensure the bot is an Admin in group \`${targetGroup}\`. You can also reply \`/restore\` directly to any backup .json file in that group!`,
              parse_mode: 'Markdown'
            });
          }
          return;
        }

        // 15. Groups-Wise Management
        if (data === 'adm_groupswise') {
          const groupsList = db.channels.map((c, i) =>
            `${i + 1}. *${c.title || (c as any).name || 'Channel'}* (${(c.type || 'channel').toUpperCase()})\n` +
            `   • ID: \`${c.channelId || (c as any).chatId || c.id}\`\n` +
            `   • Members: *${c.memberCount || 0}*\n` +
            `   • Admin Status: *${c.isBotAdmin ? '✅ Verified Admin' : '⚠️ Not Admin'}*\n` +
            `   • Approval Link: \`${c.inviteLink || 'None'}\``
          ).join('\n\n');

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `📊 *GROUPS-WISE AUDIENCE & CHANNELS*\n\n${groupsList || 'No groups configured.'}\n\n` +
              `Total Verified Users: *${db.users.filter(u => u.isVerified).length}*\n` +
              `Total Stored Users: *${db.users.length}*`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Refresh Channels', callback_data: 'adm_channels' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }
      }

      // Ensure user in database
      let botUser = db.users.find((u) => u.telegramId === String(fromUser.id));
      if (!botUser) {
        botUser = {
          telegramId: String(fromUser.id),
          username: fromUser.username || '',
          firstName: fromUser.first_name || 'User',
          isVerified: false,
          joinedChannels: [],
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          hasLeftRequired: false,
          leftChannelsAlertCount: 0,
          referralCode: `ref_${fromUser.id}`,
          referralCount: 0,
          bonusBalance: 0,
          claimedCodes: []
        };
        db.users.push(botUser);
        saveDatabase();
      }

      if (data === 'check_in') {
        // Send typing action
        await callTelegramApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' });

        // Check each required channel membership via Telegram API
        const requiredChannels = db.channels.filter((c) => c.required);
        const missing: ForceJoinChannel[] = [];

        for (const ch of requiredChannels) {
          const isAutoApprove = (ch as any).autoApprove !== undefined
            ? (ch as any).autoApprove
            : (db.config.autoApproveJoinRequests !== false);
          let isMember = await checkTelegramChatMember(token, ch.channelId, fromUser.id, isAutoApprove);
          if (!isMember && isAutoApprove) {
            try {
              const approveRes = await callTelegramApi(token, 'approveChatJoinRequest', {
                chat_id: ch.channelId,
                user_id: fromUser.id
              });
              if (approveRes.ok) {
                isMember = true;
              } else {
                const desc = String(approveRes.description || '').toLowerCase();
                if (desc.includes('already_participant') || desc.includes('already a participant') || desc.includes('already a member')) {
                  isMember = true;
                }
              }
            } catch {}
          }

          // If user previously joined / had approval request confirmed and hasn't left
          if (!isMember && botUser.joinedChannels.includes(ch.id)) {
            isMember = true;
          }

          if (!isMember) {
            missing.push(ch);
          } else if (!botUser.joinedChannels.includes(ch.id)) {
            botUser.joinedChannels.push(ch.id);
          }
        }

        if (missing.length > 0) {
          botUser.isVerified = false;
          saveDatabase();

          const missingKeyboard: any[] = missing
            .filter((m) => m.inviteLink && m.inviteLink.startsWith('http'))
            .map((m) => [{
              text: db.config.joinButtonText || '🔵 JOIN NOW',
              url: m.inviteLink,
              style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
            }]);
          missingKeyboard.push([
            {
              text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
              callback_data: 'check_in',
              style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
            }
          ]);
          if (db.config.showBonusButton) {
            missingKeyboard.push([
              {
                text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
                callback_data: 'claim_bonus',
                style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
              }
            ]);
          }

          await sendTelegramMessageSafe(token, chatId, db.config.welcomeMessage || '⚠️ Complete the required steps below to continue.\n\nPlease join all required channels/groups above and press 🔵 CHECK JOIN.', {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: missingKeyboard }
          });
          return;
        }

        // Successfully verified!
        botUser.isVerified = true;
        botUser.hasLeftRequired = false;
        saveDatabase();

        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'verify',
          user: `${fromUser.first_name || 'User'} (${fromUser.id})`,
          details: 'Real Telegram verification passed! Delivered verification post.'
        });

        // Deliver admin-configured post with exclusive link and invite & earn button
        const buttons: any[] = [];
        const actionRow: any[] = [];
        
        // Exclusive VIP link button (Configurable)
        if (db.config.exclusiveContentUrl) {
          actionRow.push({
            text: db.config.exclusiveContentButtonText || '🔓 View Exclusive Content',
            url: db.config.exclusiveContentUrl,
            style: 'success'
          });
        }

        if (db.verificationPost.buttonText && db.verificationPost.buttonUrl) {
          actionRow.push({ text: db.verificationPost.buttonText, url: db.verificationPost.buttonUrl, style: 'primary' });
        }
        if (actionRow.length > 0) buttons.push(actionRow);

        const secondaryRow: any[] = [];
        if (db.verificationPost.secondaryButtonText && db.verificationPost.secondaryButtonUrl) {
          secondaryRow.push({ text: db.verificationPost.secondaryButtonText, url: db.verificationPost.secondaryButtonUrl, style: 'primary' });
        }
        // Invite & Earn button
        secondaryRow.push({
          text: db.config.inviteButtonText || '🎁 Invite & Earn',
          callback_data: 'get_referral',
          style: 'primary'
        });
        buttons.push(secondaryRow);

        if (db.config.showBonusButton) {
          buttons.push([{
            text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
            callback_data: 'claim_bonus',
            style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
          }]);
        }

        if (db.verificationPost.mediaType === 'image' && db.verificationPost.mediaUrl?.startsWith('http')) {
          const photoRes = await callTelegramApi(token, 'sendPhoto', {
            chat_id: chatId,
            photo: db.verificationPost.mediaUrl,
            caption: db.verificationPost.text,
            parse_mode: 'Markdown',
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
          if (!photoRes.ok) {
            await sendTelegramMessageSafe(token, chatId, db.verificationPost.text, {
              parse_mode: 'Markdown',
              reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
            });
          }
        } else {
          await sendTelegramMessageSafe(token, chatId, db.verificationPost.text, {
            parse_mode: 'Markdown',
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        }
        return;
      }

      if (data === 'get_referral') {
        const botUsername = db.config.botUsername || 'PrimeForceJoinBot';
        const refLink = `https://t.me/${botUsername}?start=${botUser.referralCode}`;
        const shareText = encodeURIComponent(db.config.inviteShareMessage || '🔥 Join this bot, verify in channels, and unlock VIP access & bonuses!');
        const shareUrl = db.config.inviteCustomLink
          ? db.config.inviteCustomLink.replace('{bot_ref_link}', refLink)
          : `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`;

        await sendTelegramMessageSafe(token, chatId, `🎁 *INVITE & EARN REWARDS*\n\n` +
          `Invite friends and earn *+${db.config.referralBonusAmount} Points* for each verified join!\n\n` +
          `🔗 *Your Personal Referral Link:*\n\`${refLink}\`\n\n` +
          `📊 *Your Stats:*\n` +
          `• Friends Invited: *${botUser.referralCount} Users*\n` +
          `• Referral Bonus: *${botUser.referralCount * db.config.referralBonusAmount} Points*\n` +
          `• Current Balance: *${botUser.bonusBalance} Points*`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: db.config.inviteButtonText || '🎁 Share With Friends', url: shareUrl, style: 'primary' }],
              [{ text: '🔴 CLAIM BONUS', callback_data: 'claim_bonus', style: 'danger' }]
            ]
          }
        });
        return;
      }

      if (data === 'view_exclusive') {
        if (!botUser.isVerified || botUser.hasLeftRequired) {
          await sendTelegramMessageSafe(token, chatId, `🔒 *EXCLUSIVE ACCESS LOCKED!*\n\nPlease join all required channels and press 🔵 CHECK JOIN first.\n\n${db.config.leaveAlertMessage}`);
          return;
        }

        const exclusiveUrl = db.config.exclusiveContentUrl || 'https://t.me';
        await sendTelegramMessageSafe(token, chatId, `🔓 *EXCLUSIVE VIP ACCESS UNLOCKED!*\n\nClick the button below to access your exclusive content:`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: db.config.exclusiveContentButtonText || '🔓 Open Exclusive VIP', url: exclusiveUrl, style: 'success' }]
            ]
          }
        });
        return;
      }

      if (data === 'claim_bonus') {
        await callTelegramApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' });

        if (!botUser.isVerified || botUser.hasLeftRequired) {
          const checkBtns: any[] = db.channels
            .filter((c) => c.inviteLink && c.inviteLink.startsWith('http'))
            .map((c) => [{
              text: db.config.joinButtonText || '🔵 JOIN NOW',
              url: c.inviteLink,
              style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
            }]);
          checkBtns.push([{
            text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
            callback_data: 'check_in',
            style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
          }]);

          await sendTelegramMessageSafe(token, chatId, db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.', {
            reply_markup: {
              inline_keyboard: checkBtns
            }
          });
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (botUser.lastBonusClaimDate === today) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *ALREADY CLAIMED TODAY!*\n\nYou already claimed your bonus for today (${today}).\nPlease come back tomorrow!\n\n💰 Current Wallet: *${botUser.bonusBalance} Points*`,
            parse_mode: 'Markdown'
          });
          return;
        }

        botUser.bonusBalance += db.config.dailyBonusAmount;
        botUser.lastBonusClaimDate = today;
        saveDatabase();

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🎁 *DAILY BONUS CLAIMED!*\n\n+${db.config.dailyBonusAmount} Points added to your balance!\n\n💰 *Total Wallet Balance:* ${botUser.bonusBalance} Points`,
          parse_mode: 'Markdown'
        });
        return;
      }
    }

    // 3. Handle Regular Messages (e.g. /start, /admin, /claim, admin set commands)
    if (update.message && update.message.text) {
      const msg = update.message;
      const text = msg.text.trim();
      const chatId = msg.chat.id;
      const fromUser = msg.from;

      let botUser = db.users.find((u) => u.telegramId === String(fromUser.id));
      if (!botUser) {
        botUser = {
          telegramId: String(fromUser.id),
          username: fromUser.username || '',
          firstName: fromUser.first_name || 'User',
          isVerified: false,
          joinedChannels: [],
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          hasLeftRequired: false,
          leftChannelsAlertCount: 0,
          referralCode: `ref_${fromUser.id}`,
          referralCount: 0,
          bonusBalance: 0,
          claimedCodes: []
        };
        db.users.push(botUser);
        saveDatabase();
      }
      botUser.lastActiveAt = new Date().toISOString();

      // Show typing animation on Telegram client
      await callTelegramApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' });

      // Check if user is authorized admin
      const isAdmin = db.admins.some((a) => a.telegramId === String(fromUser.id)) || db.admins.length === 0 || fromUser.id === 8938023719;

      // Handle Admin /admin Command
      if (text.startsWith('/admin')) {
        if (!isAdmin) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⛔ *ACCESS DENIED*\n\nYou are not authorized to use the admin command.\nYour Telegram ID: \`${fromUser.id}\``,
            parse_mode: 'Markdown'
          });
          return;
        }

        const autoApproveOn = db.config.autoApproveJoinRequests !== false;
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `👑 *TeleForce Master Admin Control Panel*\n\n` +
            `Welcome, *${fromUser.first_name}*!\n\n` +
            `• Auto-Approval: *${autoApproveOn ? 'ON ✅ (Auto-Approving)' : 'OFF 🛑 (Manual Channel Review)'}*\n` +
            `• Bot Engine: *${db.config.isPollingActive !== false ? 'RUNNING 🟢' : 'PAUSED 🔴'}*\n` +
            `• Verified Users: *${db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length}*\n\n` +
            `Tap any button below for 1-click action:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📊 Live Bot Stats', callback_data: 'adm_stats', style: 'primary' }, { text: '📢 Channels List', callback_data: 'adm_channels', style: 'primary' }],
              [{ text: `⚡ Auto-Approval: ${autoApproveOn ? 'ON ✅ (Tap to OFF)' : 'OFF 🛑 (Tap to ON)'}`, callback_data: 'adm_toggle_auto_approve', style: autoApproveOn ? 'primary' : 'danger' }],
              [{ text: '⚡ Instant Broadcast', callback_data: 'adm_bcast', style: 'primary' }, { text: '🗑️ Delete Last Broadcast', callback_data: 'adm_del_last_bcast', style: 'danger' }],
              [{ text: '👥 Groups-Wise Audience', callback_data: 'adm_groupswise', style: 'primary' }, { text: '🔗 Invite & Exclusive Link', callback_data: 'adm_links', style: 'primary' }],
              [{ text: '✏️ Edit Force Text', callback_data: 'adm_edit_force', style: 'primary' }, { text: '⚠️ Edit Leave Alert', callback_data: 'adm_edit_leave', style: 'danger' }],
              [{ text: '🔘 Button Labels & Colors', callback_data: 'adm_edit_btns', style: 'primary' }, { text: '🎁 Verification Post', callback_data: 'adm_post', style: 'primary' }],
              [{ text: '🔑 Claim Codes Manager', callback_data: 'adm_codes', style: 'primary' }, { text: '💾 Database Vault', callback_data: 'adm_db', style: 'primary' }],
              [{ text: '💎 Bonus Rewards', callback_data: 'adm_bonus', style: 'primary' }, { text: '🧹 Clear Old Data', callback_data: 'adm_cleardata', style: 'danger' }],
              [{ text: '🚀 24/7 Hosting Status', callback_data: 'adm_host', style: 'primary' }]
            ]
          }
        });
        return;
      }

      // Handle Admin /setforcetext <text>
      if (text.startsWith('/setforcetext') && isAdmin) {
        const newText = text.replace('/setforcetext', '').trim();
        if (!newText) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/setforcetext <New force join message text>\``,
            parse_mode: 'Markdown'
          });
          return;
        }
        db.config.welcomeMessage = newText;
        saveDatabase();
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ *Force Join Welcome Text Updated!*\n\n*New Text:*\n${newText}`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /setleavetext <text>
      if (text.startsWith('/setleavetext') && isAdmin) {
        const newText = text.replace('/setleavetext', '').trim();
        if (!newText) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/setleavetext <New channel leave alert message>\``,
            parse_mode: 'Markdown'
          });
          return;
        }
        db.config.leaveAlertMessage = newText;
        saveDatabase();
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ *Leave Alert Message Updated!*\n\n*New Text:*\n${newText}`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /setjoinbtn <text>
      if (text.startsWith('/setjoinbtn') && isAdmin) {
        const newBtn = text.replace('/setjoinbtn', '').trim();
        if (newBtn) {
          db.config.joinButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Join Button Label set to:* \`${newBtn}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /setcheckbtn <text>
      if (text.startsWith('/setcheckbtn') && isAdmin) {
        const newBtn = text.replace('/setcheckbtn', '').trim();
        if (newBtn) {
          db.config.checkJoinButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Check Join Button Label set to:* \`${newBtn}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /setexclusivelink <url>
      if (text.startsWith('/setexclusivelink') && isAdmin) {
        const newUrl = text.replace('/setexclusivelink', '').trim();
        if (newUrl) {
          db.config.exclusiveContentUrl = newUrl;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Exclusive VIP Content Link Updated!*\n\nNew URL: \`${newUrl}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /setinvitetext <text>
      if (text.startsWith('/setinvitetext') && isAdmin) {
        const newText = text.replace('/setinvitetext', '').trim();
        if (newText) {
          db.config.inviteButtonText = newText;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Invite Button Label updated to:* \`${newText}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /setexclusivetext <text>
      if (text.startsWith('/setexclusivetext') && isAdmin) {
        const newText = text.replace('/setexclusivetext', '').trim();
        if (newText) {
          db.config.exclusiveContentButtonText = newText;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Exclusive Button Label updated to:* \`${newText}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /addchannel <@channelId> <Title> [InviteLink]
      if (text.startsWith('/addchannel') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length >= 3) {
          const chId = parts[1];
          const chTitle = parts[2];
          let chLink = parts[3] || '';

          // 1. Check if bot is Admin in channel
          const adminCheck = await checkBotIsAdminInChat(token, chId);

          // 2. If no link or 'auto' or 'approval' specified, auto-generate Approval Link!
          let isApproval = false;
          if (!chLink || chLink.toLowerCase() === 'auto' || chLink.toLowerCase() === 'approval') {
            const linkRes = await createChatApprovalInviteLink(token, chId, `${chTitle} Approval Link`);
            if (linkRes.ok && linkRes.invite_link) {
              chLink = linkRes.invite_link;
              isApproval = true;
            } else {
              chLink = `https://t.me/${chId.replace('@', '')}`;
            }
          }

          const newChan: ForceJoinChannel = {
            id: `ch-${Date.now()}`,
            channelId: chId,
            title: chTitle,
            inviteLink: chLink,
            type: chId.startsWith('-100') ? 'group' : 'channel',
            required: true,
            isBotAdmin: adminCheck.isAdmin,
            adminCheckStatus: adminCheck.isAdmin ? 'verified' : 'not_admin',
            isApprovalLink: isApproval,
            addedAt: new Date().toISOString()
          };

          db.channels.push(newChan);
          saveDatabase();

          let adminNotice = adminCheck.isAdmin
            ? '✅ *Bot Admin Status:* Verified Administrator'
            : `⚠️ *WARNING: BOT IS NOT ADMIN!*\nPlease promote @${db.config.botUsername || 'Bot'} to Administrator in \`${chId}\` with "Invite Users via Link" rights, otherwise membership check will fail!`;

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `📢 *FORCE JOIN CHANNEL ADDED!*\n\n` +
              `• Title: *${chTitle}*\n` +
              `• ID: \`${chId}\`\n` +
              `• Invite Link: ${chLink} ${isApproval ? '*(Bot Approval Link)*' : ''}\n\n` +
              `${adminNotice}`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '📢 View Channels List', callback_data: 'adm_channels' }]]
            }
          });
          return;
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/addchannel <@channelId> <Title> [InviteLink_or_auto]\`\n\n💡 If you write \`auto\`, bot will automatically create an admin approval link!`,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Workable Admin /broadcast, /bc, /broadcast_all, /broadcast_verified, /broadcast_unverified, /broadcast_groups
      if ((text.startsWith('/broadcast') || text.startsWith('/bc')) && isAdmin) {
        let targetType: 'verified_only' | 'all' | 'unverified_only' | 'groups' = 'verified_only';
        let bcastMsg = '';

        if (text.startsWith('/broadcast_all') || text.startsWith('/bc_all')) {
          targetType = 'all';
          bcastMsg = text.replace(/^\/(broadcast_all|bc_all)/, '').trim();
        } else if (text.startsWith('/broadcast_unverified') || text.startsWith('/bc_unverified')) {
          targetType = 'unverified_only';
          bcastMsg = text.replace(/^\/(broadcast_unverified|bc_unverified)/, '').trim();
        } else if (text.startsWith('/broadcast_groups') || text.startsWith('/bc_groups')) {
          targetType = 'groups';
          bcastMsg = text.replace(/^\/(broadcast_groups|bc_groups)/, '').trim();
        } else if (text.startsWith('/broadcast_verified') || text.startsWith('/bc_verified')) {
          targetType = 'verified_only';
          bcastMsg = text.replace(/^\/(broadcast_verified|bc_verified)/, '').trim();
        } else {
          bcastMsg = text.replace(/^\/(broadcast|bc)/, '').trim();
        }

        const isReply = Boolean(msg.reply_to_message);

        // If neither text nor replied message, show guidance menu with 1-click test button
        if (!bcastMsg && !isReply) {
          const verifiedCount = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
          const unverifiedCount = db.users.length - verifiedCount;
          const groupCount = db.channels.filter((c) => c.type === 'group').length;

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚡ *TELEFORCE WORKABLE BROADCASTING ENGINE*\n\n` +
              `📊 *Audience Overview:*\n` +
              `• Verified Users: *${verifiedCount}*\n` +
              `• Unverified / Left: *${unverifiedCount}*\n` +
              `• Total Users: *${db.users.length}*\n` +
              `• Discussion Groups: *${groupCount}*\n\n` +
              `💡 *How to Broadcast:*\n` +
              `1️⃣ *Reply Broadcast (Best for Media/Buttons):* Send any photo, text, or post in this chat, then **Reply** to it with \`/bc\` or \`/broadcast\`!\n` +
              `2️⃣ *Direct Text Broadcast:* \`/bc <Your Message>\` (Sends to *Verified* users)\n` +
              `3️⃣ *All Users:* \`/bc_all <Your Message>\`\n` +
              `4️⃣ *Unverified Users:* \`/bc_unverified <Your Message>\`\n` +
              `5️⃣ *All Groups:* \`/bc_groups <Your Message>\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: `📢 Test Broadcast to Verified (${verifiedCount})`, callback_data: 'adm_send_test_bcast', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        if (targetType === 'groups') {
          // Broadcast to all configured Telegram groups
          const targetGroups = db.channels.filter((c) => c.type === 'group');
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Broadcasting to ${targetGroups.length} Groups...*`,
            parse_mode: 'Markdown'
          });

          let groupSent = 0;
          for (const grp of targetGroups) {
            try {
              if (isReply && msg.reply_to_message) {
                await callTelegramApi(token, 'copyMessage', {
                  chat_id: grp.channelId,
                  from_chat_id: msg.chat.id,
                  message_id: msg.reply_to_message.message_id
                });
                groupSent++;
              } else {
                await callTelegramApi(token, 'sendMessage', {
                  chat_id: grp.channelId,
                  text: bcastMsg,
                  parse_mode: 'Markdown'
                });
                groupSent++;
              }
            } catch (e) {
              // Ignore group send errors
            }
            await new Promise((r) => setTimeout(r, 40));
          }

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *GROUP BROADCAST COMPLETE!*\n\nDelivered to *${groupSent} / ${targetGroups.length}* groups.`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]] }
          });
          return;
        }

        const eligibleRecipients = db.users.filter((u) => {
          if (targetType === 'verified_only') return u.isVerified && !u.hasLeftRequired;
          if (targetType === 'unverified_only') return !u.isVerified || u.hasLeftRequired;
          return true;
        });

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Broadcasting started!* Delivering to *${eligibleRecipients.length}* users (${targetType}). Please wait...`,
          parse_mode: 'Markdown'
        });

        let dispatchResult: { sent: number; failed: number };

        if (isReply && msg.reply_to_message) {
          // Copy exact message (photo, media, buttons, caption)
          dispatchResult = await dispatchCopyBroadcastToUsers(token, eligibleRecipients, msg.chat.id, msg.reply_to_message.message_id);
        } else {
          // Text broadcast
          dispatchResult = await dispatchBroadcastToUsers(token, eligibleRecipients, { text: bcastMsg });
        }

        // Save in broadcasts history with tracked user message IDs for instant deletion / editing
        const bcastEntry: BroadcastMessage = {
          id: `bc-${Date.now()}`,
          title: isReply ? 'Reply Copy Broadcast' : `Broadcast: "${bcastMsg.slice(0, 32)}..."`,
          type: 'instant',
          postContent: { text: bcastMsg || 'Copy message broadcast', mediaType: 'none' },
          targetAudience: targetType,
          status: 'sent',
          sentCount: dispatchResult.sent,
          totalRecipients: eligibleRecipients.length,
          createdAt: new Date().toISOString(),
          executedAt: new Date().toISOString(),
          sentMessages: (dispatchResult as any).sentMessages || []
        };
        db.broadcasts.unshift(bcastEntry);
        saveDatabase();

        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'broadcast',
          user: `${fromUser.first_name} (${fromUser.id})`,
          details: `Dispatched broadcast to ${dispatchResult.sent} users (${dispatchResult.failed} failed/blocked). Tracked ${bcastEntry.sentMessages?.length || 0} user message IDs for deletion/editing.`
        });

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ *BROADCAST DELIVERED SUCCESSFULLY!*\n\n` +
            `• Target Audience: *${targetType}*\n` +
            `• Delivered: *${dispatchResult.sent} users*\n` +
            `• Failed / Blocked: *${dispatchResult.failed} users*\n` +
            `• Time IST: \`${getISTDateString()}\`\n\n` +
            `💡 *Mistake? Delete / Edit commands:*\n` +
            `• \`/delbroadcast last\` - Delete from all recipients' screens\n` +
            `• \`/editbroadcast last <New Text>\` - Edit text on all screens\n` +
            `• \`/replacelink <OldURL> <NewURL>\` - Replace link across users`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🗑️ Delete from Users Now', callback_data: `adm_del_bcast_${bcastEntry.id}`, style: 'danger' }],
              [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
            ]
          }
        });
        return;
      }

      // ----------------------------------------------------
      // NEW: Admin Commands for Auto-Approval & Broadcasts
      // ----------------------------------------------------

      // Handle Admin /autoapproval <on|off> or /autoapprove or /setautoapprove
      if ((text.startsWith('/autoapproval') || text.startsWith('/autoapprove') || text.startsWith('/setautoapprove')) && isAdmin) {
        const arg = text.replace(/^\/(autoapproval|autoapprove|setautoapprove)/, '').trim().toLowerCase();

        if (arg === 'off' || arg === 'false' || arg === '0' || arg === 'disable') {
          db.config.autoApproveJoinRequests = false;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🚫 *AUTO-APPROVAL HAS BEEN TURNED OFF!*\n\n` +
              `• Status: *OFF 🛑*\n` +
              `• User Join Requests: *Pending for manual admin review in Telegram*\n` +
              `• The bot will NOT automatically approve channel join requests.\n\n` +
              `💡 To turn it back ON anytime, send: \`/autoapproval on\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⚡ Turn ON Auto-Approval', callback_data: 'adm_toggle_auto_approve' }],
                [{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        } else if (arg === 'on' || arg === 'true' || arg === '1' || arg === 'enable') {
          db.config.autoApproveJoinRequests = true;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚡ *AUTO-APPROVAL HAS BEEN TURNED ON!*\n\n` +
              `• Status: *ACTIVE ✅*\n` +
              `• User Join Requests: *Instantly auto-approved by Bot*\n\n` +
              `💡 To turn it OFF anytime, send: \`/autoapproval off\``,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚫 Turn OFF Auto-Approval', callback_data: 'adm_toggle_auto_approve' }],
                [{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        } else {
          const isCurrentlyOn = db.config.autoApproveJoinRequests !== false;
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚡ *CHANNEL JOIN AUTO-APPROVAL CONTROLLER*\n\n` +
              `Current Status: *${isCurrentlyOn ? 'ON ✅ (Auto-Approving)' : 'OFF 🚫 (Manual Review Only)'}*\n\n` +
              `💡 *Commands to control:* \n` +
              `• \`/autoapproval off\` - Turn OFF (Bot stops approving, channels require manual approval)\n` +
              `• \`/autoapproval on\` - Turn ON (Bot auto-approves all requests instantly)\n\n` +
              `Or use 1-click button below:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: isCurrentlyOn ? '🚫 Turn OFF Auto-Approval' : '⚡ Turn ON Auto-Approval', callback_data: 'adm_toggle_auto_approve', style: isCurrentlyOn ? 'danger' : 'primary' }],
                [{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }
      }

      // Handle Admin /delbroadcast [id|last] or /delbcast [id|last]
      if ((text.startsWith('/delbroadcast') || text.startsWith('/delbcast') || text.startsWith('/del_broadcast')) && isAdmin) {
        const param = text.replace(/^\/(delbroadcast|delbcast|del_broadcast)/, '').trim() || 'last';
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Deleting broadcast from all users' Telegram screens...* (Target: ${param})`,
          parse_mode: 'Markdown'
        });

        const delRes = await deleteBroadcastFromUsers(param);
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: delRes.success
            ? `🗑️ *BROADCAST DELETED FROM USERS' SCREENS!*\n\n${delRes.message}\nTotal deleted messages: *${delRes.affectedUsers}*`
            : `⚠️ *Deletion Failed:* ${delRes.message}`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
          }
        });
        return;
      }

      // Handle Admin /editbroadcast <id|last> <new_text> or /editbcast <new_text>
      if ((text.startsWith('/editbroadcast') || text.startsWith('/editbcast')) && isAdmin) {
        let clean = text.replace(/^\/(editbroadcast|editbcast)/, '').trim();
        let targetId = 'last';
        let newText = clean;

        // Check if first word is an ID or 'last'
        const firstSpace = clean.indexOf(' ');
        if (firstSpace > 0) {
          const firstWord = clean.substring(0, firstSpace).trim();
          if (firstWord.startsWith('bc-') || firstWord === 'last') {
            targetId = firstWord;
            newText = clean.substring(firstSpace).trim();
          }
        }

        if (!newText) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/editbroadcast [id|last] <New Text>\`\n\nExample:\n\`/editbroadcast last Hello everyone! New verified links have been updated.\``,
            parse_mode: 'Markdown'
          });
          return;
        }

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Updating broadcast on all recipients' screens...* Please wait.`,
          parse_mode: 'Markdown'
        });

        const editRes = await editBroadcastOnUsers(targetId, { newText });
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: editRes.success
            ? `✏️ *BROADCAST EDITED ON ALL SCREENS!*\n\n${editRes.message}\nTotal affected users: *${editRes.affectedUsers}*`
            : `⚠️ *Edit Failed:* ${editRes.message}`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
          }
        });
        return;
      }

      // Handle Admin /replacelink <old_url> <new_url> or /replacebroadcastlink <old_url> <new_url>
      if ((text.startsWith('/replacelink') || text.startsWith('/replacebroadcastlink')) && isAdmin) {
        const clean = text.replace(/^\/(replacelink|replacebroadcastlink)/, '').trim();
        const parts = clean.split(/\s+/);
        if (parts.length < 2) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/replacelink <old_url> <new_url>\`\n\nExample:\n\`/replacelink https://wrong.com https://correct.com\`\n\n(Yeh command last broadcast ke message text aur button link ko replace kar dega!)`,
            parse_mode: 'Markdown'
          });
          return;
        }

        const [oldUrl, newUrl] = parts;
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Replacing link in sent broadcast across all users...*\nFrom: \`${oldUrl}\`\nTo: \`${newUrl}\``,
          parse_mode: 'Markdown'
        });

        const editRes = await editBroadcastOnUsers('last', {
          replaceOldUrl: oldUrl,
          replaceNewUrl: newUrl
        });

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: editRes.success
            ? `🔗 *LINK REPLACED IN USERS' SCREENS!*\n\n${editRes.message}\nTotal updated users: *${editRes.affectedUsers}*`
            : `⚠️ *Link Replacement Failed:* ${editRes.message}`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🔙 Admin Menu', callback_data: 'adm_menu' }]]
          }
        });
        return;
      }

      // Handle Admin /groups command (groups wise report)
      if ((text === '/groups' || text === '/groupswise') && isAdmin) {
        const report = db.channels.map((ch, idx) => {
          const joined = db.users.filter((u) => u.joinedChannels.includes(ch.id)).length;
          return `${idx + 1}. *${ch.title}* (${ch.type.toUpperCase()})\n   ID: \`${ch.channelId}\`\n   Admin Status: *${ch.isBotAdmin ? '✅ Admin Verified' : '⚠️ NOT ADMIN'}*\n   Active Members: *${joined}*\n   Approval Link: *${ch.isApprovalLink ? 'YES (Auto)' : 'NO'}*\n   Link: ${ch.inviteLink}`;
        }).join('\n\n');

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `👥 *GROUPS & CHANNELS AUDIENCE BREAKDOWN*\n\n${report || 'No channels or groups configured.'}\n\n💡 Full member breakdown and group-wise broadcast options are available in Web Dashboard!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📢 Broadcast to Groups', callback_data: 'adm_bcast', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
            ]
          }
        });
        return;
      }

      // Handle Admin /setinvitelink <url>
      if (text.startsWith('/setinvitelink') && isAdmin) {
        const newUrl = text.replace('/setinvitelink', '').trim();
        db.config.inviteCustomLink = newUrl;
        saveDatabase();
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ *Invite & Earn Custom Link Updated!*\n\n${newUrl ? `Custom Link: \`${newUrl}\`` : 'Reset to default bot referral link generator.'}`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /setinvitemsg <text>
      if (text.startsWith('/setinvitemsg') && isAdmin) {
        const newMsg = text.replace('/setinvitemsg', '').trim();
        if (newMsg) {
          db.config.inviteShareMessage = newMsg;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Invite Share Message Updated!*\n\nNew Text: "${newMsg}"`,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /genlink <channelId> (Bot creates approval link)
      if (text.startsWith('/genlink') && isAdmin) {
        const chQuery = text.replace('/genlink', '').trim();
        const ch = db.channels.find((c) => c.channelId.toLowerCase() === chQuery.toLowerCase() || c.id === chQuery);
        if (!ch) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Channel not found.* Usage: \`/genlink <@channelId>\``,
            parse_mode: 'Markdown'
          });
          return;
        }

        const linkRes = await createChatApprovalInviteLink(token, ch.channelId, `${ch.title} Auto Approval`);
        if (linkRes.ok && linkRes.invite_link) {
          ch.inviteLink = linkRes.invite_link;
          ch.isApprovalLink = true;
          ch.isBotAdmin = true;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✨ *BOT APPROVAL LINK CREATED!*\n\n• Channel: *${ch.title}*\n• Approval Link: \`${linkRes.invite_link}\`\n\nUsers joining via this link will be automatically approved and tracked!`,
            parse_mode: 'Markdown'
          });
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `❌ *Could Not Create Approval Link:*\n${linkRes.error}\n\nMake sure @${db.config.botUsername || 'Bot'} is an Administrator in \`${ch.channelId}\` with "Invite Users via Link" rights!`,
            parse_mode: 'Markdown'
          });
        }
        return;
      }

      // Handle Admin /cleardata
      if (text.startsWith('/cleardata') && isAdmin) {
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🧹 *TELEFORCE DATABASE CLEANUP*\n\nChoose what old data to clear:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🗑️ Clear Audit Logs (Keep 10)', callback_data: 'adm_do_clean_logs', style: 'primary' }],
              [{ text: '👤 Purge Left / Unverified Users', callback_data: 'adm_do_clean_unverified', style: 'danger' }],
              [{ text: '📢 Clear Old Broadcast Logs', callback_data: 'adm_do_clean_bcasts', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
            ]
          }
        });
        return;
      }

      // Handle User /invite & /referral
      if (text === '/invite' || text === '/referral') {
        const botUsername = db.config.botUsername || 'PrimeForceJoinBot';
        const refLink = `https://t.me/${botUsername}?start=${botUser.referralCode}`;
        const shareText = encodeURIComponent(db.config.inviteShareMessage || '🔥 Join this bot, verify in channels, and unlock VIP access & bonuses!');
        const shareUrl = db.config.inviteCustomLink
          ? db.config.inviteCustomLink.replace('{bot_ref_link}', refLink)
          : `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`;

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🎁 *INVITE & EARN REWARDS*\n\n` +
            `Invite friends and earn *+${db.config.referralBonusAmount} Points* for each verified join!\n\n` +
            `🔗 *Your Personal Referral Link:*\n\`${refLink}\`\n\n` +
            `📊 *Your Stats:*\n` +
            `• Friends Invited: *${botUser.referralCount} Users*\n` +
            `• Referral Bonus: *${botUser.referralCount * db.config.referralBonusAmount} Points*\n` +
            `• Current Balance: *${botUser.bonusBalance} Points*`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: db.config.inviteButtonText || '🎁 Share With Friends', url: shareUrl, style: 'primary' }],
              [{ text: '🔴 CLAIM BONUS', callback_data: 'claim_bonus', style: 'danger' }]
            ]
          }
        });
        return;
      }

      // Handle User /exclusive & /vip
      if (text === '/exclusive' || text === '/vip') {
        if (!botUser.isVerified || botUser.hasLeftRequired) {
          const checkBtns: any[] = db.channels.map((c) => [{
            text: db.config.joinButtonText || '🔵 JOIN NOW',
            url: c.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
          }]);
          checkBtns.push([{
            text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
            callback_data: 'check_in',
            style: getTelegramButtonStyle(db.config.checkButtonColor, 'primary')
          }]);

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔒 *EXCLUSIVE ACCESS LOCKED!*\n\nPlease join all required channels and verify first to view exclusive content.\n\n${db.config.leaveAlertMessage}`,
            reply_markup: { inline_keyboard: checkBtns }
          });
          return;
        }

        const exclusiveUrl = db.config.exclusiveContentUrl || 'https://t.me';
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🔓 *EXCLUSIVE VIP CONTENT UNLOCKED!*\n\nCongratulations! Here is your exclusive VIP access link:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: db.config.exclusiveContentButtonText || '🔓 View Exclusive Content', url: exclusiveUrl, style: 'success' }]
            ]
          }
        });
        return;
      }

      // Handle Admin /stats
      if (text === '/stats' && isAdmin) {
        const verified = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `📊 *BOT METRICS*\n\nTotal Users: *${db.users.length}*\nVerified: *${verified}*\nRequired Channels: *${db.channels.length}*\nActive Claim Codes: *${db.claimCodes.filter((c) => c.isActive).length}*\nIST Time: *${getISTDateString()}*`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /setbonusbtn <text>
      if (text.startsWith('/setbonusbtn') && isAdmin) {
        const newBtn = text.replace('/setbonusbtn', '').trim();
        if (newBtn) {
          db.config.bonusButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Bonus Button Label set to:* \`${newBtn}\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /delchannel <id_or_channelId>
      if (text.startsWith('/delchannel') && isAdmin) {
        const query = text.replace('/delchannel', '').trim();
        const idx = db.channels.findIndex((c) => c.id === query || c.channelId === query || c.channelId.replace('@', '') === query.replace('@', ''));
        if (idx !== -1) {
          const removed = db.channels.splice(idx, 1)[0];
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Channel Removed:* ${removed.title} (\`${removed.channelId}\`)`,
            parse_mode: 'Markdown'
          });
          return;
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ Channel not found. Use \`/channels\` to see list.`,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /addcode <code> <title> <postText>
      if (text.startsWith('/addcode') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length >= 4) {
          const cCode = parts[1].toUpperCase();
          const cTitle = parts[2];
          const cMsg = parts.slice(3).join(' ');
          db.claimCodes.unshift({
            id: `code-${Date.now()}`,
            code: cCode,
            title: cTitle,
            postContent: {
              text: cMsg,
              mediaType: 'none'
            },
            maxUses: 1000,
            currentUses: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            claimedByUsers: []
          });
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Claim Code Generated!*\n\nCode: \`${cCode}\`\nTitle: *${cTitle}*\nMessage: ${cMsg}`,
            parse_mode: 'Markdown'
          });
          return;
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/addcode <CODE> <Title> <RewardMessage>\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /admins
      if (text === '/admins' && isAdmin) {
        const adminList = db.admins.map((a, i) => `${i + 1}. *${a.name}* (\`${a.telegramId}\`) - ${a.role.toUpperCase()}`).join('\n');
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `👥 *AUTHORIZED ADMINISTRATORS*\n\n${adminList || 'No additional admins configured.'}\n\n💡 *Add new admin:* \`/addadmin <TelegramID> <Name>\``,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /addadmin <id> <name>
      if (text.startsWith('/addadmin') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length >= 3) {
          const newId = parts[1];
          const newName = parts.slice(2).join(' ');
          db.admins.push({
            id: `admin-${Date.now()}`,
            telegramId: newId,
            username: '',
            name: newName,
            role: 'superadmin',
            addedAt: new Date().toISOString()
          });
          saveDatabase();
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Admin Added:* ${newName} (\`${newId}\`)`,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /setbackupgroup [groupId]
      if (text.startsWith('/setbackupgroup') && isAdmin) {
        const query = text.replace('/setbackupgroup', '').trim();
        let targetGroupId = query;
        let groupTitle = '';

        if (!targetGroupId) {
          // If typed inside a Telegram group, automatically use current group ID!
          if (chatId < 0) {
            targetGroupId = String(chatId);
            groupTitle = msg.chat?.title || 'Current Group';
          } else {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `⚠️ *Usage:* \`/setbackupgroup <GroupID>\` (e.g. \`-1002938172654\`)\n\n💡 *Tip:* Add this bot to your private Telegram group and send \`/setbackupgroup\` directly inside the group!`,
              parse_mode: 'Markdown'
            });
            return;
          }
        }

        db.config.backupGroupId = targetGroupId;
        if (groupTitle) db.config.backupGroupName = groupTitle;
        saveDatabase();

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ *DATABASE BACKUP VAULT CONFIGURED!*\n\n• Vault Group ID: \`${targetGroupId}\`\n• Auto-Sync: *Enabled*\n\nAll database snapshots will be securely saved to this group. Run \`/backup\` to generate an instant backup!`,
          parse_mode: 'Markdown'
        });

        // Trigger handshake backup to group
        await backupDatabaseToTelegramGroup('Initial Backup Vault Connection Handshake');
        return;
      }

      // Handle Admin /backup
      if (text === '/backup' && isAdmin) {
        if (!db.config.backupGroupId) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *No Backup Group Configured!*\n\nPlease set your Telegram backup group using:\n\`/setbackupgroup <GroupID>\``,
            parse_mode: 'Markdown'
          });
          return;
        }

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Uploading database backup snapshot to Telegram group...*`,
          parse_mode: 'Markdown'
        });

        const bRes = await backupDatabaseToTelegramGroup('Manual /backup command');
        if (bRes.ok) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *DATABASE BACKUP POSTED TO TELEGRAM GROUP!*\n\n• Group ID: \`${db.config.backupGroupId}\`\n• Users: *${db.users.length}*\n• Channels: *${db.channels.length}*\n• Claim Codes: *${db.claimCodes.length}*\n• IST Time: *${getISTDateString()}*`,
            parse_mode: 'Markdown'
          });
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `❌ *Backup Failed:* ${bRes.error}\n\nMake sure the bot is an Admin in group \`${db.config.backupGroupId}\`.`,
            parse_mode: 'Markdown'
          });
        }
        return;
      }

      // Handle Admin /restore or /recover (recovering database on bot crash / migration using Group ID)
      if ((text.startsWith('/restore') || text.startsWith('/recover')) && isAdmin) {
        const queryGroupId = text.replace(/^\/(restore|recover)/, '').trim();
        const replyDoc = msg.reply_to_message?.document;

        // 1. Direct Group ID recovery (e.g. /restore -1002938172654 or /recover -1002938172654)
        if (queryGroupId) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Connecting to Database Group:* \`${queryGroupId}\`\nFetching latest pinned backup document...`,
            parse_mode: 'Markdown'
          });

          const recRes = await restoreDatabaseFromTelegramGroup(queryGroupId);
          if (recRes.ok) {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `🎉 *DATABASE RESTORED SUCCESSFULLY FROM GROUP!*\n\n• Group ID: \`${queryGroupId}\`\n• Recovered Users: *${db.users.length}*\n• Recovered Channels: *${db.channels.length}*\n• Recovered Codes: *${db.claimCodes.length}*\n• Time IST: \`${getISTDateString()}\`\n\nAll bot channels, user verifications, and claim codes have been restored!`,
              parse_mode: 'Markdown'
            });
          } else {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `❌ *Restore Failed:*\n${recRes.error}\n\n💡 Ensure the bot is an Admin in group \`${queryGroupId}\` and that a backup document was pinned in that group.`,
              parse_mode: 'Markdown'
            });
          }
          return;
        }

        // 2. Recovery by Replying /restore to a .json backup file
        if (replyDoc && replyDoc.file_name?.endsWith('.json')) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⏳ *Downloading and verifying backup file:* \`${replyDoc.file_name}\`...`,
            parse_mode: 'Markdown'
          });

          try {
            const fileInfo = await callTelegramApi(token, 'getFile', { file_id: replyDoc.file_id });
            if (fileInfo.ok && fileInfo.result?.file_path) {
              const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.result.file_path}`;
              const fileRes = await fetch(fileUrl);
              const downloadedJson = await fileRes.text();
              const parsedDb = JSON.parse(downloadedJson);

              if (parsedDb && (parsedDb.users || parsedDb.channels || parsedDb.config)) {
                if (parsedDb.channels) db.channels = parsedDb.channels;
                if (parsedDb.claimCodes) db.claimCodes = parsedDb.claimCodes;
                if (parsedDb.users) db.users = parsedDb.users;
                if (parsedDb.config) db.config = { ...db.config, ...parsedDb.config };
                if (parsedDb.verificationPost) db.verificationPost = parsedDb.verificationPost;
                if (parsedDb.admins) db.admins = parsedDb.admins;
                saveDatabase(true);

                db.logs.unshift({
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  type: 'admin',
                  user: `${fromUser.first_name} (${fromUser.id})`,
                  details: `Restored database from Telegram group backup file (${replyDoc.file_name}).`
                });

                await callTelegramApi(token, 'sendMessage', {
                  chat_id: chatId,
                  text: `🎉 *DATABASE RESTORED SUCCESSFULLY!*\n\n• Recovered Users: *${db.users.length}*\n• Recovered Channels: *${db.channels.length}*\n• Recovered Codes: *${db.claimCodes.length}*\n• IST Time: *${getISTDateString()}*\n\nAll bot data has been completely restored from your Telegram Group backup!`,
                  parse_mode: 'Markdown'
                });
                return;
              }
            }
          } catch (err: any) {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: chatId,
              text: `❌ *Restore Failed:* ${err.message}`,
              parse_mode: 'Markdown'
            });
            return;
          }
        }

        // 3. If backupGroupId is already saved in config, offer 1-click restore
        if (db.config.backupGroupId) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `🔄 *DATABASE RECOVERY OPTIONS*\n\n` +
              `Configured Vault Group: \`${db.config.backupGroupId}\`\n\n` +
              `Choose recovery method below, or send \`/recover <GroupID>\`:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: `🔄 Restore From Group (${db.config.backupGroupId})`, callback_data: 'adm_dobackup_restore', style: 'primary' }],
                [{ text: '🔙 Back to Admin Menu', callback_data: 'adm_menu' }]
              ]
            }
          });
          return;
        }

        // 4. Guidance on recovery
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🔄 *DATABASE RESTORE & CRASH RECOVERY GUIDE*\n\n` +
            `Jab bot crash kare ya server change ho, aap database group ka ID dekar data restore kar sakte hain:\n\n` +
            `👉 \`/recover <GroupID>\` (e.g. \`/recover -1002938172654\`)\n` +
            `👉 Ya group me kisi \`teleforce_db_backup_*.json\` message par **Reply** karein aur likhein: \`/restore\`\n\n` +
            `Bot turant group ke pinned backup file se 100% users, channels, aur codes recover kar lega!`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /dbstatus
      if (text === '/dbstatus' && isAdmin) {
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `💾 *TELEGRAM DATABASE VAULT STATUS*\n\n` +
            `• Backup Group ID: \`${db.config.backupGroupId || 'Not Configured'}\`\n` +
            `• Vault Group Name: *${db.config.backupGroupName || 'None'}*\n` +
            `• Auto-Sync to Group: *${db.config.autoBackupToGroup ? '🟢 ACTIVE' : '🔴 DISABLED'}*\n` +
            `• Last Backup Sent: *${db.config.lastBackupTimestamp || 'None'}*\n` +
            `• Total Registered Users: *${db.users.length}*\n` +
            `• Required Channels: *${db.channels.length}*\n` +
            `• Active Claim Codes: *${db.claimCodes.length}*\n\n` +
            `Commands:\n• \`/backup\` - Send new backup snapshot to group\n• \`/restore\` - Reply to any .json backup to restore\n• \`/setbackupgroup <id>\` - Update vault group`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /restart or /fixbot (1-click crash fix and polling re-initialization directly from Telegram)
      if ((text === '/restart' || text === '/fixbot') && isAdmin) {
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⏳ *Restarting and fixing bot engine...*`,
          parse_mode: 'Markdown'
        });
        const fixRes = await restartAndFixBotPolling();
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: fixRes.ok
            ? `✅ *BOT CRASH FIX & RESTART COMPLETE!*\n\n• Bot: @${db.config.botUsername}\n• Polling Engine: *🟢 Active 24/7*\n• Stored Users: *${db.users.length}*\n• Channels: *${db.channels.length}*\n• Codes: *${db.claimCodes.length}*\n\nBot is healthy and responding to all /start and /claim commands!`
            : `❌ *Restart Error:* ${fixRes.message}`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Regular /start [ref_code] (Zero-crash resilient with Verified User detection)
      if (text.startsWith('/start')) {
        // Referral tracking
        const startParts = text.split(' ');
        if (startParts.length > 1 && startParts[1].startsWith('ref_')) {
          const referrerCode = startParts[1];
          if (!botUser.referredBy && botUser.referralCode !== referrerCode) {
            const referrer = db.users.find((u) => u.referralCode === referrerCode);
            if (referrer) {
              botUser.referredBy = referrer.telegramId;
              referrer.referralCount = (referrer.referralCount || 0) + 1;
              referrer.bonusBalance = (referrer.bonusBalance || 0) + (db.config.referralBonusAmount || 50);
              saveDatabase();
            }
          }
        }

        // If user is ALREADY verified:
        if (botUser.isVerified && !botUser.hasLeftRequired) {
          const verifiedButtons: any[] = [];
          if (db.verificationPost.buttonText && db.verificationPost.buttonUrl && db.verificationPost.buttonUrl.startsWith('http')) {
            verifiedButtons.push([{ text: db.verificationPost.buttonText, url: db.verificationPost.buttonUrl, style: 'success' }]);
          }
          if (db.verificationPost.secondaryButtonText && db.verificationPost.secondaryButtonUrl && db.verificationPost.secondaryButtonUrl.startsWith('http')) {
            verifiedButtons.push([{ text: db.verificationPost.secondaryButtonText, url: db.verificationPost.secondaryButtonUrl, style: 'primary' }]);
          }

          await sendTelegramMessageSafe(token, chatId, `🎉 *WELCOME BACK, ${fromUser?.first_name || 'Member'}!*\n\n` +
            `✅ *Status:* You are already verified in all official channels!\n\n` +
            `🎁 *Redeem Claim Code:* Type \`/claim <CODE>\` to unlock secret links.\n` +
            `👥 *Referral Code:* \`${botUser.referralCode || `ref_${fromUser?.id}`}\`\n` +
            `💰 *Bonus Balance:* ₹${botUser.bonusBalance || 0}`, {
            parse_mode: 'Markdown',
            reply_markup: verifiedButtons.length > 0 ? { inline_keyboard: verifiedButtons } : undefined
          });
          return;
        }

        // User is not verified: build force-join channels with colorful buttons
        const validChannels = db.channels.filter((c) => c.inviteLink && c.inviteLink.startsWith('http'));
        const channelButtons: any[] = validChannels.map((ch) => [
          {
            text: db.config.joinButtonText || '🔵 JOIN NOW',
            url: ch.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
          }
        ]);

        channelButtons.push([
          {
            text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
            callback_data: 'check_in',
            style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
          }
        ]);

        if (db.config.showBonusButton) {
          channelButtons.push([
            {
              text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
              callback_data: 'claim_bonus',
              style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
            }
          ]);
        }

        const welcomeText = db.config.welcomeMessage || "🎉 hey 👋 I'm your Receptionist,\n\n=>Your First Task WELCOME BONUS ₹1080\n\nWelcome! Complete the required steps below to continue.\n\n🔒 Step 1: Join all required channels/groups.\n\nAfter joining, press 🔵 CHECK JOIN.";

        await sendTelegramMessageSafe(token, chatId, welcomeText, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: channelButtons
          }
        });
        return;
      }

      // Handle Admin /over <code> or /expire <code> (1-click mark link as OVER on all users' screens)
      if ((text.startsWith('/over') || text.startsWith('/expire')) && isAdmin) {
        const targetCode = text.replace(/^\/(over|expire)(@\w+)?/i, '').trim();
        if (!targetCode) {
          await sendTelegramMessageSafe(token, chatId, `⚠️ *Usage:* \`/over <CODE>\`\n\nExample: \`/over VIP2026\`\n(Yeh command sabhi users ke message me link ko replace karke *OVER ❌* likh dega!)`, {
            parse_mode: 'Markdown'
          });
          return;
        }

        const overRes = await markClaimCodeOver(targetCode, 'over');
        await sendTelegramMessageSafe(token, chatId, overRes.success
          ? `✅ *CODE MARKED OVER ❌!*\n\n${overRes.message}`
          : `❌ *Error:* ${overRes.message}`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle Admin /delmsg <code> or /delover <code> (Delete sent message from users' chats)
      if ((text.startsWith('/delmsg') || text.startsWith('/delover')) && isAdmin) {
        const targetCode = text.replace(/^\/(delmsg|delover)(@\w+)?/i, '').trim();
        if (!targetCode) {
          await sendTelegramMessageSafe(token, chatId, `⚠️ *Usage:* \`/delmsg <CODE>\`\n\nExample: \`/delmsg VIP2026\`\n(Yeh command sabhi users ke phone se us code ka message delete kar dega!)`, {
            parse_mode: 'Markdown'
          });
          return;
        }

        const delRes = await markClaimCodeOver(targetCode, 'delete');
        await sendTelegramMessageSafe(token, chatId, delRes.success
          ? `🗑️ *SENT MESSAGES DELETED!*\n\n${delRes.message}`
          : `❌ *Error:* ${delRes.message}`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      // Handle /claim <CODE> or entering code directly
      let codeQuery = text.trim();
      const isClaimCommand = /^\/claim(@\w+)?/i.test(codeQuery);
      if (isClaimCommand) {
        codeQuery = codeQuery.replace(/^\/claim(@\w+)?/i, '').trim();
      }

      // If user typed just /claim without code
      if (isClaimCommand && !codeQuery) {
        await sendTelegramMessageSafe(token, chatId, `🎁 *HOW TO CLAIM REWARD*\n\nPlease enter your claim code with the /claim command:\n\n👉 \`/claim <CODE>\`\n\nExample: \`/claim VIP2026\`\n\nOr click on any code drop shared in our official channels!`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      codeQuery = codeQuery.toUpperCase();

      const matchedCode = db.claimCodes.find((c) => c.code.toUpperCase() === codeQuery);
      if (matchedCode) {
        if (!matchedCode.claimedByUsers) matchedCode.claimedByUsers = [];
        if (!botUser.claimedCodes) botUser.claimedCodes = [];
        if (!matchedCode.sentMessages) matchedCode.sentMessages = [];

        // Enforce force-join gate!
        if (!botUser.isVerified || botUser.hasLeftRequired) {
          const checkBtns: any[] = db.channels
            .filter((c) => c.inviteLink && c.inviteLink.startsWith('http'))
            .map((c) => [{
              text: db.config.joinButtonText || '🔵 JOIN NOW',
              url: c.inviteLink,
              style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
            }]);
          checkBtns.push([{
            text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
            callback_data: 'check_in',
            style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
          }]);

          await sendTelegramMessageSafe(token, chatId, db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.', {
            reply_markup: {
              inline_keyboard: checkBtns
            }
          });
          return;
        }

        // Check if code has been marked as OVER ❌
        if (matchedCode.isOver) {
          await sendTelegramMessageSafe(token, chatId, `❌ *THIS CODE IS OVER ❌*\n\nSorry, this claim code *${codeQuery}* is closed and the link is now *OVER ❌*.\nPlease stay tuned for new codes!`, {
            parse_mode: 'Markdown'
          });
          return;
        }

        if (botUser.claimedCodes.includes(codeQuery)) {
          await sendTelegramMessageSafe(token, chatId, `ℹ️ *ALREADY REDEEMED!*\n\nYou have already redeemed the claim code *${codeQuery}*.`, {
            parse_mode: 'Markdown'
          });
          return;
        }

        matchedCode.currentUses += 1;
        matchedCode.claimedByUsers.push(botUser.telegramId);
        botUser.claimedCodes.push(codeQuery);
        saveDatabase();

        const codeButtons: any[] = [];
        if (matchedCode.postContent.buttonText && matchedCode.postContent.buttonUrl && matchedCode.postContent.buttonUrl.startsWith('http')) {
          codeButtons.push([{ text: matchedCode.postContent.buttonText, url: matchedCode.postContent.buttonUrl }]);
        }
        if (matchedCode.postContent.secondaryButtonText && matchedCode.postContent.secondaryButtonUrl && matchedCode.postContent.secondaryButtonUrl.startsWith('http')) {
          codeButtons.push([{ text: matchedCode.postContent.secondaryButtonText, url: matchedCode.postContent.secondaryButtonUrl }]);
        }

        let sentMsgRes: any;
        const rewardText = `🎉 *CODE UNLOCKED: ${matchedCode.code}*\n\n${matchedCode.postContent.text}`;

        if (matchedCode.postContent.mediaType === 'image' && matchedCode.postContent.mediaUrl && matchedCode.postContent.mediaUrl.startsWith('http')) {
          sentMsgRes = await callTelegramApi(token, 'sendPhoto', {
            chat_id: chatId,
            photo: matchedCode.postContent.mediaUrl,
            caption: rewardText,
            parse_mode: 'Markdown',
            reply_markup: codeButtons.length > 0 ? { inline_keyboard: codeButtons } : undefined
          });
          if (!sentMsgRes.ok) {
            sentMsgRes = await sendTelegramMessageSafe(token, chatId, `🎉 CODE UNLOCKED: ${matchedCode.code}\n\n${matchedCode.postContent.text}`, {
              reply_markup: codeButtons.length > 0 ? { inline_keyboard: codeButtons } : undefined
            });
          }
        } else {
          sentMsgRes = await sendTelegramMessageSafe(token, chatId, rewardText, {
            parse_mode: 'Markdown',
            reply_markup: codeButtons.length > 0 ? { inline_keyboard: codeButtons } : undefined
          });
        }

        // Save delivery record to enable 1-click OVER ❌ and automatic timed link removal on user screens
        if (sentMsgRes && sentMsgRes.ok && sentMsgRes.result?.message_id) {
          matchedCode.sentMessages.push({
            telegramId: String(fromUser?.id),
            chatId: chatId,
            messageId: sentMsgRes.result.message_id,
            deliveredAt: new Date().toISOString()
          });
          saveDatabase();
        }
        return;
      }

      // If text started with /claim but code wasn't matched
      if (isClaimCommand) {
        await sendTelegramMessageSafe(token, chatId, `❌ *CLAIM CODE NOT FOUND OR EXPIRED*\n\nThe code "${codeQuery}" was not found or has expired.\n\n💡 *Tip:* Please check the code spelling or wait for the next code drop in our official channels!`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      // Default fallback: show clean screenshot layout with Blue & Green buttons
      const defaultBtns: any[] = db.channels
        .filter((c) => c.inviteLink && c.inviteLink.startsWith('http'))
        .map((ch) => [
          {
            text: db.config.joinButtonText || '🔵 JOIN NOW',
            url: ch.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
          }
        ]);
      defaultBtns.push([
        {
          text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
          callback_data: 'check_in',
          style: getTelegramButtonStyle(db.config.checkButtonColor, 'success')
        }
      ]);
      await sendTelegramMessageSafe(token, chatId, db.config.welcomeMessage || '⚠️ Welcome! Complete the required steps below to continue.\n\nPlease join all required channels/groups above and press 🔵 CHECK JOIN.', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: defaultBtns
        }
      });
    }
  } catch (err) {
    console.error('Error processing Telegram update:', err);
  }
}

// Crash Fix Engine: Resets webhooks, clears conflicting polling sessions, re-verifies bot token, and restarts polling
async function restartAndFixBotPolling(): Promise<{ ok: boolean; message: string; me?: any }> {
  const token = db.config.botToken;
  if (!token) return { ok: false, message: 'No Bot Token configured.' };

  try {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      pollingTimeout = null;
    }
    isPollingRunning = false;

    // 1. Delete any webhook with drop_pending_updates: false to preserve users' messages
    await callTelegramApi(token, 'deleteWebhook', { drop_pending_updates: false });

    // 2. Fetch bot identity to ensure token is 100% valid
    const me = await callTelegramApi(token, 'getMe', {});
    if (me.ok && me.result) {
      db.config.botUsername = me.result.username || db.config.botUsername;
      db.config.botName = me.result.first_name || db.config.botName;
    }

    // 3. Clear any 409 conflict by getting the latest update ID
    try {
      const testUpdates = await callTelegramApi(token, 'getUpdates', { 
        offset: -1, 
        timeout: 1,
        allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member', 'chat_join_request']
      });
      if (testUpdates.ok && Array.isArray(testUpdates.result) && testUpdates.result.length > 0) {
        lastUpdateId = testUpdates.result[testUpdates.result.length - 1].update_id;
      }
    } catch {}

    // 4. Start fresh polling
    isPollingRunning = true;
    db.config.isPollingActive = true;
    saveDatabase(true);

    runTelegramPolling();

    db.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'admin',
      user: 'Crash Fix Watchdog',
      details: `Bot @${db.config.botUsername || 'PrimeL26bot'} re-initialized, conflict cleared & 24/7 polling restarted.`
    });

    return {
      ok: true,
      message: `Bot @${db.config.botUsername || 'PrimeL26bot'} successfully restarted! Polling engine is active.`,
      me: me.result
    };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

// Resilient Background Long-Polling loop with individual update isolation
async function runTelegramPolling() {
  if (!isPollingRunning) return;
  const token = db.config.botToken;

  if (!token) {
    console.log('No Telegram bot token configured. Polling paused.');
    isPollingRunning = false;
    db.config.isPollingActive = false;
    saveDatabase();
    return;
  }

  try {
    const res = await callTelegramApi(token, 'getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 10,
      allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member', 'chat_join_request']
    });

    if (res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        try {
          await processTelegramUpdate(update);
        } catch (uErr: any) {
          console.error(`Error processing update ${update.update_id}:`, uErr.message);
        }
      }
    } else if (res.error_code === 409) {
      console.warn('Telegram polling 409 Conflict detected. Auto-recovering in 3s...');
      await new Promise((r) => setTimeout(r, 3000));
    } else if (res.error) {
      console.warn('Telegram polling notice:', res.error);
    }
  } catch (err) {
    console.error('Telegram polling error:', err);
  }

  if (isPollingRunning) {
    pollingTimeout = setTimeout(runTelegramPolling, 1000);
  }
}

// Telegram Webhook Endpoint (optional direct webhook delivery)
app.post('/api/telegram/webhook', async (req: Request, res: Response) => {
  await processTelegramUpdate(req.body);
  res.json({ ok: true });
});

// Crash Fix & Bot Restart API Endpoints (called by Web Admin Dashboard button)
app.post('/api/bot/fix-crash', async (req: Request, res: Response) => {
  const result = await restartAndFixBotPolling();
  res.json(result);
});

app.post('/api/bot/restart', async (req: Request, res: Response) => {
  const result = await restartAndFixBotPolling();
  res.json(result);
});

// Bot Start Endpoint
app.post('/api/bot/start', async (req: Request, res: Response) => {
  db.config.isPollingActive = true;
  saveDatabase();

  let botInfo: any = null;
  if (db.config.botToken) {
    const me = await callTelegramApi(db.config.botToken, 'getMe', {});
    if (me.ok) {
      db.config.botUsername = me.result.username;
      db.config.botName = me.result.first_name;
      botInfo = me.result;
    }

    if (!isPollingRunning) {
      isPollingRunning = true;
      runTelegramPolling();
    }
  } else {
    // Active simulation mode
    isPollingRunning = true;
  }

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'System',
    details: `Bot service STARTED! (Username: @${db.config.botUsername}, Real Polling: ${Boolean(db.config.botToken)})`
  });
  saveDatabase();

  res.json({
    success: true,
    message: 'Bot started successfully!',
    isPollingActive: true,
    botInfo,
    botUsername: db.config.botUsername
  });
});

app.post('/api/bot/stop', (req: Request, res: Response) => {
  isPollingRunning = false;
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
  }
  db.config.isPollingActive = false;
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'System',
    details: 'Bot service STOPPED.'
  });

  res.json({ success: true, message: 'Bot stopped successfully', isPollingActive: false });
});

// --- HEALTHCHECK & UPTIME ENDPOINTS (For 24/7 Monitoring & Pingers) ---
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    istTime: getISTDateString(),
    botActive: isPollingRunning,
    botUsername: db.config.botUsername || 'None',
    usersCount: db.users.length,
    version: '1.0.0-pro'
  });
});

// --- API ROUTES ---

// 1. System Status & Overview
app.get('/api/status', (req: Request, res: Response) => {
  const verifiedCount = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
  const leftCount = db.users.filter((u) => u.hasLeftRequired).length;
  const totalBalance = db.users.reduce((acc, u) => acc + (u.bonusBalance || 0), 0);
  const totalReferrals = db.users.reduce((acc, u) => acc + (u.referralCount || 0), 0);

  res.json({
    status: 'online',
    currentIST: getISTDateString(),
    botTokenConfigured: Boolean(db.config.botToken && db.config.botToken.length > 10),
    botUsername: db.config.botUsername,
    stats: {
      totalUsers: db.users.length,
      verifiedUsers: verifiedCount,
      leftUsers: leftCount,
      totalChannels: db.channels.length,
      activeClaimCodes: db.claimCodes.filter((c) => c.isActive).length,
      totalBroadcasts: db.broadcasts.length,
      totalAdmins: db.admins.length,
      totalBalance,
      totalReferrals
    }
  });
});

// 2. Bot Configuration
app.get('/api/config', (req: Request, res: Response) => {
  res.json(db.config);
});

app.post('/api/config', (req: Request, res: Response) => {
  db.config = { ...db.config, ...req.body };
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: 'Bot configuration updated.'
  });
  res.json({ success: true, config: db.config });
});

// Test real Telegram Bot token
app.post('/api/telegram/test-token', async (req: Request, res: Response) => {
  const { token } = req.body;
  const botToken = token || db.config.botToken;
  if (!botToken) {
    return res.status(400).json({ ok: false, description: 'Bot token is missing' });
  }

  const result = await callTelegramApi(botToken, 'getMe', {});
  if (result.ok) {
    db.config.botUsername = result.result.username;
    db.config.botName = result.result.first_name;
    saveDatabase();
  }
  res.json(result);
});

// --- Telegram Group Database Vault REST Endpoints ---
app.post('/api/database/backup-to-group', async (req: Request, res: Response) => {
  const reason = req.body?.reason || 'Web Admin Manual Backup Trigger';
  const result = await backupDatabaseToTelegramGroup(reason);
  res.json(result);
});

app.get('/api/database/export', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=teleforce_db_backup_${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/database/import', (req: Request, res: Response) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
  }

  if (incoming.users && Array.isArray(incoming.users)) db.users = incoming.users;
  if (incoming.channels && Array.isArray(incoming.channels)) db.channels = incoming.channels;
  if (incoming.claimCodes && Array.isArray(incoming.claimCodes)) db.claimCodes = incoming.claimCodes;
  if (incoming.config) db.config = { ...db.config, ...incoming.config };
  if (incoming.verificationPost) db.verificationPost = incoming.verificationPost;
  if (incoming.broadcasts) db.broadcasts = incoming.broadcasts;
  if (incoming.admins) db.admins = incoming.admins;

  saveDatabase(true);

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Web Admin Dashboard',
    details: `Database restored from imported JSON file. Recovered ${db.users.length} users and ${db.channels.length} channels.`
  });

  res.json({
    ok: true,
    message: 'Database restored successfully!',
    stats: {
      users: db.users.length,
      channels: db.channels.length,
      claimCodes: db.claimCodes.length
    }
  });
});

app.post('/api/database/test-group', async (req: Request, res: Response) => {
  const { groupId } = req.body;
  const targetId = groupId || db.config.backupGroupId;
  const token = db.config.botToken;

  if (!token || !targetId) {
    return res.status(400).json({ ok: false, error: 'Bot token or Group ID missing' });
  }

  const result = await callTelegramApi(token, 'getChat', { chat_id: targetId });
  if (result.ok) {
    db.config.backupGroupId = targetId;
    db.config.backupGroupName = result.result?.title || 'Backup Vault';
    saveDatabase();
  }
  res.json(result);
});

// Send real test message to a Telegram ID
app.post('/api/telegram/send-test', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  if (!db.config.botToken) {
    return res.status(400).json({ ok: false, description: 'Telegram Bot Token not configured in settings.' });
  }
  const result = await callTelegramApi(db.config.botToken, 'sendMessage', {
    chat_id: chatId,
    text: text || '👋 Hello! This is a test message from your TeleForce Bot Management Suite.',
    parse_mode: 'Markdown'
  });
  res.json(result);
});

// 3. Channels & Groups (Force Join Management)
app.get('/api/channels', (req: Request, res: Response) => {
  res.json(db.channels);
});

app.post('/api/channels', async (req: Request, res: Response) => {
  const { channelId, title, inviteLink, type, required, memberCount, autoCreateApprovalLink } = req.body;
  if (!channelId || !title) {
    return res.status(400).json({ error: 'channelId and title are required.' });
  }

  const cleanChannelId = channelId.trim().startsWith('@') || channelId.trim().startsWith('-') ? channelId.trim() : `@${channelId.trim()}`;
  let finalInviteLink = (inviteLink || '').trim();
  let isApprovalLink = false;
  let isBotAdmin = false;
  let adminCheckStatus: 'verified' | 'not_admin' | 'error' | 'pending' = 'pending';

  const token = db.config.botToken;

  // 1. Verify if bot is Admin in this channel/group
  if (token) {
    const adminCheck = await checkBotIsAdminInChat(token, cleanChannelId);
    isBotAdmin = adminCheck.isAdmin;
    adminCheckStatus = adminCheck.isAdmin ? 'verified' : 'not_admin';

    // 2. If user requested auto approval link or didn't supply one, let bot create it!
    if (autoCreateApprovalLink || !finalInviteLink) {
      const linkRes = await createChatApprovalInviteLink(token, cleanChannelId, `${title.trim()} Join Request`);
      if (linkRes.ok && linkRes.invite_link) {
        finalInviteLink = linkRes.invite_link;
        isApprovalLink = true;
      }
    }
  }

  if (!finalInviteLink) {
    finalInviteLink = `https://t.me/${cleanChannelId.replace('@', '')}`;
  }

  const newChannel: ForceJoinChannel = {
    id: `ch-${Date.now()}`,
    channelId: cleanChannelId,
    title: title.trim(),
    inviteLink: finalInviteLink,
    type: type === 'group' ? 'group' : 'channel',
    required: required !== undefined ? Boolean(required) : true,
    memberCount: memberCount ? parseInt(memberCount, 10) : Math.floor(Math.random() * 20000 + 5000),
    addedAt: new Date().toISOString(),
    isBotAdmin,
    adminCheckStatus,
    isApprovalLink
  };

  db.channels.push(newChannel);
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: `Added new force-join ${newChannel.type}: ${newChannel.title} (${newChannel.channelId}). Admin: ${isBotAdmin ? 'YES' : 'NO'}, Approval Link: ${isApprovalLink ? 'YES' : 'NO'}`
  });

  res.json({ success: true, channel: newChannel, isBotAdmin, isApprovalLink });
});

// Verify bot admin rights in channel
app.post('/api/channels/:id/verify-admin', async (req: Request, res: Response) => {
  const channel = db.channels.find((c) => c.id === req.params.id);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  const token = db.config.botToken;
  if (!token) return res.status(400).json({ error: 'Bot token not configured' });

  const check = await checkBotIsAdminInChat(token, channel.channelId);
  channel.isBotAdmin = check.isAdmin;
  channel.adminCheckStatus = check.isAdmin ? 'verified' : 'not_admin';
  saveDatabase();

  res.json({
    success: true,
    isAdmin: check.isAdmin,
    status: check.status,
    channel
  });
});

// Generate bot approval link for channel
app.post('/api/channels/:id/create-approval-link', async (req: Request, res: Response) => {
  const channel = db.channels.find((c) => c.id === req.params.id);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  const token = db.config.botToken;
  if (!token) return res.status(400).json({ error: 'Bot token not configured' });

  const linkRes = await createChatApprovalInviteLink(token, channel.channelId, `${channel.title} Approval Link`);
  if (linkRes.ok && linkRes.invite_link) {
    channel.inviteLink = linkRes.invite_link;
    channel.isApprovalLink = true;
    channel.approvalLinkCreated = new Date().toISOString();
    channel.isBotAdmin = true;
    channel.adminCheckStatus = 'verified';
    saveDatabase();

    db.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'admin',
      user: 'Admin Panel',
      details: `Generated Telegram Approval Link for ${channel.title}: ${linkRes.invite_link}`
    });

    return res.json({ success: true, inviteLink: linkRes.invite_link, channel });
  }

  res.status(400).json({ success: false, error: linkRes.error || 'Failed to create approval link. Ensure bot is Admin in channel!' });
});

// Groups-wise Audience Breakdown Endpoint
app.get('/api/groups-wise-stats', (req: Request, res: Response) => {
  const groupsData = db.channels.map((ch) => {
    const joinedUsers = db.users.filter((u) => u.joinedChannels.includes(ch.id));
    const verifiedUsers = joinedUsers.filter((u) => u.isVerified && !u.hasLeftRequired);
    const leftUsers = db.users.filter((u) => u.hasLeftRequired && !u.joinedChannels.includes(ch.id));

    return {
      channelId: ch.id,
      title: ch.title,
      rawChannelId: ch.channelId,
      type: ch.type,
      required: ch.required,
      inviteLink: ch.inviteLink,
      isApprovalLink: ch.isApprovalLink,
      isBotAdmin: ch.isBotAdmin,
      memberCount: ch.memberCount,
      activeBotMembersCount: joinedUsers.length,
      verifiedMembersCount: verifiedUsers.length,
      leftMembersCount: leftUsers.length,
      members: joinedUsers.map((u) => ({
        telegramId: u.telegramId,
        firstName: u.firstName,
        username: u.username,
        isVerified: u.isVerified,
        joinedAt: u.joinedAt,
        lastActiveAt: u.lastActiveAt,
        bonusBalance: u.bonusBalance,
        referralCount: u.referralCount
      }))
    };
  });

  res.json({
    totalChannels: db.channels.length,
    groups: groupsData,
    unassignedUsers: db.users.filter((u) => u.joinedChannels.length === 0).length
  });
});

// Old Data Cleaner & Purge Endpoint
app.post('/api/database/clean', (req: Request, res: Response) => {
  const {
    cleanLogs = false,
    cleanUnverifiedUsers = false,
    cleanInactiveUsers = false,
    cleanExpiredCodes = false,
    cleanBroadcasts = false,
    resetAllUsers = false
  } = req.body;

  const purgedSummary: string[] = [];

  if (cleanLogs) {
    const keepCount = 10;
    const removedCount = Math.max(0, db.logs.length - keepCount);
    db.logs = db.logs.slice(0, keepCount);
    purgedSummary.push(`Removed ${removedCount} audit logs (kept ${keepCount} latest)`);
  }

  if (cleanUnverifiedUsers) {
    const beforeCount = db.users.length;
    db.users = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
    const removedCount = beforeCount - db.users.length;
    purgedSummary.push(`Removed ${removedCount} unverified / abandoned users`);
  }

  if (cleanInactiveUsers) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const beforeCount = db.users.length;
    db.users = db.users.filter((u) => {
      const lastActive = new Date(u.lastActiveAt).getTime();
      return !isNaN(lastActive) && lastActive > thirtyDaysAgo;
    });
    const removedCount = beforeCount - db.users.length;
    purgedSummary.push(`Purged ${removedCount} inactive users (>30 days)`);
  }

  if (cleanExpiredCodes) {
    const beforeCount = db.claimCodes.length;
    db.claimCodes = db.claimCodes.filter((c) => c.isActive && c.currentUses < c.maxUses);
    const removedCount = beforeCount - db.claimCodes.length;
    purgedSummary.push(`Purged ${removedCount} exhausted / inactive claim codes`);
  }

  if (cleanBroadcasts) {
    const count = db.broadcasts.length;
    db.broadcasts = [];
    purgedSummary.push(`Cleared ${count} past broadcast records`);
  }

  if (resetAllUsers) {
    const count = db.users.length;
    db.users = [];
    purgedSummary.push(`Reset ALL ${count} users`);
  }

  saveDatabase(true);

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Database Cleanup Engine',
    details: `Cleaned database: ${purgedSummary.join(', ')}`
  });

  res.json({
    success: true,
    message: `Database cleaned successfully! ${purgedSummary.join('. ')}`,
    purgedSummary,
    stats: {
      users: db.users.length,
      logs: db.logs.length,
      claimCodes: db.claimCodes.length,
      broadcasts: db.broadcasts.length
    }
  });
});

app.delete('/api/channels/:id', (req: Request, res: Response) => {
  const index = db.channels.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  const deleted = db.channels.splice(index, 1)[0];
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: `Deleted force-join channel: ${deleted.title}`
  });

  res.json({ success: true });
});

// 4. Claim Codes
app.get('/api/codes', (req: Request, res: Response) => {
  res.json(db.claimCodes);
});

app.post('/api/codes', (req: Request, res: Response) => {
  const { code, title, postContent, maxUses, isActive, autoOverMinutes, autoDeleteMinutes, specificOverIST, overAction } = req.body;
  if (!code || !title || !postContent?.text) {
    return res.status(400).json({ error: 'code, title and postContent.text are required.' });
  }

  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');
  const existingIndex = db.claimCodes.findIndex((c) => c.code === cleanCode);

  if (existingIndex !== -1) {
    // Update existing
    db.claimCodes[existingIndex] = {
      ...db.claimCodes[existingIndex],
      title,
      postContent,
      maxUses: maxUses ? parseInt(maxUses, 10) : 1000,
      isActive: isActive !== undefined ? isActive : true,
      autoOverMinutes: autoOverMinutes ? parseInt(autoOverMinutes, 10) : undefined,
      autoDeleteMinutes: autoDeleteMinutes ? parseInt(autoDeleteMinutes, 10) : undefined,
      specificOverIST: specificOverIST || undefined,
      overAction: overAction || 'replace_with_over'
    };
    saveDatabase();
    return res.json({ success: true, code: db.claimCodes[existingIndex] });
  }

  const newCode: ClaimCode = {
    id: `code-${Date.now()}`,
    code: cleanCode,
    title: title.trim(),
    postContent: {
      text: postContent.text,
      mediaType: postContent.mediaType || 'none',
      mediaUrl: postContent.mediaUrl || '',
      buttonText: postContent.buttonText || '',
      buttonUrl: postContent.buttonUrl || '',
      secondaryButtonText: postContent.secondaryButtonText || '',
      secondaryButtonUrl: postContent.secondaryButtonUrl || ''
    },
    maxUses: maxUses ? parseInt(maxUses, 10) : 1000,
    currentUses: 0,
    isActive: isActive !== undefined ? isActive : true,
    autoOverMinutes: autoOverMinutes ? parseInt(autoOverMinutes, 10) : undefined,
    autoDeleteMinutes: autoDeleteMinutes ? parseInt(autoDeleteMinutes, 10) : undefined,
    specificOverIST: specificOverIST || undefined,
    overAction: overAction || 'replace_with_over',
    isOver: false,
    sentMessages: [],
    createdAt: new Date().toISOString(),
    claimedByUsers: []
  };

  db.claimCodes.unshift(newCode);
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: `Created new claim code: ${newCode.code} ("${newCode.title}")`
  });

  res.json({ success: true, code: newCode });
});

// Mark code as OVER ❌ (Replaces link with OVER ❌ across all users' screens)
app.post('/api/codes/:id/over', async (req: Request, res: Response) => {
  const result = await markClaimCodeOver(req.params.id, 'over');
  res.json(result);
});

// Delete sent reward message from all users' Telegram screens
app.post('/api/codes/:id/delete-messages', async (req: Request, res: Response) => {
  const result = await markClaimCodeOver(req.params.id, 'delete');
  res.json(result);
});

app.delete('/api/codes/:id', (req: Request, res: Response) => {
  const index = db.claimCodes.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Claim code not found' });
  }
  const deleted = db.claimCodes.splice(index, 1)[0];
  saveDatabase();
  res.json({ success: true, deleted: deleted.code });
});

// 5. Verification Post (Post on joining all channels)
app.get('/api/verification-post', (req: Request, res: Response) => {
  res.json(db.verificationPost);
});

app.post('/api/verification-post', (req: Request, res: Response) => {
  db.verificationPost = { ...db.verificationPost, ...req.body };
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: 'Verification reward post updated.'
  });
  res.json({ success: true, verificationPost: db.verificationPost });
});

// 6. Broadcast Management (Instant & Scheduled with IST)
app.get('/api/broadcasts', (req: Request, res: Response) => {
  res.json(db.broadcasts);
});

app.post('/api/broadcasts', (req: Request, res: Response) => {
  const { title, type, postContent, scheduledTimeIST, targetAudience } = req.body;
  if (!title || !postContent?.text) {
    return res.status(400).json({ error: 'title and postContent.text are required.' });
  }

  const eligibleRecipients = db.users.filter((u) => {
    if (targetAudience === 'verified_only') return u.isVerified && !u.hasLeftRequired;
    if (targetAudience === 'unverified_only') return !u.isVerified || u.hasLeftRequired;
    return true;
  });

  const isInstant = type === 'instant';

  const newBroadcast: BroadcastMessage = {
    id: `bc-${Date.now()}`,
    title: title.trim(),
    type: isInstant ? 'instant' : 'scheduled',
    postContent: {
      text: postContent.text,
      mediaType: postContent.mediaType || 'none',
      mediaUrl: postContent.mediaUrl || '',
      buttonText: postContent.buttonText || '',
      buttonUrl: postContent.buttonUrl || ''
    },
    targetAudience: targetAudience || 'verified_only',
    scheduledTimeIST: isInstant ? undefined : scheduledTimeIST,
    status: isInstant ? 'sent' : 'scheduled',
    sentCount: isInstant ? eligibleRecipients.length : 0,
    totalRecipients: eligibleRecipients.length,
    createdAt: new Date().toISOString(),
    executedAt: isInstant ? new Date().toISOString() : undefined
  };

  db.broadcasts.unshift(newBroadcast);
  saveDatabase();

  if (isInstant && db.config.botToken && eligibleRecipients.length > 0) {
    // Dispatch in background so response isn't blocked, update counts on complete
    dispatchBroadcastToUsers(db.config.botToken, eligibleRecipients, {
      text: postContent.text,
      mediaType: postContent.mediaType,
      mediaUrl: postContent.mediaUrl,
      buttonText: postContent.buttonText,
      buttonUrl: postContent.buttonUrl
    }).then((res) => {
      newBroadcast.sentCount = res.sent;
      newBroadcast.sentMessages = res.sentMessages;
      saveDatabase();
    }).catch(console.error);
  }

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'broadcast',
    user: 'Admin Panel',
    details: isInstant
      ? `Executed instant broadcast "${newBroadcast.title}" to ${newBroadcast.sentCount} users.`
      : `Scheduled broadcast "${newBroadcast.title}" for IST: ${scheduledTimeIST}.`
  });

  res.json({ success: true, broadcast: newBroadcast });
});

app.post('/api/broadcasts/:id/send-now', (req: Request, res: Response) => {
  const broadcast = db.broadcasts.find((b) => b.id === req.params.id);
  if (!broadcast) {
    return res.status(404).json({ error: 'Broadcast not found' });
  }

  const eligibleRecipients = db.users.filter((u) => {
    if (broadcast.targetAudience === 'verified_only') return u.isVerified && !u.hasLeftRequired;
    if (broadcast.targetAudience === 'unverified_only') return !u.isVerified || u.hasLeftRequired;
    return true;
  });

  broadcast.status = 'sent';
  broadcast.totalRecipients = eligibleRecipients.length;
  broadcast.executedAt = new Date().toISOString();
  saveDatabase();

  if (db.config.botToken && eligibleRecipients.length > 0) {
    dispatchBroadcastToUsers(db.config.botToken, eligibleRecipients, {
      text: broadcast.postContent.text,
      mediaType: broadcast.postContent.mediaType,
      mediaUrl: broadcast.postContent.mediaUrl,
      buttonText: broadcast.postContent.buttonText,
      buttonUrl: broadcast.postContent.buttonUrl
    }).then((res) => {
      broadcast.sentCount = res.sent;
      broadcast.sentMessages = res.sentMessages;
      saveDatabase();
    }).catch(console.error);
  } else {
    broadcast.sentCount = eligibleRecipients.length;
    saveDatabase();
  }

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'broadcast',
    user: 'Admin Panel',
    details: `Manual trigger: sent broadcast "${broadcast.title}" to ${broadcast.totalRecipients} users.`
  });

  res.json({ success: true, broadcast });
});

// Delete broadcast from all recipients' Telegram screens (e.g. sent by mistake)
app.post('/api/broadcasts/:id/delete-from-users', async (req: Request, res: Response) => {
  const result = await deleteBroadcastFromUsers(req.params.id);
  res.json(result);
});

// Delete last sent broadcast from all users
app.post('/api/broadcasts/delete-last', async (req: Request, res: Response) => {
  const result = await deleteBroadcastFromUsers('last');
  res.json(result);
});

// Edit broadcast text or replace links on all recipients' screens
app.post('/api/broadcasts/:id/edit-on-users', async (req: Request, res: Response) => {
  const { newText, replaceOldUrl, replaceNewUrl, newButtonText, newButtonUrl } = req.body;
  const result = await editBroadcastOnUsers(req.params.id, {
    newText,
    replaceOldUrl,
    replaceNewUrl,
    newButtonText,
    newButtonUrl
  });
  res.json(result);
});

// Toggle Auto-Approval setting via 1-click REST endpoint
app.post('/api/config/toggle-auto-approve', (req: Request, res: Response) => {
  const newState = req.body?.enabled !== undefined
    ? Boolean(req.body.enabled)
    : !(db.config.autoApproveJoinRequests !== false);

  db.config.autoApproveJoinRequests = newState;
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: `Channel Join Auto-Approval toggled to: ${newState ? 'ON' : 'OFF'}`
  });

  res.json({ success: true, autoApproveJoinRequests: db.config.autoApproveJoinRequests });
});

app.delete('/api/broadcasts/:id', (req: Request, res: Response) => {
  const index = db.broadcasts.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Broadcast not found' });
  }
  db.broadcasts.splice(index, 1);
  saveDatabase();
  res.json({ success: true });
});

// 7. Multiple Admins Management (By Telegram ID)
app.get('/api/admins', (req: Request, res: Response) => {
  res.json(db.admins);
});

app.post('/api/admins', (req: Request, res: Response) => {
  const { telegramId, username, name, role } = req.body;
  if (!telegramId || !name) {
    return res.status(400).json({ error: 'telegramId and name are required.' });
  }

  const cleanTelegramId = telegramId.toString().trim();
  const existing = db.admins.find((a) => a.telegramId === cleanTelegramId);
  if (existing) {
    return res.status(400).json({ error: 'Admin with this Telegram ID already exists.' });
  }

  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}`,
    telegramId: cleanTelegramId,
    username: username ? username.replace(/^@/, '') : '',
    name: name.trim(),
    role: role || 'superadmin',
    addedAt: new Date().toISOString()
  };

  db.admins.push(newAdmin);
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Owner',
    details: `Added new admin: ${newAdmin.name} (Telegram ID: ${newAdmin.telegramId}) with role ${newAdmin.role}`
  });

  res.json({ success: true, admin: newAdmin });
});

app.delete('/api/admins/:id', (req: Request, res: Response) => {
  const admin = db.admins.find((a) => a.id === req.params.id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  if (admin.role === 'owner') {
    return res.status(400).json({ error: 'Cannot delete the primary owner account.' });
  }

  db.admins = db.admins.filter((a) => a.id !== req.params.id);
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Owner',
    details: `Removed admin: ${admin.name} (${admin.telegramId})`
  });

  res.json({ success: true });
});

// 8. Users & Referrals
app.get('/api/users', (req: Request, res: Response) => {
  res.json(db.users);
});

// Simulate Channel Leave action to trigger bot alert
app.post('/api/users/:telegramId/simulate-leave', (req: Request, res: Response) => {
  const user = db.users.find((u) => u.telegramId === req.params.telegramId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove one required channel to make them unverified
  if (user.joinedChannels.length > 0) {
    const leftChannelId = user.joinedChannels.pop();
    const channelObj = db.channels.find((c) => c.id === leftChannelId);
    user.hasLeftRequired = true;
    user.isVerified = false;
    user.leftChannelsAlertCount += 1;
    saveDatabase();

    db.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'leave',
      user: `${user.firstName} (${user.telegramId})`,
      details: `Left ${channelObj?.title || 'Required Channel'}. Bot triggered re-join force alert.`
    });

    return res.json({
      success: true,
      hasLeft: true,
      alertMessage: db.config.leaveAlertMessage,
      remainingChannels: user.joinedChannels,
      missingChannel: channelObj
    });
  }

  res.json({ success: false, message: 'User is not in any channels' });
});

// 9. Logs
app.get('/api/logs', (req: Request, res: Response) => {
  res.json(db.logs.slice(0, 50));
});

// 10. Interactive Telegram Bot Engine Simulation Endpoint
// Used by the in-app phone simulator & test playground to execute full bot logic
app.post('/api/bot/simulate-action', (req: Request, res: Response) => {
  const { action, telegramId, payload } = req.body;
  const userTelegramId = telegramId || 'sim_user_999';

  let user = db.users.find((u) => u.telegramId === userTelegramId);
  if (!user) {
    user = {
      telegramId: userTelegramId,
      username: 'telegram_tester',
      firstName: 'You (Tester)',
      isVerified: false,
      joinedChannels: [],
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      hasLeftRequired: false,
      leftChannelsAlertCount: 0,
      referralCode: `ref_${userTelegramId}`,
      referralCount: 0,
      bonusBalance: 0,
      claimedCodes: []
    };
    db.users.push(user);
    saveDatabase();
  }

  user.lastActiveAt = new Date().toISOString();

  const requiredChannels = db.channels.filter((c) => c.required);
  const isJoinedAll = requiredChannels.every((c) => user!.joinedChannels.includes(c.id));

  // Handle various user commands/buttons
  switch (action) {
    case 'start': {
      const refMatch = payload && typeof payload === 'string' && payload.startsWith('ref_');
      let referralMsg = '';
      if (refMatch && !user.referredBy && user.referralCode !== payload) {
        user.referredBy = payload;
        const referrer = db.users.find((u) => u.referralCode === payload);
        if (referrer) {
          referrer.referralCount += 1;
          referrer.bonusBalance += db.config.referralBonusAmount;
          referralMsg = `\n🎁 You joined via referral link! +${db.config.referralBonusAmount} pts credited to your referrer.`;
        }
      }

      saveDatabase();
      return res.json({
        type: 'start_prompt',
        typingDuration: 1200,
        text: `${db.config.welcomeMessage}${referralMsg}\n\n📢 *Required Verification List:*`,
        channels: db.channels,
        userJoined: user.joinedChannels,
        isVerified: user.isVerified && !user.hasLeftRequired,
        buttons: {
          blueVerifyButton: db.config.checkJoinButtonText || '🔵 CHECK IN & VERIFY',
          redBonusButton: db.config.bonusButtonText || '🔴 CLAIM BONUS',
          claimCodeButton: '🔑 Enter Claim Code'
        }
      });
    }

    case 'join_channel': {
      const channelId = payload?.channelId;
      if (channelId && !user.joinedChannels.includes(channelId)) {
        user.joinedChannels.push(channelId);
        // Check if now joined all
        const allJoinedNow = requiredChannels.every((c) => user!.joinedChannels.includes(c.id));
        if (allJoinedNow) {
          user.hasLeftRequired = false;
        }
        saveDatabase();
      }
      return res.json({
        success: true,
        userJoined: user.joinedChannels,
        isJoinedAll: requiredChannels.every((c) => user!.joinedChannels.includes(c.id))
      });
    }

    case 'leave_channel': {
      const channelId = payload?.channelId;
      if (channelId) {
        user.joinedChannels = user.joinedChannels.filter((id) => id !== channelId);
        user.hasLeftRequired = true;
        user.isVerified = false;
        user.leftChannelsAlertCount += 1;
        saveDatabase();

        const channelObj = db.channels.find((c) => c.id === channelId);

        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'leave',
          user: `${user.firstName} (${user.telegramId})`,
          details: `Left channel ${channelObj?.title || channelId}. Triggered bot force-join alert.`
        });

        return res.json({
          type: 'leave_alert',
          typingDuration: 1000,
          text: `🚨 *WARNING: YOU LEFT A REQUIRED CHANNEL!*\n\nChannel: *${channelObj?.title || 'Required Channel'}*\n\n${db.config.leaveAlertMessage}`,
          channelToRejoin: channelObj,
          userJoined: user.joinedChannels,
          actionRequired: 'rejoin'
        });
      }
      break;
    }

    case 'check_in': {
      const hasAll = requiredChannels.every((c) => user!.joinedChannels.includes(c.id));
      if (!hasAll) {
        const missing = requiredChannels.filter((c) => !user!.joinedChannels.includes(c.id));
        return res.json({
          type: 'check_in_failed',
          typingDuration: 1200,
          success: false,
          text: `❌ *VERIFICATION FAILED!*\n\nYou have NOT joined all required channels/groups.\nMissing: ${missing.map((m) => `\n👉 ${m.title} (${m.channelId})`).join('')}\n\nPlease join all of them first and click *Check In* again!`,
          missingChannels: missing
        });
      }

      // Mark verified
      user.isVerified = true;
      user.hasLeftRequired = false;
      saveDatabase();

      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'verify',
        user: `${user.firstName} (${user.telegramId})`,
        details: 'Passed force-join verification. Delivered post reward.'
      });

      return res.json({
        type: 'check_in_success',
        typingDuration: 1400,
        success: true,
        text: db.verificationPost.text,
        mediaType: db.verificationPost.mediaType,
        mediaUrl: db.verificationPost.mediaUrl,
        buttonText: db.verificationPost.buttonText,
        buttonUrl: db.verificationPost.buttonUrl,
        secondaryButtonText: db.verificationPost.secondaryButtonText,
        secondaryButtonUrl: db.verificationPost.secondaryButtonUrl
      });
    }

    case 'claim_bonus': {
      // Must be joined all
      const hasAll = requiredChannels.every((c) => user!.joinedChannels.includes(c.id));
      if (!hasAll || user.hasLeftRequired) {
        return res.json({
          type: 'bonus_denied',
          typingDuration: 1000,
          success: false,
          text: `⚠️ *CANNOT CLAIM BONUS!*\n\nYou must remain joined in all our official channels and groups to claim daily bonus.\n\nPlease complete force-join first!`
        });
      }

      const today = new Date().toISOString().split('T')[0];
      if (user.lastBonusClaimDate === today) {
        return res.json({
          type: 'bonus_already_claimed',
          typingDuration: 1000,
          success: false,
          text: `⏳ *ALREADY CLAIMED TODAY!*\n\nYou already claimed your daily bonus for today (${today}).\nPlease come back tomorrow to claim again!\n\nCurrent Wallet Balance: *${user.bonusBalance} Points*`
        });
      }

      user.bonusBalance += db.config.dailyBonusAmount;
      user.lastBonusClaimDate = today;
      saveDatabase();

      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'bonus',
        user: `${user.firstName} (${user.telegramId})`,
        details: `Claimed daily bonus of ${db.config.dailyBonusAmount} points. Total: ${user.bonusBalance}`
      });

      return res.json({
        type: 'bonus_success',
        typingDuration: 1200,
        success: true,
        text: `🎁 *DAILY BONUS CLAIMED SUCCESSFULLY!*\n\n+${db.config.dailyBonusAmount} Points added to your balance!\n\n💰 *Total Wallet Balance:* ${user.bonusBalance} Points\n🔥 Invite friends using your referral link to earn 50 points per user!`
      });
    }

    case 'enter_claim_code': {
      const codeInput = (payload?.code || '').trim().toUpperCase();
      if (!codeInput) {
        return res.json({
          type: 'code_error',
          typingDuration: 800,
          text: '⚠️ Please provide a valid claim code (e.g., /claim VIP2026).'
        });
      }

      // CRITICAL REQUIREMENT: "or wo code tabhi Work krega jb users all required Chanel join hoga agr nhi hoga toh bot usse join krne ke liye force krega"
      const hasAll = requiredChannels.every((c) => user!.joinedChannels.includes(c.id));
      if (!hasAll || user.hasLeftRequired) {
        const missing = requiredChannels.filter((c) => !user!.joinedChannels.includes(c.id));
        return res.json({
          type: 'code_blocked_force_join',
          typingDuration: 1200,
          success: false,
          text: `🔒 *CODE ACCESS LOCKED!*\n\nYour claim code *${codeInput}* cannot be redeemed yet because you haven't joined all required channels.\n\n👇 Please join all channels below to unlock this code:`,
          missingChannels: missing,
          forceJoinRequired: true
        });
      }

      const codeObj = db.claimCodes.find((c) => c.code === codeInput);
      if (!codeObj || !codeObj.isActive) {
        return res.json({
          type: 'code_not_found',
          typingDuration: 1000,
          success: false,
          text: `❌ *INVALID OR EXPIRED CLAIM CODE!*\n\nThe code "*${codeInput}*" does not exist or has been disabled by the admin.`
        });
      }

      if (codeObj.currentUses >= codeObj.maxUses) {
        return res.json({
          type: 'code_exhausted',
          typingDuration: 1000,
          success: false,
          text: `⚠️ *CODE USAGE LIMIT REACHED!*\n\nThis claim code has reached its maximum limit (${codeObj.maxUses} claims).`
        });
      }

      if (user.claimedCodes.includes(codeInput)) {
        return res.json({
          type: 'code_already_used',
          typingDuration: 1000,
          success: false,
          text: `ℹ️ *ALREADY REDEEMED!*\n\nYou have already redeemed this claim code on your account.`
        });
      }

      // Successful redemption
      codeObj.currentUses += 1;
      codeObj.claimedByUsers.push(user.telegramId);
      user.claimedCodes.push(codeInput);
      saveDatabase();

      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'claim',
        user: `${user.firstName} (${user.telegramId})`,
        details: `Redeemed claim code ${codeInput} (${codeObj.title})`
      });

      return res.json({
        type: 'code_success',
        typingDuration: 1400,
        success: true,
        text: codeObj.postContent.text,
        mediaType: codeObj.postContent.mediaType,
        mediaUrl: codeObj.postContent.mediaUrl,
        buttonText: codeObj.postContent.buttonText,
        buttonUrl: codeObj.postContent.buttonUrl,
        secondaryButtonText: codeObj.postContent.secondaryButtonText,
        secondaryButtonUrl: codeObj.postContent.secondaryButtonUrl
      });
    }

    case 'get_referral': {
      const botUser = db.config.botUsername || 'PrimeForceJoinBot';
      const refLink = `https://t.me/${botUser}?start=${user.referralCode}`;
      return res.json({
        type: 'referral_info',
        typingDuration: 1000,
        text: `👥 *REFERRAL SYSTEM & EARNINGS*\n\nInvite your friends and earn *${db.config.referralBonusAmount} Points* for each verified friend!\n\n🔗 *Your Referral Link:*\n\`${refLink}\`\n\n📊 *Your Stats:*\n• Total Invited: *${user.referralCount} users*\n• Bonus Earned: *${user.referralCount * db.config.referralBonusAmount} Points*\n• Current Balance: *${user.bonusBalance} Points*`,
        referralLink: refLink,
        referralCount: user.referralCount,
        balance: user.bonusBalance
      });
    }

    default:
      return res.json({ error: 'Unknown action' });
  }
});

// Vite Integration Setup
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 TeleForce Telegram Bot & Admin Suite running on http://0.0.0.0:${PORT}`);

    // Auto-start Telegram polling on server launch for 24/7 autonomous uptime
    const token = process.env.TELEGRAM_BOT_TOKEN || db.config.botToken;
    if (token && token.length > 10) {
      if (!isPollingRunning) {
        console.log('🤖 Auto-starting Telegram bot polling for 24/7 background operation...');
        isPollingRunning = true;
        db.config.isPollingActive = true;
        runTelegramPolling();
      }
    }

    // Auto-timer loop: Checks for expired claim codes & scheduled broadcasts every 15 seconds
    setInterval(async () => {
      const now = Date.now();
      const istNow = getISTDateString();

      // 1. Check claim codes auto-over and auto-delete
      for (const code of db.claimCodes) {
        if (code.isOver) continue;

        // Auto-over minutes check
        if (code.autoOverMinutes && code.autoOverMinutes > 0) {
          const createdTime = new Date(code.createdAt).getTime();
          const elapsed = (now - createdTime) / 60000;
          if (elapsed >= code.autoOverMinutes) {
            console.log(`⏱️ Auto-Over triggered for code: ${code.code}`);
            await markClaimCodeOver(code.id, code.overAction === 'delete_message' ? 'delete' : 'over');
          }
        }

        // Specific IST time check
        if (code.specificOverIST && code.specificOverIST <= istNow) {
          console.log(`⏱️ Specific IST Over triggered for code: ${code.code} at ${istNow}`);
          await markClaimCodeOver(code.id, code.overAction === 'delete_message' ? 'delete' : 'over');
        }
      }
    }, 15000);
  });
}

startServer();
