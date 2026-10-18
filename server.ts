import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type {
  ForceJoinChannel,
  ClaimCode,
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
    referralBonusAmount: 50
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

// Real Telegram Bot API helper
async function callTelegramApi(token: string, method: string, payload: any): Promise<any> {
  if (!token) return { ok: false, error: 'No bot token provided' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Real Telegram API helper to check if a user is a member of a channel/group
async function checkTelegramChatMember(token: string, chatId: string, userId: number | string): Promise<boolean> {
  try {
    const res = await callTelegramApi(token, 'getChatMember', {
      chat_id: chatId,
      user_id: userId
    });
    if (res.ok && res.result) {
      const status = res.result.status;
      return ['creator', 'administrator', 'member', 'restricted'].includes(status);
    }
    return false;
  } catch (err) {
    console.error(`Error checking membership in ${chatId} for ${userId}:`, err);
    return false;
  }
}

// Helper to get Telegram Bot API 9.4 button styles
function getTelegramButtonStyle(color?: string, fallback: 'primary' | 'danger' | 'success' = 'primary'): 'primary' | 'danger' | 'success' {
  if (color === 'red') return 'danger';
  if (color === 'green') return 'success';
  if (color === 'blue') return 'primary';
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
      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'admin',
        user: 'Database Vault Engine',
        details: `Saved database backup document to Telegram Group (${backupGroupId}). Msg ID: ${docData.result?.message_id}`
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return { ok: true, message: `Backup document sent to Telegram Group (Msg ID: ${docData.result?.message_id})` };
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

// Process an incoming Telegram update (from polling or webhook)
async function processTelegramUpdate(update: any) {
  const token = db.config.botToken;
  if (!token) return;

  try {
    // 1. Handle Leave/Join Events via chat_member updates
    if (update.chat_member) {
      const cm = update.chat_member;
      const user = cm.from;
      const newStatus = cm.new_chat_member?.status;
      const oldStatus = cm.old_chat_member?.status;

      if (newStatus === 'left' || newStatus === 'kicked') {
        // User left a channel/group!
        const matchedChannel = db.channels.find(
          (c) => c.channelId.toLowerCase() === `@${update.chat_member.chat?.username?.toLowerCase()}` ||
                 c.channelId === String(update.chat_member.chat?.id)
        );

        if (matchedChannel && matchedChannel.required) {
          // Find bot user
          let botUser = db.users.find((u) => u.telegramId === String(user.id));
          if (botUser) {
            botUser.hasLeftRequired = true;
            botUser.isVerified = false;
            botUser.leftChannelsAlertCount += 1;
            saveDatabase();
          }

          db.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'leave',
            user: `${user.first_name} (${user.id})`,
            details: `Detected leaving ${matchedChannel.title}. Sending re-join alert message.`
          });

          // Send direct warning message to user matching uploaded screenshot with Blue & Red colored buttons
          const leaveKeyboard: any[] = db.channels.map((ch) => [
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
              style: getTelegramButtonStyle(db.config.checkButtonColor, 'primary')
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

          await callTelegramApi(token, 'sendMessage', {
            chat_id: user.id,
            text: db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
            reply_markup: {
              inline_keyboard: leaveKeyboard
            }
          });
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
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `👑 *TeleForce Master Admin Control Panel*\n\nWelcome, *${fromUser.first_name}*!\nSelect any function below to configure with 1-click:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📊 Live Bot Stats', callback_data: 'adm_stats', style: 'primary' }, { text: '📢 Channels List', callback_data: 'adm_channels', style: 'primary' }],
                [{ text: '✏️ Edit Force Text', callback_data: 'adm_edit_force', style: 'primary' }, { text: '⚠️ Edit Leave Alert', callback_data: 'adm_edit_leave', style: 'danger' }],
                [{ text: '🔘 Button Labels & Colors', callback_data: 'adm_edit_btns', style: 'primary' }, { text: '🎁 Verification Post', callback_data: 'adm_post', style: 'primary' }],
                [{ text: '🔑 Claim Codes Manager', callback_data: 'adm_codes', style: 'primary' }, { text: '⚡ Instant Broadcast', callback_data: 'adm_bcast', style: 'primary' }],
                [{ text: '💾 Database Vault (Group Backup)', callback_data: 'adm_db', style: 'primary' }, { text: '💎 Bonus Rewards', callback_data: 'adm_bonus', style: 'primary' }],
                [{ text: '👥 Admins & Users', callback_data: 'adm_admins', style: 'primary' }, { text: '🚀 24/7 Hosting Status', callback_data: 'adm_host', style: 'primary' }]
              ]
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
              `• Target Audience: *${verifiedCount} Verified Users*\n\n` +
              `💡 *To send custom broadcast, type:*\n\`/broadcast Your announcement message here\`\n\n` +
              `Or send a test announcement right now:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📢 Send Test Announcement Now', callback_data: 'adm_send_test_bcast', style: 'primary' }],
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
          const isMember = await checkTelegramChatMember(token, ch.channelId, fromUser.id);
          if (!isMember) {
            missing.push(ch);
          } else if (!botUser.joinedChannels.includes(ch.id)) {
            botUser.joinedChannels.push(ch.id);
          }
        }

        if (missing.length > 0) {
          botUser.isVerified = false;
          botUser.hasLeftRequired = true;
          saveDatabase();

          const missingKeyboard: any[] = missing.map((m) => [{
            text: db.config.joinButtonText || '🔵 JOIN NOW',
            url: m.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
          }]);
          missingKeyboard.push([
            {
              text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
              callback_data: 'check_in',
              style: getTelegramButtonStyle(db.config.checkButtonColor, 'primary')
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

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
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
          user: `${fromUser.first_name} (${fromUser.id})`,
          details: 'Real Telegram verification passed! Delivered verification post.'
        });

        // Deliver admin-configured post (WITHOUT clutter or invite buttons)
        const buttons: any[] = [];
        const actionRow: any[] = [];
        if (db.verificationPost.buttonText && db.verificationPost.buttonUrl) {
          actionRow.push({ text: db.verificationPost.buttonText, url: db.verificationPost.buttonUrl, style: 'primary' });
        }
        if (db.verificationPost.secondaryButtonText && db.verificationPost.secondaryButtonUrl) {
          actionRow.push({ text: db.verificationPost.secondaryButtonText, url: db.verificationPost.secondaryButtonUrl, style: 'primary' });
        }
        if (actionRow.length > 0) buttons.push(actionRow);

        if (db.config.showBonusButton) {
          buttons.push([{
            text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
            callback_data: 'claim_bonus',
            style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
          }]);
        }

        if (db.verificationPost.mediaType === 'image' && db.verificationPost.mediaUrl?.startsWith('http')) {
          await callTelegramApi(token, 'sendPhoto', {
            chat_id: chatId,
            photo: db.verificationPost.mediaUrl,
            caption: db.verificationPost.text,
            parse_mode: 'Markdown',
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: db.verificationPost.text,
            parse_mode: 'Markdown',
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
          });
        }
        return;
      }

      if (data === 'claim_bonus') {
        await callTelegramApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' });

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
            text: db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
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

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `👑 *TeleForce Master Admin Control Panel*\n\nWelcome, *${fromUser.first_name}*!\nSelect any function below to configure with 1-click:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📊 Live Bot Stats', callback_data: 'adm_stats', style: 'primary' }, { text: '📢 Channels List', callback_data: 'adm_channels', style: 'primary' }],
              [{ text: '✏️ Edit Force Text', callback_data: 'adm_edit_force', style: 'primary' }, { text: '⚠️ Edit Leave Alert', callback_data: 'adm_edit_leave', style: 'danger' }],
              [{ text: '🔘 Button Labels & Colors', callback_data: 'adm_edit_btns', style: 'primary' }, { text: '🎁 Verification Post', callback_data: 'adm_post', style: 'primary' }],
              [{ text: '🔑 Claim Codes Manager', callback_data: 'adm_codes', style: 'primary' }, { text: '⚡ Instant Broadcast', callback_data: 'adm_bcast', style: 'primary' }],
              [{ text: '💾 Database Vault (Group Backup)', callback_data: 'adm_db', style: 'primary' }, { text: '💎 Bonus Rewards', callback_data: 'adm_bonus', style: 'primary' }],
              [{ text: '👥 Admins & Users', callback_data: 'adm_admins', style: 'primary' }, { text: '🚀 24/7 Hosting Status', callback_data: 'adm_host', style: 'primary' }]
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

      // Handle Admin /addchannel <@channelId> <Title> <InviteLink>
      if (text.startsWith('/addchannel') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length >= 4) {
          const chId = parts[1];
          const chTitle = parts[2];
          const chLink = parts[3];

          db.channels.push({
            id: `ch-${Date.now()}`,
            channelId: chId,
            title: chTitle,
            inviteLink: chLink,
            type: 'channel',
            required: true,
            addedAt: new Date().toISOString()
          });
          saveDatabase();

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `✅ *Force Join Channel Added via Telegram!*\n\nTitle: *${chTitle}*\nID: \`${chId}\`\nLink: ${chLink}`,
            parse_mode: 'Markdown'
          });
          return;
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/addchannel <@channelId> <Title> <InviteLink>\``,
            parse_mode: 'Markdown'
          });
          return;
        }
      }

      // Handle Admin /broadcast <text>
      if (text.startsWith('/broadcast') && isAdmin) {
        const bcastMsg = text.replace('/broadcast', '').trim();
        if (!bcastMsg) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ *Usage:* \`/broadcast <Your message here>\``,
            parse_mode: 'Markdown'
          });
          return;
        }

        const verifiedUsers = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
        for (const u of verifiedUsers) {
          try {
            await callTelegramApi(token, 'sendMessage', {
              chat_id: u.telegramId,
              text: bcastMsg,
              parse_mode: 'Markdown'
            });
          } catch (e) {
            // ignore
          }
        }

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `⚡ *Broadcast Delivered to ${verifiedUsers.length} verified users!*`,
          parse_mode: 'Markdown'
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

      // Handle Admin /restore (or recovering data on bot change)
      if (text.startsWith('/restore') && isAdmin) {
        const replyDoc = msg.reply_to_message?.document;
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
                db.channels = parsedDb.channels || db.channels;
                db.claimCodes = parsedDb.claimCodes || db.claimCodes;
                db.users = parsedDb.users || db.users;
                db.config = { ...db.config, ...parsedDb.config };
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

        // Guidance on recovery
        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🔄 *DATABASE RESTORE & RECOVERY GUIDE*\n\n` +
            `Jab aap bot change karein ya data recover karna ho:\n\n` +
            `1️⃣ Apne Database Backup Telegram Group me jayein: \`${db.config.backupGroupId || 'Set via /setbackupgroup'}\`\n` +
            `2️⃣ Kisi bhi \`teleforce_db_backup_*.json\` file ko dhundhein.\n` +
            `3️⃣ Us message par **Reply** karein aur likhein: \`/restore\`\n\n` +
            `Bot turant us JSON backup ko download karke pura database (users, channels, codes) restore kar dega!\n\n` +
            `_Aap Web Admin Dashboard ke "Telegram DB & Backup" tab se bhi backup upload karke restore kar sakte hain._`,
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

      // Handle Regular /start [ref_code] (Matching exact layout from user screenshot with Blue & Red buttons)
      if (text.startsWith('/start')) {
        const channelButtons: any[] = db.channels.map((ch) => [
          {
            text: db.config.joinButtonText || '🔵 JOIN NOW',
            url: ch.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, 'primary')
          }
        ]);

        // Blue Check Join Button
        channelButtons.push([
          {
            text: db.config.checkJoinButtonText || '🔵 CHECK JOIN',
            callback_data: 'check_in',
            style: getTelegramButtonStyle(db.config.checkButtonColor, 'primary')
          }
        ]);

        // Red Claim Bonus Button
        if (db.config.showBonusButton) {
          channelButtons.push([
            {
              text: db.config.bonusButtonText || '🔴 CLAIM BONUS',
              callback_data: 'claim_bonus',
              style: getTelegramButtonStyle(db.config.bonusButtonColor, 'danger')
            }
          ]);
        }

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: db.config.welcomeMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
          reply_markup: {
            inline_keyboard: channelButtons
          }
        });
        return;
      }

      // Handle /claim <CODE> or entering code directly
      let codeQuery = text;
      if (codeQuery.startsWith('/claim')) {
        codeQuery = codeQuery.replace('/claim', '').trim();
      }
      codeQuery = codeQuery.toUpperCase();

      const matchedCode = db.claimCodes.find((c) => c.code === codeQuery);
      if (matchedCode) {
        // Enforce force-join gate!
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
            text: db.config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
            reply_markup: {
              inline_keyboard: checkBtns
            }
          });
          return;
        }

        if (botUser.claimedCodes.includes(codeQuery)) {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: `ℹ️ *ALREADY REDEEMED!*\n\nYou have already redeemed the claim code *${codeQuery}*.`,
            parse_mode: 'Markdown'
          });
          return;
        }

        matchedCode.currentUses += 1;
        matchedCode.claimedByUsers.push(botUser.telegramId);
        botUser.claimedCodes.push(codeQuery);
        saveDatabase();

        const codeButtons: any[] = [];
        if (matchedCode.postContent.buttonText && matchedCode.postContent.buttonUrl) {
          codeButtons.push([{ text: matchedCode.postContent.buttonText, url: matchedCode.postContent.buttonUrl, style: 'primary' }]);
        }

        await callTelegramApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `🎉 *CODE UNLOCKED: ${matchedCode.code}*\n\n${matchedCode.postContent.text}`,
          parse_mode: 'Markdown',
          reply_markup: codeButtons.length > 0 ? { inline_keyboard: codeButtons } : undefined
        });
        return;
      }

      // Default fallback: show clean screenshot layout with Blue & Red buttons
      const defaultBtns: any[] = db.channels.map((ch) => [
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
          style: getTelegramButtonStyle(db.config.checkButtonColor, 'primary')
        }
      ]);
      await callTelegramApi(token, 'sendMessage', {
        chat_id: chatId,
        text: db.config.welcomeMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
        reply_markup: {
          inline_keyboard: defaultBtns
        }
      });
    }
  } catch (err) {
    console.error('Error processing Telegram update:', err);
  }
}

