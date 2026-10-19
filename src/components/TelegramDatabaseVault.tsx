import React, { useState } from 'react';
import { 
  Database, 
  Send, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Users, 
  Layers, 
  KeyRound, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Cloud,
  Trash2,
  Filter,
  Search,
  Radio,
  Sparkles
} from 'lucide-react';
import { BotConfig, ForceJoinChannel, ClaimCode, BotUser } from '../types/telegram.ts';

interface TelegramDatabaseVaultProps {
  config: BotConfig;
  channels: ForceJoinChannel[];
  claimCodes: ClaimCode[];
  users: BotUser[];
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onOpenHostingGuide?: () => void;
}

export const TelegramDatabaseVault: React.FC<TelegramDatabaseVaultProps> = ({
  config,
  channels,
  claimCodes,
  users,
  onSaveConfig,
  onRefreshData,
  onOpenHostingGuide
}) => {
  const [activeSection, setActiveSection] = useState<'backup' | 'groups_wise' | 'clean_data' | 'local_file'>('backup');
  const [groupIdInput, setGroupIdInput] = useState(config.backupGroupId || '');
  const [autoSync, setAutoSync] = useState(config.autoBackupToGroup ?? true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);
  const [isTestingGroup, setIsTestingGroup] = useState(false);
  const [groupTestResult, setGroupTestResult] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);

  // Groups-wise view state
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'verified' | 'left'>('all');

  // Clean data state
  const [cleanOptions, setCleanOptions] = useState({
    cleanLogs: true,
    cleanUnverifiedUsers: false,
    cleanInactiveUsers: false,
    cleanExpiredCodes: false,
    cleanBroadcasts: false,
    resetAllUsers: false
  });
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<{ success: boolean; message: string } | null>(null);

  // 1. Save Group Config
  const handleSaveGroupConfig = async () => {
    await onSaveConfig({
      backupGroupId: groupIdInput.trim(),
      autoBackupToGroup: autoSync
    });
  };

  // 2. Test Connection to Telegram Group
  const handleTestGroup = async () => {
    if (!groupIdInput.trim()) return;
    setIsTestingGroup(true);
    setGroupTestResult(null);
    try {
      const res = await fetch('/api/database/test-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: groupIdInput.trim() })
      });
      const data = await res.json();
      setGroupTestResult(data);
      if (data.ok) {
        await handleSaveGroupConfig();
        await onRefreshData();
      }
    } catch (err: any) {
      setGroupTestResult({ ok: false, error: err.message });
    } finally {
      setIsTestingGroup(false);
    }
  };

  // 3. Backup Database to Telegram Group Now
  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setBackupResult(null);
    try {
      const res = await fetch('/api/database/backup-to-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual Web Dashboard Backup Button' })
      });
      const data = await res.json();
      setBackupResult(data);
      if (data.ok) {
        await onRefreshData();
      }
    } catch (err: any) {
      setBackupResult({ ok: false, error: err.message });
    } finally {
      setIsBackingUp(false);
    }
  };

  // 4. Download local .json copy
  const handleDownloadJson = () => {
    window.location.href = '/api/database/export';
  };

  // 5. Upload & Restore Database from .json file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const res = await fetch('/api/database/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        const data = await res.json();

        if (data.ok) {
          setRestoreResult({ ok: true, message: data.message });
          await onRefreshData();
        } else {
          setRestoreResult({ ok: false, error: data.error || 'Failed to restore database' });
        }
      } catch (err: any) {
        setRestoreResult({ ok: false, error: `Invalid JSON format: ${err.message}` });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  // 6. Handle Database Cleanup
  const handleRunCleanup = async () => {
    if (!window.confirm('Are you sure you want to run this cleanup? Selected records will be permanently purged from the database.')) {
      return;
    }

    setIsCleaning(true);
    setCleanResult(null);
    try {
      const res = await fetch('/api/database/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanOptions)
      });
      const data = await res.json();
      if (data.success) {
        setCleanResult({ success: true, message: data.message });
        await onRefreshData();
      } else {
        setCleanResult({ success: false, message: data.error || 'Cleanup failed' });
      }
    } catch (err: any) {
      setCleanResult({ success: false, message: err.message });
    } finally {
      setIsCleaning(false);
    }
  };

  // Groups-wise audience calculation
  const filteredUsers = users.filter((u) => {
    // Channel match
    if (selectedChannelId !== 'all') {
      if (!u.joinedChannels.includes(selectedChannelId)) return false;
    }
    // Filter match
    if (memberFilter === 'verified' && (!u.isVerified || u.hasLeftRequired)) return false;
    if (memberFilter === 'left' && !u.hasLeftRequired) return false;
    // Search match
    if (searchMember.trim()) {
      const q = searchMember.toLowerCase();
      const matchName = u.firstName.toLowerCase().includes(q);
      const matchUser = (u.username || '').toLowerCase().includes(q);
      const matchId = u.telegramId.includes(q);
      if (!matchName && !matchUser && !matchId) return false;
    }
    return true;
  });

  const verifiedCount = users.filter((u) => u.isVerified && !u.hasLeftRequired).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Telegram Database Vault & Group Backup</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CRASH RECOVERY READY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Agar bot crash kare ya server reboot ho, toh aap apne <strong>Telegram Database Group ID</strong> se 100% users, channels, aur codes recover kar sakte hain.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOTAL USERS</span>
              <span className="text-emerald-400 font-bold text-base">{users.length}</span>
            </div>
            <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CHANNELS</span>
              <span className="text-blue-400 font-bold text-base">{channels.length}</span>
            </div>
            <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CLAIM CODES</span>
              <span className="text-amber-400 font-bold text-base">{claimCodes.length}</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-4 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveSection('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'backup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>1. Telegram Group Backup & Recovery</span>
          </button>

          <button
            onClick={() => setActiveSection('groups_wise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'groups_wise'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Groups-Wise Audience ({channels.length} Channels)</span>
          </button>

          <button
            onClick={() => setActiveSection('clean_data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'clean_data'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>3. Clear Old Data & Purge</span>
          </button>

          <button
            onClick={() => setActiveSection('local_file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'local_file'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>4. Local JSON File Import/Export</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TELEGRAM GROUP BACKUP & CRASH RECOVERY */}
      {activeSection === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Telegram Backup Vault Group Configuration
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Last Backup: {config.lastBackupTimestamp || 'None'}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Telegram Backup Group ID <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. -1002938172654"
                  value={groupIdInput}
                  onChange={(e) => setGroupIdInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestGroup}
                  disabled={isTestingGroup || !groupIdInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isTestingGroup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isTestingGroup ? 'Testing...' : 'Test & Connect'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 <strong>Tip:</strong> Bot ko apne private Telegram group me Admin banayein aur group me <code>/setbackupgroup</code> send karein, ya group ka -100... ID yahan enter karein.
              </p>

              {/* Group Test Feedback */}
              {groupTestResult && (
                <div className={`p-3 rounded-lg text-xs border ${
                  groupTestResult.ok
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border-red-800 text-red-200'
                }`}>
                  {groupTestResult.ok ? (
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Connected to Group: <strong>{groupTestResult.result?.title}</strong> (ID: {groupTestResult.result?.id})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>
                        Telegram Error: {groupTestResult.description || 'Could not access group. Ensure bot is Admin!'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Auto-Sync Toggle */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Sync Database to Group</span>
                <span className="text-[11px] text-slate-400">
                  Har naye user verification aur backup trigger par auto snapshot post karein
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setAutoSync(checked);
                    await onSaveConfig({ autoBackupToGroup: checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Instant Backup to Group Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackupNow}
                disabled={isBackingUp || !groupIdInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isBackingUp ? 'Sending Backup to Telegram Group...' : '💾 BACKUP DATABASE TO TELEGRAM GROUP NOW'}</span>
              </button>

              {/* Backup Result Toast */}
              {backupResult && (
                <div className={`mt-3 p-3 rounded-lg text-xs border ${
                  backupResult.ok
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border-red-800 text-red-200'
                }`}>
                  {backupResult.ok ? (
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{backupResult.message || 'Database snapshot and .json file successfully sent to your Telegram Group!'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{backupResult.error || 'Failed to send backup. Check bot permissions in group.'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Crash Recovery Guide Card */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Crash Recovery Guide (Bot Crash Hone Par)</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Step 1: Telegram Group me Restore</span>
                Apne Database Backup Group me jayein aur kisi bhi <code>teleforce_db_backup_*.json</code> file par <strong>Reply</strong> karke <code>/restore</code> send karein. Bot turant 100% data load kar lega!
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Step 2: Server Reboot Protection</span>
                Jab bhi server restart hota hai, bot database file <code>data/bot_database.json</code> se auto-load ho jata hai. Agar file empty ho, toh group backup se recover kar sakte hain.
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Step 3: Web Dashboard Instant Restore</span>
                Telegram group se backup file download karke yahan &quot;4. Local JSON File&quot; tab me upload karke 1-click me restore karein.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GROUPS-WISE AUDIENCE BREAKDOWN */}
      {activeSection === 'groups_wise' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Groups-Wise User Audience & Membership Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kis channel ya group me kitne members active hain aur unka real-time verification status dekhein.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Channel Selector */}
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">All Channels & Groups ({channels.length})</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title} ({ch.type.toUpperCase()})
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
                <button
                  onClick={() => setMemberFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${memberFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  All ({filteredUsers.length})
                </button>
                <button
                  onClick={() => setMemberFilter('verified')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${memberFilter === 'verified' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setMemberFilter('left')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${memberFilter === 'left' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Left
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user / ID..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Channels summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {channels.map((ch) => {
              const joinedCount = users.filter((u) => u.joinedChannels.includes(ch.id)).length;
              const isSelected = selectedChannelId === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannelId(isSelected ? 'all' : ch.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[180px]">{ch.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ch.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-400 font-mono mt-0.5 truncate">{ch.channelId}</div>
                  
                  <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px]">Active Members:</span>
                    <span className="font-bold text-emerald-400">{joinedCount} users</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Members Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Member Details ({filteredUsers.length} found)</span>
              <span>Telegram Verification Status</span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No users found for this group filter.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div key={u.telegramId} className="p-3 flex items-center justify-between hover:bg-slate-800/30 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                        {u.firstName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{u.firstName}</span>
                          {u.username && <span className="text-blue-400 font-mono text-[11px]">@{u.username}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                          <span>ID: {u.telegramId}</span>
                          <span>·</span>
                          <span>Joined: {new Date(u.joinedAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>Balance: {u.bonusBalance || 0} pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.isVerified && !u.hasLeftRequired ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          VERIFIED MEMBER
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          UNVERIFIED / LEFT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: CLEAR OLD DATA & PURGE */}
      {activeSection === 'clean_data' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Clear Old Data & Database Maintenance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unwanted logs, unverified inactive users, ya expired claim codes ko clean karke database speed aur storage optimize karein.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Users: {users.length}</span>
          </div>

          {/* Clean result toast */}
          {cleanResult && (
            <div className={`p-3 rounded-lg text-xs border ${
              cleanResult.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-red-950/60 border-red-800 text-red-200'
            }`}>
              {cleanResult.message}
            </div>
          )}

          {/* Cleanup Options Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={cleanOptions.cleanLogs}
                onChange={(e) => setCleanOptions({ ...cleanOptions, cleanLogs: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-white block">Clear Audit Logs (Keep Last 10)</span>
                <span className="text-slate-400 text-[11px]">Old join/leave/verify audit logs ko trim karega</span>
              </div>
            </label>

            <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={cleanOptions.cleanUnverifiedUsers}
                onChange={(e) => setCleanOptions({ ...cleanOptions, cleanUnverifiedUsers: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-white block">Purge Left & Unverified Users</span>
                <span className="text-slate-400 text-[11px]">Jin users ne channels leave kar diye aur verify nahi huye</span>
              </div>
            </label>

            <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={cleanOptions.cleanInactiveUsers}
                onChange={(e) => setCleanOptions({ ...cleanOptions, cleanInactiveUsers: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-white block">Purge Inactive Users (&gt;30 Days)</span>
                <span className="text-slate-400 text-[11px]">Pichle 30 dino se koi activity na karne wale accounts</span>
              </div>
            </label>

            <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={cleanOptions.cleanExpiredCodes}
                onChange={(e) => setCleanOptions({ ...cleanOptions, cleanExpiredCodes: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-white block">Purge Exhausted / Inactive Codes</span>
                <span className="text-slate-400 text-[11px]">Max limit reach kar chuke ya disabled claim codes</span>
              </div>
            </label>

            <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={cleanOptions.cleanBroadcasts}
                onChange={(e) => setCleanOptions({ ...cleanOptions, cleanBroadcasts: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-white block">Clear Past Broadcast Records</span>
                <span className="text-slate-400 text-[11px]">Purane sent announcements ki list clear karega</span>
              </div>
            </label>

            <label className="flex items-start gap-3 bg-red-950/30 p-3.5 rounded-xl border border-red-900/60 cursor-pointer hover:border-red-700">
              <input
                type="checkbox"
                checked={cleanOptions.resetAllUsers}
                onChange={(e) => setCleanOptions({ ...cleanOptions, resetAllUsers: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded mt-0.5"
              />
              <div>
                <span className="font-semibold text-red-300 block">⚠️ Reset All Users (Factory Clean)</span>
                <span className="text-red-400/80 text-[11px]">Sabhi bot users ka record zero kar dega</span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunCleanup}
              disabled={isCleaning}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isCleaning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{isCleaning ? 'Cleaning Database...' : 'Run Selected Database Cleanup'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: LOCAL JSON FILE IMPORT / EXPORT */}
      {activeSection === 'local_file' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              Manual Local JSON Backup & Restore
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-xs text-white block">Download .JSON Backup File</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Database ka snapshot apne laptop/computer me download karein.
              </p>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export database.json</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-xs text-white block">Upload & Restore from File</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pehle se saved <code>teleforce_db_backup_*.json</code> file select karke restore karein.
              </p>
              <label className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Restoring...' : 'Upload & Restore File'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isRestoring}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {restoreResult && (
            <div className={`p-3 rounded-lg text-xs border ${
              restoreResult.ok
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-red-950/60 border-red-800 text-red-200'
            }`}>
              {restoreResult.message || restoreResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
