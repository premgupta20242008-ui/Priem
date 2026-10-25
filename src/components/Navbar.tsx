import { 
  ShieldCheck, 
  Layers, 
  KeyRound, 
  Radio, 
  Users, 
  Settings, 
  Smartphone, 
  ExternalLink, 
  Clock,
  Palette,
  Database,
  Cloud,
  RotateCcw
} from 'lucide-react';

export type TabType = 'channels' | 'text_editor' | 'verification' | 'codes' | 'broadcast' | 'admins' | 'database' | 'settings';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isSimulatorOpen: boolean;
  onToggleSimulator: () => void;
  isBotRunning: boolean;
  onToggleBotRunning: () => void;
  currentIST: string;
  botUsername: string;
  onOpenHostingGuide?: () => void;
  onFixCrashRestart?: () => void;
  isRestarting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isSimulatorOpen,
  onToggleSimulator,
  isBotRunning,
  onToggleBotRunning,
  currentIST,
  botUsername,
  onOpenHostingGuide,
  onFixCrashRestart,
  isRestarting
}) => {
  const tabs = [
    { id: 'channels' as TabType, label: 'Channels', icon: Layers },
    { id: 'text_editor' as TabType, label: 'Force Text & Buttons', icon: Palette },
    { id: 'verification' as TabType, label: 'Post on Join', icon: ShieldCheck },
    { id: 'codes' as TabType, label: 'Claim Codes', icon: KeyRound },
    { id: 'broadcast' as TabType, label: 'IST Broadcasts', icon: Radio },
    { id: 'admins' as TabType, label: 'Admins & Users', icon: Users },
    { id: 'database' as TabType, label: 'Telegram DB & Backup', icon: Database },
    { id: 'settings' as TabType, label: 'Config & /admin', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
              TF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">TeleForce</span>
                <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">PRO BOT</span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>@{botUsername || 'PrimeForceJoinBot'}</span>
                <span className="text-slate-600">·</span>
                <span className="text-blue-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" />
                  IST: {currentIST ? currentIST.split(' ')[1] : 'Live'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Host 24/7 Guide Button */}
            <button
              onClick={onOpenHostingGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 cursor-pointer"
              title="24/7 Free Hosting & Deployment Instructions (Render, VPS, UptimeRobot)"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-200" />
              <span>Host 24/7</span>
            </button>

            {/* Crash Fix & Restart Button */}
            {onFixCrashRestart && (
              <button
                onClick={onFixCrashRestart}
                disabled={isRestarting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white shadow-md shadow-orange-500/20 border border-orange-400/30 cursor-pointer disabled:opacity-50"
                title="Fix Telegram connection, clear conflicts, reset webhook and restart bot engine"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
                <span>{isRestarting ? 'Fixing...' : 'Fix Crash & Restart'}</span>
              </button>
            )}

            <button
              onClick={onToggleBotRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                isBotRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-emerald-500/20'
              }`}
              title={isBotRunning ? 'Click to pause bot engine' : 'Click to start bot engine & real polling'}
            >
              <div className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-ping' : 'bg-white'}`} />
              <span>{isBotRunning ? 'Bot Running' : 'Start Bot'}</span>
            </button>

            <button
              onClick={onToggleSimulator}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
                isSimulatorOpen
                  ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:brightness-110'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isSimulatorOpen ? 'Hide Simulator' : 'Open Simulator'}</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/50 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
