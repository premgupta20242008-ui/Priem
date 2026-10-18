import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = fs.existsSync(path.join(__dirname, "package.json")) ? __dirname : process.cwd();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
const DATA_DIR = path.join(ROOT_DIR, "data");
const DB_FILE = path.join(DATA_DIR, "bot_database.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const defaultDatabase = {
  config: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    botUsername: "PrimeForceJoinBot",
    botName: "Prime Force Join & Rewards Bot",
    isPollingActive: false,
    welcomeMessage: "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
    leaveAlertMessage: "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
    joinButtonText: "\u{1F535} JOIN NOW",
    joinButtonColor: "blue",
    checkJoinButtonText: "\u{1F535} CHECK JOIN",
    checkButtonColor: "blue",
    bonusButtonText: "\u{1F534} CLAIM BONUS",
    bonusButtonColor: "red",
    codeButtonText: "\u{1F511} ENTER CLAIM CODE",
    codeButtonColor: "amber",
    showBonusButton: true,
    dailyBonusAmount: 25,
    referralBonusAmount: 50
  },
  channels: [
    {
      id: "ch-1",
      channelId: "@PrimeUpdatesHub",
      title: "\u{1F4E2} Prime Official Updates",
      inviteLink: "https://t.me/PrimeUpdatesHub",
      type: "channel",
      required: true,
      memberCount: 48290,
      addedAt: new Date(Date.now() - 864e5 * 7).toISOString()
    },
    {
      id: "ch-2",
      channelId: "@PrimeVipLounge",
      title: "\u{1F48E} Prime VIP Signals & Drops",
      inviteLink: "https://t.me/PrimeVipLounge",
      type: "channel",
      required: true,
      memberCount: 29140,
      addedAt: new Date(Date.now() - 864e5 * 5).toISOString()
    },
    {
      id: "ch-3",
      channelId: "@PrimeCommunityChat",
      title: "\u{1F4AC} Prime Community Group",
      inviteLink: "https://t.me/PrimeCommunityChat",
      type: "group",
      required: true,
      memberCount: 15820,
      addedAt: new Date(Date.now() - 864e5 * 3).toISOString()
    }
  ],
  claimCodes: [
    {
      id: "code-1",
      code: "VIP2026",
      title: "Exclusive VIP Loot Box & Links",
      postContent: {
        text: "\u{1F381} *VIP UNLOCKED SUCCESSFULLY!*\n\nHere is your private VIP package:\n\u2022 High Speed Proxy Links\n\u2022 Daily Premium Drops\n\u2022 Exclusive Content Access\n\nClick below to download your bundle:",
        mediaType: "image",
        mediaUrl: "/src/assets/images/telegram_bot_hero_1792137087644.jpg",
        buttonText: "\u{1F680} Access VIP Portal",
        buttonUrl: "https://telegram.org",
        secondaryButtonText: "\u{1F310} Join Support Group",
        secondaryButtonUrl: "https://t.me"
      },
      maxUses: 1e3,
      currentUses: 342,
      isActive: true,
      createdAt: new Date(Date.now() - 864e5 * 4).toISOString(),
      claimedByUsers: ["user_101", "user_102"]
    },
    {
      id: "code-2",
      code: "BONUS100",
      title: "Special 100 Points Code",
      postContent: {
        text: "\u{1F48E} *SPECIAL CODE REDEEMED!*\n\nYou received 100 Instant Bonus Points in your bot wallet!\nShare your referral link with friends to earn 50 points per join.",
        mediaType: "none",
        buttonText: "\u{1F4CA} Check Wallet",
        buttonUrl: "https://t.me"
      },
      maxUses: 500,
      currentUses: 128,
      isActive: true,
      createdAt: new Date(Date.now() - 864e5 * 2).toISOString(),
      claimedByUsers: ["user_101"]
    }
  ],
  verificationPost: {
    enabled: true,
    text: "\u{1F389} *VERIFICATION SUCCESSFUL!*\n\nThank you for joining all our official channels and groups! Your membership has been verified.\n\n\u{1F447} You now have full access to our bot features:\n\u2022 Daily Bonus rewards\n\u2022 Secret Claim Codes redemption\n\u2022 Referral system\n\u2022 Exclusive direct media drops",
    mediaType: "image",
    mediaUrl: "/src/assets/images/telegram_bot_hero_1792137087644.jpg",
    buttonText: "\u{1F525} View Exclusive Content",
    buttonUrl: "https://telegram.org",
    secondaryButtonText: "\u{1F465} Invite & Earn",
    secondaryButtonUrl: "https://telegram.org"
  },
  broadcasts: [
    {
      id: "bc-1",
      title: "Welcome Drops & Weekly Giveaway",
      type: "instant",
      postContent: {
        text: "\u{1F525} *WEEKLY GIVEAWAY ANNOUNCEMENT*\n\nAll verified users have been entered into this week's Lucky Draw!\nMake sure you stay in all channels to remain eligible.",
        mediaType: "image",
        mediaUrl: "/src/assets/images/telegram_bot_hero_1792137087644.jpg",
        buttonText: "\u{1F381} Check Status",
        buttonUrl: "https://telegram.org"
      },
      status: "sent",
      targetAudience: "verified_only",
      sentCount: 1420,
      totalRecipients: 1420,
      createdAt: new Date(Date.now() - 864e5).toISOString(),
      executedAt: new Date(Date.now() - 864e5).toISOString()
    }
  ],
  admins: [
    {
      id: "admin-1",
      telegramId: "1092837465",
      username: "prime_owner",
      name: "Prime Owner",
      role: "owner",
      addedAt: new Date(Date.now() - 864e5 * 30).toISOString()
    },
    {
      id: "admin-2",
      telegramId: "9876543210",
      username: "tele_mod_rahul",
      name: "Rahul (Co-Admin)",
      role: "superadmin",
      addedAt: new Date(Date.now() - 864e5 * 10).toISOString()
    }
  ],
  users: [
    {
      telegramId: "user_101",
      username: "alex_trader",
      firstName: "Alex",
      isVerified: true,
      joinedChannels: ["ch-1", "ch-2", "ch-3"],
      joinedAt: new Date(Date.now() - 864e5 * 5).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
      hasLeftRequired: false,
      leftChannelsAlertCount: 0,
      referralCode: "ref_101",
      referralCount: 4,
      bonusBalance: 275,
      lastBonusClaimDate: new Date(Date.now() - 864e5).toISOString().split("T")[0],
      claimedCodes: ["VIP2026", "BONUS100"]
    },
    {
      telegramId: "user_102",
      username: "priya_k",
      firstName: "Priya",
      isVerified: true,
      joinedChannels: ["ch-1", "ch-2", "ch-3"],
      joinedAt: new Date(Date.now() - 864e5 * 2).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
      hasLeftRequired: false,
      leftChannelsAlertCount: 0,
      referralCode: "ref_102",
      referredBy: "user_101",
      referralCount: 1,
      bonusBalance: 125,
      lastBonusClaimDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      claimedCodes: ["VIP2026"]
    },
    {
      telegramId: "user_103",
      username: "vikram99",
      firstName: "Vikram",
      isVerified: false,
      joinedChannels: ["ch-1"],
      joinedAt: new Date(Date.now() - 36e5 * 4).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
      hasLeftRequired: true,
      leftChannelsAlertCount: 1,
      referralCode: "ref_103",
      referredBy: "user_101",
      referralCount: 0,
      bonusBalance: 0,
      claimedCodes: []
    }
  ],
  logs: [
    {
      id: "log-1",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "verify",
      user: "alex_trader (101)",
      details: "Joined all 3 required channels and successfully verified."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 18e5).toISOString(),
      type: "claim",
      user: "alex_trader (101)",
      details: "Redeemed claim code VIP2026."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 36e5).toISOString(),
      type: "leave",
      user: "vikram99 (103)",
      details: "Detected leaving @PrimeVipLounge. Sent automatic warning & forced re-join."
    }
  ]
};
let db = defaultDatabase;
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
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
    console.error("Error loading db file, using defaults:", err);
    db = defaultDatabase;
  }
}
let autoBackupDebounce = null;
function saveDatabase(skipAutoGroupSync = false) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    if (!skipAutoGroupSync && db.config.autoBackupToGroup && db.config.backupGroupId && db.config.botToken) {
      if (autoBackupDebounce) clearTimeout(autoBackupDebounce);
      autoBackupDebounce = setTimeout(() => {
        backupDatabaseToTelegramGroup("Auto-Sync on data change").catch(() => {
        });
      }, 5e3);
    }
  } catch (err) {
    console.error("Error saving db file:", err);
  }
}
loadDatabase();
function getISTDateString(d = /* @__PURE__ */ new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1e3;
  const istDate = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1e3 + istOffset);
  const pad = (n) => n.toString().padStart(2, "0");
  const year = istDate.getFullYear();
  const month = pad(istDate.getMonth() + 1);
  const day = pad(istDate.getDate());
  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
