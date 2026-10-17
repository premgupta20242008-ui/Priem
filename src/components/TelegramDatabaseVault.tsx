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
  Cloud
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
  const [groupIdInput, setGroupIdInput] = useState(config.backupGroupId || '');
  const [autoSync, setAutoSync] = useState(config.autoBackupToGroup ?? true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);
  const [isTestingGroup, setIsTestingGroup] = useState(false);
  const [groupTestResult, setGroupTestResult] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);

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
        setRestoreResult(data);
        if (data.ok) {
          await onRefreshData();
        }
      } catch (err: any) {
        setRestoreResult({ ok: false, error: `Invalid JSON file: ${err.message}` });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const isConnected = Boolean(config.backupGroupId && config.backupGroupId.length > 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Telegram Group Database Storage & Recovery Vault
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Aapka sara bot data (users, channels, codes, configs) direct aapke Telegram group me save hota hai. Bot change karte waqt ya server recover karte time yahan se 1-click me restore ho jata hai!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenHostingGuide && (
            <button
              onClick={onOpenHostingGuide}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Learn how to host 24x7 without losing database"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-300" />
              <span>24/7 Hosting Guide</span>
            </button>
          )}
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
            isConnected
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'Group Vault Connected' : 'Group ID Required'}</span>
          </span>
        </div>
      </div>

      {/* Metrics Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Stored Users</span>
          </div>
          <div className="text-2xl font-black text-white">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified & registered</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Channels & Groups</span>
          </div>
          <div className="text-2xl font-black text-white">{channels.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Required for force-join</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Claim Codes</span>
          </div>
          <div className="text-2xl font-black text-white">{claimCodes.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active secret codes</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Last Vault Backup</span>
          </div>
          <div className="text-xs font-mono font-bold text-purple-300 truncate mt-1">
            {config.lastBackupTimestamp || 'Pending first backup'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">IST Time stamp</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Group Configuration & Instant Backup */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Telegram Group Vault Setup Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Telegram Database Group Settings
              </span>
              <span className="text-[10px] text-blue-400 font-mono">Auto-Sync Supported</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Telegram Group ID (where backups are sent)
                </label>
                <span className="text-[10px] text-amber-400 font-mono">Telegram cmd: /setbackupgroup</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. -1002938172654 or @YourGroup"
                  value={groupIdInput}
                  onChange={(e) => setGroupIdInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestGroup}
                  disabled={isTestingGroup || !groupIdInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTestingGroup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isTestingGroup ? 'Testing...' : 'Test & Save'}</span>
                </button>
              </div>

              {/* Group Test Feedback */}
              {groupTestResult && (
                <div className={`mt-2 p-3 rounded-lg text-xs border ${
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
                  Har user verify, code claim, ya config change par auto snapshot post karein
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

          {/* 2. Manual Export & Import Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-purple-400" />
              Manual Local Export & Restore (.json)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download JSON */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">Download Database</span>
                <p className="text-[11px] text-slate-400">
                  Save current database copy to your computer/phone.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>

              {/* Upload & Restore */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">Upload & Restore</span>
                <p className="text-[11px] text-slate-400">
                  Select any previous backup .json to recover instantly.
                </p>
                <label className="w-full py-2 px-3 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-100 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isRestoring ? 'Restoring...' : 'Upload & Restore'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isRestoring}
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
                {restoreResult.ok ? (
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{restoreResult.message || 'Database restored successfully!'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{restoreResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bot Migration & Telegram Command Instructions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recovery Instructions */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3.5">
            <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Bot Change / Recover Kaise Karein? (Guide)</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <span>1️⃣ Group Setup:</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Apne bot ko kisi private Telegram group me add karein aur admin banayein. Fir group me <span className="font-mono text-white">/setbackupgroup</span> command bhejein.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <span>2️⃣ Automatic Saving:</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Bot har snapshot aur <span className="font-mono text-white">.json document</span> us group me send karta rahega. Group me hamesha latest database backup ready rahega.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span>3️⃣ 1-Click Restore / Recovery:</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Jab bhi bot change karein ya server restart ho:
                  Group me kisi bhi <span className="font-mono text-white">teleforce_db_*.json</span> file par **Reply** karein aur <span className="font-mono text-emerald-300">/restore</span> likhein! Bot turant pura data wapas load kar lega!
                </p>
              </div>
            </div>
          </div>

          {/* Telegram Slash Commands Cheat Sheet */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Database Telegram Slash Commands</span>
            </span>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-blue-400 font-bold">/setbackupgroup &lt;groupId&gt;</span>
                <span className="text-[10px] text-slate-400 font-sans">Group ID connect karein ya direct group me run karein</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-emerald-400 font-bold">/backup</span>
                <span className="text-[10px] text-slate-400 font-sans">Group me instant .json snapshot send karein</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-purple-400 font-bold">/restore (Reply to .json file)</span>
                <span className="text-[10px] text-slate-400 font-sans">Group backup file se sara data instant recover karein</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-amber-400 font-bold">/dbstatus</span>
                <span className="text-[10px] text-slate-400 font-sans">Database metrics aur backup group status dekhein</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
