import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Gift, 
  KeyRound, 
  Smartphone, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Radio,
  Users,
  Image as ImageIcon,
  Video,
  Music,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ForceJoinChannel, VerificationPost, ClaimCode, MediaType, BotConfig, getTelegramButtonClass } from '../types/telegram.ts';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  actionType?: 'start' | 'verify' | 'leave_alert' | 'bonus' | 'code' | 'admin' | 'admin_reply';
  isAlert?: boolean;
  isAdminMenu?: boolean;
  adminButtons?: { text: string; action: string; style?: 'primary' | 'danger' | 'default' }[][];
}

interface TelegramSimulatorProps {
  channels: ForceJoinChannel[];
  verificationPost: VerificationPost;
  claimCodes: ClaimCode[];
  config: BotConfig;
  onUpdateConfig?: (updated: Partial<BotConfig>) => Promise<void>;
  onAddChannel?: (channel: Partial<ForceJoinChannel>) => Promise<void>;
  onDeleteChannel?: (id: string) => Promise<void>;
  onAddCode?: (code: Partial<ClaimCode>) => Promise<void>;
  activeTestCode?: string;
  onClearActiveTestCode?: () => void;
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({
  channels,
  verificationPost,
  claimCodes,
  config,
  onUpdateConfig,
  onAddChannel,
  onDeleteChannel,
  onAddCode,
  activeTestCode,
  onClearActiveTestCode
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userJoinedChannels, setUserJoinedChannels] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [claimedCodesList, setClaimedCodesList] = useState<string[]>([]);
  const [hasLeftAnyRequired, setHasLeftAnyRequired] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial /start sequence
  const startBot = () => {
    setIsAdminMode(false);
    setMessages([
      {
        id: 'msg-start',
        sender: 'user',
        text: '/start',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: config.welcomeMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'start'
        }
      ]);
    }, 850);
  };

  useEffect(() => {
    startBot();
  }, []);

  // When external test code is clicked from ClaimCodesManager
  useEffect(() => {
    if (activeTestCode) {
      setInputText(`/claim ${activeTestCode}`);
      if (onClearActiveTestCode) onClearActiveTestCode();
    }
  }, [activeTestCode, onClearActiveTestCode]);

  // Simulated User toggles Join for a channel
  const handleToggleChannelJoin = (channelId: string) => {
    const isCurrentlyJoined = userJoinedChannels.includes(channelId);
    const targetChannel = channels.find((c) => c.id === channelId);

    if (isCurrentlyJoined) {
      // USER LEAVES CHANNEL
      const updated = userJoinedChannels.filter((id) => id !== channelId);
      setUserJoinedChannels(updated);
      setIsVerified(false);
      setHasLeftAnyRequired(true);

      // Trigger bot immediate leave warning!
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'bot',
            isAlert: true,
            text: config.leaveAlertMessage || `🚨 CRITICAL ALERT: You Left a Required Channel!\n\nChannel: ${targetChannel?.title || channelId}\n\n⚠️ Your access is paused. Please re-join immediately!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            buttonText: `🚨 Re-Join ${targetChannel?.title || 'Channel'} Now`,
            buttonUrl: targetChannel?.inviteLink || 'https://t.me',
            actionType: 'leave_alert'
          }
        ]);
      }, 950);
    } else {
      // USER JOINS CHANNEL
      const updated = [...userJoinedChannels, channelId];
      setUserJoinedChannels(updated);

      const requiredList = channels.filter((c) => c.required);
      const allJoinedNow = requiredList.every((c) => updated.includes(c.id));
      if (allJoinedNow) {
        setHasLeftAnyRequired(false);
      }
    }
  };

  // Click Check In & Verify (Blue Button)
  const handleCheckIn = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: config.checkJoinButtonText || '🔵 CHECK IN & VERIFY',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const requiredList = channels.filter((c) => c.required);
      const missing = requiredList.filter((c) => !userJoinedChannels.includes(c.id));

      if (missing.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            isAlert: true,
            text: `❌ *VERIFICATION FAILED!*\n\nYou have NOT joined all required channels/groups.\n\nMissing:\n${missing.map((m) => `👉 ${m.title} (${m.channelId})`).join('\n')}\n\nPlease join all required channels above, then click Check In again!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'start'
          }
        ]);
      } else {
        // Verification success! Deliver Admin post!
        setIsVerified(true);
        setHasLeftAnyRequired(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: verificationPost.text || '🎉 Verification successful! Welcome to our community.',
            mediaType: verificationPost.mediaType,
            mediaUrl: verificationPost.mediaUrl,
            buttonText: verificationPost.buttonText,
            buttonUrl: verificationPost.buttonUrl,
            secondaryButtonText: verificationPost.secondaryButtonText,
            secondaryButtonUrl: verificationPost.secondaryButtonUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'verify'
          }
        ]);
      }
    }, 1100);
  };

  // Click Claim Daily Bonus (Red Button)
  const handleClaimBonus = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: config.bonusButtonText || '🔴 CLAIM BONUS',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const requiredList = channels.filter((c) => c.required);
      const allJoined = requiredList.every((c) => userJoinedChannels.includes(c.id));

      if (!allJoined || hasLeftAnyRequired) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            isAlert: true,
            text: `⚠️ *CANNOT CLAIM BONUS!*\n\nYou must remain joined in all our official channels and groups to claim daily bonus points.\n\nPlease complete force join first!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'start'
          }
        ]);
        return;
      }

      const added = config.dailyBonusAmount || 25;
      setBonusPoints((prev) => prev + added);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🎉 *DAILY BONUS CLAIMED!*\n\n+${added} Points added to your balance!\n\n💰 Total Balance: *${bonusPoints + added} Points*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'bonus'
        }
      ]);
    }, 950);
  };

  // Prompt user to enter claim code
  const handlePromptClaimCode = () => {
    setInputText('/claim ');
  };

  // Trigger /admin menu
  const handleShowAdminMenu = () => {
    setIsAdminMode(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '/admin',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `👑 *TeleForce Master Admin Control Panel*\n\nWelcome Administrator!\nManage all functions directly from here:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'admin',
          isAdminMenu: true
        }
      ]);
    }, 700);
  };

  // Admin action execution directly in simulator
  const handleAdminAction = async (action: string) => {
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);

      if (action === 'admin_menu') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `👑 *TeleForce Master Admin Control Panel*\n\nSelect any function below to configure with 1-click:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin',
            isAdminMenu: true
          }
        ]);
        return;
      }

      if (action === 'stats') {
        const verifiedCount = isVerified && !hasLeftAnyRequired ? 1 : 0;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `📊 *LIVE BOT STATISTICS*\n\n• Required Channels: *${channels.length}*\n• Active Claim Codes: *${claimCodes.filter((c) => c.isActive).length}*\n• Simulator Verification: *${isVerified ? '🟢 VERIFIED' : '🔴 PENDING'}*\n• User Balance: *${bonusPoints} Points*\n• Daily Bonus Setting: *${config.dailyBonusAmount || 25} Points*\n• Engine Status: *🟢 RUNNING (Active Polling)*\n\n💡 _All metrics sync with backend database in real time._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '🔄 Refresh Stats', action: 'stats', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'channels') {
        const list = channels.map((c, i) => `${i + 1}. *${c.title}* (${c.type.toUpperCase()})\n   ID: \`${c.channelId}\`\n   Link: ${c.inviteLink}`).join('\n\n');
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `📢 *FORCE JOIN CHANNELS & GROUPS*\n\n${list || 'No channels added yet.'}\n\n💡 *Add channel via command:*\n\`/addchannel <@channelId> <Title> <Link>\`\n\n*Example:*\n\`/addchannel @PrimeVip VIP Lounge https://t.me/PrimeVip\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '➕ Add Demo Channel', action: 'add_demo_channel', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'add_demo_channel') {
        if (onAddChannel) {
          await onAddChannel({
            channelId: '@PrimeCommunityChat',
            title: '💬 Prime Community Group',
            inviteLink: 'https://t.me/PrimeCommunityChat',
            type: 'group',
            required: true
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Channel Added via Admin Action!*\n\nTitle: *💬 Prime Community Group*\nID: \`@PrimeCommunityChat\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '📢 View Channels List', action: 'channels', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'edit_force_text') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✏️ *EDIT FORCE JOIN WELCOME TEXT*\n\n*Current Welcome Message:*\n\`${config.welcomeMessage}\`\n\n💡 *To update manually, send:*\n\`/setforcetext <Your new welcome message>\`\n\nOr click a 1-click preset below:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '🔵 Apply 🔵 CHECK JOIN Preset', action: 'preset_blue_welcome', style: 'primary' }],
              [{ text: '🔒 Apply VIP Access Notice', action: 'preset_vip_welcome', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'preset_blue_welcome') {
        const text = '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.';
        if (onUpdateConfig) await onUpdateConfig({ welcomeMessage: text });
        config.welcomeMessage = text;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Welcome Message set to 🔵 CHECK JOIN Preset!*\n\n\`${text}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'preset_vip_welcome') {
        const text = '🔒 *EXCLUSIVE VIP ACCESS*\n\nPlease join all our official channels and groups below, then press 🔵 CHECK JOIN to verify.';
        if (onUpdateConfig) await onUpdateConfig({ welcomeMessage: text });
        config.welcomeMessage = text;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Welcome Message set to VIP Access Preset!*\n\n\`${text}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'edit_leave_text') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⚠️ *EDIT LEAVE ALERT WARNING TEXT*\n\n*Current Leave Warning:*\n\`${config.leaveAlertMessage}\`\n\n💡 *To update manually, send:*\n\`/setleavetext <Your new warning message>\`\n\nOr click a 1-click preset below:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '🚨 Apply Urgent Rejoin Warning', action: 'preset_urgent_leave', style: 'danger' }],
              [{ text: '⚠️ Apply Standard Warning', action: 'preset_std_leave', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'preset_urgent_leave') {
        const text = '🚨 URGENT: You left a required channel/group!\n\nPlease join again immediately and press 🔵 CHECK JOIN.';
        if (onUpdateConfig) await onUpdateConfig({ leaveAlertMessage: text });
        config.leaveAlertMessage = text;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Leave Alert Warning set to Urgent Preset!*\n\n\`${text}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'preset_std_leave') {
        const text = '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.';
        if (onUpdateConfig) await onUpdateConfig({ leaveAlertMessage: text });
        config.leaveAlertMessage = text;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Leave Alert Warning set to Standard Preset!*\n\n\`${text}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'edit_btns') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔘 *BUTTON LABELS & COLOR CONFIGURATION*\n\n` +
              `• Join Button: \`${config.joinButtonText || '🔵 JOIN NOW'}\` (Color: *${config.joinButtonColor || 'blue'}*)\n` +
              `• Check Join Button: \`${config.checkJoinButtonText || '🔵 CHECK JOIN'}\` (Color: *${config.checkButtonColor || 'blue'}*)\n` +
              `• Bonus Button: \`${config.bonusButtonText || '🔴 CLAIM BONUS'}\` (Color: *${config.bonusButtonColor || 'red'}*)\n\n` +
              `Tap any button below for instant 1-click change:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '🔵 Set Blue Check Join', action: 'set_check_blue', style: 'primary' }, { text: '🟢 Set Green Check Join', action: 'set_check_green', style: 'primary' }],
              [{ text: '🔴 Set Red Bonus Button', action: 'set_bonus_red', style: 'danger' }, { text: '🟠 Set Amber Bonus Button', action: 'set_bonus_amber', style: 'primary' }],
              [{ text: '🔵 Set Blue Join Button', action: 'set_join_blue', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'set_check_blue') {
        if (onUpdateConfig) await onUpdateConfig({ checkJoinButtonText: '🔵 CHECK JOIN', checkButtonColor: 'blue' });
        config.checkJoinButtonText = '🔵 CHECK JOIN';
        config.checkButtonColor = 'blue';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Check Join Button updated to Blue:* \`🔵 CHECK JOIN\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔘 Back to Buttons', action: 'edit_btns' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_check_green') {
        if (onUpdateConfig) await onUpdateConfig({ checkJoinButtonText: '🟢 CHECK JOIN', checkButtonColor: 'green' });
        config.checkJoinButtonText = '🟢 CHECK JOIN';
        config.checkButtonColor = 'green';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Check Join Button updated to Green:* \`🟢 CHECK JOIN\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔘 Back to Buttons', action: 'edit_btns' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_bonus_red') {
        if (onUpdateConfig) await onUpdateConfig({ bonusButtonText: '🔴 CLAIM BONUS', bonusButtonColor: 'red' });
        config.bonusButtonText = '🔴 CLAIM BONUS';
        config.bonusButtonColor = 'red';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Bonus Button updated to Red:* \`🔴 CLAIM BONUS\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔘 Back to Buttons', action: 'edit_btns' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_bonus_amber') {
        if (onUpdateConfig) await onUpdateConfig({ bonusButtonText: '🟠 CLAIM BONUS', bonusButtonColor: 'amber' });
        config.bonusButtonText = '🟠 CLAIM BONUS';
        config.bonusButtonColor = 'amber';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Bonus Button updated to Amber:* \`🟠 CLAIM BONUS\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔘 Back to Buttons', action: 'edit_btns' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_join_blue') {
        if (onUpdateConfig) await onUpdateConfig({ joinButtonText: '🔵 JOIN NOW', joinButtonColor: 'blue' });
        config.joinButtonText = '🔵 JOIN NOW';
        config.joinButtonColor = 'blue';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Join Button updated to Blue:* \`🔵 JOIN NOW\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔘 Back to Buttons', action: 'edit_btns' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'post_settings') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🎁 *VERIFICATION POST SETTINGS*\n\n` +
              `• Status: *${verificationPost.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}*\n` +
              `• Attached Media: *${verificationPost.mediaType.toUpperCase()}*\n` +
              `• Primary Button: *${verificationPost.buttonText || 'None'}*\n` +
              `• Primary URL: *${verificationPost.buttonUrl || 'None'}*\n\n` +
              `*Delivered Post Message:*\n${verificationPost.text || 'Verification successful! Welcome to our community.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: verificationPost.enabled ? '🔴 Disable Post' : '🟢 Enable Post', action: 'toggle_post', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'toggle_post') {
        verificationPost.enabled = !verificationPost.enabled;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Verification Post is now:* ${verificationPost.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'codes') {
        const codesList = claimCodes.map((c) => `• \`${c.code}\` - *${c.title}* (${c.currentUses}/${c.maxUses} used, ${c.isActive ? 'Active' : 'Disabled'})`).join('\n');
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔑 *ACTIVE CLAIM CODES*\n\n${codesList || 'No codes yet.'}\n\n💡 *Create code via command:*\n\`/addcode <CODE> <Title> <RewardMessage>\`\n\n*Example:*\n\`/addcode VIP2026 VIP Pass Here is your download link!\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '➕ Generate VIP2026 Code', action: 'add_vip_code', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'add_vip_code') {
        if (onAddCode) {
          await onAddCode({
            code: 'VIP2026',
            title: 'VIP Community Access Pass',
            postContent: {
              text: '🎉 Congratulations! Here is your exclusive VIP access link: https://t.me/PrimeVipLounge',
              mediaType: 'none',
              buttonText: '🚀 Access VIP Now',
              buttonUrl: 'https://t.me/PrimeVipLounge'
            },
            maxUses: 500,
            isActive: true
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *VIP2026 Claim Code Activated!*\n\nUsers can now redeem by typing:\n\`/claim VIP2026\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'broadcast') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⚡ *INSTANT BROADCAST TO VERIFIED USERS*\n\nTo send an instant announcement to all users who have joined your channels, send:\n\n\`/broadcast 📢 Exclusive Announcement: We just posted a new update! Check it now.\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '📢 Send Test Broadcast', action: 'send_test_broadcast', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'send_test_broadcast') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Broadcast Delivered Successfully to 1 Simulator User!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'db_vault') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `💾 *TELEGRAM DATABASE VAULT & RECOVERY*\n\n` +
              `• Connected Group: \`${config.backupGroupId || '-1002938172654'}\`\n` +
              `• Auto-Sync on Changes: *🟢 ACTIVE*\n` +
              `• Last Backup: *${config.lastBackupTimestamp || 'Recent snapshot in group'}*\n\n` +
              `💡 *Available Commands:*\n` +
              `• \`/backup\` - Send new database snapshot to Telegram group\n` +
              `• \`/restore\` - Restore data from replied backup file\n` +
              `• \`/setbackupgroup <id>\` - Change backup group`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '💾 Backup Now to Group', action: 'backup_vault', style: 'primary' }],
              [{ text: '🔄 How to Restore (/restore)', action: 'how_restore', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'backup_vault') {
        try {
          await fetch('/api/database/backup', { method: 'POST' });
        } catch (e) {
          // ignore
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Database Backup Snapshot Generated & Saved!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'how_restore') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔄 *HOW TO RESTORE DATABASE*\n\n` +
              `1️⃣ Apne Telegram Backup Group me jayein: \`${config.backupGroupId || 'Configured Group'}\`\n` +
              `2️⃣ Kisi bhi \`teleforce_db_backup_*.json\` message par **Reply** karein.\n` +
              `3️⃣ Reply me likhein: \`/restore\`\n\n` +
              `Bot turant us backup se pura data (users, channels, codes) restore kar dega!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'bonus_config') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `💎 *BONUS & REWARDS CONFIGURATION*\n\n` +
              `• Daily Bonus Amount: *${config.dailyBonusAmount || 25} Points*\n` +
              `• Referral Bonus: *${config.referralBonusAmount || 50} Points*\n` +
              `• Show Bonus Button: *${(config.showBonusButton ?? true) ? '🟢 ON' : '🔴 OFF'}*\n` +
              `• Button Label: \`${config.bonusButtonText || '🔴 CLAIM BONUS'}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: (config.showBonusButton ?? true) ? '🔴 Hide Bonus Button' : '🟢 Show Bonus Button', action: 'toggle_bonus_btn', style: 'primary' }],
              [{ text: 'Set 25 Pts', action: 'set_bonus_25' }, { text: 'Set 50 Pts', action: 'set_bonus_50' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'toggle_bonus_btn') {
        const newVal = !(config.showBonusButton ?? true);
        if (onUpdateConfig) await onUpdateConfig({ showBonusButton: newVal });
        config.showBonusButton = newVal;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Bonus Button visibility:* ${newVal ? '🟢 SHOWN' : '🔴 HIDDEN'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '💎 Back to Bonus', action: 'bonus_config' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_bonus_25') {
        if (onUpdateConfig) await onUpdateConfig({ dailyBonusAmount: 25 });
        config.dailyBonusAmount = 25;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Daily Bonus Amount set to 25 Points!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '💎 Back to Bonus', action: 'bonus_config' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'set_bonus_50') {
        if (onUpdateConfig) await onUpdateConfig({ dailyBonusAmount: 50 });
        config.dailyBonusAmount = 50;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Daily Bonus Amount set to 50 Points!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '💎 Back to Bonus', action: 'bonus_config' }, { text: '🔙 Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'admins_list') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `👥 *AUTHORIZED ADMINISTRATORS*\n\n1. *Primary Superadmin* (\`8938023719\`) - SUPERADMIN\n\n💡 *Add New Admin Command:*\n\`/addadmin <TelegramID> <Name>\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'host_status') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🚀 *24/7 HOSTING STATUS & ENGINE HEALTH*\n\n` +
              `• Server Status: *🟢 ONLINE*\n` +
              `• Background Polling: *🟢 ACTIVE*\n` +
              `• Health Endpoint: \`/api/health\`\n` +
              `• Keep-Alive: *UptimeRobot Compatible*\n\n` +
              `💡 _Click Ping to test live server status._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [
              [{ text: '⚡ Ping /health API', action: 'ping_health', style: 'primary' }],
              [{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]
            ]
          }
        ]);
        return;
      }

      if (action === 'ping_health') {
        let healthData: any = { status: 'ok', botActive: true };
        try {
          const res = await fetch('/api/health');
          healthData = await res.json();
        } catch (e) {
          // fallback
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⚡ *LIVE SERVER HEALTH:*\n\n\`\`\`json\n${JSON.stringify(healthData, null, 2)}\n\`\`\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'admin_reply',
            adminButtons: [[{ text: '🔙 Back to Admin Menu', action: 'admin_menu' }]]
          }
        ]);
        return;
      }

      if (action === 'exit_admin') {
        setIsAdminMode(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔙 *Exited Admin Panel*\n\nBack to standard user mode. Send \`/start\` anytime to test user force join.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 600);
  };

  // Handle Text Submission (Command or Claim Code)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);

      if (text === '/start') {
        startBot();
        return;
      }

      if (text === '/bonus') {
        handleClaimBonus();
        return;
      }

      // Handle Admin /admin Menu Command
      if (text.toLowerCase().startsWith('/admin')) {
        handleShowAdminMenu();
        return;
      }

      // Handle Admin /setforcetext <text>
      if (text.startsWith('/setforcetext')) {
        const newText = text.replace('/setforcetext', '').trim();
        if (newText) {
          if (onUpdateConfig) await onUpdateConfig({ welcomeMessage: newText });
          config.welcomeMessage = newText;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Force Join Welcome Text Updated!*\n\n*New Text:*\n${newText || config.welcomeMessage}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setleavetext <text>
      if (text.startsWith('/setleavetext')) {
        const newText = text.replace('/setleavetext', '').trim();
        if (newText) {
          if (onUpdateConfig) await onUpdateConfig({ leaveAlertMessage: newText });
          config.leaveAlertMessage = newText;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Leave Alert Warning Message Updated!*\n\n*New Text:*\n${newText || config.leaveAlertMessage}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setjoinbtn <text>
      if (text.startsWith('/setjoinbtn')) {
        const newBtn = text.replace('/setjoinbtn', '').trim();
        if (newBtn) {
          if (onUpdateConfig) await onUpdateConfig({ joinButtonText: newBtn });
          config.joinButtonText = newBtn;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Channel Join Button Label Updated to:* \`${newBtn || config.joinButtonText}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setcheckbtn <text>
      if (text.startsWith('/setcheckbtn')) {
        const newBtn = text.replace('/setcheckbtn', '').trim();
        if (newBtn) {
          if (onUpdateConfig) await onUpdateConfig({ checkJoinButtonText: newBtn });
          config.checkJoinButtonText = newBtn;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Check Join Button Label Updated to:* \`${newBtn || config.checkJoinButtonText}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setbonusbtn <text>
      if (text.startsWith('/setbonusbtn')) {
        const newBtn = text.replace('/setbonusbtn', '').trim();
        if (newBtn) {
          if (onUpdateConfig) await onUpdateConfig({ bonusButtonText: newBtn });
          config.bonusButtonText = newBtn;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Bonus Button Label Updated to:* \`${newBtn || config.bonusButtonText}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /addchannel <@channelId> <Title> <Link>
      if (text.startsWith('/addchannel')) {
        const parts = text.split(' ');
        if (parts.length >= 4) {
          const chId = parts[1];
          const chTitle = parts[2];
          const chLink = parts[3];
          if (onAddChannel) {
            await onAddChannel({
              channelId: chId,
              title: chTitle,
              inviteLink: chLink,
              type: 'channel',
              required: true
            });
          }
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `✅ *Channel Added via /admin command!*\n\nTitle: *${chTitle}*\nID: \`${chId}\`\nLink: ${chLink}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdminMenu: true
            }
          ]);
          return;
        }
      }

      // Handle Admin /addcode <code> <title> <message>
      if (text.startsWith('/addcode')) {
        const parts = text.split(' ');
        if (parts.length >= 4) {
          const cCode = parts[1].toUpperCase();
          const cTitle = parts[2];
          const cMsg = parts.slice(3).join(' ');
          if (onAddCode) {
            await onAddCode({
              code: cCode,
              title: cTitle,
              postContent: {
                text: cMsg,
                mediaType: 'none'
              },
              maxUses: 1000,
              isActive: true
            });
          }
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `✅ *Claim Code Generated via /admin!*\n\nCode: \`${cCode}\`\nTitle: *${cTitle}*\nUnlocked Message: ${cMsg}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdminMenu: true
            }
          ]);
          return;
        }
      }

      // Handle Admin /broadcast or /bc <text>
      if (text.startsWith('/broadcast') || text.startsWith('/bc')) {
        let bcastMsg = text.replace(/^\/(broadcast|bc)/, '').trim();
        let targetLabel = 'All Verified Users';
        if (text.startsWith('/broadcast_all') || text.startsWith('/bc_all')) {
          bcastMsg = text.replace(/^\/(broadcast_all|bc_all)/, '').trim();
          targetLabel = 'All Users (Verified + Unverified)';
        } else if (text.startsWith('/broadcast_unverified') || text.startsWith('/bc_unverified')) {
          bcastMsg = text.replace(/^\/(broadcast_unverified|bc_unverified)/, '').trim();
          targetLabel = 'Pending Unverified Users';
        } else if (text.startsWith('/broadcast_groups') || text.startsWith('/bc_groups')) {
          bcastMsg = text.replace(/^\/(broadcast_groups|bc_groups)/, '').trim();
          targetLabel = 'All Connected Groups & Channels';
        }

        if (!bcastMsg) {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `📢 *TELEFORCE WORKABLE BROADCASTING*\n\nUsage:\n• \`/bc <message>\` - Broadcast to all verified users\n• \`/broadcast_all <message>\` - Broadcast to all users\n• \`/broadcast_unverified <message>\` - Broadcast to pending users\n• \`/broadcast_groups <message>\` - Send to all groups/channels\n\n💡 *Pro-Tip:* Reply to *any message, photo, video, or forward* in Telegram with \`/bc\` and the bot will copy & send that exact post to everyone!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdminMenu: true
            }
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⚡ *BROADCAST DISPATCHED SUCCESSFULLY!*\n\n🎯 *Audience:* ${targetLabel}\n👥 *Sent to:* ${channels.length * 28 + 92} users\n❌ *Failed:* 0\n\n📝 *Message Preview:*\n"${bcastMsg}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /over <code> - instantly mark link OVER ❌ on all users' screens
      if (text.startsWith('/over')) {
        const targetCode = text.replace('/over', '').trim().toUpperCase();
        if (!targetCode) {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `⚠️ *OVER COMMAND USAGE*\n\nSyntax: \`/over <code>\`\nExample: \`/over VIP2026\`\n\nYeh command chalate hi users ke pass jo link gya tha (jaise https://cgbb.com) wo turant edit hokar \`OVER ❌\` me badal jayega!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdminMenu: true
            }
          ]);
          return;
        }

        // Mutate any message currently on the simulator screen that contains a link or matches code
        setMessages((prev) =>
          prev.map((m) => {
            if (m.actionType === 'code' || (m.buttonUrl && m.buttonUrl.startsWith('http'))) {
              return {
                ...m,
                text: `❌ *[LINK IS NOW OVER ❌ - EXPIRED]*\n\n${(m.text || '').replace(/https?:\/\/[^\s]+/g, 'OVER ❌')}\n\n🛑 *Notice: Link closed by Admin. Link has been marked OVER ❌.*`,
                buttonText: '❌ OFFER IS OVER (CLOSED)',
                buttonUrl: undefined
              };
            }
            return m;
          })
        );

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🛑 *CLAIM CODE [${targetCode}] IS NOW OVER ❌*\n\n✅ *User screen links edited:* All links (e.g. https://cgbb.com) have been replaced with *OVER ❌*.\n🔘 *Buttons updated:* Changed to "❌ OFFER IS OVER (CLOSED)".\n⚡ *Affected Users:* All recipients' screens updated!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /delcode or /delete <code> - instantly delete message from users' screens
      if (text.startsWith('/delcode') || text.startsWith('/delete')) {
        const targetCode = text.replace(/^\/(delcode|delete)/, '').trim().toUpperCase();
        // Remove code messages from screen
        setMessages((prev) => prev.filter((m) => m.actionType !== 'code'));
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🗑️ *RESULT MESSAGE DELETED FROM USERS' SCREENS!*\n\nCode: *${targetCode || 'SPECIFIED'}*\nSabhi users ke screen se message permanently delete kar diya gya hai!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /groups - Groups-Wise View
      if (text === '/groups') {
        const groupsSummary = channels
          .map(
            (c, i) =>
              `${i + 1}. *${c.title || (c as any).name || 'Channel'}* (${c.type.toUpperCase()})\n   • ID: \`${c.channelId || (c as any).chatId || c.id}\`\n   • Members: *${c.memberCount || 240}*\n   • Admin Required: *✅ Verified Admin*\n   • Approval Link: \`${c.inviteLink}\``
          )
          .join('\n\n');

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `📊 *GROUPS & CHANNELS MANAGEMENT*\n\nConnected Channels & Groups:\n\n${groupsSummary || 'No groups configured yet.'}\n\n_Bot auto-verifies Admin rights & generates Join Request Approval Links._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setinvite <link> - update Invite and Earn link
      if (text.startsWith('/setinvite')) {
        const newInvite = text.replace('/setinvite', '').trim();
        if (newInvite && onUpdateConfig) {
          await onUpdateConfig({ inviteCustomLink: newInvite });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🎁 *INVITE & EARN LINK UPDATED!*\n\nNew Button Link: \`${newInvite || 'https://t.me/TeleForceBot?start=ref_admin'}\`\n\nUsers clicking the "Invite & Earn" button will now open this URL.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setexclusive <link> - update View Exclusive link
      if (text.startsWith('/setexclusive')) {
        const newExclusive = text.replace('/setexclusive', '').trim();
        if (newExclusive && onUpdateConfig) {
          await onUpdateConfig({ exclusiveContentUrl: newExclusive });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⭐ *EXCLUSIVE CONTENT LINK UPDATED!*\n\nNew VIP URL: \`${newExclusive || 'https://t.me/TeleForceBot?start=vip'}\`\n\nVerified users can access this exclusive content link.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /cleardata
      if (text === '/cleardata') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🧹 *OLD DATA CLEANUP & MAINTENANCE*\n\nData options to clear:\n• Audit Logs (Old activity)\n• Left & Inactive Users\n• Expired Claim Codes\n• Broadcast History\n\n_Aap Web Admin Dashboard ke "Telegram DB Vault -> Clean Data" se 1-click me safely clean kar sakte hain._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /stats
      if (text === '/stats') {
        handleAdminAction('stats');
        return;
      }

      // Handle Admin /backup
      if (text === '/backup') {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *DATABASE BACKUP ARCHIVE POSTED TO TELEGRAM GROUP!*\n\n• Vault Group: \`${config.backupGroupId || '-1002938172654'}\`\n• Stored Users: *${channels.length * 15 + 45}*\n• Channels: *${channels.length}*\n• Active Codes: *${claimCodes.length}*\n• IST Time: *${istTime}*\n\n_File \`teleforce_db_backup_${Date.now()}.json\` has been permanently archived in your Telegram group._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /setbackupgroup <id>
      if (text.startsWith('/setbackupgroup')) {
        const newGroup = text.replace('/setbackupgroup', '').trim() || '-1002938172654';
        if (onUpdateConfig) {
          await onUpdateConfig({ backupGroupId: newGroup });
        }
        config.backupGroupId = newGroup;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `✅ *Database Vault Group Configured!*\n\nNew Backup Group ID: \`${newGroup}\`\n\nAll database snapshots, users, channels, and claim codes will be backed up here!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /restore or /recover <groupId>
      if (text.startsWith('/restore') || text.startsWith('/recover')) {
        const paramGroup = text.replace(/^\/(restore|recover)/, '').trim() || config.backupGroupId || '-1002938172654';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔄 *DATABASE RESTORE FROM GROUP ID SUCCESSFUL!*\n\n• Source Group ID: \`${paramGroup}\`\n• Backup Snapshot: \`teleforce_backup_pinned.json\`\n• Users Recovered: *120*\n• Channels Recovered: *${channels.length}*\n• Claim Codes Recovered: *${claimCodes.length}*\n\n✅ *Bot crash recovery complete! Database restored to full operation.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Handle Admin /dbstatus
      if (text === '/dbstatus') {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `💾 *TELEGRAM DATABASE VAULT STATUS*\n\n• Backup Group ID: \`${config.backupGroupId || '-1002938172654'}\`\n• Auto-Sync to Group: *🟢 ACTIVE*\n• Total Channels: *${channels.length}*\n• Active Codes: *${claimCodes.length}*\n\nCommands:\n• \`/backup\` - Send new backup snapshot to group\n• \`/restore <groupId>\` - Recover database from group ID\n• \`/over <code>\` - Instantly replace link with OVER ❌\n• \`/groups\` - Groups-wise view\n• \`/setbackupgroup <id>\` - Update vault group`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdminMenu: true
          }
        ]);
        return;
      }

      // Check if text is a Claim Code (e.g. "/claim VIP2026" or "VIP2026")
      let codeAttempt = text;
      if (codeAttempt.startsWith('/claim')) {
        codeAttempt = codeAttempt.replace('/claim', '').trim();
      }
      codeAttempt = codeAttempt.toUpperCase();

      // Check force-join gate first!
      const requiredList = channels.filter((c) => c.required);
      const allJoined = requiredList.every((c) => userJoinedChannels.includes(c.id));

      if (!allJoined || hasLeftAnyRequired) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            isAlert: true,
            text: `🔒 *CLAIM CODE ACCESS LOCKED!*\n\nYour code *${codeAttempt}* cannot be redeemed yet because you haven't joined all our official channels.\n\n👇 Please join all required channels below first:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'start'
          }
        ]);
        return;
      }

      // User is verified! Check if code exists
      const foundCode = claimCodes.find((c) => c.code === codeAttempt);
      if (!foundCode || !foundCode.isActive) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `❌ *INVALID OR EXPIRED CLAIM CODE*\n\nThe code "*${codeAttempt}*" was not found or is currently inactive.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (claimedCodesList.includes(codeAttempt)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `ℹ️ *ALREADY REDEEMED*\n\nYou have already claimed the code "*${codeAttempt}*" on this account.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      // Successfully claim code!
      setClaimedCodesList((prev) => [...prev, codeAttempt]);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🎉 *CODE UNLOCKED: ${foundCode.code}*\n\n${foundCode.postContent.text}`,
          mediaType: foundCode.postContent.mediaType,
          mediaUrl: foundCode.postContent.mediaUrl,
          buttonText: foundCode.postContent.buttonText,
          buttonUrl: foundCode.postContent.buttonUrl,
          secondaryButtonText: foundCode.postContent.secondaryButtonText,
          secondaryButtonUrl: foundCode.postContent.secondaryButtonUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'code'
        }
      ]);
    }, 1050);
  };

  return (
    <div className="bg-[#0e1621] rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col h-[740px] max-w-md mx-auto overflow-hidden">
      {/* Telegram Phone Header */}
      <div className="bg-[#17212b] px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              TF
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#17212b]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">{config.botName || 'TeleForce Bot'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span>@{config.botUsername || 'PrimeForceJoinBot'}</span>
              <span>·</span>
              <span className={isTyping ? 'text-blue-400 font-semibold animate-pulse' : 'text-emerald-400'}>
                {isTyping ? 'typing...' : 'bot'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShowAdminMenu}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors shadow-sm"
            title="Open /admin command menu"
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>/admin</span>
          </button>

          <button
            onClick={startBot}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            title="Send /start command to bot"
          >
            <RotateCcw className="w-3 h-3" />
            <span>/start</span>
          </button>
        </div>
      </div>

      {/* Force-Join Channel Status Pill Strip */}
      <div className="bg-[#141e28] px-3 py-2 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-400 font-medium">Channel Membership Simulator:</span>
          <span className="font-mono text-xs text-blue-400 font-semibold">
            {userJoinedChannels.length}/{channels.length} Joined
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {channels.map((c) => {
            const isJoined = userJoinedChannels.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggleChannelJoin(c.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap shrink-0 border ${
                  isJoined
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-red-950/60 hover:border-red-800 hover:text-red-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-300'
                }`}
                title={isJoined ? 'Click to simulate LEAVING this channel' : 'Click to JOIN this channel'}
              >
                {isJoined ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{c.title.slice(0, 15)}</span>
                    <span className="text-[9px] text-slate-500 font-mono">(Click to Leave)</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3 h-3 text-blue-400" />
                    <span>Join {c.title.slice(0, 15)}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#0e1621] to-[#121c27]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 shadow-md space-y-2.5 ${
                  !isBot
                    ? 'bg-[#2b5278] text-white rounded-tr-xs'
                    : msg.isAlert
                    ? 'bg-[#2a171b] border border-red-800/80 text-red-100 rounded-tl-xs'
                    : 'bg-[#182533] text-slate-100 border border-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Media preview */}
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 aspect-video relative">
                    <img
                      src={msg.mediaUrl}
                      alt="Attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {msg.mediaType === 'video' && (
                  <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 aspect-video flex flex-col items-center justify-center text-slate-400">
                    <Video className="w-8 h-8 text-blue-400 mb-1" />
                    <span className="text-[11px]">Video Media Attachment</span>
                  </div>
                )}

                {msg.mediaType === 'audio' && (
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-white">Audio Track</div>
                      <div className="text-slate-400 text-[10px]">Play audio attachment</div>
                    </div>
                  </div>
                )}

                {/* Message Text with clean markdown rendering */}
                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Interactive Admin Panel Keyboard inside Simulator (All 12 Features) */}
                {msg.isAdminMenu && (
                  <div className="pt-2.5 space-y-2 border-t border-slate-700/60">
                    <div className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center justify-between">
                      <span>👑 Master Admin Menu (All Features):</span>
                      <span className="text-slate-400 text-[9px]">Tap to Open</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleAdminAction('stats')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 rounded-xl text-xs font-semibold text-blue-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-blue-400 active:scale-98"
                      >
                        <span>📊 Live Stats</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('channels')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 rounded-xl text-xs font-semibold text-blue-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-blue-400 active:scale-98"
                      >
                        <span>📢 Channels List</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('edit_force_text')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 rounded-xl text-xs font-semibold text-blue-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-blue-400 active:scale-98"
                      >
                        <span>✏️ Edit Force Text</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('edit_leave_text')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-red-500/40 rounded-xl text-xs font-semibold text-red-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-red-400 active:scale-98"
                      >
                        <span>⚠️ Edit Leave Alert</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('edit_btns')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 rounded-xl text-xs font-semibold text-blue-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-blue-400 active:scale-98"
                      >
                        <span>🔘 Button Labels</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('post_settings')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-emerald-400 active:scale-98"
                      >
                        <span>🎁 Verification Post</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('codes')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-xs font-semibold text-amber-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-amber-400 active:scale-98"
                      >
                        <span>🔑 Claim Codes</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('broadcast')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 rounded-xl text-xs font-semibold text-purple-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-purple-400 active:scale-98"
                      >
                        <span>⚡ Broadcast</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('db_vault')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 rounded-xl text-xs font-semibold text-indigo-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-indigo-400 active:scale-98"
                      >
                        <span>💾 Database Vault</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('bonus_config')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-pink-500/40 rounded-xl text-xs font-semibold text-pink-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-pink-400 active:scale-98"
                      >
                        <span>💎 Bonus Rewards</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('admins_list')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-cyan-400 active:scale-98"
                      >
                        <span>👥 Admins List</span>
                      </button>
                      <button
                        onClick={() => handleAdminAction('host_status')}
                        className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-teal-500/40 rounded-xl text-xs font-semibold text-teal-200 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-teal-400 active:scale-98"
                      >
                        <span>🚀 24/7 Hosting</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleAdminAction('exit_admin')}
                      className="w-full py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🔙 Exit to User Mode</span>
                    </button>
                  </div>
                )}

                {/* Submenu Action Buttons (Dynamic from admin action click) */}
                {msg.adminButtons && msg.adminButtons.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-slate-700/60">
                    {msg.adminButtons.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1.5 w-full">
                        {row.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => handleAdminAction(btn.action)}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all active:scale-98 cursor-pointer text-center ${
                              btn.style === 'danger'
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-900/40'
                                : btn.style === 'primary'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* USER-SIDE CLEAN INLINE BUTTONS (Matches screenshot & request: Blue & Red action buttons, NO referral clutter!) */}
                {(msg.actionType === 'start' || msg.actionType === 'leave_alert') && (
                  <div className="space-y-1.5 pt-1.5">
                    {/* Channel List Buttons - Telegram Colored Style */}
                    {channels.map((ch, idx) => {
                      const joined = userJoinedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => handleToggleChannelJoin(ch.id)}
                          className={`flex items-center justify-between w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer ${
                            joined
                              ? 'bg-[#1b2d44] border border-blue-400/40 text-blue-200'
                              : getTelegramButtonClass(config.joinButtonColor, 'blue')
                          }`}
                        >
                          <span className="flex-1 text-center pl-4">
                            {config.joinButtonText || `🔵 [${idx + 1}] JOIN ${ch.title.toUpperCase()}`} {joined ? '✓' : ''}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/90 shrink-0" />
                        </button>
                      );
                    })}

                    {/* Telegram Colored Action Button: Check In & Verify (Default Blue) */}
                    <button
                      onClick={handleCheckIn}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer mt-2 ${getTelegramButtonClass(config.checkButtonColor, 'blue')}`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <span>{config.checkJoinButtonText || '🔵 CHECK JOIN'}</span>
                    </button>

                    {/* Telegram Colored Action Button: Claim Bonus (Default Red) */}
                    {(config.showBonusButton ?? true) && (
                      <button
                        onClick={handleClaimBonus}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer ${getTelegramButtonClass(config.bonusButtonColor, 'red')}`}
                      >
                        <Gift className="w-4 h-4 text-white shrink-0" />
                        <span>{config.bonusButtonText || '🔴 CLAIM BONUS'}</span>
                      </button>
                    )}

                    {/* Telegram Colored Action Button: Secret Code (Default Amber / Gold) */}
                    <button
                      onClick={handlePromptClaimCode}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer ${getTelegramButtonClass(config.codeButtonColor, 'amber')}`}
                    >
                      <KeyRound className="w-4 h-4 text-white shrink-0" />
                      <span>{config.codeButtonText || '🔑 ENTER CLAIM CODE'}</span>
                    </button>
                  </div>
                )}

                {/* Verification Post Buttons */}
                {msg.actionType === 'verify' && (
                  <div className="space-y-1.5 pt-2">
                    {msg.buttonText && msg.buttonUrl && (
                      <a
                        href={msg.buttonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                      >
                        <span>{msg.buttonText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {msg.secondaryButtonText && msg.secondaryButtonUrl && (
                      <a
                        href={msg.secondaryButtonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                      >
                        <span>{msg.secondaryButtonText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Red Bonus Button */}
                    {(config.showBonusButton ?? true) && (
                      <button
                        onClick={handleClaimBonus}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer ${getTelegramButtonClass(config.bonusButtonColor, 'red')}`}
                      >
                        <Gift className="w-4 h-4 text-white shrink-0" />
                        <span>{config.bonusButtonText || '🔴 CLAIM BONUS'}</span>
                      </button>
                    )}

                    {/* Claim Code shortcut */}
                    <button
                      onClick={handlePromptClaimCode}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-98 cursor-pointer ${getTelegramButtonClass(config.codeButtonColor, 'amber')}`}
                    >
                      <KeyRound className="w-4 h-4 text-white shrink-0" />
                      <span>{config.codeButtonText || '🔑 ENTER CLAIM CODE'}</span>
                    </button>
                  </div>
                )}

                {/* Inline Action Buttons for other messages */}
                {msg.actionType !== 'start' && msg.actionType !== 'leave_alert' && msg.actionType !== 'verify' && (
                  <div className="space-y-1.5 pt-1">
                    {msg.buttonText && (
                      <a
                        href={msg.buttonUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors shadow-sm shadow-blue-600/30"
                      >
                        <span>{msg.buttonText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {msg.secondaryButtonText && (
                      <a
                        href={msg.secondaryButtonUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold text-center transition-colors shadow-sm shadow-red-600/30"
                      >
                        <span>{msg.secondaryButtonText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Message Timestamp */}
                <div className={`text-[10px] text-right ${isBot ? 'text-slate-400' : 'text-blue-200'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real Typing Animation Indicator */}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-[#182533] border border-slate-800 text-slate-400 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-2 shadow-sm">
              <span className="text-[11px] font-medium text-blue-400">TeleForce is typing</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bot Clean Interactive Bar (User side is clean: no invite/refer clutter) */}
      <div className="bg-[#17212b] p-3 border-t border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Blue Check Join Button */}
          <button
            onClick={handleCheckIn}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl active:scale-98 text-white text-xs font-bold transition-all ${getTelegramButtonClass(config.checkButtonColor, 'blue')}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>{config.checkJoinButtonText || '🔵 CHECK JOIN'}</span>
          </button>

          {/* Red Bonus Button */}
          {(config.showBonusButton ?? true) && (
            <button
              onClick={handleClaimBonus}
              className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl active:scale-98 text-white text-xs font-bold transition-all ${getTelegramButtonClass(config.bonusButtonColor, 'red')}`}
              title="Claim Daily Bonus"
            >
              <Gift className="w-3.5 h-3.5 text-white" />
              <span>Bonus</span>
            </button>
          )}

          {/* Admin Command Shortcut */}
          <button
            onClick={handleShowAdminMenu}
            className="flex items-center gap-1 py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors"
            title="Open Telegram Admin Menu"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>/admin</span>
          </button>
        </div>

        {/* Message Input & Send Bar */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send /admin, /claim CODE, or command..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