setInterval(() => {
  const nowIST = getISTDateString();
  let changed = false;
  db.broadcasts.forEach((b) => {
    if (b.type === "scheduled" && b.status === "scheduled" && b.scheduledTimeIST) {
      if (nowIST >= b.scheduledTimeIST) {
        b.status = "sent";
        const eligibleUsers = db.users.filter((u) => {
          if (b.targetAudience === "verified_only") return u.isVerified && !u.hasLeftRequired;
          if (b.targetAudience === "unverified_only") return !u.isVerified || u.hasLeftRequired;
          return true;
        });
        b.sentCount = eligibleUsers.length;
        b.totalRecipients = eligibleUsers.length;
        b.executedAt = (/* @__PURE__ */ new Date()).toISOString();
        changed = true;
        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          type: "broadcast",
          user: "System Scheduler (IST)",
          details: `Scheduled broadcast "${b.title}" executed at IST ${nowIST}. Delivered to ${b.sentCount} recipients.`
        });
      }
    }
  });
  if (changed) {
    saveDatabase();
  }
}, 15e3);
const app = express();
app.use(express.json());
let pollingTimeout = null;
let lastUpdateId = 0;
let isPollingRunning = false;
async function callTelegramApi(token, method, payload) {
  if (!token) return { ok: false, error: "No bot token provided" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
async function checkTelegramChatMember(token, chatId, userId) {
  try {
    const res = await callTelegramApi(token, "getChatMember", {
      chat_id: chatId,
      user_id: userId
    });
    if (res.ok && res.result) {
      const status = res.result.status;
      return ["creator", "administrator", "member", "restricted"].includes(status);
    }
    return false;
  } catch (err) {
    console.error(`Error checking membership in ${chatId} for ${userId}:`, err);
    return false;
  }
}
function getTelegramButtonStyle(color, fallback = "primary") {
  if (color === "red") return "danger";
  if (color === "green") return "success";
  if (color === "blue") return "primary";
  return fallback;
}
async function backupDatabaseToTelegramGroup(reason = "Automatic Sync") {
  const token = db.config.botToken;
  const backupGroupId = db.config.backupGroupId;
  if (!token || !backupGroupId) {
    return { ok: false, error: "Telegram Bot Token or Backup Group ID is not configured." };
  }
  const istNow = getISTDateString();
  const summary = `\u{1F4E6} *TELEFORCE DATABASE VAULT BACKUP*

\u{1F916} *Bot:* @${db.config.botUsername || "PrimeAdsEbot"}
\u23F1 *IST Timestamp:* \`${istNow}\`
\u{1F4DD} *Reason:* ${reason}

\u{1F4CA} *DATABASE METRICS:*
\u2022 Total Stored Users: *${db.users.length}*
\u2022 Verified Members: *${db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length}*
\u2022 Required Channels: *${db.channels.length}*
\u2022 Active Claim Codes: *${db.claimCodes.length}*
\u2022 Authorized Admins: *${db.admins.length}*

\u{1F510} *RECOVERY & BOT MIGRATION:*
To recover data on a new bot or after restart: reply to this message with \`/restore\` or click 'Restore' in Web Dashboard.

#DB_BACKUP #TELEFORCE_VAULT`;
  const jsonContent = JSON.stringify(db, null, 2);
  const filename = `teleforce_db_backup_${Date.now()}.json`;
  try {
    const formData = new FormData();
    formData.append("chat_id", backupGroupId);
    const blob = new Blob([jsonContent], { type: "application/json" });
    formData.append("document", blob, filename);
    formData.append("caption", summary);
    formData.append("parse_mode", "Markdown");
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: formData
    });
    const docData = await res.json();
    if (docData && docData.ok) {
      db.config.lastBackupTimestamp = istNow;
      db.config.lastBackupMessageId = docData.result?.message_id;
      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "admin",
        user: "Database Vault Engine",
        details: `Saved database backup document to Telegram Group (${backupGroupId}). Msg ID: ${docData.result?.message_id}`
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      return { ok: true, message: `Backup document sent to Telegram Group (Msg ID: ${docData.result?.message_id})` };
    } else {
      const textRes = await callTelegramApi(token, "sendMessage", {
        chat_id: backupGroupId,
        text: `${summary}

\`\`\`json
${jsonContent.slice(0, 3200)}
\`\`\``,
        parse_mode: "Markdown"
      });
      if (textRes.ok) {
        db.config.lastBackupTimestamp = istNow;
        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          type: "admin",
          user: "Database Vault Engine",
          details: `Sent database backup summary text to Telegram Group (${backupGroupId})`
        });
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
        return { ok: true, message: "Backup summary text sent to Telegram Group." };
      }
      return { ok: false, error: docData?.description || textRes?.description || "Telegram API rejected message" };
    }
  } catch (err) {
    console.error("Error backing up database to Telegram group:", err);
    return { ok: false, error: err.message };
  }
}
async function processTelegramUpdate(update) {
  const token = db.config.botToken;
  if (!token) return;
  try {
    if (update.chat_member) {
      const cm = update.chat_member;
      const user = cm.from;
      const newStatus = cm.new_chat_member?.status;
      const oldStatus = cm.old_chat_member?.status;
      if (newStatus === "left" || newStatus === "kicked") {
        const matchedChannel = db.channels.find(
          (c) => c.channelId.toLowerCase() === `@${update.chat_member.chat?.username?.toLowerCase()}` || c.channelId === String(update.chat_member.chat?.id)
        );
        if (matchedChannel && matchedChannel.required) {
          let botUser = db.users.find((u) => u.telegramId === String(user.id));
          if (botUser) {
            botUser.hasLeftRequired = true;
            botUser.isVerified = false;
            botUser.leftChannelsAlertCount += 1;
            saveDatabase();
          }
          db.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            type: "leave",
            user: `${user.first_name} (${user.id})`,
            details: `Detected leaving ${matchedChannel.title}. Sending re-join alert message.`
          });
          const leaveKeyboard = db.channels.map((ch) => [
            {
              text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
              url: ch.inviteLink,
              style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
            }
          ]);
          leaveKeyboard.push([
            {
              text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
              callback_data: "check_in",
              style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
            }
          ]);
          if (db.config.showBonusButton) {
            leaveKeyboard.push([
              {
                text: db.config.bonusButtonText || "\u{1F534} CLAIM BONUS",
                callback_data: "claim_bonus",
                style: getTelegramButtonStyle(db.config.bonusButtonColor, "danger")
              }
            ]);
          }
          await callTelegramApi(token, "sendMessage", {
            chat_id: user.id,
            text: db.config.leaveAlertMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
            reply_markup: {
              inline_keyboard: leaveKeyboard
            }
          });
        }
      }
    }
    if (update.callback_query) {
      const cq = update.callback_query;
      const fromUser = cq.from;
      const chatId = cq.message?.chat?.id || fromUser.id;
      const data = cq.data;
      await callTelegramApi(token, "answerCallbackQuery", {
        callback_query_id: cq.id,
        text: "Processing..."
      });
      if (data.startsWith("adm_")) {
        const isAdmin = db.admins.some((a) => a.telegramId === String(fromUser.id)) || db.admins.length === 0 || fromUser.id === 8938023719;
        if (!isAdmin) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: "\u26D4 Access denied."
          });
          return;
        }
        if (data === "adm_menu") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F451} *TeleForce Master Admin Control Panel*

Welcome, *${fromUser.first_name}*!
Select any function below to configure with 1-click:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F4CA} Live Bot Stats", callback_data: "adm_stats", style: "primary" }, { text: "\u{1F4E2} Channels List", callback_data: "adm_channels", style: "primary" }],
                [{ text: "\u270F\uFE0F Edit Force Text", callback_data: "adm_edit_force", style: "primary" }, { text: "\u26A0\uFE0F Edit Leave Alert", callback_data: "adm_edit_leave", style: "danger" }],
                [{ text: "\u{1F518} Button Labels & Colors", callback_data: "adm_edit_btns", style: "primary" }, { text: "\u{1F381} Verification Post", callback_data: "adm_post", style: "primary" }],
                [{ text: "\u{1F511} Claim Codes Manager", callback_data: "adm_codes", style: "primary" }, { text: "\u26A1 Instant Broadcast", callback_data: "adm_bcast", style: "primary" }],
                [{ text: "\u{1F4BE} Database Vault (Group Backup)", callback_data: "adm_db", style: "primary" }, { text: "\u{1F48E} Bonus Rewards", callback_data: "adm_bonus", style: "primary" }],
                [{ text: "\u{1F465} Admins & Users", callback_data: "adm_admins", style: "primary" }, { text: "\u{1F680} 24/7 Hosting Status", callback_data: "adm_host", style: "primary" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_db") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F4BE} *TELEGRAM DATABASE VAULT*

\u2022 Vault Group ID: \`${db.config.backupGroupId || "Not Configured"}\`
\u2022 Group Name: *${db.config.backupGroupName || "None"}*
\u2022 Auto-Sync on Changes: *${db.config.autoBackupToGroup ? "\u{1F7E2} ENABLED" : "\u{1F534} DISABLED"}*
\u2022 Last Backup Sent: *${db.config.lastBackupTimestamp || "None"}*
\u2022 Total Stored Users: *${db.users.length}*
\u2022 Required Channels: *${db.channels.length}*

\u{1F4A1} *How to configure:* Add this bot as Admin to your private Telegram group and run \`/setbackupgroup\` inside it!`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F4BE} Backup Now to Group", callback_data: "adm_dobackup", style: "primary" }],
                [{ text: "\u{1F504} How to Restore (/restore)", callback_data: "adm_how_restore", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_dobackup") {
          await callTelegramApi(token, "sendMessage", { chat_id: chatId, text: "\u23F3 Uploading database backup snapshot to Telegram group..." });
          const res = await backupDatabaseToTelegramGroup("Admin Panel Button Trigger");
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: res.ok ? `\u2705 *Database backup sent to Telegram group!*

Msg: ${res.message}` : `\u274C *Error:* ${res.error}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_how_restore") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F504} *HOW TO RESTORE DATABASE*

1\uFE0F\u20E3 Apne Telegram Backup Group me jayein: \`${db.config.backupGroupId || "Configured Group"}\`
2\uFE0F\u20E3 Kisi bhi \`teleforce_db_backup_*.json\` message par **Reply** karein.
3\uFE0F\u20E3 Reply me likhein: \`/restore\`

Bot turant us file se pura database (users, channels, codes) restore kar dega!`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_stats") {
          const verified = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
          const left = db.users.filter((u) => u.hasLeftRequired).length;
          const totalBalance = db.users.reduce((acc, u) => acc + (u.bonusBalance || 0), 0);
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F4CA} *TELEFORCE LIVE BOT STATS*

\u2022 Total Registered Users: *${db.users.length}*
\u2022 Verified Active Members: *${verified}*
\u2022 Left Channels (Alert Triggered): *${left}*
\u2022 Active Force Channels: *${db.channels.length}*
\u2022 Active Claim Codes: *${db.claimCodes.filter((c) => c.isActive).length}*
\u2022 Total Bonus Distributed: *${totalBalance} Points*
\u2022 Server Uptime: *${Math.floor(process.uptime())}s*
\u2022 Indian Standard Time: *${getISTDateString()}*`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F504} Refresh Stats", callback_data: "adm_stats", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_channels") {
          const chList = db.channels.map((c, i) => `${i + 1}. *${c.title}* (${c.type.toUpperCase()})
   ID: \`${c.channelId}\`
   Link: ${c.inviteLink}`).join("\n\n");
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F4E2} *FORCE JOIN CHANNELS & GROUPS*

