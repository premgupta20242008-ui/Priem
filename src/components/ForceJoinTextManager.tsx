import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  Terminal, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  Palette,
  Gift,
  KeyRound,
  Zap,
  Check
} from 'lucide-react';
import { BotConfig, ForceJoinChannel, ButtonColor, getTelegramButtonClass } from '../types/telegram.ts';

interface ForceJoinTextManagerProps {
  config: BotConfig;
  channels: ForceJoinChannel[];
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
}

const colorPalette: { id: ButtonColor; name: string; bgClass: string; borderClass: string }[] = [
  { id: 'blue', name: 'Blue', bgClass: 'bg-[#2481cc]', borderClass: 'border-blue-400' },
  { id: 'green', name: 'Green', bgClass: 'bg-[#2ea043]', borderClass: 'border-emerald-400' },
  { id: 'red', name: 'Red', bgClass: 'bg-[#d73a49]', borderClass: 'border-red-400' },
  { id: 'purple', name: 'Purple', bgClass: 'bg-[#8a3ffc]', borderClass: 'border-purple-400' },
  { id: 'amber', name: 'Gold/Amber', bgClass: 'bg-[#d97706]', borderClass: 'border-amber-400' },
  { id: 'cyan', name: 'Cyan', bgClass: 'bg-[#0891b2]', borderClass: 'border-cyan-400' }
];

