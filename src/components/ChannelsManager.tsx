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
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import { ForceJoinChannel } from '../types/telegram.ts';

interface ChannelsManagerProps {
  channels: ForceJoinChannel[];
  onAddChannel: (channel: Partial<ForceJoinChannel> & { autoCreateApprovalLink?: boolean }) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onSimulateLeave: (channelId: string) => void;
  onRefreshData?: () => Promise<void>;
  autoApproveJoinRequests?: boolean;
  onToggleAutoApprove?: () => Promise<any>;
}

export const ChannelsManager: React.FC<ChannelsManagerProps> = ({
  channels,
  onAddChannel,
  onDeleteChannel,
  onSimulateLeave,
  onRefreshData,
  autoApproveJoinRequests,
  onToggleAutoApprove
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    channelId: '',
    inviteLink: '',
    type: 'channel' as 'channel' | 'group',
    required: true,
    memberCount: '',
    autoCreateApprovalLink: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.title || !formData.channelId) {
      setErrorMsg('Please fill in channel/group title and channel ID/username.');
      return;
    }

    if (!formData.autoCreateApprovalLink && !formData.inviteLink) {
      setErrorMsg('Please either provide an Invite Link or select "Bot Khud Approval Link Create Karega".');
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
        memberCount: formData.memberCount ? parseInt(formData.memberCount, 10) : undefined,
        autoCreateApprovalLink: formData.autoCreateApprovalLink
      });
      setFormData({
        title: '',
        channelId: '',
        inviteLink: '',
        type: 'channel',
        required: true,
        memberCount: '',
        autoCreateApprovalLink: true
      });
      setShowAddForm(false);
      if (onRefreshData) await onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add channel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify Bot Admin Status in real-time
  const handleVerifyAdmin = async (channel: ForceJoinChannel) => {
    setActionLoadingId(channel.id);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/channels/${channel.id}/verify-admin`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({
          id: channel.id,
          msg: data.isAdmin ? '✅ Bot is Administrator!' : '⚠️ Bot is NOT an admin in this channel! Please add bot as Admin.',
          isError: !data.isAdmin
        });
        if (onRefreshData) await onRefreshData();
      } else {
        setActionFeedback({ id: channel.id, msg: data.error || 'Failed to verify admin', isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ id: channel.id, msg: err.message, isError: true });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Auto-generate Join Request Approval Link
  const handleCreateApprovalLink = async (channel: ForceJoinChannel) => {
    setActionLoadingId(`approval-${channel.id}`);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/channels/${channel.id}/create-approval-link`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({
          id: channel.id,
          msg: `✨ Bot Approval Link Created: ${data.inviteLink}`
        });
        if (onRefreshData) await onRefreshData();
      } else {
        setActionFeedback({ id: channel.id, msg: data.error || 'Bot needs Admin rights to create approval links', isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ id: channel.id, msg: err.message, isError: true });
    } finally {
      setActionLoadingId(null);
    }
  };

  const channelCount = channels.filter((c) => c.type === 'channel').length;
  const groupCount = channels.filter((c) => c.type === 'group').length;
  const totalAudience = channels.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Bot Admin Rights Warning Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-blue-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Bot Admin Required & Auto Approval Links</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                REQUIRED BY TELEGRAM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Bot ko aapke sabhi required channels aur groups me <strong>Admin hona mandatory hai</strong> (&quot;Invite Users via Link&quot; permission ke sath). Bot khud <strong>Approval Links (Join Requests)</strong> create karega aur users ko verify karega!
            </p>
          </div>
        </div>
      </div>

      {/* ⚡ Channel Join Request Auto-Approval Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            autoApproveJoinRequests !== false
              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
              : 'bg-red-600/20 border-red-500/40 text-red-400'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Channel Join Request Auto-Approval</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                autoApproveJoinRequests !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {autoApproveJoinRequests !== false ? 'ACTIVE: ON ✅' : 'DISABLED: OFF 🛑'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {autoApproveJoinRequests !== false
                ? 'Bot user join requests ko turant automatically approve karta hai. Users bina waiting ke direct verified hote hain.'
                : 'Auto-approval band hai. Join requests Telegram channel me Pending rahengi aur Channel Admin ko manually approve karni hongi.'}
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Telegram bot command: <code className="text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/40">/autoapproval {autoApproveJoinRequests !== false ? 'off' : 'on'}</code>
            </div>
          </div>
        </div>

        {onToggleAutoApprove && (
          <button
            onClick={onToggleAutoApprove}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              autoApproveJoinRequests !== false
                ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white shadow-red-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white shadow-emerald-600/30'
            }`}
          >
            <span>{autoApproveJoinRequests !== false ? '🛑 Turn OFF Auto-Approval' : '⚡ Turn ON Auto-Approval'}</span>
          </button>
        )}
      </div>

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
            Users cannot claim bonuses, secret codes, or exclusive content without joining these required channels.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap shrink-0 cursor-pointer"
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
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Bot must be Admin in channel
            </span>
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
              <span className="text-[10px] text-slate-500 mt-1 block">Private channels require -100... ID</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Invite Link (URL)
                </label>
                <span className="text-[10px] text-indigo-400">Optional if auto-generated</span>
              </div>
              <input
                type="url"
                placeholder="https://t.me/PrimeUpdatesHub (Leave blank if auto-generating)"
                value={formData.inviteLink}
                onChange={(e) => setFormData({ ...formData, inviteLink: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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

          {/* Bot Auto Approval Link Generation Option */}
          <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/30 space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-200 font-medium">
              <input
                type="checkbox"
                checked={formData.autoCreateApprovalLink}
                onChange={(e) => setFormData({ ...formData, autoCreateApprovalLink: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-700 rounded focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ⚡ Bot khud Approval Link create karega (Join Request with Auto-Approve)
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-6">
              Bot Telegram API ke <code>createChatInviteLink</code> se approval link banayega. Users click karke request bhejenge aur bot automatically approve kar dega.
            </p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Adding & Checking Admin...' : 'Save Channel'}
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
            Bot Admin & Approval link status verified
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-white">{channel.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {channel.type}
                      </span>
                      {channel.required && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          REQUIRED
                        </span>
                      )}

                      {/* Admin Required Status Badge */}
                      {channel.isBotAdmin ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          BOT ADMIN VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          BOT ADMIN REQUIRED
                        </span>
                      )}

                      {/* Approval Link Badge */}
                      {channel.isApprovalLink && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          BOT APPROVAL LINK
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span className="text-blue-400">{channel.channelId}</span>
                      <span>·</span>
                      <a
                        href={channel.inviteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors underline"
                      >
                        <span>{channel.isApprovalLink ? 'Approval Join Link' : 'Invite Link'}</span>
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

                    {/* Action Feedback Banner */}
                    {actionFeedback && actionFeedback.id === channel.id && (
                      <div className={`mt-2 p-2 rounded text-xs border ${
                        actionFeedback.isError
                          ? 'bg-red-950/60 border-red-800 text-red-200'
                          : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      }`}>
                        {actionFeedback.msg}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Verify Admin, Create Approval Link, Simulator Leave, Delete */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {/* Verify Admin Button */}
                  <button
                    onClick={() => handleVerifyAdmin(channel)}
                    disabled={actionLoadingId === channel.id}
                    title="Check if Bot has administrator rights in this channel"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoadingId === channel.id ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
                    <span>Check Admin</span>
                  </button>

                  {/* Create Approval Link Button */}
                  <button
                    onClick={() => handleCreateApprovalLink(channel)}
                    disabled={actionLoadingId === `approval-${channel.id}`}
                    title="Generate Bot Approval Invite Link (creates_join_request)"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Create Approval Link</span>
                  </button>

                  {/* Leave Simulator */}
                  <button
                    onClick={() => onSimulateLeave(channel.id)}
                    title="Simulate what happens when a user leaves this channel"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/50 hover:text-red-200 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Test Leave</span>
                  </button>

                  <button
                    onClick={() => onDeleteChannel(channel.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
          <span className="font-semibold text-white">Bot Admin & Approval Link Workflow: </span>
          Jab aap channel add karte hain, bot automatically check karta hai ki wo admin hai ya nahi. Agar aap <strong>&quot;Bot khud Approval Link create karega&quot;</strong> select karte hain, toh bot Telegram API se approval invite link create karta hai. Jab user request bhejta hai, bot use auto-approve kar leta hai aur membership register kar deta hai!
        </div>
      </div>
    </div>
  );
};