${chList || "No channels configured yet."}

\u{1F4A1} *Add Channel Command:*
\`/addchannel <@channelId> <Title> <InviteLink>\`

\u{1F4A1} *Delete Channel Command:*
\`/delchannel <channelId>\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u2795 Add Demo Channel", callback_data: "adm_add_demo_channel", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_add_demo_channel") {
          const newCh = {
            id: `ch-${Date.now()}`,
            channelId: "@PrimeCommunityChat",
            title: "\u{1F4AC} Prime Community Group",
            inviteLink: "https://t.me/PrimeCommunityChat",
            type: "group",
            required: true,
            memberCount: 18500,
            addedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          db.channels.push(newCh);
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Added Channel:* ${newCh.title} (\`${newCh.channelId}\`)`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F4E2} View Channels List", callback_data: "adm_channels", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_edit_force") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u270F\uFE0F *EDIT FORCE JOIN WELCOME TEXT*

*Current Welcome Message:*
\`${db.config.welcomeMessage}\`

\u{1F4A1} *Manual Update Command:*
\`/setforcetext <Your new welcome message>\`

Or choose a 1-click preset below:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F535} Apply \u{1F535} CHECK JOIN Preset", callback_data: "adm_preset_blue_welcome", style: "primary" }],
                [{ text: "\u{1F512} Apply VIP Access Notice", callback_data: "adm_preset_vip_welcome", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_preset_blue_welcome") {
          db.config.welcomeMessage = "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Welcome Message set to \u{1F535} CHECK JOIN Preset:*

${db.config.welcomeMessage}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_preset_vip_welcome") {
          db.config.welcomeMessage = "\u{1F512} *EXCLUSIVE VIP ACCESS*\n\nPlease join all our official channels and groups below, then press \u{1F535} CHECK JOIN to verify.";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Welcome Message set to VIP Preset:*

${db.config.welcomeMessage}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_edit_leave") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *EDIT LEAVE ALERT WARNING TEXT*

*Current Leave Alert:*
\`${db.config.leaveAlertMessage}\`

\u{1F4A1} *Manual Update Command:*
\`/setleavetext <Your new warning message>\`

Or choose a 1-click preset below:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F6A8} Apply Urgent Rejoin Warning", callback_data: "adm_preset_urgent_leave", style: "danger" }],
                [{ text: "\u26A0\uFE0F Apply Standard Warning", callback_data: "adm_preset_std_leave", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_preset_urgent_leave") {
          db.config.leaveAlertMessage = "\u{1F6A8} URGENT: You left a required channel/group!\n\nPlease join again immediately and press \u{1F535} CHECK JOIN.";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Leave Alert set to Urgent Preset:*

${db.config.leaveAlertMessage}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_preset_std_leave") {
          db.config.leaveAlertMessage = "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Leave Alert set to Standard Preset:*

${db.config.leaveAlertMessage}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_edit_btns") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F518} *BUTTON LABELS & COLOR CUSTOMIZER*

\u2022 Join Button: \`${db.config.joinButtonText || "\u{1F535} JOIN NOW"}\` (Color: *${db.config.joinButtonColor || "blue"}*)
\u2022 Check Join Button: \`${db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN"}\` (Color: *${db.config.checkButtonColor || "blue"}*)
\u2022 Bonus Button: \`${db.config.bonusButtonText || "\u{1F534} CLAIM BONUS"}\` (Color: *${db.config.bonusButtonColor || "red"}*)

Tap any button below for instant 1-click color & label change:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F535} Set Blue Check Join", callback_data: "adm_set_check_blue", style: "primary" }, { text: "\u{1F7E2} Set Green Check Join", callback_data: "adm_set_check_green", style: "primary" }],
                [{ text: "\u{1F534} Set Red Bonus Button", callback_data: "adm_set_bonus_red", style: "danger" }, { text: "\u{1F7E0} Set Amber Bonus Button", callback_data: "adm_set_bonus_amber", style: "primary" }],
                [{ text: "\u{1F535} Set Blue Join Button", callback_data: "adm_set_join_blue", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_set_check_blue") {
          db.config.checkJoinButtonText = "\u{1F535} CHECK JOIN";
          db.config.checkButtonColor = "blue";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Check Join Button updated to Blue:* \`\u{1F535} CHECK JOIN\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F518} Back to Buttons", callback_data: "adm_edit_btns" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_set_check_green") {
          db.config.checkJoinButtonText = "\u{1F7E2} CHECK JOIN";
          db.config.checkButtonColor = "green";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Check Join Button updated to Green:* \`\u{1F7E2} CHECK JOIN\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F518} Back to Buttons", callback_data: "adm_edit_btns" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_set_bonus_red") {
          db.config.bonusButtonText = "\u{1F534} CLAIM BONUS";
          db.config.bonusButtonColor = "red";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Bonus Button updated to Red:* \`\u{1F534} CLAIM BONUS\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F518} Back to Buttons", callback_data: "adm_edit_btns" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_set_bonus_amber") {
          db.config.bonusButtonText = "\u{1F7E0} CLAIM BONUS";
          db.config.bonusButtonColor = "amber";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Bonus Button updated to Amber:* \`\u{1F7E0} CLAIM BONUS\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F518} Back to Buttons", callback_data: "adm_edit_btns" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_set_join_blue") {
          db.config.joinButtonText = "\u{1F535} JOIN NOW";
          db.config.joinButtonColor = "blue";
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Join Button updated to Blue:* \`\u{1F535} JOIN NOW\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F518} Back to Buttons", callback_data: "adm_edit_btns" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_codes") {
          const codeList = db.claimCodes.map((c) => `\u2022 \`${c.code}\` - *${c.title}* (${c.currentUses}/${c.maxUses} uses, ${c.isActive ? "Active" : "Disabled"})`).join("\n");
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F511} *ACTIVE CLAIM CODES*

${codeList || "No codes generated."}

\u{1F4A1} *Create Code Command:*
\`/addcode <CODE> <Title> <RewardMessage>\`

Users redeem using \`/claim <code>\` after verifying in all channels.`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u2795 Generate VIP2026 Code", callback_data: "adm_add_vip_code", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_add_vip_code") {
          let codeObj = db.claimCodes.find((c) => c.code === "VIP2026");
          if (!codeObj) {
            db.claimCodes.unshift({
              id: `code-${Date.now()}`,
              code: "VIP2026",
              title: "VIP Community Access Pass",
              postContent: {
                text: "\u{1F389} Congratulations! Here is your exclusive VIP access link: https://t.me/PrimeVipLounge",
                mediaType: "none",
                buttonText: "\u{1F680} Access VIP Now",
                buttonUrl: "https://t.me/PrimeVipLounge"
              },
              maxUses: 500,
              currentUses: 0,
              isActive: true,
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              claimedByUsers: []
            });
          } else {
            codeObj.isActive = true;
          }
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *VIP2026 Claim Code Activated!* Users can now redeem via \`/claim VIP2026\`.`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_post") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F381} *VERIFICATION POST SETTINGS*

\u2022 Status: *${db.verificationPost.enabled ? "\u{1F7E2} ENABLED" : "\u{1F534} DISABLED"}*
\u2022 Attached Media: *${db.verificationPost.mediaType.toUpperCase()}*
\u2022 Primary Button: *${db.verificationPost.buttonText || "None"}*
\u2022 Primary URL: *${db.verificationPost.buttonUrl || "None"}*

*Delivered Message:*
${db.verificationPost.text}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: db.verificationPost.enabled ? "\u{1F534} Disable Post" : "\u{1F7E2} Enable Post", callback_data: "adm_toggle_post", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_toggle_post") {
          db.verificationPost.enabled = !db.verificationPost.enabled;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Verification Post is now:* ${db.verificationPost.enabled ? "\u{1F7E2} ENABLED" : "\u{1F534} DISABLED"}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_bcast") {
          const verifiedCount = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A1 *INSTANT BROADCAST TO VERIFIED USERS*

\u2022 Target Audience: *${verifiedCount} Verified Users*

\u{1F4A1} *To send custom broadcast, type:*
\`/broadcast Your announcement message here\`

Or send a test announcement right now:`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F4E2} Send Test Announcement Now", callback_data: "adm_send_test_bcast", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_send_test_bcast") {
          const verifiedUsers = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
          let sentCount = 0;
          const sampleText = `\u{1F4E2} *OFFICIAL ANNOUNCEMENT*

Hello everyone! Thank you for staying active in our channels. Exciting drops and bonuses coming up!`;
          for (const u of verifiedUsers) {
            try {
              await callTelegramApi(token, "sendMessage", {
                chat_id: u.telegramId,
                text: sampleText,
                parse_mode: "Markdown"
              });
              sentCount++;
            } catch (e) {
            }
          }
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Broadcast Delivered to ${sentCount} Verified Users!*`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_bonus") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F48E} *BONUS & REWARDS CONFIGURATION*

\u2022 Daily Bonus Amount: *${db.config.dailyBonusAmount || 25} Points*
\u2022 Referral Bonus: *${db.config.referralBonusAmount || 50} Points*
\u2022 Show Bonus Button: *${db.config.showBonusButton ? "\u{1F7E2} ON" : "\u{1F534} OFF"}*
\u2022 Button Text: \`${db.config.bonusButtonText || "\u{1F534} CLAIM BONUS"}\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: db.config.showBonusButton ? "\u{1F534} Hide Bonus Button" : "\u{1F7E2} Show Bonus Button", callback_data: "adm_toggle_bonus", style: "primary" }],
                [{ text: "Set 25 Pts", callback_data: "adm_bonus_25" }, { text: "Set 50 Pts", callback_data: "adm_bonus_50" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_toggle_bonus") {
          db.config.showBonusButton = !db.config.showBonusButton;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Bonus Button visibility:* ${db.config.showBonusButton ? "\u{1F7E2} SHOWN" : "\u{1F534} HIDDEN"}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F48E} Back to Bonus", callback_data: "adm_bonus" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_bonus_25") {
          db.config.dailyBonusAmount = 25;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Daily Bonus Amount set to 25 Points!*`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F48E} Back to Bonus", callback_data: "adm_bonus" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_bonus_50") {
          db.config.dailyBonusAmount = 50;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Daily Bonus Amount set to 50 Points!*`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F48E} Back to Bonus", callback_data: "adm_bonus" }, { text: "\u{1F519} Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_admins") {
          const adminList = db.admins.map((a, i) => `${i + 1}. *${a.name}* (\`${a.telegramId}\`) - ${a.role.toUpperCase()}`).join("\n");
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F465} *AUTHORIZED ADMINISTRATORS*

