import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  Music,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ClaimCode, MediaType } from '../types/telegram.ts';

interface ClaimCodesManagerProps {
  codes: ClaimCode[];
  onAddCode: (codeData: any) => Promise<void>;
  onDeleteCode: (id: string) => Promise<void>;
  onTestCodeInSimulator?: (code: string) => void;
}

export const ClaimCodesManager: React.FC<ClaimCodesManagerProps> = ({
  codes,
  onAddCode,
  onDeleteCode,
  onTestCodeInSimulator
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    text: '',
    mediaType: 'none' as MediaType,
    mediaUrl: '',
    buttonText: '',
    buttonUrl: '',
    secondaryButtonText: '',
    secondaryButtonUrl: '',
    maxUses: 500
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.code || !formData.title || !formData.text) {
      setErrorMsg('Code, Title, and Post Text are mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddCode({
        code: formData.code.toUpperCase().trim(),
        title: formData.title.trim(),
        maxUses: formData.maxUses,
        postContent: {
          text: formData.text,
          mediaType: formData.mediaType,
          mediaUrl: formData.mediaUrl,
          buttonText: formData.buttonText,
          buttonUrl: formData.buttonUrl,
          secondaryButtonText: formData.secondaryButtonText,
          secondaryButtonUrl: formData.secondaryButtonUrl
        }
      });
      setFormData({
        code: '',
        title: '',
        text: '',
        mediaType: 'none',
        mediaUrl: '',
        buttonText: '',
        buttonUrl: '',
        secondaryButtonText: '',
        secondaryButtonUrl: '',
        maxUses: 500
      });
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create claim code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            Secret Claim Code Generator & Rewards
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create custom access codes. Codes only work if the user is in ALL required channels!
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Generate New Code'}
        </button>
      </div>

      {/* Force-Join Protection Notice */}
      <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Strict Force-Join Gate Active: </span>
          When a user submits a claim code via Telegram (e.g. <span className="font-mono text-amber-300">/claim VIP2026</span>), the bot inspects their live membership in all required channels. If they haven&apos;t joined or have left any channel, the reward is locked and the force-join message is triggered!
        </div>
      </div>

      {/* New Code Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Configure Secret Code & Payload Post
            </span>
            <span className="text-[11px] text-slate-400">Users redeem in bot chat</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Claim Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. VIP2026, BONUS500"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Internal Title / Description <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Special VIP Access Drop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value, 10) || 100 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
          </div>

          {/* Bound Post Message Content */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reward Post Text (Sent to user when code is verified) <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter the secret message, link, or unlock instructions..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          {/* Media Option */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Media Attachment
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'image', label: 'Image' },
                  { id: 'video', label: 'Video' },
                  { id: 'audio', label: 'Audio' }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setFormData({ ...formData, mediaType: m.id as MediaType })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      formData.mediaType === m.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.mediaType !== 'none' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Media Direct URL
                </label>
                <input
                  type="text"
                  placeholder="/src/assets/images/telegram_bot_hero_1792137087644.jpg"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Custom Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-medium text-blue-400 mb-1">
                Primary Button Label (Blue)
              </label>
              <input
                type="text"
                placeholder="e.g. 🚀 Download VIP File"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 mb-2"
              />
              <input
                type="url"
                placeholder="https://yourlink.com"
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-red-400 mb-1">
                Secondary Button Label (Red)
              </label>
              <input
                type="text"
                placeholder="e.g. 💬 Join Discussions"
                value={formData.secondaryButtonText}
                onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 mb-2"
              />
              <input
                type="url"
                placeholder="https://t.me"
                value={formData.secondaryButtonUrl}
                onChange={(e) => setFormData({ ...formData, secondaryButtonUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Create Claim Code'}
            </button>
          </div>
        </form>
      )}

      {/* Codes Grid / List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active Claim Codes ({codes.length})
          </div>
          <div className="text-xs text-slate-400">
            Click copy or test directly in simulator
          </div>
        </div>

        {codes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No claim codes created yet. Click &quot;Generate New Code&quot; to configure your first code.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {codes.map((code) => {
              const usagePercent = Math.min(100, Math.round((code.currentUses / code.maxUses) * 100));
              return (
                <div
                  key={code.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        <span className="font-mono font-bold text-amber-400 text-sm tracking-wide">
                          {code.code}
                        </span>
                        <button
                          onClick={() => handleCopy(code.code)}
                          className="text-amber-400 hover:text-white transition-colors ml-1"
                          title="Copy Code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-white">{code.title}</span>

                      {code.isActive ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          DISABLED
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-1 max-w-xl font-mono">
                      {code.postContent.text}
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="tabular-nums font-mono text-slate-300">
                        {code.currentUses} / {code.maxUses} claims ({usagePercent}%)
                      </span>
                      <span>·</span>
                      <span>Attached: {code.postContent.mediaType.toUpperCase()}</span>
                      {code.postContent.buttonText && (
                        <>
                          <span>·</span>
                          <span className="text-blue-400">Button: {code.postContent.buttonText}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {onTestCodeInSimulator && (
                      <button
                        onClick={() => onTestCodeInSimulator(code.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/50 hover:text-blue-200 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Test in Bot</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteCode(code.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
