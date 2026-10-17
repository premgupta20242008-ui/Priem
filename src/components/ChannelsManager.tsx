import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertTriangle, 
  Users, 
  Radio, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ForceJoinChannel } from '../types/telegram.ts';

interface ChannelsManagerProps {
  channels: ForceJoinChannel[];
  onAddChannel: (channel: Partial<ForceJoinChannel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onSimulateLeave: (channelId: string) => void;
}

export const ChannelsManager: React.FC<ChannelsManagerProps> = ({
  channels,
  onAddChannel,
  onDeleteChannel,
  onSimulateLeave
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    channelId: '',
    inviteLink: '',
    type: 'channel' as 'channel' | 'group',
    required: true,
    memberCount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.title || !formData.channelId || !formData.inviteLink) {
      setErrorMsg('Please fill in title, channel ID/username, and invite link.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddChannel({
        title: formData.title,
        channelId: formData.channelId,
        inviteLink: formData.inviteLink,
        type: formData.type,
        required: formData.required,
        memberCount: formData.memberCount ? parseInt(formData.memberCount, 10) : undefined
      });
      setFormData({
        title: '',
        channelId: '',
        inviteLink: '',
        type: 'channel',
        required: true,
        memberCount: ''
      });
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add channel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const channelCount = channels.filter((c) => c.type === 'channel').length;
  const groupCount = channels.filter((c) => c.type === 'group').length;
  const totalAudience = channels.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Broadcast Channels</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{channelCount}</div>
            <div className="text-[11px] text-blue-400 mt-1">Force Join Channels</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Discussion Groups</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{groupCount}</div>
            <div className="text-[11px] text-indigo-400 mt-1">Force Join Groups</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Combined Reach</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {totalAudience.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-500 mt-1">Subscribers Protected</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Force Join Channels & Groups
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Users cannot claim bonuses, secret codes, or content without joining these required channels.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Channel / Group'}
        </button>
      </div>

      {/* Add Channel Modal/Inline Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-blue-500/30 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Configure New Force Join Channel or Group
            </span>
            <span className="text-[11px] text-slate-400">Bot must be Admin in this channel/group</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Channel / Group Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Prime VIP Signals"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Telegram ID or Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. @PrimeUpdatesHub or -100123456789"
                value={formData.channelId}
                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Invite Link (URL) <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://t.me/PrimeUpdatesHub"
                value={formData.inviteLink}
                onChange={(e) => setFormData({ ...formData, inviteLink: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'channel' | 'group' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="channel">Broadcast Channel</option>
                <option value="group">Discussion Group</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-700 rounded focus:ring-blue-500"
              />
              <span>Mandatory for Verification & Claim Codes</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Save Channel'}
            </button>
          </div>
        </form>
      )}

      {/* Channel List Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active Force Join Requirements ({channels.length})
          </div>
          <div className="text-xs text-slate-400">
            Leave detector actively checks all members
          </div>
        </div>

        {channels.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No force join channels added yet. Click &quot;Add Channel / Group&quot; to configure your first required channel.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    channel.type === 'channel'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {channel.type === 'channel' ? <Radio className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{channel.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {channel.type}
                      </span>
                      {channel.required && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          REQUIRED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span className="text-blue-400">{channel.channelId}</span>
                      <span>·</span>
                      <a
                        href={channel.inviteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Invite Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {channel.memberCount && (
                        <>
                          <span>·</span>
                          <span className="text-slate-400 tabular-nums">
                            {channel.memberCount.toLocaleString()} members
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Leave Simulator */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onSimulateLeave(channel.id)}
                    title="Simulate what happens when a user leaves this channel"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/50 hover:text-red-200 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Test Leave Alert</span>
                  </button>

                  <button
                    onClick={() => onDeleteChannel(channel.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Channel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Explainer Banner */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">How Leave Detection Works: </span>
          When any member leaves a required channel or group, the bot immediately pauses their verified status, blocks all secret claim codes, and dispatches a high-priority warning message with direct re-join buttons styled in vibrant blue and red!
        </div>
      </div>
    </div>
  );
};