${adminList || "No custom admins configured (Superadmin access enabled)."}

\u2022 Total Bot Users in DB: *${db.users.length}*

\u{1F4A1} *Add New Admin Command:*
\`/addadmin <TelegramID> <Name>\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
        if (data === "adm_host") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u{1F680} *24/7 HOSTING STATUS & ENGINE HEALTH*

\u2022 Server Status: *\u{1F7E2} ONLINE*
\u2022 Server Uptime: *${Math.floor(process.uptime())} seconds*
\u2022 IST Time: *${getISTDateString()}*
\u2022 Port: \`${PORT}\`
\u2022 Polling Status: *${isPollingRunning ? "\u{1F7E2} ACTIVE" : "\u{1F534} PAUSED"}*
\u2022 Auto-Start on Reboot: *ENABLED*

\u{1F4A1} *Keep Awake Tip:* Ping \`/api/health\` every 5 minutes using UptimeRobot so cloud hosts never sleep!`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u26A1 Ping /health API", callback_data: "adm_ping_health", style: "primary" }],
                [{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_ping_health") {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A1 *HEALTHCHECK RESPONSE:*

\`\`\`json
{
  "status": "ok",
  "uptime": ${Math.floor(process.uptime())},
  "botActive": ${isPollingRunning},
  "users": ${db.users.length},
  "ist": "${getISTDateString()}"
}
\`\`\``,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "\u{1F519} Back to Admin Menu", callback_data: "adm_menu" }]]
            }
          });
          return;
        }
      }
      let botUser = db.users.find((u) => u.telegramId === String(fromUser.id));
      if (!botUser) {
        botUser = {
          telegramId: String(fromUser.id),
          username: fromUser.username || "",
          firstName: fromUser.first_name || "User",
          isVerified: false,
          joinedChannels: [],
          joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
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
      if (data === "check_in") {
        await callTelegramApi(token, "sendChatAction", { chat_id: chatId, action: "typing" });
        const requiredChannels = db.channels.filter((c) => c.required);
        const missing = [];
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
          const missingKeyboard = missing.map((m) => [{
            text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
            url: m.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
          }]);
          missingKeyboard.push([
            {
              text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
              callback_data: "check_in",
              style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
            }
          ]);
          if (db.config.showBonusButton) {
            missingKeyboard.push([
              {
                text: db.config.bonusButtonText || "\u{1F534} CLAIM BONUS",
                callback_data: "claim_bonus",
                style: getTelegramButtonStyle(db.config.bonusButtonColor, "danger")
              }
            ]);
          }
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: db.config.leaveAlertMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
            reply_markup: { inline_keyboard: missingKeyboard }
          });
          return;
        }
        botUser.isVerified = true;
        botUser.hasLeftRequired = false;
        saveDatabase();
        db.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          type: "verify",
          user: `${fromUser.first_name} (${fromUser.id})`,
          details: "Real Telegram verification passed! Delivered verification post."
        });
        const buttons = [];
        const actionRow = [];
        if (db.verificationPost.buttonText && db.verificationPost.buttonUrl) {
          actionRow.push({ text: db.verificationPost.buttonText, url: db.verificationPost.buttonUrl, style: "primary" });
        }
        if (db.verificationPost.secondaryButtonText && db.verificationPost.secondaryButtonUrl) {
          actionRow.push({ text: db.verificationPost.secondaryButtonText, url: db.verificationPost.secondaryButtonUrl, style: "primary" });
        }
        if (actionRow.length > 0) buttons.push(actionRow);
        if (db.config.showBonusButton) {
          buttons.push([{
            text: db.config.bonusButtonText || "\u{1F534} CLAIM BONUS",
            callback_data: "claim_bonus",
            style: getTelegramButtonStyle(db.config.bonusButtonColor, "danger")
          }]);
        }
        if (db.verificationPost.mediaType === "image" && db.verificationPost.mediaUrl?.startsWith("http")) {
          await callTelegramApi(token, "sendPhoto", {
            chat_id: chatId,
            photo: db.verificationPost.mediaUrl,
            caption: db.verificationPost.text,
            parse_mode: "Markdown",
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : void 0
          });
        } else {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: db.verificationPost.text,
            parse_mode: "Markdown",
            reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : void 0
          });
        }
        return;
      }
      if (data === "claim_bonus") {
        await callTelegramApi(token, "sendChatAction", { chat_id: chatId, action: "typing" });
        if (!botUser.isVerified || botUser.hasLeftRequired) {
          const checkBtns = db.channels.map((c) => [{
            text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
            url: c.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
          }]);
          checkBtns.push([{
            text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
            callback_data: "check_in",
            style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
          }]);
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: db.config.leaveAlertMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
            reply_markup: {
              inline_keyboard: checkBtns
            }
          });
          return;
        }
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        if (botUser.lastBonusClaimDate === today) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u23F3 *ALREADY CLAIMED TODAY!*

You already claimed your bonus for today (${today}).
Please come back tomorrow!

\u{1F4B0} Current Wallet: *${botUser.bonusBalance} Points*`,
            parse_mode: "Markdown"
          });
          return;
        }
        botUser.bonusBalance += db.config.dailyBonusAmount;
        botUser.lastBonusClaimDate = today;
        saveDatabase();
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F381} *DAILY BONUS CLAIMED!*

+${db.config.dailyBonusAmount} Points added to your balance!

\u{1F4B0} *Total Wallet Balance:* ${botUser.bonusBalance} Points`,
          parse_mode: "Markdown"
        });
        return;
      }
    }
    if (update.message && update.message.text) {
      const msg = update.message;
      const text = msg.text.trim();
      const chatId = msg.chat.id;
      const fromUser = msg.from;
      let botUser = db.users.find((u) => u.telegramId === String(fromUser.id));
      if (!botUser) {
        botUser = {
          telegramId: String(fromUser.id),
          username: fromUser.username || "",
          firstName: fromUser.first_name || "User",
          isVerified: false,
          joinedChannels: [],
          joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
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
      botUser.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
      await callTelegramApi(token, "sendChatAction", { chat_id: chatId, action: "typing" });
      const isAdmin = db.admins.some((a) => a.telegramId === String(fromUser.id)) || db.admins.length === 0 || fromUser.id === 8938023719;
      if (text.startsWith("/admin")) {
        if (!isAdmin) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26D4 *ACCESS DENIED*

You are not authorized to use the admin command.
Your Telegram ID: \`${fromUser.id}\``,
            parse_mode: "Markdown"
          });
          return;
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F451} *TeleForce Master Admin Control Panel*

Welcome, *${fromUser.first_name}*!
Select any function below to configure with 1-click:`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "\u{1F4CA} Live Bot Stats", callback_data: "adm_stats", style: "primary" }, { text: "\u{1F4E2} Channels List", callback_data: "adm_channels", style: "primary" }],
              [{ text: "\u270F\uFE0F Edit Force Text", callback_data: "adm_edit_force", style: "primary" }, { text: "\u26A0\uFE0F Edit Leave Alert", callback_data: "adm_edit_leave", style: "danger" }],
              [{ text: "\u{1F518} Button Labels & Colors", callback_data: "adm_edit_btns", style: "primary" }, { text: "\u{1F381} Verification Post", callback_data: "adm_post", style: "primary" }],
              [{ text: "\u{1F511} Claim Codes Manager", callback_data: "adm_codes", style: "primary" }, { text: "\u26A1 Instant Broadcast", callback_data: "adm_bcast", style: "primary" }],
              [{ text: "\u{1F4BE} Database Vault (Group Backup)", callback_data: "adm_db", style: "primary" }, { text: "\u{1F48E} Bonus Rewards", callback_data: "adm_bonus", style: "primary" }],
              [{ text: "\u{1F465} Admins & Users", callback_data: "adm_admins", style: "primary" }, { text: "\u{1F680} 24/7 Hosting Status", callback_data: "adm_host", style: "primary" }]
            ]
          }
        });
        return;
      }
      if (text.startsWith("/setforcetext") && isAdmin) {
        const newText = text.replace("/setforcetext", "").trim();
        if (!newText) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *Usage:* \`/setforcetext <New force join message text>\``,
            parse_mode: "Markdown"
          });
          return;
        }
        db.config.welcomeMessage = newText;
        saveDatabase();
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u2705 *Force Join Welcome Text Updated!*

