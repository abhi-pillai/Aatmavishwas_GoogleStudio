import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  Clock, 
  Calendar, 
  Eye, 
  Mic, 
  Briefcase, 
  Users, 
  Presentation, 
  Zap,
  ArrowUpRight,
  Filter,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { FeedbackReport, UserProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Cloud, UserCheck } from 'lucide-react';

interface ProgressDashboardProps {
  progress: UserProgress;
  sessions: FeedbackReport[];
  onViewReport: (report: FeedbackReport) => void;
  onClearHistory?: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  sessions,
  onViewReport,
  onClearHistory,
  onOpenAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [sessionFilter, setSessionFilter] = useState<'all' | 'speech' | 'interview' | 'gd' | 'presentation' | 'challenge'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredSessions = sessionFilter === 'all'
    ? sessions
    : sessions.filter(s => s.sessionType === sessionFilter);

  // Prepare chronological chart data (oldest to newest) from real user sessions only
  const chartData = [...sessions].reverse().map((s, idx) => ({
    name: `Sess ${idx + 1}`,
    date: new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    confidence: s.confidenceScore,
    clarity: s.clarityScore,
    wpm: s.wpm,
    fillers: s.fillerWordsCount,
    type: s.sessionType,
  }));

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'speech': return Mic;
      case 'interview': return Briefcase;
      case 'gd': return Users;
      case 'presentation': return Presentation;
      default: return Zap;
    }
  };

  return (
    <div id="progress-dashboard-module" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Progress Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            Live Vocal Analytics
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Speaking Progress & Improvement Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Metrics are generated strictly from your actual speech evaluations — tracking pace, filler control, and confidence score momentum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-[11px] text-slate-400 font-medium block">Current Rank</span>
            <span className="text-sm font-bold text-indigo-300">{progress.level}</span>
          </div>
          {onClearHistory && sessions.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  title="Reset practice data to start fresh"
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl border border-slate-800 hover:border-rose-900 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Cloud Sync Banner */}
      {currentUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-white">Firestore Cloud Sync Active</span>
              <span className="text-slate-400 ml-2">
                Evaluations & analytics securely tied to <span className="text-emerald-400 font-mono font-medium">@{userProfile?.username || 'user'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Device Persistence Enabled</span>
          </div>
        </div>
      ) : onOpenAuth ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Guest Mode Active</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sign in with Google to permanently back up your rehearsal transcripts and speech growth analytics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Core KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Practice Sessions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Practice Sessions</span>
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {sessions.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            {sessions.length === 0 ? (
              <span>No recorded sessions yet</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {progress.totalSpeakingMinutes} min spoken total
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Avg Confidence Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Confidence Score</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {sessions.length > 0 ? (
              <>
                {progress.averageConfidenceScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {sessions.length > 0 
              ? `Averaged across ${sessions.length} real ${sessions.length === 1 ? 'session' : 'sessions'}`
              : 'Awaiting your first speech'}
          </div>
        </div>

        {/* Card 3: Filler Word Reduction */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Filler Word Reduction</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {sessions.length >= 2 ? (
              `${progress.fillerReductionPct}%`
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {sessions.length >= 2 ? (
              `From initial (${sessions[sessions.length - 1].fillerWordsCount}) to latest (${sessions[0].fillerWordsCount})`
            ) : sessions.length === 1 ? (
              'Complete 1 more session to compare'
            ) : (
              'Awaiting speech evaluations'
            )}
          </div>
        </div>

        {/* Card 4: Practice Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Practice Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {progress.streakDays} {progress.streakDays === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-[11px] text-slate-400">
            {progress.streakDays > 0 ? (
              <span className="text-amber-400/90 font-medium">Active practice streak</span>
            ) : (
              'Record today to begin streak'
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Confidence & Clarity Trend */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Confidence & Clarity Trajectory</h3>
              <p className="text-xs text-slate-400">
                {sessions.length > 0 
                  ? 'Progression across your recorded sessions' 
                  : 'Calibrates once you complete your first practice'}
              </p>
            </div>
            {sessions.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Confidence
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Clarity
                </span>
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-slate-200">No session trajectory yet</div>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Record your first speech in Speech Studio or answer an interview question to begin generating your real score trajectory.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Area type="monotone" dataKey="confidence" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConfidence)" />
                  <Area type="monotone" dataKey="clarity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClarity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Speaking Speed (WPM) & Filler Reduction */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Speaking Speed (WPM) Stability</h3>
              <p className="text-xs text-slate-400">Target zone: 120 to 165 WPM for optimal comprehension</p>
            </div>
            {sessions.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                Avg: {progress.averageWpm} WPM
              </span>
            )}
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-slate-200">Speaking pace not yet calibrated</div>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Your Words Per Minute (WPM) pace chart will render as soon as you record and analyze your first practice response.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 200]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="wpm" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Badges Row */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Communication Milestones & Badges
            </h3>
            <p className="text-xs text-slate-400">Earned strictly when your actual speaking sessions meet milestone criteria</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {progress.badges.filter(b => b.unlocked).length} of {progress.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {progress.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-between gap-2 transition ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-indigo-950/40 to-slate-950 border-amber-500/30 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-50'
              }`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div>
                <div className="text-xs font-bold text-white">{badge.title}</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{badge.description}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                badge.unlocked 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {badge.unlocked ? (badge.dateUnlocked ? `Unlocked ${badge.dateUnlocked}` : 'Unlocked') : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Practice Sessions Log */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Practice Session History</h3>
            <p className="text-xs text-slate-400">Every session you complete is preserved here with its full AI evaluation report</p>
          </div>

          {sessions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {(['all', 'speech', 'interview', 'gd', 'presentation', 'challenge'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  id={`session-filter-${filterKey}`}
                  onClick={() => setSessionFilter(filterKey)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition whitespace-nowrap ${
                    sessionFilter === filterKey
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-200">No Practice Sessions Logged</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {sessions.length === 0
                ? "You haven't recorded any sessions yet. Once you complete your first practice in Speech Studio, Interview Prep, Group Discussion, Slide Rehearsal, or Daily Drills, your comprehensive feedback will be logged here."
                : `No recorded sessions match the "${sessionFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const Icon = getSessionIcon(session.sessionType);
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{session.title}</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded-full uppercase font-bold bg-slate-800 text-slate-300">
                          {session.sessionType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>{new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{session.durationSeconds}s ({session.wordCount} words)</span>
                        <span>•</span>
                        <span className="text-indigo-300">{session.wpm} WPM</span>
                        <span>•</span>
                        <span className={session.fillerWordsCount <= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                          {session.fillerWordsCount} fillers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Score</span>
                      <span className="text-base font-bold text-white font-mono">{session.overallScore}/100</span>
                    </div>

                    <button
                      id={`view-report-btn-${session.id}`}
                      onClick={() => onViewReport(session)}
                      className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
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
