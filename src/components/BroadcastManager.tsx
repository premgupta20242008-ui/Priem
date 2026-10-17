import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  Music,
  ExternalLink,
  Users,
  Calendar
} from 'lucide-react';
import { BroadcastMessage, MediaType } from '../types/telegram.ts';

interface BroadcastManagerProps {
  broadcasts: BroadcastMessage[];
  currentIST: string;
  totalUsers: number;
  verifiedUsers: number;
  onSendBroadcast: (data: any) => Promise<void>;
  onTriggerNow: (id: string) => Promise<void>;
  onDeleteBroadcast: (id: string) => Promise<void>;
}

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({
  broadcasts,
  currentIST,
  totalUsers,
  verifiedUsers,
  onSendBroadcast,
  onTriggerNow,
  onDeleteBroadcast
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState<'instant' | 'scheduled'>('instant');
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    mediaType: 'none' as MediaType,
    mediaUrl: '',
    buttonText: '',
    buttonUrl: '',
    targetAudience: 'verified_only' as 'all' | 'verified_only' | 'unverified_only',
    scheduledDate: '',
    scheduledTime: '12:00'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.title || !formData.text) {
      setErrorMsg('Broadcast Title and Message Text are required.');
      return;
    }

    let scheduledTimeIST: string | undefined = undefined;
    if (broadcastMode === 'scheduled') {
      if (!formData.scheduledDate || !formData.scheduledTime) {
        setErrorMsg('Please select both Indian Date and Time for scheduling.');
        return;
      }
      scheduledTimeIST = `${formData.scheduledDate} ${formData.scheduledTime}:00`;
    }

    try {
      setIsSubmitting(true);
      await onSendBroadcast({
        title: formData.title.trim(),
        type: broadcastMode,
        targetAudience: formData.targetAudience,
        scheduledTimeIST,
        postContent: {
          text: formData.text,
          mediaType: formData.mediaType,
          mediaUrl: formData.mediaUrl,
          buttonText: formData.buttonText,
          buttonUrl: formData.buttonUrl
        }
      });
      setFormData({
        title: '',
        text: '',
        mediaType: 'none',
        mediaUrl: '',
        buttonText: '',
        buttonUrl: '',
        targetAudience: 'verified_only',
        scheduledDate: '',
        scheduledTime: '12:00'
      });
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              Broadcast Engine (Instant & IST Scheduled)
            </h2>
            <span className="text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              IST (UTC+5:30)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Send instant mass alerts or schedule messages with precise Indian Standard Time timing.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Create Broadcast'}
        </button>
      </div>

      {/* Clock Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Current Indian Standard Time (IST)</div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {currentIST || 'Syncing IST...'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            Verified Audience: <span className="text-emerald-400 font-bold tabular-nums">{verifiedUsers}</span>
          </div>
          <span>·</span>
          <div>
            Total Registered: <span className="text-slate-200 font-bold tabular-nums">{totalUsers}</span>
          </div>
        </div>
      </div>

      {/* New Broadcast Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-blue-500/30 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" />
              Compose Mass Telegram Broadcast
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setBroadcastMode('instant')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  broadcastMode === 'instant' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Instant Broadcast
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMode('scheduled')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  broadcastMode === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⏰ Scheduled (IST)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Broadcast Campaign Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. VIP Alpha Signal Drop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Audience Filter
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="verified_only">Verified Members Only (In All Channels)</option>
                <option value="all">All Bot Users (Verified & Pending)</option>
                <option value="unverified_only">Unverified / Left Channel Users Only (Re-engage)</option>
              </select>
            </div>
          </div>

          {/* IST Scheduling Controls */}
          {broadcastMode === 'scheduled' && (
            <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold">
                <Calendar className="w-4 h-4" />
                Select Indian Standard Time (IST) Execution Schedule:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Date (IST)</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Time (IST 24-hr format)</label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Broadcast Content */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Broadcast Message Content <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write your announcement, markdown text, emojis, and links..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          {/* Media & Action Buttons */}
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

          {/* Optional Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-medium text-blue-400 mb-1">
                Inline Button Label (Blue Action)
              </label>
              <input
                type="text"
                placeholder="e.g. 🎁 Claim Now"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Inline Button Link URL
              </label>
              <input
                type="url"
                placeholder="https://t.me"
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : broadcastMode === 'instant'
                  ? 'Send Instant Broadcast'
                  : 'Schedule for IST Time'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Broadcast History & Queue */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Broadcast Queue & History ({broadcasts.length})
          </div>
          <div className="text-xs text-slate-400">
            Background worker triggers scheduled jobs automatically
          </div>
        </div>

        {broadcasts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No broadcasts yet. Click &quot;Create Broadcast&quot; to draft or send your first message.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{b.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {b.type}
                    </span>
                    {b.status === 'sent' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        DELIVERED
                      </span>
                    )}
                    {b.status === 'scheduled' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        SCHEDULED (IST)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 line-clamp-1 max-w-xl font-mono">
                    {b.postContent.text}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                    {b.scheduledTimeIST && (
                      <span className="text-blue-400">Scheduled: {b.scheduledTimeIST} IST</span>
                    )}
                    {b.executedAt && (
                      <span>Executed: {new Date(b.executedAt).toLocaleTimeString()}</span>
                    )}
                    <span>·</span>
                    <span className="text-slate-300 tabular-nums">
                      Delivered to {b.sentCount} users ({b.targetAudience.replace('_', ' ')})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {b.status === 'scheduled' && (
                    <button
                      onClick={() => onTriggerNow(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50 transition-colors"
                      title="Trigger immediately without waiting"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Send Now</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteBroadcast(b.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Broadcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
