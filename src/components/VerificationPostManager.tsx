import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Image as ImageIcon, 
  Video, 
  Music, 
  ExternalLink, 
  Save, 
  Sparkles, 
  Eye, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { VerificationPost, MediaType } from '../types/telegram.ts';

interface VerificationPostManagerProps {
  post: VerificationPost;
  onSave: (updated: VerificationPost) => Promise<void>;
}

export const VerificationPostManager: React.FC<VerificationPostManagerProps> = ({
  post,
  onSave
}) => {
  const [formData, setFormData] = useState<VerificationPost>({ ...post });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sampleImages = [
    { label: 'TeleForce Verified Shield', url: '/src/assets/images/telegram_bot_hero_1792137087644.jpg' },
    { label: 'Cyber Tech Banner', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Verification Success Post & Reward
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            This message and media drops automatically to users as soon as they join all required channels and click &quot;Check In&quot;.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500"
            />
            <span className="font-medium">Auto-Send on Verification</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Post Editor Form */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Text / Caption */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Verification Message Text / Caption
                </label>
                <span className="text-[11px] text-slate-500">Supports Markdown (*bold*, _italic_)</span>
              </div>
              <textarea
                rows={6}
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                placeholder="Enter congratulations text, rewards link, or instructions..."
                required
              />
            </div>

            {/* Media Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Attached Media Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'Text Only', icon: FileText },
                  { id: 'image', label: 'Image', icon: ImageIcon },
                  { id: 'video', label: 'Video', icon: Video },
                  { id: 'audio', label: 'Audio', icon: Music },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.mediaType === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setFormData({ ...formData, mediaType: item.id as MediaType })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media URL if media selected */}
            {formData.mediaType !== 'none' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Media Source URL ({formData.mediaType.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={formData.mediaUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="Enter direct image/video/audio URL or pick below"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">Quick Assets:</span>
                  {sampleImages.map((asset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, mediaUrl: asset.url, mediaType: 'image' })}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition-colors"
                    >
                      {asset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons Setup */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Inline Action Buttons (Blue & Red Theme)
              </span>

              {/* Primary Button (Blue) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-blue-400 font-medium mb-1">
                    Primary Button Label (Blue Action)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="e.g. 🔥 Open VIP Portal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Primary Button URL
                  </label>
                  <input
                    type="url"
                    value={formData.buttonUrl || ''}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="https://t.me/your_portal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Secondary Button (Red / Indigo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-red-400 font-medium mb-1">
                    Secondary Button Label (Red Action)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonText || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    placeholder="e.g. 👥 Share & Earn Bonus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Secondary Button URL
                  </label>
                  <input
                    type="url"
                    value={formData.secondaryButtonUrl || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonUrl: e.target.value })}
                    placeholder="https://t.me"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Changes saved to Bot engine!</span>
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Verification Post'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Telegram Message Preview */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Live Bot Message Mockup
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Telegram View
            </span>
          </div>

          {/* Telegram Bubble */}
          <div className="bg-[#182533] rounded-2xl p-4 shadow-lg border border-slate-700/50 space-y-3 max-w-sm mx-auto w-full my-auto">
            {/* Header / Bot Label */}
            <div className="flex items-center gap-2 pb-1 border-b border-slate-700/40">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold flex items-center justify-center text-white">
                B
              </div>
              <span className="text-xs font-semibold text-blue-400">TeleForce Official Bot</span>
              <span className="text-[10px] text-slate-400 ml-auto">now</span>
            </div>

            {/* Media Preview */}
            {formData.mediaType === 'image' && formData.mediaUrl && (
              <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 aspect-video relative">
                <img
                  src={formData.mediaUrl}
                  alt="Post attachment"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {formData.mediaType === 'video' && (
              <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 aspect-video flex flex-col items-center justify-center text-slate-400">
                <Video className="w-8 h-8 text-blue-400 mb-1" />
                <span className="text-[11px]">Video Attachment Preview</span>
              </div>
            )}

            {formData.mediaType === 'audio' && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Music className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white">VIP Audio Announcement</div>
                  <div className="text-slate-400 text-[10px]">02:45 · 4.2 MB</div>
                </div>
              </div>
            )}

            {/* Message Body */}
            <div className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
              {formData.text}
            </div>

            {/* Telegram Action Buttons (Blue & Red Theme) */}
            <div className="space-y-1.5 pt-2">
              {formData.buttonText && (
                <a
                  href={formData.buttonUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors shadow-sm shadow-blue-600/30"
                >
                  <span>{formData.buttonText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {formData.secondaryButtonText && (
                <a
                  href={formData.secondaryButtonUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold text-center transition-colors shadow-sm shadow-red-600/30"
                >
                  <span>{formData.secondaryButtonText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
