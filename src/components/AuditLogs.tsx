import React from 'react';
import { BotLog } from '../types/telegram.ts';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  Gift, 
  Radio, 
  UserPlus 
} from 'lucide-react';

interface AuditLogsProps {
  logs: BotLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const getIcon = (type: BotLog['type']) => {
    switch (type) {
      case 'verify':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'leave':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'claim':
        return <KeyRound className="w-3.5 h-3.5 text-amber-400" />;
      case 'bonus':
        return <Gift className="w-3.5 h-3.5 text-pink-400" />;
      case 'broadcast':
        return <Radio className="w-3.5 h-3.5 text-blue-400" />;
      case 'admin':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Live Telegram Bot Audit Trail
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Real-Time Events</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-xs text-slate-500 text-center py-4">No recent activity logged.</div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {logs.slice(0, 15).map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 text-xs bg-slate-950/60 border border-slate-800/60 rounded-lg p-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">{getIcon(log.type)}</span>
                <div>
                  <span className="font-semibold text-slate-200">{log.user}: </span>
                  <span className="text-slate-400">{log.details}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap shrink-0 mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
