import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  AlertCircle, 
  Award, 
  ShieldAlert, 
  Share2,
  ExternalLink,
  Coins
} from 'lucide-react';
import { AdminUser, BotUser } from '../types/telegram.ts';

interface AdminsManagerProps {
  admins: AdminUser[];
  users: BotUser[];
  onAddAdmin: (adminData: Partial<AdminUser>) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
  onSimulateUserLeave: (telegramId: string) => Promise<void>;
}

export const AdminsManager: React.FC<AdminsManagerProps> = ({
  admins,
  users,
  onAddAdmin,
  onDeleteAdmin,
  onSimulateUserLeave
}) => {
  const [activeTab, setActiveTab] = useState<'admins' | 'users' | 'referrals'>('admins');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    telegramId: '',
    username: '',
    role: 'superadmin' as 'superadmin' | 'moderator'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name || !formData.telegramId) {
      setErrorMsg('Name and Telegram ID are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddAdmin(formData);
      setFormData({
        name: '',
        telegramId: '',
        username: '',
        role: 'superadmin'
      });
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBonusDistributed = users.reduce((acc, u) => acc + (u.bonusBalance || 0), 0);
  const totalReferrals = users.reduce((acc, u) => acc + (u.referralCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Admins, Members & Referral Network
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorize team admins by Telegram ID and monitor user verification status & referral earnings.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'admins' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admins ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bot Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'referrals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Referrals Leaderboard
          </button>
        </div>
      </div>

      {/* Tab: Admins */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Co-Admins Authorized via Telegram ID
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddForm ? 'Cancel' : 'Add Co-Admin by Telegram ID'}
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="font-semibold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Authorize New Telegram Admin
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telegram User ID (Numeric) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1092837465"
                    value={formData.telegramId}
                    onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telegram @Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @rahul_admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Role & Permissions
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="superadmin">Super Admin (All Access)</option>
                    <option value="moderator">Moderator (Broadcast & Posts)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Granting...' : 'Authorize Admin'}
                </button>
              </div>
            </form>
          )}

          {/* Admins Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {admin.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{admin.name}</span>
                        {admin.role === 'owner' ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            PRIMARY OWNER
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {admin.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>ID: <strong className="text-slate-200">{admin.telegramId}</strong></span>
                        {admin.username && (
                          <>
                            <span>·</span>
                            <span className="text-blue-400">@{admin.username}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>Added: {new Date(admin.addedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {admin.role !== 'owner' && (
                    <button
                      onClick={() => onDeleteAdmin(admin.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Bot Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Registered Telegram members interacting with the bot. Real-time verification state and channel leave trackers.
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {users.map((user) => (
                <div
                  key={user.telegramId}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      user.isVerified && !user.hasLeftRequired
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {user.firstName.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{user.firstName}</span>
                        {user.username && (
                          <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
                        )}

                        {user.isVerified && !user.hasLeftRequired ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            VERIFIED (IN ALL CHANNELS)
                          </span>
                        ) : user.hasLeftRequired ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            LEFT REQUIRED CHANNEL!
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            PENDING JOIN
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono">
                        <span>Telegram ID: {user.telegramId}</span>
                        <span>·</span>
                        <span>Balance: <strong className="text-amber-400">{user.bonusBalance} pts</strong></span>
                        <span>·</span>
                        <span>Invites: {user.referralCount}</span>
                        {user.claimedCodes.length > 0 && (
                          <>
                            <span>·</span>
                            <span>Codes: {user.claimedCodes.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Simulate leave action button */}
                  <div className="self-end md:self-center">
                    <button
                      onClick={() => onSimulateUserLeave(user.telegramId)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900/50 transition-colors"
                      title="Simulate user leaving a channel to test bot re-join alert message"
                    >
                      Simulate Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Referrals */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Reward Points Issued</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {totalBonusDistributed.toLocaleString()} pts
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Referral Invites Completed</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {totalReferrals.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Referral Leaderboard
            </div>
            <div className="divide-y divide-slate-800/80">
              {[...users]
                .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
                .map((u, rank) => (
                  <div key={u.telegramId} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        rank === 0 ? 'bg-amber-500 text-black' : rank === 1 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{rank + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{u.firstName} (@{u.username || u.telegramId})</div>
                        <div className="text-xs text-slate-400 font-mono">Ref Code: {u.referralCode}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-blue-400 tabular-nums">{u.referralCount} referrals</div>
                      <div className="text-xs text-amber-400 tabular-nums">{u.bonusBalance} pts balance</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
