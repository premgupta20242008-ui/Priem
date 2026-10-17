import React, { useState } from 'react';
import { 
  Server, 
  Cloud, 
  Terminal, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Activity, 
  Zap,
  Globe,
  Database,
  BellRing,
  HelpCircle,
  FileCode,
  Check
} from 'lucide-react';

interface HostingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername?: string;
}

export const HostingGuideModal: React.FC<HostingGuideModalProps> = ({
  isOpen,
  onClose,
  botUsername = 'PrimeForceJoinBot'
}) => {
  const [activeTab, setActiveTab] = useState<'render' | 'vps' | 'docker' | 'railway' | 'uptimerobot'>('render');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingHealth, setIsTestingHealth] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestHealth = async () => {
    setIsTestingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Failed to ping /api/health' });
    } finally {
      setIsTestingHealth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">24/7 Hosting & Deployment Guide</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FREE & EASY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Apne Telegram Bot aur Dashboard ko hamesha (24 ghante) live chalane ke aasan tarike
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('render')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'render'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            1. Render.com (Free & Recommended)
          </button>

          <button
            onClick={() => setActiveTab('uptimerobot')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'uptimerobot'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            2. 24x7 Keep-Alive (UptimeRobot)
          </button>

          <button
            onClick={() => setActiveTab('vps')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'vps'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. VPS / Linux (PM2)
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'docker'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            4. Docker Container
          </button>

          <button
            onClick={() => setActiveTab('railway')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'railway'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            5. Railway / Koyeb
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: RENDER.COM */}
          {activeTab === 'render' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-blue-400 text-sm block mb-1">
                  🌟 Render.com par 100% Free me 24/7 kaise host karein:
                </span>
                Render par aapka Web Dashboard aur Telegram Bot dono ek saath chalte hain. Render ka free tier lifetime free rehta hai aur automatic GitHub deployments support karta hai.
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-semibold text-white">Code ko GitHub par Push karein</h4>
                    <p className="text-xs text-slate-400">
                      Apne project folder ko GitHub repository par upload karein:
                    </p>
                    <div className="relative mt-2">
                      <pre className="bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                        git init{'\n'}git add .{'\n'}git commit -m "Initial TeleForce Bot commit"{'\n'}git branch -M main{'\n'}git remote add origin https://github.com/YOUR_USERNAME/teleforce-bot.git{'\n'}git push -u origin main
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit push -u origin main`, 'git-push')}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {copiedKey === 'git-push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Render.com par New Web Service banayein</h4>
                      <a
                        href="https://dashboard.render.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                      >
                        Open Render <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li><strong>Render.com</strong> par account banayein (Free with GitHub).</li>
                      <li><strong>New +</strong> button par click karein aur <strong>Web Service</strong> chunein.</li>
                      <li>Apna GitHub repository connect karein.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-semibold text-white">Settings Configure karein</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Runtime:</span>
                        <span className="font-mono text-emerald-400 font-semibold">Node</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Build Command:</span>
                        <span className="font-mono text-blue-400 font-semibold">npm install && npm run build</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Start Command:</span>
                        <span className="font-mono text-blue-400 font-semibold">npm start</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Instance Type:</span>
                        <span className="font-mono text-purple-400 font-semibold">Free ($0/month)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-semibold text-white">Environment Variables Add karein</h4>
                    <p className="text-xs text-slate-400">
                      Render Dashboard mein <strong>Environment</strong> section mein jakar ye variables add karein:
                    </p>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span><strong className="text-blue-400">NODE_ENV:</strong> production</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span><strong className="text-blue-400">TELEGRAM_BOT_TOKEN:</strong> your_bot_token_from_botfather</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30">
                  <div className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-semibold text-emerald-400">Important: 24/7 Keep-Alive setup karein</h4>
                    <p className="text-xs text-slate-300">
                      Render free instances 15 minute bina traffic ke sleep mode me chale jaate hain. Bot ko 24x7 bina ruke chalane ke liye <strong>UptimeRobot</strong> (free) par <code>/api/health</code> endpoint set karein. (Agla tab dekhein 👉)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPTIMEROBOT KEEP-ALIVE */}
          {activeTab === 'uptimerobot' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-emerald-400 text-sm block mb-1">
                  ⚡ Bot ko 24 Ghante Hamesha Active (Awake) Rakhne Ka Secret Formula:
                </span>
                Render, Koyeb, ya kisi bhi free cloud host par free servers 15 minute baad so (sleep) jaate hain. UptimeRobot har 5 minute me bot ke <code>/api/health</code> link ko ping karega, jisse bot <strong>1 second ke liye bhi band nahi hoga!</strong>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Aapka Live 24/7 Healthcheck Endpoint:
                  </span>
                  <button
                    onClick={handleTestHealth}
                    disabled={isTestingHealth}
                    className="text-[11px] px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    {isTestingHealth ? 'Pinging...' : 'Ping /api/health Now'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-900 px-3 py-2 rounded-lg text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
                    {window.location.origin}/api/health
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/api/health`, 'health-url')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                    title="Copy URL"
                  >
                    {copiedKey === 'health-url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {testResult && (
                  <pre className="bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto border border-emerald-500/20">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                )}
              </div>

              {/* UptimeRobot Steps */}
              <div className="space-y-3 text-xs text-slate-300">
                <h4 className="font-semibold text-white text-sm">UptimeRobot Setup (1 Minute Ka Kaam):</h4>
                <ol className="space-y-2 list-decimal list-inside bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <li>
                    <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-blue-400 underline font-medium">
                      uptimerobot.com
                    </a> par free account banayein ya login karein.
                  </li>
                  <li>
                    <strong>+ Add New Monitor</strong> button par click karein.
                  </li>
                  <li>
                    <strong>Monitor Type:</strong> chunein <code>HTTP(s)</code>
                  </li>
                  <li>
                    <strong>Friendly Name:</strong> likhein <code>TeleForce Bot 24/7</code>
                  </li>
                  <li>
                    <strong>URL (or IP):</strong> me apna hosted URL dalein, jaise:{' '}
                    <code className="text-emerald-400 font-mono">https://your-app.onrender.com/api/health</code>
                  </li>
                  <li>
                    <strong>Monitoring Interval:</strong> <code>Every 5 minutes</code> set karein.
                  </li>
                  <li>
                    <strong>Create Monitor</strong> par click karein.
                  </li>
                </ol>
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-blue-400" />
                  Mubarak ho! Ab aapka bot 24/7/365 lagatar bina ruke live rahega.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VPS / UBUNTU LINUX */}
          {activeTab === 'vps' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-purple-400 text-sm block mb-1">
                  🖥️ Ubuntu / VPS par 24x7 PM2 se chalana:
                </span>
                Agar aapke paas Hetzner, DigitalOcean, Linode, AWS, ya koi bhi Linux server hai, to PM2 process manager ke saath bot background me humesha auto-restart mode me chalega.
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Full Command List (Copy & Run):</h4>
                
                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`# 1. Server Packages Update & Node.js 22 Install
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# 2. PM2 Process Manager Install
sudo npm install -g pm2 tsx

# 3. Clone Repository & Setup
git clone https://github.com/YOUR_USERNAME/teleforce-bot.git
cd teleforce-bot
npm install
npm run build

# 4. Set Environment Variables
export TELEGRAM_BOT_TOKEN="your_token_from_botfather"
export NODE_ENV="production"
export PORT="3000"

# 5. Start with PM2 (Auto Restart on crash or reboot)
pm2 start "npm start" --name "teleforce-bot"

# 6. Save PM2 configuration for auto-start on server reboot
pm2 startup
pm2 save`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`sudo apt update && sudo apt upgrade -y\ncurl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt install -y nodejs git\nsudo npm install -g pm2 tsx\ngit clone https://github.com/YOUR_USERNAME/teleforce-bot.git\ncd teleforce-bot\nnpm install && npm run build\npm2 start "npm start" --name "teleforce-bot"\npm2 startup && pm2 save`, 'vps-commands')}
                    className="absolute top-3 right-3 p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {copiedKey === 'vps-commands' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                  <span className="font-semibold text-white block">Useful PM2 Commands:</span>
                  <div className="font-mono text-[11px] text-slate-400 space-y-1">
                    <div>• <code>pm2 status</code> - Bot ka live status dekhein</div>
                    <div>• <code>pm2 logs teleforce-bot</code> - Real-time Telegram logs dekhein</div>
                    <div>• <code>pm2 restart teleforce-bot</code> - Bot ko restart karein</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCKER CONTAINER */}
          {activeTab === 'docker' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-cyan-400 text-sm block mb-1">
                  🐳 Docker Container Deployment:
                </span>
                Humne aapke project me production-ready <code>Dockerfile</code> pehle se generate kar diya hai. Aap direct Docker build karke container run kar sakte hain.
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Docker Commands:</h4>
                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`# 1. Build the Docker Image
docker build -t teleforce-bot .

# 2. Run the Container in Background (24/7 with auto-restart)
docker run -d \\
  --name teleforce-bot \\
  --restart always \\
  -p 3000:3000 \\
  -e TELEGRAM_BOT_TOKEN="your_bot_token_here" \\
  -e NODE_ENV="production" \\
  teleforce-bot

# 3. View Real-time Bot Logs
docker logs -f teleforce-bot`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`docker build -t teleforce-bot .\ndocker run -d --name teleforce-bot --restart always -p 3000:3000 -e TELEGRAM_BOT_TOKEN="your_bot_token_here" teleforce-bot`, 'docker-commands')}
                    className="absolute top-3 right-3 p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {copiedKey === 'docker-commands' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RAILWAY / KOYEB */}
          {activeTab === 'railway' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-amber-400 text-sm block mb-1">
                  🚀 Railway.app / Koyeb (Zero-Config One Click):
                </span>
                Railway aur Koyeb direct GitHub repository detect kar lete hain aur automatically package.json se build aur start command chala dete hain.
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <ol className="space-y-2 list-decimal list-inside bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <li>
                    <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-amber-400 underline font-medium">
                      railway.app
                    </a> ya <a href="https://koyeb.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-medium">koyeb.com</a> par login karein.
                  </li>
                  <li><strong>Deploy from GitHub Repo</strong> chunein.</li>
                  <li>
                    Variables tab me jayein aur <code>TELEGRAM_BOT_TOKEN</code> add karein.
                  </li>
                  <li>Deploy par click karein — 2 minute me aapka bot aur web dashboard live ho jayega!</li>
                </ol>
              </div>
            </div>
          )}

          {/* DATA RECOVERY CALLOUT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-500/30 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Database className="w-4 h-4 text-blue-400" />
              Hosting Par Data Loss Ka Darr? (Zero Data Loss Guarantee):
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kayi cloud providers (jaise Render free) par server restart hone par files reset ho sakti hain. Isi liye humne aapke liye <strong>Telegram Group Database Vault</strong> banaya hai:
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Aapka pura database (users, channels, claim codes, settings) automatically aapke Telegram Backup Group me store hota rehta hai.</li>
              <li>Agar server restart bhi ho jaye ya aap bot badlein, to bus backup group me <code>/restore</code> likh kar reply karein ya Web UI se 1-click me pura database recover kar lein!</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            24x7 Auto-Start Polling Enabled in Server
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/20"
          >
            Got it, Let's Host!
          </button>
        </div>

      </div>
    </div>
  );
};
