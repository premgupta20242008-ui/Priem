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
  Calendar,
  Edit3,
  Link2,
  Undo2,
  X,
  RefreshCw
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
  onDeleteBroadcastFromUsers?: (id: string) => Promise<any>;
  onEditBroadcastOnUsers?: (id: string, options: any) => Promise<any>;
  onDeleteLastBroadcast?: () => Promise<any>;
}

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({
  broadcasts,
  currentIST,
  totalUsers,
  verifiedUsers,
  onSendBroadcast,
  onTriggerNow,
  onDeleteBroadcast,
  onDeleteBroadcastFromUsers,
  onEditBroadcastOnUsers,
  onDeleteLastBroadcast
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
  
  // Edit on Users Modal state
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastMessage | null>(null);
  const [editFormData, setEditFormData] = useState({
    newText: '',
    replaceOldUrl: '',
    replaceNewUrl: '',
    newButtonText: '',
    newButtonUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isError?: boolean; message: string } | null>(null);

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
      setFeedback({ isError: false, message: 'Broadcast dispatched successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFromUsers = async (b: BroadcastMessage) => {
    if (!window.confirm(`Kya aap sachme broadcast "${b.title}" ko sabhi recipients ke Telegram se delete karna chahte hain?`)) {
      return;
    }
    setActionLoadingId(`del-users-${b.id}`);
    setFeedback(null);
    try {
      if (onDeleteBroadcastFromUsers) {
        const res = await onDeleteBroadcastFromUsers(b.id);
        setFeedback({
          isError: !res.success,
          message: res.message || `Deleted from ${res.affectedUsers || 0} users' Telegram chats.`
        });
      } else {
        const res = await fetch(`/api/broadcasts/${b.id}/delete-from-users`, { method: 'POST' });
        const data = await res.json();
        setFeedback({
          isError: !data.success,
          message: data.message || `Deleted from ${data.affectedUsers || 0} users' Telegram chats.`
        });
      }
    } catch (err: any) {
      setFeedback({ isError: true, message: err.message || 'Failed to delete from users' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleDeleteLastFromUsers = async () => {
    if (!window.confirm('Kya aap sabhi users ke phone se aakhiri (last) broadcast ko turant delete karna chahte hain?')) {
      return;
    }
    setActionLoadingId('del-last');
    setFeedback(null);
    try {
      if (onDeleteLastBroadcast) {
        const res = await onDeleteLastBroadcast();
        setFeedback({
          isError: !res.success,
          message: res.message || `Deleted from ${res.affectedUsers || 0} users' screens.`
        });
      } else {
        const res = await fetch('/api/broadcasts/delete-last', { method: 'POST' });
        const data = await res.json();
        setFeedback({
          isError: !data.success,
          message: data.message || `Deleted from ${data.affectedUsers || 0} users' screens.`
        });
      }
    } catch (err: any) {
      setFeedback({ isError: true, message: err.message || 'Failed to delete last broadcast' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleOpenEditModal = (b: BroadcastMessage) => {
    setEditingBroadcast(b);
    setEditFormData({
      newText: b.postContent.text || '',
      replaceOldUrl: '',
      replaceNewUrl: '',
      newButtonText: b.postContent.buttonText || '',
      newButtonUrl: b.postContent.buttonUrl || ''
    });
  };

  const handleSaveEditOnUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroadcast) return;
    setIsEditing(true);
    setFeedback(null);
    try {
      if (onEditBroadcastOnUsers) {
        const res = await onEditBroadcastOnUsers(editingBroadcast.id, editFormData);
        setFeedback({
          isError: !res.success,
          message: res.message || `Updated on ${res.affectedUsers || 0} users' screens.`
        });
      } else {
        const res = await fetch(`/api/broadcasts/${editingBroadcast.id}/edit-on-users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        });
        const data = await res.json();
        setFeedback({
          isError: !data.success,
          message: data.message || `Updated on ${data.affectedUsers || 0} users' screens.`
        });
      }
      setEditingBroadcast(null);
    } catch (err: any) {
      setFeedback({ isError: true, message: err.message || 'Failed to edit on users' });
    } finally {
      setIsEditing(false);
      setTimeout(() => setFeedback(null), 5000);
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
              Broadcast Engine (Instant, Scheduled & Recall)
            </h2>
            <span className="text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              IST (UTC+5:30)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Send instant mass alerts or schedule posts. Galti se bheja gaya broadcast sabhi users ke screen se delete ya edit bhi kar sakte hain!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Create Broadcast'}
          </button>
        </div>
      </div>

      {/* Emergency Recall & Edit Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shrink-0">
            <Undo2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Broadcast Message Recall & Edit Control</h3>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">
                Users Side Recall
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Agar galti se koi galat message ya link broadcast ho jaye, toh use users ke Telegram chat se turant delete karein ya link replace karein.
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
              <span>Telegram commands:</span>
              <code className="text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">/delbroadcast last</code>
              <code className="text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">/replacelink &lt;old&gt; &lt;new&gt;</code>
              <code className="text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">/editbroadcast last &lt;text&gt;</code>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeleteLastFromUsers}
          disabled={actionLoadingId === 'del-last'}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 rounded-lg transition-all shadow-md shadow-red-600/30 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          title="Delete last broadcast from all recipients' Telegram screens"
        >
          <Trash2 className={`w-4 h-4 ${actionLoadingId === 'del-last' ? 'animate-spin' : ''}`} />
          <span>{actionLoadingId === 'del-last' ? 'Deleting from Users...' : '🗑️ Delete Last Broadcast from Users'}</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
          feedback.isError 
            ? 'bg-red-950/60 border-red-800 text-red-300'
            : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.isError ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" />
              Compose New Broadcast Message
            </h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setBroadcastMode('instant')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  broadcastMode === 'instant' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Instant Send
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMode('scheduled')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  broadcastMode === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Schedule (IST)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-900 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Broadcast Campaign Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Weekend VIP Code Drop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Audience <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="verified_only">Verified Users Only (Joined all channels)</option>
                <option value="all">All Registered Bot Users</option>
                <option value="unverified_only">Unverified / Left Users Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Message Text (Supports Markdown) <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter message text... Use *bold*, _italic_, or `code`"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Inline Button Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 🎁 Claim Bonus Now"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Inline Button URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://t.me/..."
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {broadcastMode === 'scheduled' && (
            <div className="p-3 bg-blue-950/20 border border-blue-900/50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-300 mb-1">
                  Schedule Date (IST) <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-300 mb-1">
                  Schedule Time (IST 24-hr) <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
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
            Messages are tracked with recipient message IDs for 1-click recall & edit
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
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  b.isDeletedFromUsers ? 'bg-red-950/20 opacity-75' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{b.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {b.type}
                    </span>
                    {b.status === 'sent' && !b.isDeletedFromUsers && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        DELIVERED
                      </span>
                    )}
                    {b.isDeletedFromUsers && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        DELETED FROM USERS ({b.deletedFromUsersCount || b.sentCount})
                      </span>
                    )}
                    {b.isEditedOnUsers && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        EDITED ON USERS
                      </span>
                    )}
                    {b.status === 'scheduled' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        SCHEDULED (IST)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 line-clamp-2 max-w-xl font-mono">
                    {b.postContent.text}
                  </div>

                  {b.postContent.buttonText && b.postContent.buttonUrl && (
                    <div className="flex items-center gap-2 text-[11px] text-blue-400 font-mono">
                      <Link2 className="w-3 h-3" />
                      <span>Button: &quot;{b.postContent.buttonText}&quot; ➔ {b.postContent.buttonUrl}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono flex-wrap">
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
                    {b.sentMessages && b.sentMessages.length > 0 && (
                      <span className="text-emerald-400">
                        • {b.sentMessages.length} tracked for recall
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  {b.status === 'scheduled' && (
                    <button
                      onClick={() => onTriggerNow(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                      title="Trigger immediately without waiting"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Send Now</span>
                    </button>
                  )}

                  {b.status === 'sent' && !b.isDeletedFromUsers && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/50 transition-colors cursor-pointer"
                        title="Edit text or replace links across all users' screens"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Edit / Replace Link</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFromUsers(b)}
                        disabled={actionLoadingId === `del-users-${b.id}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete this message from all recipients' Telegram screens"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete from Users</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onDeleteBroadcast(b.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Remove from Dashboard Records"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit on Users Modal */}
      {editingBroadcast && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Edit Broadcast on All Users&apos; Screens</h3>
              </div>
              <button
                onClick={() => setEditingBroadcast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Target: <span className="text-white font-semibold">{editingBroadcast.title}</span> (Sent to {editingBroadcast.sentCount} users). Any updates saved here will be applied directly to recipients&apos; Telegram messages via the Telegram API!
            </p>

            <form onSubmit={handleSaveEditOnUsers} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Updated Message Text (Markdown)
                </label>
                <textarea
                  rows={4}
                  value={editFormData.newText}
                  onChange={(e) => setEditFormData({ ...editFormData, newText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4" />
                  Quick URL / Link Replacer (Replace bad link with correct link)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Old / Wrong URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://wrong-link.com"
                      value={editFormData.replaceOldUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, replaceOldUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-red-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">New / Correct URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://correct-link.com"
                      value={editFormData.replaceNewUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, replaceNewUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={editFormData.newButtonText}
                    onChange={(e) => setEditFormData({ ...editFormData, newButtonText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Button URL</label>
                  <input
                    type="text"
                    value={editFormData.newButtonUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, newButtonUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBroadcast(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
                >
                  <Edit3 className={`w-3.5 h-3.5 ${isEditing ? 'animate-spin' : ''}`} />
                  <span>{isEditing ? 'Updating on Telegram...' : 'Apply Edits to All Users'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
