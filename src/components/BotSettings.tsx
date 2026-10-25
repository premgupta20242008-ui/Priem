import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Radio, 
  Bot, 
  Coins, 
  FileText,
  AlertTriangle,
  ExternalLink,
  Cloud,
  RotateCcw
} from 'lucide-react';
import { BotConfig } from '../types/telegram.ts';

interface BotSettingsProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onOpenHostingGuide?: () => void;
}

export const BotSettings: React.FC<BotSettingsProps> = ({
  config,
  onSaveConfig,
  onOpenHostingGuide
}) => {
  const [formData, setFormData] = useState<BotConfig>({ ...config });
  const [testChatId, setTestChatId] = useState('');
  const [testMsgText, setTestMsgText] = useState('👋 TeleForce Bot Test: Connection verified!');
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFixingCrash, setIsFixingCrash] = useState(false);
  const [crashFixResult, setCrashFixResult] = useState<any>(null);

  const handleFixCrash = async () => {
    setIsFixingCrash(true);
    setCrashFixResult(null);
    try {
      const res = await fetch('/api/bot/fix-crash', { method: 'POST' });
      const data = await res.json();
      setCrashFixResult(data);
    } catch (err: any) {
      setCrashFixResult({ ok: false, message: err.message });
    } finally {
      setIsFixingCrash(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestToken = async () => {
    setIsTestingToken(true);
    setTokenTestResult(null);
    try {
      const res = await fetch('/api/telegram/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formData.botToken })
      });
      const data = await res.json();
      setTokenTestResult(data);
      if (data.ok) {
        setFormData((prev) => ({
          ...prev,
          botUsername: data.result.username,
          botName: data.result.first_name
        }));
      }
    } catch (err: any) {
      setTokenTestResult({ ok: false, error: err.message });
    } finally {
      setIsTestingToken(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testChatId) return;
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: testChatId, text: testMsgText })
      });
      const data = await res.json();
      setTestSendResult(data);
    } catch (err: any) {
      setTestSendResult({ ok: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Telegram Bot API & Engine Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure live Telegram Bot token from @BotFather, customizable messages, and bonus rewards.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Engine: <span className="text-emerald-400 font-bold">READY</span>
        </div>
      </div>

      {/* 24/7 Hosting Quick Action Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-blue-950/40 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">24/7 Cloud Hosting & Deployment Guide</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FREE TIERS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Bot ko Render, Railway, ya VPS par 24 ghante bina computer on rakhe run karein (with UptimeRobot keep-alive).
            </p>
          </div>
        </div>
        {onOpenHostingGuide && (
          <button
            type="button"
            onClick={onOpenHostingGuide}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Hosting Guide</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bot Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-blue-400" />
              Bot Credentials & Profile
            </div>

            {/* Bot Token from BotFather */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Telegram Bot API Token (from @BotFather)
                </label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open @BotFather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="e.g. 7123456789:AAHq_xyz..."
                  value={formData.botToken}
                  onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestToken}
                  disabled={isTestingToken || !formData.botToken}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {isTestingToken ? 'Checking...' : 'Verify Token'}
                </button>
              </div>

              {/* Token test result feedback */}
              {tokenTestResult && (
                <div className={`mt-2 p-2.5 rounded-lg text-xs border ${
                  tokenTestResult.ok
                    ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                    : 'bg-red-950/50 border-red-800/80 text-red-300'
                }`}>
                  {tokenTestResult.ok ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Token Verified! Connected to: <strong>@{tokenTestResult.result.username}</strong> ({tokenTestResult.result.first_name})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Telegram Error: {tokenTestResult.description || 'Invalid token'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bot Username & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bot Username
                </label>
                <input
                  type="text"
                  value={formData.botUsername}
                  onChange={(e) => setFormData({ ...formData, botUsername: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bot Display Title
                </label>
                <input
                  type="text"
                  value={formData.botName}
                  onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Custom Welcome Message */}
            <div className="border-t border-slate-800 pt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Force Join Welcome Prompt (/start)
              </label>
              <textarea
                rows={3}
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Leave Alert Warning Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Leave Detection Warning Message
                </label>
                <span className="text-[11px] text-slate-400">Triggered if user leaves a channel</span>
              </div>
              <textarea
                rows={3}
                value={formData.leaveAlertMessage}
                onChange={(e) => setFormData({ ...formData, leaveAlertMessage: e.target.value })}
                className="w-full bg-slate-950 border border-red-900/60 rounded-lg p-2.5 text-xs text-red-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Bonus Rewards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Daily Check-in Bonus (Points)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.dailyBonusAmount}
                  onChange={(e) => setFormData({ ...formData, dailyBonusAmount: parseInt(e.target.value, 10) || 10 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Referral Reward (Points per Verified Join)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.referralBonusAmount}
                  onChange={(e) => setFormData({ ...formData, referralBonusAmount: parseInt(e.target.value, 10) || 20 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Telegram Group Database Vault Setting */}
            <div className="border-t border-slate-800 pt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Database Vault Group ID (for backup & recovery)
              </label>
              <input
                type="text"
                placeholder="e.g. -1002938172654"
                value={formData.backupGroupId || ''}
                onChange={(e) => setFormData({ ...formData, backupGroupId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Bot change karte waqt ya server restore karte time sara data is group se recover ho jata hai.
              </span>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Config saved!</span>
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Bot Health Recovery & Live Telegram Message Dispatcher */}
        <div className="lg:col-span-5 space-y-4">
          {/* Bot Crash Fix & Health Recovery Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900 border border-amber-500/30 rounded-xl p-5 shadow-sm space-y-3">
            <div className="text-sm font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Bot Health & Crash Recovery</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                1-Click Fix
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Agar bot Telegram pe <code className="text-amber-300 font-mono">/start</code> ya <code className="text-amber-300 font-mono">/claim</code> ka response na de ya crash ho jaye (socket timeout, webhook conflict, ya 409 error), toh is button se instant restart karein.
            </p>
            <button
              type="button"
              onClick={handleFixCrash}
              disabled={isFixingCrash}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isFixingCrash ? 'animate-spin' : ''}`} />
              <span>{isFixingCrash ? 'Fixing Connection & Restarting...' : '🛠️ Fix Crash & Restart Bot Engine'}</span>
            </button>
            {crashFixResult && (
              <div className={`p-2.5 rounded-lg text-xs border ${
                crashFixResult.ok
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/50 border-red-800 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {crashFixResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{crashFixResult.message || (crashFixResult.ok ? 'Bot successfully restarted!' : 'Failed to restart')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Send className="w-4 h-4 text-blue-400" />
              Live Telegram Dispatcher
            </div>
            <p className="text-xs text-slate-400">
              Send an actual real-time message through the Telegram Bot API to verify your bot token with your personal Telegram ID.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Telegram Chat ID / User ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1092837465 (Your Telegram User ID)"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: Start a chat with your bot first in Telegram, then enter your ID here.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Message Text
                </label>
                <textarea
                  rows={3}
                  value={testMsgText}
                  onChange={(e) => setTestMsgText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestMessage}
                disabled={isSendingTest || !testChatId || !formData.botToken}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Sending to Telegram...' : 'Send Test Telegram Message'}</span>
              </button>

              {testSendResult && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  testSendResult.ok
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}>
                  {testSendResult.ok ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Message successfully delivered to Telegram chat!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Failed: {testSendResult.description || testSendResult.error || 'Check Chat ID'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