export const ForceJoinTextManager: React.FC<ForceJoinTextManagerProps> = ({
  config,
  channels,
  onSaveConfig
}) => {
  const [formData, setFormData] = useState<BotConfig>({
    ...config,
    joinButtonText: config.joinButtonText || '🔵 JOIN NOW',
    joinButtonColor: config.joinButtonColor || 'blue',
    checkJoinButtonText: config.checkJoinButtonText || '🟢 CHECK JOIN',
    checkButtonColor: config.checkButtonColor || 'green',
    bonusButtonText: config.bonusButtonText || '🔴 CLAIM BONUS',
    bonusButtonColor: config.bonusButtonColor || 'red',
    codeButtonText: config.codeButtonText || '🔑 ENTER CLAIM CODE',
    codeButtonColor: config.codeButtonColor || 'amber',
    showBonusButton: config.showBonusButton ?? true,
    welcomeMessage: config.welcomeMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🟢 CHECK JOIN.',
    leaveAlertMessage: config.leaveAlertMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🟢 CHECK JOIN.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const applyPreset = (
    welcome: string, 
    leave: string, 
    checkBtn?: string, 
    checkColor?: ButtonColor,
    bonusBtn?: string,
    bonusColor?: ButtonColor
  ) => {
    setFormData((prev) => ({
      ...prev,
      welcomeMessage: welcome,
      leaveAlertMessage: leave,
      checkJoinButtonText: checkBtn || prev.checkJoinButtonText,
      checkButtonColor: checkColor || prev.checkButtonColor,
      bonusButtonText: bonusBtn || prev.bonusButtonText,
      bonusButtonColor: bonusColor || prev.bonusButtonColor
    }));
  };

  const sampleChannels = channels.length > 0 ? channels : [
    { id: '1', title: 'Prime Official Channel', channelId: '@prime_channel', inviteLink: 'https://t.me', type: 'channel', required: true, addedAt: '' },
    { id: '2', title: 'VIP Alpha Discussion', channelId: '@prime_chat', inviteLink: 'https://t.me', type: 'group', required: true, addedAt: '' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            Telegram Force Join Text & Colored Buttons (New Update)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Telegram ke new update ke mutabik colored buttons aur exact screenshot welcome message set karein. Manage via <span className="font-mono text-amber-300">/admin</span> command!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          <Terminal className="w-3.5 h-3.5" />
          <span>Telegram /admin Available</span>
        </div>
      </div>

      {/* Preset Quick Fill Pills */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          1-Click Text & Color Presets:
        </span>

        {/* Blue & Red Buttons Preset (User Requested) */}
        <button
          type="button"
          onClick={() => applyPreset(
            '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
            '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.',
            '🔵 CHECK JOIN',
            'blue',
            '🔴 CLAIM BONUS',
            'red'
          )}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-900/80 border border-blue-400 text-blue-100 hover:bg-blue-800 transition-colors font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <span>🔵 Blue & 🔴 Red Buttons (Active)</span>
        </button>

        {/* Hindi Hinglish Preset */}
        <button
          type="button"
          onClick={() => applyPreset(
            '⚠️ Kripya bot ke exclusive features aur claim codes access karne ke liye hamare official channels ko join karein.\n\nJoin karne ke baad niche diye gaye 🔵 CHECK JOIN button dabayein!',
            '🚨 ALERT: Aapne hamara channel leave kar diya hai! Re-join karein aur 🔵 CHECK JOIN dabayein.',
            '🔵 CHECK JOIN',
            'blue',
            '🔴 CLAIM BONUS',
            'red'
          )}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors font-medium"
        >
          🇮🇳 Hindi / Hinglish
        </button>

        {/* VIP Elite Preset */}
        <button
          type="button"
          onClick={() => applyPreset(
            '🔒 VIP EXCLUSIVE ACCESS RESTRICTED\n\nYou must be a verified member of all our official channels below before unlocking premium links.',
            '🚨 CRITICAL ALERT: You left a required channel! Access paused.',
            '🔵 CHECK IN & VERIFY',
            'blue',
            '🔴 CLAIM BONUS',
            'red'
          )}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors font-medium"
        >
          👑 VIP Elite Access
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSave} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="text-sm font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-400" />
                Welcome Text & Colored Buttons Configuration
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Telegram Colored Buttons Ready</span>
            </div>

            {/* Force Join Main / Welcome Message (Matches Exact Screenshot) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Welcome / Force Join Text (/start message)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const current = formData.welcomeMessage || '';
                      if (!current.startsWith('*') && !current.endsWith('*')) {
                        setFormData({ ...formData, welcomeMessage: `*${current}*` });
                      }
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white rounded border border-blue-500/40 transition-colors"
                    title="Poore message ko BOLD karein (*text*)"
                  >
                    B Bold (*...*)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = formData.welcomeMessage || '';
                      setFormData({ ...formData, welcomeMessage: `_${current}_` });
                    }}
                    className="px-2 py-0.5 text-[10px] italic bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                    title="Italic karein (_text_)"
                  >
                    I Italic (_..._)
                  </button>
                  <span className="text-[10px] text-amber-400 font-mono hidden sm:inline">cmd: /setforcetext &lt;text&gt;</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                placeholder="*⚠️ You left a required channel/group. Please join again and press 🟢 CHECK JOIN.*"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>💡 Telegram me **BOLD** karne ke liye text ke aage aur peeche <code className="text-blue-400 font-bold bg-slate-900 px-1 py-0.5 rounded">*text*</code> lagayein.</span>
                <span className="text-emerald-400 font-mono">Markdown Supported</span>
              </div>
            </div>

            {/* Leave Warning Alert Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Channel Leave Detection Alert Message
                </label>
                <span className="text-[10px] text-amber-400 font-mono">Telegram cmd: /setleavetext &lt;text&gt;</span>
              </div>
              <textarea
                rows={3}
                value={formData.leaveAlertMessage}
                onChange={(e) => setFormData({ ...formData, leaveAlertMessage: e.target.value })}
                className="w-full bg-slate-950 border border-red-900/50 rounded-lg p-3 text-xs text-red-200 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
                placeholder="⚠️ You left a required channel/group. Please join again and press 🟢 CHECK JOIN."
                required
              />
            </div>

            {/* Colored Buttons Section (Telegram New Update Styling) */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Telegram Colored Buttons (New Update)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Buttons ko alag-alag vibrant colors me style karein
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Zero referral clutter</span>
              </div>

              {/* 1. Blue Check Join Action Button */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    Check Join Button (Blue - Telegram Style)
                  </label>
                  
                  {/* Color Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1">Color:</span>
                    {colorPalette.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, checkButtonColor: cp.id })}
                        className={`w-5 h-5 rounded-full ${cp.bgClass} flex items-center justify-center transition-all ${
                          (formData.checkButtonColor || 'blue') === cp.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={cp.name}
                      >
                        {(formData.checkButtonColor || 'blue') === cp.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.checkJoinButtonText}
                  onChange={(e) => setFormData({ ...formData, checkJoinButtonText: e.target.value })}
                  placeholder="🔵 CHECK JOIN"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                />
                <span className="text-[10px] text-slate-500 block font-mono">Telegram cmd: /setcheckbtn &lt;text&gt;</span>
              </div>

              {/* 2. Red Claim Bonus Button */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-red-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Claim Bonus Button (Red in Screenshot)
                  </label>

                  {/* Color Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1">Color:</span>
                    {colorPalette.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, bonusButtonColor: cp.id })}
                        className={`w-5 h-5 rounded-full ${cp.bgClass} flex items-center justify-center transition-all ${
                          (formData.bonusButtonColor || 'red') === cp.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={cp.name}
                      >
                        {(formData.bonusButtonColor || 'red') === cp.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.bonusButtonText}
                    onChange={(e) => setFormData({ ...formData, bonusButtonText: e.target.value })}
                    placeholder="🔴 CLAIM BONUS"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                  />

                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.showBonusButton}
                      onChange={(e) => setFormData({ ...formData, showBonusButton: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded bg-slate-900 border-slate-700 focus:ring-red-500"
                    />
                    <span>Show Bonus</span>
                  </label>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">Telegram cmd: /setbonusbtn &lt;text&gt;</span>
              </div>

              {/* 3. Blue Channel Join Button Color & Text */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    Channel Join Buttons (Blue Style)
                  </label>

                  {/* Color Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1">Color:</span>
                    {colorPalette.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, joinButtonColor: cp.id })}
                        className={`w-5 h-5 rounded-full ${cp.bgClass} flex items-center justify-center transition-all ${
                          (formData.joinButtonColor || 'blue') === cp.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={cp.name}
                      >
                        {(formData.joinButtonColor || 'blue') === cp.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.joinButtonText}
                  onChange={(e) => setFormData({ ...formData, joinButtonText: e.target.value })}
                  placeholder="🔵 JOIN NOW"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
                <span className="text-[10px] text-slate-500 block font-mono">Telegram cmd: /setjoinbtn &lt;text&gt;</span>
              </div>

              {/* 4. Gold / Amber Secret Claim Code Button */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Secret Claim Code Button
                  </label>

                  {/* Color Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1">Color:</span>
                    {colorPalette.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, codeButtonColor: cp.id })}
                        className={`w-5 h-5 rounded-full ${cp.bgClass} flex items-center justify-center transition-all ${
                          (formData.codeButtonColor || 'amber') === cp.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={cp.name}
                      >
                        {(formData.codeButtonColor || 'amber') === cp.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.codeButtonText}
                  onChange={(e) => setFormData({ ...formData, codeButtonText: e.target.value })}
                  placeholder="🔑 ENTER CLAIM CODE"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              {saveSuccess ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Text aur button colors successfully update ho gaye!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Changes live bot aur simulator me turant reflect honge
                </span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Text & Colors'}</span>
              </button>
            </div>
          </form>

          {/* Telegram /admin Commands Cheatsheet */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Telegram /admin Command Reference</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Direct Bot Control
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/admin</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Open master control center with interactive inline buttons</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/setforcetext &lt;text&gt;</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Edit the force join welcome message directly from Telegram</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/setcheckbtn &lt;text&gt;</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Customize the Green check in button label</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/setbonusbtn &lt;text&gt;</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Customize the Red claim bonus button label</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/addchannel &lt;@id&gt; &lt;Title&gt; &lt;Link&gt;</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Add new required channel or group</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold">/broadcast &lt;text&gt;</span>
                <p className="text-slate-400 text-[10px] mt-0.5 font-sans">Instant message broadcast to all verified members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup with Telegram's Colored Buttons */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Live Telegram Colored Buttons View
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Screenshot Accurate
              </span>
            </div>

            {/* Telegram Message Box */}
            <div className="bg-[#182533] text-white rounded-2xl p-4 shadow-xl border border-slate-700/60 max-w-sm mx-auto space-y-3 font-sans">
              
              {/* Message Header & Text (Screenshot welcome text) */}
              <div className="space-y-2">
                <div className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap font-medium">
                  {formData.welcomeMessage || '⚠️ You left a required channel/group.\n\nPlease join again and press 🔵 CHECK JOIN.'}
                </div>
                <div className="text-[10px] text-slate-400 text-right font-mono">13:04</div>
              </div>

              {/* Colored Channel Join Buttons */}
              <div className="space-y-2 pt-1">
                {sampleChannels.map((channel, idx) => (
                  <div
                    key={channel.id || idx}
                    className={`flex items-center justify-between w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all ${getTelegramButtonClass(formData.joinButtonColor, 'blue')}`}
                  >
                    <span className="flex-1 text-center pl-4">
                      {formData.joinButtonText || `🔵 [${idx + 1}] JOIN ${channel.title.toUpperCase()}`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  </div>
                ))}

                {/* Colored Check Join Button (Default Blue) */}
                <div
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all mt-2 ${getTelegramButtonClass(formData.checkButtonColor, 'blue')}`}
                >
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{formData.checkJoinButtonText || '🔵 CHECK JOIN'}</span>
                </div>

                {/* Colored Claim Bonus Button (Default Red) */}
                {formData.showBonusButton && (
                  <div
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all ${getTelegramButtonClass(formData.bonusButtonColor, 'red')}`}
                  >
                    <Gift className="w-4 h-4 text-white shrink-0" />
                    <span>{formData.bonusButtonText || '🔴 CLAIM BONUS'}</span>
                  </div>
                )}

                {/* Colored Secret Claim Code Button (Default Amber) */}
                <div
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all ${getTelegramButtonClass(formData.codeButtonColor, 'amber')}`}
                >
                  <KeyRound className="w-4 h-4 text-white shrink-0" />
                  <span>{formData.codeButtonText || '🔑 ENTER CLAIM CODE'}</span>
                </div>
              </div>

              <div className="text-center pt-1 border-t border-slate-700/50">
                <span className="text-[10px] text-emerald-400 font-medium">
                  ✓ Telegram New Update: Full Colored Inline Buttons
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
