import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar.tsx';
import { ChannelsManager } from './components/ChannelsManager.tsx';
import { VerificationPostManager } from './components/VerificationPostManager.tsx';
import { ClaimCodesManager } from './components/ClaimCodesManager.tsx';
import { BroadcastManager } from './components/BroadcastManager.tsx';
import { AdminsManager } from './components/AdminsManager.tsx';
import { BotSettings } from './components/BotSettings.tsx';
import { ForceJoinTextManager } from './components/ForceJoinTextManager.tsx';
import { TelegramDatabaseVault } from './components/TelegramDatabaseVault.tsx';
import { TelegramSimulator } from './components/TelegramSimulator.tsx';
import { AuditLogs } from './components/AuditLogs.tsx';
import { HostingGuideModal } from './components/HostingGuideModal.tsx';
import { 
  ForceJoinChannel, 
  VerificationPost, 
  ClaimCode, 
  BroadcastMessage, 
  AdminUser, 
  BotUser, 
  BotConfig, 
  BotLog 
} from './types/telegram.ts';
import { 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Radio, 
  Layers,
  X,
  Cloud,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('channels');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);
  const [isHostingModalOpen, setIsHostingModalOpen] = useState(false);
  const [activeTestCode, setActiveTestCode] = useState<string | undefined>(undefined);
  const [isFixingCrash, setIsFixingCrash] = useState(false);
  const [crashFixMessage, setCrashFixMessage] = useState<string | null>(null);

  // Data states
  const [channels, setChannels] = useState<ForceJoinChannel[]>([]);
  const [verificationPost, setVerificationPost] = useState<VerificationPost>({
    enabled: true,
    text: '',
    mediaType: 'none'
  });
  const [claimCodes, setClaimCodes] = useState<ClaimCode[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<BotUser[]>([]);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [config, setConfig] = useState<BotConfig>({
    botToken: '',
    botUsername: 'PrimeForceJoinBot',
    botName: 'TeleForce Official Bot',
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
  });
  const [currentIST, setCurrentIST] = useState<string>('');
  const [isBotRunning, setIsBotRunning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all database records
  const loadData = async () => {
    try {
      const [
        statusRes,
        channelsRes,
        codesRes,
        vPostRes,
        broadcastsRes,
        adminsRes,
        usersRes,
        configRes,
        logsRes
      ] = await Promise.all([
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/channels').then((r) => r.json()),
        fetch('/api/codes').then((r) => r.json()),
        fetch('/api/verification-post').then((r) => r.json()),
        fetch('/api/broadcasts').then((r) => r.json()),
        fetch('/api/admins').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/config').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json())
      ]);

      if (statusRes.currentIST) setCurrentIST(statusRes.currentIST);
      if (channelsRes) setChannels(channelsRes);
      if (codesRes) setClaimCodes(codesRes);
      if (vPostRes) setVerificationPost(vPostRes);
      if (broadcastsRes) setBroadcasts(broadcastsRes);
      if (adminsRes) setAdmins(adminsRes);
      if (usersRes) setUsers(usersRes);
      if (configRes) {
        setConfig(configRes);
        setIsBotRunning(configRes.isPollingActive ?? true);
      }
      if (logsRes) setLogs(logsRes);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBotRunning = async () => {
    try {
      const endpoint = isBotRunning ? '/api/bot/stop' : '/api/bot/start';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setIsBotRunning(data.isPollingActive);
      await loadData();
    } catch (err) {
      console.error('Error toggling bot status:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-start bot on initialization
    fetch('/api/bot/start', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setIsBotRunning(true);
      })
      .catch((e) => console.log('Auto-start bot result:', e));

    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Channel Management
  const handleAddChannel = async (channelData: Partial<ForceJoinChannel>) => {
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channelData)
    });
    if (!res.ok) throw new Error('Failed to add channel');
    await loadData();
  };

  const handleDeleteChannel = async (id: string) => {
    const res = await fetch(`/api/channels/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete channel');
    await loadData();
  };

  // Handlers for Verification Post
  const handleSaveVerificationPost = async (updated: VerificationPost) => {
    const res = await fetch('/api/verification-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to save post');
    setVerificationPost(updated);
    await loadData();
  };

  // Handlers for Claim Codes
  const handleAddClaimCode = async (codeData: any) => {
    const res = await fetch('/api/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codeData)
    });
    if (!res.ok) throw new Error('Failed to create code');
    await loadData();
  };

  const handleDeleteClaimCode = async (id: string) => {
    const res = await fetch(`/api/codes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete code');
    await loadData();
  };

  // Handlers for Broadcasts
  const handleSendBroadcast = async (broadcastData: any) => {
    const res = await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcastData)
    });
    if (!res.ok) throw new Error('Failed to dispatch broadcast');
    await loadData();
  };

  const handleTriggerBroadcastNow = async (id: string) => {
    const res = await fetch(`/api/broadcasts/${id}/send-now`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger broadcast');
    await loadData();
  };

  const handleDeleteBroadcast = async (id: string) => {
    const res = await fetch(`/api/broadcasts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete broadcast');
    await loadData();
  };

  const handleDeleteBroadcastFromUsers = async (id: string) => {
    const res = await fetch(`/api/broadcasts/${id}/delete-from-users`, { method: 'POST' });
    const data = await res.json();
    await loadData();
    return data;
  };

  const handleEditBroadcastOnUsers = async (id: string, options: any) => {
    const res = await fetch(`/api/broadcasts/${id}/edit-on-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    const data = await res.json();
    await loadData();
    return data;
  };

  const handleDeleteLastBroadcast = async () => {
    const res = await fetch('/api/broadcasts/delete-last', { method: 'POST' });
    const data = await res.json();
    await loadData();
    return data;
  };

  // Handlers for Admins
  const handleAddAdmin = async (adminData: Partial<AdminUser>) => {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add admin');
    await loadData();
  };

  const handleDeleteAdmin = async (id: string) => {
    const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to remove admin');
    await loadData();
  };

  // Handlers for Config
  const handleSaveConfig = async (updated: Partial<BotConfig>) => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to save config');
    await loadData();
  };

  // Handlers for Leave Simulation
  const handleSimulateUserLeave = async (telegramId: string) => {
    const res = await fetch(`/api/users/${telegramId}/simulate-leave`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await loadData();
    }
  };

  const handleTriggerSimulatorLeaveTest = (channelId: string) => {
    setIsSimulatorOpen(true);
    // Find first user and trigger leave simulation
    if (users.length > 0) {
      handleSimulateUserLeave(users[0].telegramId);
    }
  };

  const handleTestCodeInSimulator = (code: string) => {
    setActiveTestCode(code);
    setIsSimulatorOpen(true);
  };

  const handleFixCrashAndRestart = async () => {
    setIsFixingCrash(true);
    setCrashFixMessage(null);
    try {
      const res = await fetch('/api/bot/fix-crash', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setCrashFixMessage(data.message || 'Bot successfully restarted!');
        await loadData();
        setIsBotRunning(true);
      } else {
        setCrashFixMessage(data.message || 'Failed to restart bot.');
      }
    } catch (err: any) {
      setCrashFixMessage(`Error: ${err.message}`);
    } finally {
      setIsFixingCrash(false);
      setTimeout(() => setCrashFixMessage(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (Wordmark - Links - Primary Action) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isSimulatorOpen={isSimulatorOpen}
        onToggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        isBotRunning={isBotRunning}
        onToggleBotRunning={handleToggleBotRunning}
        currentIST={currentIST}
        botUsername={config.botUsername}
        onOpenHostingGuide={() => setIsHostingModalOpen(true)}
        onFixCrashRestart={handleFixCrashAndRestart}
        isRestarting={isFixingCrash}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Crash Fix Alert Notification Banner */}
        {crashFixMessage && (
          <div className="mb-4 bg-gradient-to-r from-amber-950/70 to-orange-950/70 border border-amber-500/50 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200 shadow-lg shadow-orange-950/30">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{crashFixMessage}</span>
            </div>
            <button onClick={() => setCrashFixMessage(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bot Live Status Strip */}
        <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-semibold text-white">
              {isBotRunning ? 'Telegram Bot Engine is ACTIVE & RUNNING' : 'Telegram Bot Engine is PAUSED'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono">
              @{config.botUsername || 'PrimeForceJoinBot'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-blue-400 font-mono">
              IST: {currentIST || 'Live'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Crash Fix & Restart Button */}
            <button
              onClick={handleFixCrashAndRestart}
              disabled={isFixingCrash}
              className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 text-amber-200 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Auto-fix Telegram connection, flush 409 conflict, and restart polling"
            >
              <RotateCcw className={`w-3 h-3 ${isFixingCrash ? 'animate-spin' : ''}`} />
              <span>{isFixingCrash ? 'Fixing & Restarting...' : '🛠️ Fix Crash & Restart'}</span>
            </button>

            <button
              onClick={() => setIsHostingModalOpen(true)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Step-by-step instructions to host 24x7 for free"
            >
              <Cloud className="w-3 h-3 text-purple-300" />
              <span>Host 24/7 Guide</span>
            </button>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Typing: <strong className="text-emerald-400">ON</strong> · Force Join: <strong className="text-blue-400">ON</strong>
            </span>
            <button
              onClick={handleToggleBotRunning}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                isBotRunning
                  ? 'bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isBotRunning ? 'Stop Engine' : 'Start Engine'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left/Main Column: Admin Control Suite (width adjusts based on simulator state) */}
          <div className={`${isSimulatorOpen ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            
            {/* Tab Views */}
            {currentTab === 'channels' && (
              <ChannelsManager
                channels={channels}
                onAddChannel={handleAddChannel}
                onDeleteChannel={handleDeleteChannel}
                onSimulateLeave={handleTriggerSimulatorLeaveTest}
              />
            )}

            {currentTab === 'text_editor' && (
              <ForceJoinTextManager
                config={config}
                channels={channels}
                onSaveConfig={handleSaveConfig}
              />
            )}

            {currentTab === 'verification' && (
              <VerificationPostManager
                post={verificationPost}
                onSave={handleSaveVerificationPost}
              />
            )}

            {currentTab === 'codes' && (
              <ClaimCodesManager
                codes={claimCodes}
                onAddCode={handleAddClaimCode}
                onDeleteCode={handleDeleteClaimCode}
                onTestCodeInSimulator={handleTestCodeInSimulator}
              />
            )}

            {currentTab === 'broadcast' && (
              <BroadcastManager
                broadcasts={broadcasts}
                currentIST={currentIST}
                totalUsers={users.length}
                verifiedUsers={users.filter((u) => u.isVerified && !u.hasLeftRequired).length}
                onSendBroadcast={handleSendBroadcast}
                onTriggerNow={handleTriggerBroadcastNow}
                onDeleteBroadcast={handleDeleteBroadcast}
                onDeleteBroadcastFromUsers={handleDeleteBroadcastFromUsers}
                onEditBroadcastOnUsers={handleEditBroadcastOnUsers}
                onDeleteLastBroadcast={handleDeleteLastBroadcast}
              />
            )}

            {currentTab === 'admins' && (
              <AdminsManager
                admins={admins}
                users={users}
                onAddAdmin={handleAddAdmin}
                onDeleteAdmin={handleDeleteAdmin}
                onSimulateUserLeave={handleSimulateUserLeave}
              />
            )}

            {currentTab === 'database' && (
              <TelegramDatabaseVault
                config={config}
                channels={channels}
                claimCodes={claimCodes}
                users={users}
                onSaveConfig={handleSaveConfig}
                onRefreshData={loadData}
                onOpenHostingGuide={() => setIsHostingModalOpen(true)}
              />
            )}

            {currentTab === 'settings' && (
              <BotSettings
                config={config}
                onSaveConfig={handleSaveConfig}
                onOpenHostingGuide={() => setIsHostingModalOpen(true)}
              />
            )}

            {/* Audit Logs Stream */}
            <AuditLogs logs={logs} />
          </div>

          {/* Right Column: Live Telegram Mobile Client Simulator */}
          {isSimulatorOpen && (
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  Live Telegram Bot Simulator
                </span>
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <TelegramSimulator
                channels={channels}
                verificationPost={verificationPost}
                claimCodes={claimCodes}
                config={config}
                onUpdateConfig={handleSaveConfig}
                onAddChannel={handleAddChannel}
                onDeleteChannel={handleDeleteChannel}
                onAddCode={handleAddClaimCode}
                activeTestCode={activeTestCode}
                onClearActiveTestCode={() => setActiveTestCode(undefined)}
              />
            </div>
          )}

        </div>
      </main>

      {/* 24/7 Hosting Guide Interactive Modal */}
      <HostingGuideModal
        isOpen={isHostingModalOpen}
        onClose={() => setIsHostingModalOpen(false)}
        botUsername={config.botUsername}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            TeleForce Bot Suite · Enterprise Force Join & Claim Code System
          </div>
          <div className="flex items-center gap-4">
            <span>IST Engine: UTC+05:30</span>
            <span>·</span>
            <span>Telegram Bot API v7.0+</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