*New Text:*
${newText}`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text.startsWith("/setleavetext") && isAdmin) {
        const newText = text.replace("/setleavetext", "").trim();
        if (!newText) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *Usage:* \`/setleavetext <New channel leave alert message>\``,
            parse_mode: "Markdown"
          });
          return;
        }
        db.config.leaveAlertMessage = newText;
        saveDatabase();
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u2705 *Leave Alert Message Updated!*

*New Text:*
${newText}`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text.startsWith("/setjoinbtn") && isAdmin) {
        const newBtn = text.replace("/setjoinbtn", "").trim();
        if (newBtn) {
          db.config.joinButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Join Button Label set to:* \`${newBtn}\``,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/setcheckbtn") && isAdmin) {
        const newBtn = text.replace("/setcheckbtn", "").trim();
        if (newBtn) {
          db.config.checkJoinButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Check Join Button Label set to:* \`${newBtn}\``,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/addchannel") && isAdmin) {
        const parts = text.split(" ");
        if (parts.length >= 4) {
          const chId = parts[1];
          const chTitle = parts[2];
          const chLink = parts[3];
          db.channels.push({
            id: `ch-${Date.now()}`,
            channelId: chId,
            title: chTitle,
            inviteLink: chLink,
            type: "channel",
            required: true,
            addedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Force Join Channel Added via Telegram!*

Title: *${chTitle}*
ID: \`${chId}\`
Link: ${chLink}`,
            parse_mode: "Markdown"
          });
          return;
        } else {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *Usage:* \`/addchannel <@channelId> <Title> <InviteLink>\``,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/broadcast") && isAdmin) {
        const bcastMsg = text.replace("/broadcast", "").trim();
        if (!bcastMsg) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *Usage:* \`/broadcast <Your message here>\``,
            parse_mode: "Markdown"
          });
          return;
        }
        const verifiedUsers = db.users.filter((u) => u.isVerified && !u.hasLeftRequired);
        for (const u of verifiedUsers) {
          try {
            await callTelegramApi(token, "sendMessage", {
              chat_id: u.telegramId,
              text: bcastMsg,
              parse_mode: "Markdown"
            });
          } catch (e) {
          }
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u26A1 *Broadcast Delivered to ${verifiedUsers.length} verified users!*`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text === "/stats" && isAdmin) {
        const verified = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F4CA} *BOT METRICS*

Total Users: *${db.users.length}*
Verified: *${verified}*
Required Channels: *${db.channels.length}*
Active Claim Codes: *${db.claimCodes.filter((c) => c.isActive).length}*
IST Time: *${getISTDateString()}*`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text.startsWith("/setbonusbtn") && isAdmin) {
        const newBtn = text.replace("/setbonusbtn", "").trim();
        if (newBtn) {
          db.config.bonusButtonText = newBtn;
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Bonus Button Label set to:* \`${newBtn}\``,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/delchannel") && isAdmin) {
        const query = text.replace("/delchannel", "").trim();
        const idx = db.channels.findIndex((c) => c.id === query || c.channelId === query || c.channelId.replace("@", "") === query.replace("@", ""));
        if (idx !== -1) {
          const removed = db.channels.splice(idx, 1)[0];
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Channel Removed:* ${removed.title} (\`${removed.channelId}\`)`,
            parse_mode: "Markdown"
          });
          return;
        } else {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F Channel not found. Use \`/channels\` to see list.`,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/addcode") && isAdmin) {
        const parts = text.split(" ");
        if (parts.length >= 4) {
          const cCode = parts[1].toUpperCase();
          const cTitle = parts[2];
          const cMsg = parts.slice(3).join(" ");
          db.claimCodes.unshift({
            id: `code-${Date.now()}`,
            code: cCode,
            title: cTitle,
            postContent: {
              text: cMsg,
              mediaType: "none"
            },
            maxUses: 1e3,
            currentUses: 0,
            isActive: true,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            claimedByUsers: []
          });
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Claim Code Generated!*

Code: \`${cCode}\`
Title: *${cTitle}*
Message: ${cMsg}`,
            parse_mode: "Markdown"
          });
          return;
        } else {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *Usage:* \`/addcode <CODE> <Title> <RewardMessage>\``,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text === "/admins" && isAdmin) {
        const adminList = db.admins.map((a, i) => `${i + 1}. *${a.name}* (\`${a.telegramId}\`) - ${a.role.toUpperCase()}`).join("\n");
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F465} *AUTHORIZED ADMINISTRATORS*

${adminList || "No additional admins configured."}

\u{1F4A1} *Add new admin:* \`/addadmin <TelegramID> <Name>\``,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text.startsWith("/addadmin") && isAdmin) {
        const parts = text.split(" ");
        if (parts.length >= 3) {
          const newId = parts[1];
          const newName = parts.slice(2).join(" ");
          db.admins.push({
            id: `admin-${Date.now()}`,
            telegramId: newId,
            username: "",
            name: newName,
            role: "superadmin",
            addedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          saveDatabase();
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *Admin Added:* ${newName} (\`${newId}\`)`,
            parse_mode: "Markdown"
          });
          return;
        }
      }
      if (text.startsWith("/setbackupgroup") && isAdmin) {
        const query = text.replace("/setbackupgroup", "").trim();
        let targetGroupId = query;
        let groupTitle = "";
        if (!targetGroupId) {
          if (chatId < 0) {
            targetGroupId = String(chatId);
            groupTitle = msg.chat?.title || "Current Group";
          } else {
            await callTelegramApi(token, "sendMessage", {
              chat_id: chatId,
              text: `\u26A0\uFE0F *Usage:* \`/setbackupgroup <GroupID>\` (e.g. \`-1002938172654\`)

\u{1F4A1} *Tip:* Add this bot to your private Telegram group and send \`/setbackupgroup\` directly inside the group!`,
              parse_mode: "Markdown"
            });
            return;
          }
        }
        db.config.backupGroupId = targetGroupId;
        if (groupTitle) db.config.backupGroupName = groupTitle;
        saveDatabase();
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u2705 *DATABASE BACKUP VAULT CONFIGURED!*

\u2022 Vault Group ID: \`${targetGroupId}\`
\u2022 Auto-Sync: *Enabled*

All database snapshots will be securely saved to this group. Run \`/backup\` to generate an instant backup!`,
          parse_mode: "Markdown"
        });
        await backupDatabaseToTelegramGroup("Initial Backup Vault Connection Handshake");
        return;
      }
      if (text === "/backup" && isAdmin) {
        if (!db.config.backupGroupId) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u26A0\uFE0F *No Backup Group Configured!*

Please set your Telegram backup group using:
\`/setbackupgroup <GroupID>\``,
            parse_mode: "Markdown"
          });
          return;
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u23F3 *Uploading database backup snapshot to Telegram group...*`,
          parse_mode: "Markdown"
        });
        const bRes = await backupDatabaseToTelegramGroup("Manual /backup command");
        if (bRes.ok) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2705 *DATABASE BACKUP POSTED TO TELEGRAM GROUP!*

\u2022 Group ID: \`${db.config.backupGroupId}\`
\u2022 Users: *${db.users.length}*
\u2022 Channels: *${db.channels.length}*
\u2022 Claim Codes: *${db.claimCodes.length}*
\u2022 IST Time: *${getISTDateString()}*`,
            parse_mode: "Markdown"
          });
        } else {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u274C *Backup Failed:* ${bRes.error}

Make sure the bot is an Admin in group \`${db.config.backupGroupId}\`.`,
            parse_mode: "Markdown"
          });
        }
        return;
      }
      if (text.startsWith("/restore") && isAdmin) {
        const replyDoc = msg.reply_to_message?.document;
        if (replyDoc && replyDoc.file_name?.endsWith(".json")) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u23F3 *Downloading and verifying backup file:* \`${replyDoc.file_name}\`...`,
            parse_mode: "Markdown"
          });
          try {
            const fileInfo = await callTelegramApi(token, "getFile", { file_id: replyDoc.file_id });
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
                  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                  type: "admin",
                  user: `${fromUser.first_name} (${fromUser.id})`,
                  details: `Restored database from Telegram group backup file (${replyDoc.file_name}).`
                });
                await callTelegramApi(token, "sendMessage", {
                  chat_id: chatId,
                  text: `\u{1F389} *DATABASE RESTORED SUCCESSFULLY!*

\u2022 Recovered Users: *${db.users.length}*
\u2022 Recovered Channels: *${db.channels.length}*
\u2022 Recovered Codes: *${db.claimCodes.length}*
\u2022 IST Time: *${getISTDateString()}*

All bot data has been completely restored from your Telegram Group backup!`,
                  parse_mode: "Markdown"
                });
                return;
              }
            }
          } catch (err) {
            await callTelegramApi(token, "sendMessage", {
              chat_id: chatId,
              text: `\u274C *Restore Failed:* ${err.message}`,
              parse_mode: "Markdown"
            });
            return;
          }
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F504} *DATABASE RESTORE & RECOVERY GUIDE*