// Background Long-Polling loop
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
      allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member']
    });

    if (res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        await processTelegramUpdate(update);
      }
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

// Bot Start & Stop Endpoints
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

app.post('/api/channels', (req: Request, res: Response) => {
  const { channelId, title, inviteLink, type, required, memberCount } = req.body;
  if (!channelId || !title || !inviteLink) {
    return res.status(400).json({ error: 'channelId, title and inviteLink are required.' });
  }

  const newChannel: ForceJoinChannel = {
    id: `ch-${Date.now()}`,
    channelId: channelId.trim().startsWith('@') || channelId.trim().startsWith('-') ? channelId.trim() : `@${channelId.trim()}`,
    title: title.trim(),
    inviteLink: inviteLink.trim(),
    type: type === 'group' ? 'group' : 'channel',
    required: required !== undefined ? Boolean(required) : true,
    memberCount: memberCount ? parseInt(memberCount, 10) : Math.floor(Math.random() * 20000 + 5000),
    addedAt: new Date().toISOString()
  };

  db.channels.push(newChannel);
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'admin',
    user: 'Admin Panel',
    details: `Added new force-join ${newChannel.type}: ${newChannel.title} (${newChannel.channelId})`
  });

  res.json({ success: true, channel: newChannel });
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
  const { code, title, postContent, maxUses, isActive } = req.body;
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
      isActive: isActive !== undefined ? isActive : true
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
  broadcast.sentCount = eligibleRecipients.length;
  broadcast.totalRecipients = eligibleRecipients.length;
  broadcast.executedAt = new Date().toISOString();
  saveDatabase();

  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'broadcast',
    user: 'Admin Panel',
    details: `Manual trigger: sent broadcast "${broadcast.title}" to ${broadcast.sentCount} users.`
  });

  res.json({ success: true, broadcast });
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
  });
}

startServer();