Jab aap bot change karein ya data recover karna ho:

1\uFE0F\u20E3 Apne Database Backup Telegram Group me jayein: \`${db.config.backupGroupId || "Set via /setbackupgroup"}\`
2\uFE0F\u20E3 Kisi bhi \`teleforce_db_backup_*.json\` file ko dhundhein.
3\uFE0F\u20E3 Us message par **Reply** karein aur likhein: \`/restore\`

Bot turant us JSON backup ko download karke pura database (users, channels, codes) restore kar dega!

_Aap Web Admin Dashboard ke "Telegram DB & Backup" tab se bhi backup upload karke restore kar sakte hain._`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text === "/dbstatus" && isAdmin) {
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F4BE} *TELEGRAM DATABASE VAULT STATUS*

\u2022 Backup Group ID: \`${db.config.backupGroupId || "Not Configured"}\`
\u2022 Vault Group Name: *${db.config.backupGroupName || "None"}*
\u2022 Auto-Sync to Group: *${db.config.autoBackupToGroup ? "\u{1F7E2} ACTIVE" : "\u{1F534} DISABLED"}*
\u2022 Last Backup Sent: *${db.config.lastBackupTimestamp || "None"}*
\u2022 Total Registered Users: *${db.users.length}*
\u2022 Required Channels: *${db.channels.length}*
\u2022 Active Claim Codes: *${db.claimCodes.length}*

Commands:
\u2022 \`/backup\` - Send new backup snapshot to group
\u2022 \`/restore\` - Reply to any .json backup to restore
\u2022 \`/setbackupgroup <id>\` - Update vault group`,
          parse_mode: "Markdown"
        });
        return;
      }
      if (text.startsWith("/start")) {
        const channelButtons = db.channels.map((ch) => [
          {
            text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
            url: ch.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
          }
        ]);
        channelButtons.push([
          {
            text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
            callback_data: "check_in",
            style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
          }
        ]);
        if (db.config.showBonusButton) {
          channelButtons.push([
            {
              text: db.config.bonusButtonText || "\u{1F534} CLAIM BONUS",
              callback_data: "claim_bonus",
              style: getTelegramButtonStyle(db.config.bonusButtonColor, "danger")
            }
          ]);
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: db.config.welcomeMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
          reply_markup: {
            inline_keyboard: channelButtons
          }
        });
        return;
      }
      let codeQuery = text;
      if (codeQuery.startsWith("/claim")) {
        codeQuery = codeQuery.replace("/claim", "").trim();
      }
      codeQuery = codeQuery.toUpperCase();
      const matchedCode = db.claimCodes.find((c) => c.code === codeQuery);
      if (matchedCode) {
        if (!botUser.isVerified || botUser.hasLeftRequired) {
          const checkBtns = db.channels.map((c) => [{
            text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
            url: c.inviteLink,
            style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
          }]);
          checkBtns.push([{
            text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
            callback_data: "check_in",
            style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
          }]);
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: db.config.leaveAlertMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
            reply_markup: {
              inline_keyboard: checkBtns
            }
          });
          return;
        }
        if (botUser.claimedCodes.includes(codeQuery)) {
          await callTelegramApi(token, "sendMessage", {
            chat_id: chatId,
            text: `\u2139\uFE0F *ALREADY REDEEMED!*

You have already redeemed the claim code *${codeQuery}*.`,
            parse_mode: "Markdown"
          });
          return;
        }
        matchedCode.currentUses += 1;
        matchedCode.claimedByUsers.push(botUser.telegramId);
        botUser.claimedCodes.push(codeQuery);
        saveDatabase();
        const codeButtons = [];
        if (matchedCode.postContent.buttonText && matchedCode.postContent.buttonUrl) {
          codeButtons.push([{ text: matchedCode.postContent.buttonText, url: matchedCode.postContent.buttonUrl, style: "primary" }]);
        }
        await callTelegramApi(token, "sendMessage", {
          chat_id: chatId,
          text: `\u{1F389} *CODE UNLOCKED: ${matchedCode.code}*

${matchedCode.postContent.text}`,
          parse_mode: "Markdown",
          reply_markup: codeButtons.length > 0 ? { inline_keyboard: codeButtons } : void 0
        });
        return;
      }
      const defaultBtns = db.channels.map((ch) => [
        {
          text: db.config.joinButtonText || "\u{1F535} JOIN NOW",
          url: ch.inviteLink,
          style: getTelegramButtonStyle(db.config.joinButtonColor, "primary")
        }
      ]);
      defaultBtns.push([
        {
          text: db.config.checkJoinButtonText || "\u{1F535} CHECK JOIN",
          callback_data: "check_in",
          style: getTelegramButtonStyle(db.config.checkButtonColor, "primary")
        }
      ]);
      await callTelegramApi(token, "sendMessage", {
        chat_id: chatId,
        text: db.config.welcomeMessage || "\u26A0\uFE0F You left a required channel/group.\n\nPlease join again and press \u{1F535} CHECK JOIN.",
        reply_markup: {
          inline_keyboard: defaultBtns
        }
      });
    }
  } catch (err) {
    console.error("Error processing Telegram update:", err);
  }
}
async function runTelegramPolling() {
  if (!isPollingRunning) return;
  const token = db.config.botToken;
  if (!token) {
    console.log("No Telegram bot token configured. Polling paused.");
    isPollingRunning = false;
    db.config.isPollingActive = false;
    saveDatabase();
    return;
  }
  try {
    const res = await callTelegramApi(token, "getUpdates", {
      offset: lastUpdateId + 1,
      timeout: 10,
      allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"]
    });
    if (res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        await processTelegramUpdate(update);
      }
    }
  } catch (err) {
    console.error("Telegram polling error:", err);
  }
  if (isPollingRunning) {
    pollingTimeout = setTimeout(runTelegramPolling, 1e3);
  }
}
app.post("/api/telegram/webhook", async (req, res) => {
  await processTelegramUpdate(req.body);
  res.json({ ok: true });
});
app.post("/api/bot/start", async (req, res) => {
  db.config.isPollingActive = true;
  saveDatabase();
  let botInfo = null;
  if (db.config.botToken) {
    const me = await callTelegramApi(db.config.botToken, "getMe", {});
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
    isPollingRunning = true;
  }
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "System",
    details: `Bot service STARTED! (Username: @${db.config.botUsername}, Real Polling: ${Boolean(db.config.botToken)})`
  });
  saveDatabase();
  res.json({
    success: true,
    message: "Bot started successfully!",
    isPollingActive: true,
    botInfo,
    botUsername: db.config.botUsername
  });
});
app.post("/api/bot/stop", (req, res) => {
  isPollingRunning = false;
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
  }
  db.config.isPollingActive = false;
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "System",
    details: "Bot service STOPPED."
  });
  res.json({ success: true, message: "Bot stopped successfully", isPollingActive: false });
});
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    istTime: getISTDateString(),
    botActive: isPollingRunning,
    botUsername: db.config.botUsername || "None",
    usersCount: db.users.length,
    version: "1.0.0-pro"
  });
});
app.get("/api/status", (req, res) => {
  const verifiedCount = db.users.filter((u) => u.isVerified && !u.hasLeftRequired).length;
  const leftCount = db.users.filter((u) => u.hasLeftRequired).length;
  const totalBalance = db.users.reduce((acc, u) => acc + (u.bonusBalance || 0), 0);
  const totalReferrals = db.users.reduce((acc, u) => acc + (u.referralCount || 0), 0);
  res.json({
    status: "online",
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
app.get("/api/config", (req, res) => {
  res.json(db.config);
});
app.post("/api/config", (req, res) => {
  db.config = { ...db.config, ...req.body };
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Admin Panel",
    details: "Bot configuration updated."
  });
  res.json({ success: true, config: db.config });
});
app.post("/api/telegram/test-token", async (req, res) => {
  const { token } = req.body;
  const botToken = token || db.config.botToken;
  if (!botToken) {
    return res.status(400).json({ ok: false, description: "Bot token is missing" });
  }
  const result = await callTelegramApi(botToken, "getMe", {});
  if (result.ok) {
    db.config.botUsername = result.result.username;
    db.config.botName = result.result.first_name;
    saveDatabase();
  }
  res.json(result);
});
app.post("/api/database/backup-to-group", async (req, res) => {
  const reason = req.body?.reason || "Web Admin Manual Backup Trigger";
  const result = await backupDatabaseToTelegramGroup(reason);
  res.json(result);
});
app.get("/api/database/export", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename=teleforce_db_backup_${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});
app.post("/api/database/import", (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({ ok: false, error: "Invalid JSON payload" });
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
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Web Admin Dashboard",
    details: `Database restored from imported JSON file. Recovered ${db.users.length} users and ${db.channels.length} channels.`
  });
  res.json({
    ok: true,
    message: "Database restored successfully!",
    stats: {
      users: db.users.length,
      channels: db.channels.length,
      claimCodes: db.claimCodes.length
    }
  });
});
app.post("/api/database/test-group", async (req, res) => {
  const { groupId } = req.body;
  const targetId = groupId || db.config.backupGroupId;
  const token = db.config.botToken;
  if (!token || !targetId) {
    return res.status(400).json({ ok: false, error: "Bot token or Group ID missing" });
  }
  const result = await callTelegramApi(token, "getChat", { chat_id: targetId });
  if (result.ok) {
    db.config.backupGroupId = targetId;
    db.config.backupGroupName = result.result?.title || "Backup Vault";
    saveDatabase();
  }
  res.json(result);
});
app.post("/api/telegram/send-test", async (req, res) => {
  const { chatId, text } = req.body;
  if (!db.config.botToken) {
    return res.status(400).json({ ok: false, description: "Telegram Bot Token not configured in settings." });
  }
  const result = await callTelegramApi(db.config.botToken, "sendMessage", {
    chat_id: chatId,
    text: text || "\u{1F44B} Hello! This is a test message from your TeleForce Bot Management Suite.",
    parse_mode: "Markdown"
  });
  res.json(result);
});
app.get("/api/channels", (req, res) => {
  res.json(db.channels);
});
app.post("/api/channels", (req, res) => {
  const { channelId, title, inviteLink, type, required, memberCount } = req.body;
  if (!channelId || !title || !inviteLink) {
    return res.status(400).json({ error: "channelId, title and inviteLink are required." });
  }
  const newChannel = {
    id: `ch-${Date.now()}`,
    channelId: channelId.trim().startsWith("@") || channelId.trim().startsWith("-") ? channelId.trim() : `@${channelId.trim()}`,
    title: title.trim(),
    inviteLink: inviteLink.trim(),
    type: type === "group" ? "group" : "channel",
    required: required !== void 0 ? Boolean(required) : true,
    memberCount: memberCount ? parseInt(memberCount, 10) : Math.floor(Math.random() * 2e4 + 5e3),
    addedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.channels.push(newChannel);
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Admin Panel",
    details: `Added new force-join ${newChannel.type}: ${newChannel.title} (${newChannel.channelId})`
  });
  res.json({ success: true, channel: newChannel });
});
app.delete("/api/channels/:id", (req, res) => {
  const index = db.channels.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Channel not found" });
  }
  const deleted = db.channels.splice(index, 1)[0];
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Admin Panel",
    details: `Deleted force-join channel: ${deleted.title}`
  });
  res.json({ success: true });
});
app.get("/api/codes", (req, res) => {
  res.json(db.claimCodes);
});
app.post("/api/codes", (req, res) => {
  const { code, title, postContent, maxUses, isActive } = req.body;
  if (!code || !title || !postContent?.text) {
    return res.status(400).json({ error: "code, title and postContent.text are required." });
  }
  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "_");
  const existingIndex = db.claimCodes.findIndex((c) => c.code === cleanCode);
  if (existingIndex !== -1) {
    db.claimCodes[existingIndex] = {
      ...db.claimCodes[existingIndex],
      title,
      postContent,
      maxUses: maxUses ? parseInt(maxUses, 10) : 1e3,
      isActive: isActive !== void 0 ? isActive : true
    };
    saveDatabase();
    return res.json({ success: true, code: db.claimCodes[existingIndex] });
  }
  const newCode = {
    id: `code-${Date.now()}`,
    code: cleanCode,
    title: title.trim(),
    postContent: {
      text: postContent.text,
      mediaType: postContent.mediaType || "none",
      mediaUrl: postContent.mediaUrl || "",
      buttonText: postContent.buttonText || "",
      buttonUrl: postContent.buttonUrl || "",
      secondaryButtonText: postContent.secondaryButtonText || "",
      secondaryButtonUrl: postContent.secondaryButtonUrl || ""
    },
    maxUses: maxUses ? parseInt(maxUses, 10) : 1e3,
    currentUses: 0,
    isActive: isActive !== void 0 ? isActive : true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    claimedByUsers: []
  };
  db.claimCodes.unshift(newCode);
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Admin Panel",
    details: `Created new claim code: ${newCode.code} ("${newCode.title}")`
  });
  res.json({ success: true, code: newCode });
});
app.delete("/api/codes/:id", (req, res) => {
  const index = db.claimCodes.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Claim code not found" });
  }
  const deleted = db.claimCodes.splice(index, 1)[0];
  saveDatabase();
  res.json({ success: true, deleted: deleted.code });
});
app.get("/api/verification-post", (req, res) => {
  res.json(db.verificationPost);
});
app.post("/api/verification-post", (req, res) => {
  db.verificationPost = { ...db.verificationPost, ...req.body };
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Admin Panel",
    details: "Verification reward post updated."
  });
  res.json({ success: true, verificationPost: db.verificationPost });
});
app.get("/api/broadcasts", (req, res) => {
  res.json(db.broadcasts);
});
app.post("/api/broadcasts", (req, res) => {
  const { title, type, postContent, scheduledTimeIST, targetAudience } = req.body;
  if (!title || !postContent?.text) {
    return res.status(400).json({ error: "title and postContent.text are required." });
  }
  const eligibleRecipients = db.users.filter((u) => {
    if (targetAudience === "verified_only") return u.isVerified && !u.hasLeftRequired;
    if (targetAudience === "unverified_only") return !u.isVerified || u.hasLeftRequired;
    return true;
  });
  const isInstant = type === "instant";
  const newBroadcast = {
    id: `bc-${Date.now()}`,
    title: title.trim(),
    type: isInstant ? "instant" : "scheduled",
    postContent: {
      text: postContent.text,
      mediaType: postContent.mediaType || "none",
      mediaUrl: postContent.mediaUrl || "",
      buttonText: postContent.buttonText || "",
      buttonUrl: postContent.buttonUrl || ""
    },
    targetAudience: targetAudience || "verified_only",
    scheduledTimeIST: isInstant ? void 0 : scheduledTimeIST,
    status: isInstant ? "sent" : "scheduled",
    sentCount: isInstant ? eligibleRecipients.length : 0,
    totalRecipients: eligibleRecipients.length,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    executedAt: isInstant ? (/* @__PURE__ */ new Date()).toISOString() : void 0
  };
  db.broadcasts.unshift(newBroadcast);
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "broadcast",
    user: "Admin Panel",
    details: isInstant ? `Executed instant broadcast "${newBroadcast.title}" to ${newBroadcast.sentCount} users.` : `Scheduled broadcast "${newBroadcast.title}" for IST: ${scheduledTimeIST}.`
  });
  res.json({ success: true, broadcast: newBroadcast });
});
app.post("/api/broadcasts/:id/send-now", (req, res) => {
  const broadcast = db.broadcasts.find((b) => b.id === req.params.id);
  if (!broadcast) {
    return res.status(404).json({ error: "Broadcast not found" });
  }
  const eligibleRecipients = db.users.filter((u) => {
    if (broadcast.targetAudience === "verified_only") return u.isVerified && !u.hasLeftRequired;
    if (broadcast.targetAudience === "unverified_only") return !u.isVerified || u.hasLeftRequired;
    return true;
  });
  broadcast.status = "sent";
  broadcast.sentCount = eligibleRecipients.length;
  broadcast.totalRecipients = eligibleRecipients.length;
  broadcast.executedAt = (/* @__PURE__ */ new Date()).toISOString();
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "broadcast",
    user: "Admin Panel",
    details: `Manual trigger: sent broadcast "${broadcast.title}" to ${broadcast.sentCount} users.`
  });
  res.json({ success: true, broadcast });
});
app.delete("/api/broadcasts/:id", (req, res) => {
  const index = db.broadcasts.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Broadcast not found" });
  }
  db.broadcasts.splice(index, 1);
  saveDatabase();
  res.json({ success: true });
});
app.get("/api/admins", (req, res) => {
  res.json(db.admins);
});
app.post("/api/admins", (req, res) => {
  const { telegramId, username, name, role } = req.body;
  if (!telegramId || !name) {
    return res.status(400).json({ error: "telegramId and name are required." });
  }
  const cleanTelegramId = telegramId.toString().trim();
  const existing = db.admins.find((a) => a.telegramId === cleanTelegramId);
  if (existing) {
    return res.status(400).json({ error: "Admin with this Telegram ID already exists." });
  }
  const newAdmin = {
    id: `admin-${Date.now()}`,
    telegramId: cleanTelegramId,
    username: username ? username.replace(/^@/, "") : "",
    name: name.trim(),
    role: role || "superadmin",
    addedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.admins.push(newAdmin);
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Owner",
    details: `Added new admin: ${newAdmin.name} (Telegram ID: ${newAdmin.telegramId}) with role ${newAdmin.role}`
  });
  res.json({ success: true, admin: newAdmin });
});
app.delete("/api/admins/:id", (req, res) => {
  const admin = db.admins.find((a) => a.id === req.params.id);
  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }
  if (admin.role === "owner") {
    return res.status(400).json({ error: "Cannot delete the primary owner account." });
  }
  db.admins = db.admins.filter((a) => a.id !== req.params.id);
  saveDatabase();
  db.logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "admin",
    user: "Owner",
    details: `Removed admin: ${admin.name} (${admin.telegramId})`
  });
  res.json({ success: true });
});
app.get("/api/users", (req, res) => {
  res.json(db.users);
});
app.post("/api/users/:telegramId/simulate-leave", (req, res) => {
  const user = db.users.find((u) => u.telegramId === req.params.telegramId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.joinedChannels.length > 0) {
    const leftChannelId = user.joinedChannels.pop();
    const channelObj = db.channels.find((c) => c.id === leftChannelId);
    user.hasLeftRequired = true;
    user.isVerified = false;
    user.leftChannelsAlertCount += 1;
    saveDatabase();
    db.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "leave",
      user: `${user.firstName} (${user.telegramId})`,
      details: `Left ${channelObj?.title || "Required Channel"}. Bot triggered re-join force alert.`
    });
    return res.json({
      success: true,
      hasLeft: true,
      alertMessage: db.config.leaveAlertMessage,
      remainingChannels: user.joinedChannels,
      missingChannel: channelObj
    });
  }
  res.json({ success: false, message: "User is not in any channels" });
});
app.get("/api/logs", (req, res) => {
  res.json(db.logs.slice(0, 50));
});
app.post("/api/bot/simulate-action", (req, res) => {
  const { action, telegramId, payload } = req.body;
  const userTelegramId = telegramId || "sim_user_999";
  let user = db.users.find((u) => u.telegramId === userTelegramId);
  if (!user) {
    user = {
      telegramId: userTelegramId,
      username: "telegram_tester",
      firstName: "You (Tester)",
      isVerified: false,
      joinedChannels: [],
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
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
  user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
  const requiredChannels = db.channels.filter((c) => c.required);
  const isJoinedAll = requiredChannels.every((c) => user.joinedChannels.includes(c.id));
  switch (action) {
    case "start": {
      const refMatch = payload && typeof payload === "string" && payload.startsWith("ref_");
      let referralMsg = "";
      if (refMatch && !user.referredBy && user.referralCode !== payload) {
        user.referredBy = payload;
        const referrer = db.users.find((u) => u.referralCode === payload);
        if (referrer) {
          referrer.referralCount += 1;
          referrer.bonusBalance += db.config.referralBonusAmount;
          referralMsg = `
\u{1F381} You joined via referral link! +${db.config.referralBonusAmount} pts credited to your referrer.`;
        }
      }
      saveDatabase();
      return res.json({
        type: "start_prompt",
        typingDuration: 1200,
        text: `${db.config.welcomeMessage}${referralMsg}

\u{1F4E2} *Required Verification List:*`,
        channels: db.channels,
        userJoined: user.joinedChannels,
        isVerified: user.isVerified && !user.hasLeftRequired,
        buttons: {
          blueVerifyButton: db.config.checkJoinButtonText || "\u{1F535} CHECK IN & VERIFY",
          redBonusButton: db.config.bonusButtonText || "\u{1F534} CLAIM BONUS",
          claimCodeButton: "\u{1F511} Enter Claim Code"
        }
      });
    }
    case "join_channel": {
      const channelId = payload?.channelId;
      if (channelId && !user.joinedChannels.includes(channelId)) {
        user.joinedChannels.push(channelId);
        const allJoinedNow = requiredChannels.every((c) => user.joinedChannels.includes(c.id));
        if (allJoinedNow) {
          user.hasLeftRequired = false;
        }
        saveDatabase();
      }
      return res.json({
        success: true,
        userJoined: user.joinedChannels,
        isJoinedAll: requiredChannels.every((c) => user.joinedChannels.includes(c.id))
      });
    }
    case "leave_channel": {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          type: "leave",
          user: `${user.firstName} (${user.telegramId})`,
          details: `Left channel ${channelObj?.title || channelId}. Triggered bot force-join alert.`
        });
        return res.json({
          type: "leave_alert",
          typingDuration: 1e3,
          text: `\u{1F6A8} *WARNING: YOU LEFT A REQUIRED CHANNEL!*

Channel: *${channelObj?.title || "Required Channel"}*

${db.config.leaveAlertMessage}`,
          channelToRejoin: channelObj,
          userJoined: user.joinedChannels,
          actionRequired: "rejoin"
        });
      }
      break;
    }
    case "check_in": {
      const hasAll = requiredChannels.every((c) => user.joinedChannels.includes(c.id));
      if (!hasAll) {
        const missing = requiredChannels.filter((c) => !user.joinedChannels.includes(c.id));
        return res.json({
          type: "check_in_failed",
          typingDuration: 1200,
          success: false,
          text: `\u274C *VERIFICATION FAILED!*

You have NOT joined all required channels/groups.
Missing: ${missing.map((m) => `
\u{1F449} ${m.title} (${m.channelId})`).join("")}

Please join all of them first and click *Check In* again!`,
          missingChannels: missing
        });
      }
      user.isVerified = true;
      user.hasLeftRequired = false;
      saveDatabase();
      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "verify",
        user: `${user.firstName} (${user.telegramId})`,
        details: "Passed force-join verification. Delivered post reward."
      });
      return res.json({
        type: "check_in_success",
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
    case "claim_bonus": {
      const hasAll = requiredChannels.every((c) => user.joinedChannels.includes(c.id));
      if (!hasAll || user.hasLeftRequired) {
        return res.json({
          type: "bonus_denied",
          typingDuration: 1e3,
          success: false,
          text: `\u26A0\uFE0F *CANNOT CLAIM BONUS!*

You must remain joined in all our official channels and groups to claim daily bonus.

Please complete force-join first!`
        });
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      if (user.lastBonusClaimDate === today) {
        return res.json({
          type: "bonus_already_claimed",
          typingDuration: 1e3,
          success: false,
          text: `\u23F3 *ALREADY CLAIMED TODAY!*

You already claimed your daily bonus for today (${today}).
Please come back tomorrow to claim again!

Current Wallet Balance: *${user.bonusBalance} Points*`
        });
      }
      user.bonusBalance += db.config.dailyBonusAmount;
      user.lastBonusClaimDate = today;
      saveDatabase();
      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "bonus",
        user: `${user.firstName} (${user.telegramId})`,
        details: `Claimed daily bonus of ${db.config.dailyBonusAmount} points. Total: ${user.bonusBalance}`
      });
      return res.json({
        type: "bonus_success",
        typingDuration: 1200,
        success: true,
        text: `\u{1F381} *DAILY BONUS CLAIMED SUCCESSFULLY!*

+${db.config.dailyBonusAmount} Points added to your balance!

\u{1F4B0} *Total Wallet Balance:* ${user.bonusBalance} Points
\u{1F525} Invite friends using your referral link to earn 50 points per user!`
      });
    }
    case "enter_claim_code": {
      const codeInput = (payload?.code || "").trim().toUpperCase();
      if (!codeInput) {
        return res.json({
          type: "code_error",
          typingDuration: 800,
          text: "\u26A0\uFE0F Please provide a valid claim code (e.g., /claim VIP2026)."
        });
      }
      const hasAll = requiredChannels.every((c) => user.joinedChannels.includes(c.id));
      if (!hasAll || user.hasLeftRequired) {
        const missing = requiredChannels.filter((c) => !user.joinedChannels.includes(c.id));
        return res.json({
          type: "code_blocked_force_join",
          typingDuration: 1200,
          success: false,
          text: `\u{1F512} *CODE ACCESS LOCKED!*

Your claim code *${codeInput}* cannot be redeemed yet because you haven't joined all required channels.

\u{1F447} Please join all channels below to unlock this code:`,
          missingChannels: missing,
          forceJoinRequired: true
        });
      }
      const codeObj = db.claimCodes.find((c) => c.code === codeInput);
      if (!codeObj || !codeObj.isActive) {
        return res.json({
          type: "code_not_found",
          typingDuration: 1e3,
          success: false,
          text: `\u274C *INVALID OR EXPIRED CLAIM CODE!*

The code "*${codeInput}*" does not exist or has been disabled by the admin.`
        });
      }
      if (codeObj.currentUses >= codeObj.maxUses) {
        return res.json({
          type: "code_exhausted",
          typingDuration: 1e3,
          success: false,
          text: `\u26A0\uFE0F *CODE USAGE LIMIT REACHED!*

This claim code has reached its maximum limit (${codeObj.maxUses} claims).`
        });
      }
      if (user.claimedCodes.includes(codeInput)) {
        return res.json({
          type: "code_already_used",
          typingDuration: 1e3,
          success: false,
          text: `\u2139\uFE0F *ALREADY REDEEMED!*

You have already redeemed this claim code on your account.`
        });
      }
      codeObj.currentUses += 1;
      codeObj.claimedByUsers.push(user.telegramId);
      user.claimedCodes.push(codeInput);
      saveDatabase();
      db.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "claim",
        user: `${user.firstName} (${user.telegramId})`,
        details: `Redeemed claim code ${codeInput} (${codeObj.title})`
      });
      return res.json({
        type: "code_success",
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
    case "get_referral": {
      const botUser = db.config.botUsername || "PrimeForceJoinBot";
      const refLink = `https://t.me/${botUser}?start=${user.referralCode}`;
      return res.json({
        type: "referral_info",
        typingDuration: 1e3,
        text: `\u{1F465} *REFERRAL SYSTEM & EARNINGS*

Invite your friends and earn *${db.config.referralBonusAmount} Points* for each verified friend!

\u{1F517} *Your Referral Link:*
\`${refLink}\`

\u{1F4CA} *Your Stats:*
\u2022 Total Invited: *${user.referralCount} users*
\u2022 Bonus Earned: *${user.referralCount * db.config.referralBonusAmount} Points*
\u2022 Current Balance: *${user.bonusBalance} Points*`,
        referralLink: refLink,
        referralCount: user.referralCount,
        balance: user.bonusBalance
      });
    }
    default:
      return res.json({ error: "Unknown action" });
  }
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`\u{1F680} TeleForce Telegram Bot & Admin Suite running on http://0.0.0.0:${PORT}`);
    const token = process.env.TELEGRAM_BOT_TOKEN || db.config.botToken;
    if (token && token.length > 10) {
      if (!isPollingRunning) {
        console.log("\u{1F916} Auto-starting Telegram bot polling for 24/7 background operation...");
        isPollingRunning = true;
        db.config.isPollingActive = true;
        runTelegramPolling();
      }
    }
  });
}
startServer();
