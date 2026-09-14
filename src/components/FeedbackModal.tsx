import React, { useState } from 'react';
import { 
  X, 
  Award, 
  TrendingUp, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  RotateCcw, 
  Share2, 
  Download,
  Flame,
  Zap,
  BookOpen
} from 'lucide-react';
import { FeedbackReport } from '../types';

interface FeedbackModalProps {
  report: FeedbackReport | null;
  onClose: () => void;
  onRetake?: () => void;
  audioUrl?: string | null;
  recordedAudioUrl?: string | null;
  isOpen?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  report,
  onClose,
  onRetake,
  audioUrl,
  recordedAudioUrl,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'vocabulary' | 'transcript'>('overview');
  const [copied, setCopied] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Support both isOpen flag and null check
  if (isOpen === false || !report) return null;

  const effectiveAudioUrl = audioUrl || recordedAudioUrl;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 88) return 'Distinguished Orator';
    if (score >= 80) return 'High Executive Presence';
    if (score >= 70) return 'Effective Communicator';
    return 'Building Fundamentals';
  };

  const copyReportSummary = () => {
    const text = `Aatmavishwas Report: ${report.title}\nOverall Score: ${report.overallScore}/100 | WPM: ${report.wpm} (${report.wpmStatus})\nFiller Words: ${report.fillerWordsCount}\nSummary: ${report.executiveSummary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="feedback-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div 
        id="feedback-modal-card"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{report.title}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-slate-800 text-indigo-300 border border-indigo-500/20">
                  {report.sessionType}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Analyzed at {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Duration {report.durationSeconds}s ({report.wordCount} words)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-report-btn"
              onClick={copyReportSummary}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              title="Copy Summary"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              id="close-feedback-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Sparkles },
            { id: 'metrics', label: 'Acoustic & Pacing Metrics', icon: TrendingUp },
            { id: 'vocabulary', label: 'Vocabulary & Refinements', icon: BookOpen },
            { id: 'transcript', label: 'Full Transcript & Audio', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Banner & Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Master Score Dial Card */}
                <div className="md:col-span-1 p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
                  <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">
                    Overall Score
                  </div>
                  <div className="relative flex items-center justify-center my-2">
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                      {report.overallScore}
                      <span className="text-lg font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getScoreColor(report.overallScore)}`}>
                    {getScoreBadge(report.overallScore)}
                  </span>
                </div>

                {/* Submetrics Highlights */}
                <div className="md:col-span-3 grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium">Speaking Speed</span>
                    <div className="my-1">
                      <div className="text-2xl font-bold text-white">{report.wpm} <span className="text-xs font-normal text-slate-400">WPM</span></div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {report.wpmStatus === 'Optimal' ? (
                          <span className="text-emerald-400">Optimal Pace (130-160)</span>
                        ) : report.wpmStatus === 'Too Slow' ? (
                          <span className="text-amber-400">Below Tempo (&lt;120 WPM)</span>
                        ) : (
                          <span className="text-amber-400">Accelerated (&gt;165 WPM)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (report.wpm / 180) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium">Filler Word Count</span>
                    <div className="my-1">
                      <div className="text-2xl font-bold text-white">
                        {report.fillerWordsCount}
                        <span className="text-xs font-normal text-slate-400 ml-1">detected</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {report.fillerWordsCount <= 2 ? (
                          <span className="text-emerald-400">Ultra clean delivery</span>
                        ) : report.fillerWordsCount <= 5 ? (
                          <span className="text-sky-400">Controlled usage</span>
                        ) : (
                          <span className="text-amber-400">Frequent pauses replaced</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {report.fillerWordsBreakdown.length > 0 
                        ? `Top: "${report.fillerWordsBreakdown[0].word}" (${report.fillerWordsBreakdown[0].count}x)` 
                        : 'No prominent fillers'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium">Clarity & Articulation</span>
                    <div className="my-1">
                      <div className="text-2xl font-bold text-emerald-400">{report.clarityScore}%</div>
                      <div className="text-xs text-slate-300 mt-0.5">Confidence: {report.confidenceScore}%</div>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${report.clarityScore}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Quote */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Executive Coach Summary
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic">
                  "{report.executiveSummary}"
                </p>
              </div>

              {/* Strengths & Improvements Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths Observed
                  </div>
                  <ul className="space-y-2.5">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    <AlertCircle className="w-4 h-4" />
                    Growth & Focus Opportunities
                  </div>
                  <ul className="space-y-2.5">
                    {report.improvements.map((imp, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* STAR Analysis if present for Interview */}
              {report.starAnalysis && (
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                      <Award className="w-4 h-4" />
                      STAR Method Framework Breakdown
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded-full">
                      STAR Score: {report.starAnalysis.score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-indigo-400 uppercase block mb-1">Situation (S)</span>
                      <p className="text-slate-300">{report.starAnalysis.situation || 'Clear context set.'}</p>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-indigo-400 uppercase block mb-1">Task (T)</span>
                      <p className="text-slate-300">{report.starAnalysis.task || 'Responsibility identified.'}</p>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 uppercase block mb-1">Action (A)</span>
                      <p className="text-slate-300">{report.starAnalysis.action || 'Concrete measures taken.'}</p>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 uppercase block mb-1">Result (R)</span>
                      <p className="text-slate-300">{report.starAnalysis.result || 'Measurable outcome delivered.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Micro-Drills */}
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Recommended Immediate Drills
                </div>
                <div className="space-y-2">
                  {report.actionableDrills.map((drill, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{drill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Detailed Score Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Speech Clarity', score: report.clarityScore, desc: 'Enunciation, crisp phonetics, and message legibility.' },
                  { label: 'Vocal Confidence', score: report.confidenceScore, desc: 'Tonal projection, steady conviction, and lack of trailing inflection.' },
                  { label: 'Pacing & Rhythm', score: report.pacingScore, desc: 'Tempo control within the human retention zone (130-160 WPM).' },
                  { label: 'Vocabulary Sophistication', score: report.vocabularyScore, desc: 'Diversity of phrasing, lexical range, and low repetition.' },
                  { label: 'Content Structure', score: report.structureScore, desc: 'Beginning hook, thematic transitions, and decisive conclusion.' },
                  { label: 'Filler Suppression', score: Math.max(20, 100 - report.fillerWordsCount * 7), desc: 'Ability to sustain thought transitions with silence instead of verbal fillers.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                      <span className="text-sm font-bold text-indigo-400">{item.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-700/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Filler Words Breakdown Details */}
              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Detected Verbal Fillers ({report.fillerWordsCount} Total)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Goal: &le; 2 per 2 minutes of speech
                  </span>
                </div>

                {report.fillerWordsBreakdown.length === 0 ? (
                  <div className="p-4 text-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                    🌟 Flawless delivery! Zero typical filler words detected in this recording.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.fillerWordsBreakdown.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded">
                              "{item.word}"
                            </span>
                            <span className="text-xs text-slate-400">{item.count} occurrences</span>
                          </div>
                          {item.contextExample && (
                            <p className="text-xs text-slate-400 italic mt-1.5 font-mono">
                              {item.contextExample}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              {/* Sample Polished Re-write */}
              {report.sampleImprovedResponse && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    AI Executive Re-imagination (High-Impact Version)
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-serif italic border-l-2 border-indigo-400 pl-3 py-1">
                    "{report.sampleImprovedResponse}"
                  </p>
                  <p className="text-xs text-slate-400">
                    Notice the concise active syntax and immediate strategic punchlines.
                  </p>
                </div>
              )}

              {/* Vocabulary Upgrades */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Lexical Enhancements (Elevate Your Word Choices)
                </h3>

                {report.vocabularyUpgrades.length === 0 ? (
                  <p className="text-xs text-slate-400">Vocabulary was well adapted to the professional context.</p>
                ) : (
                  <div className="space-y-3">
                    {report.vocabularyUpgrades.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-300 line-through">
                              {item.original}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {item.suggested}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{item.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {effectiveAudioUrl && !audioError && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    Session Audio Recording
                  </div>
                  <audio
                    controls
                    src={effectiveAudioUrl}
                    onError={() => setAudioError(true)}
                    className="h-9 max-w-xs w-full"
                  />
                </div>
              )}
              {effectiveAudioUrl && audioError && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-400">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span>Audio recording preview format is not supported for native playback in this browser.</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Verbatim Transcript</span>
                  <span>{report.wordCount} words</span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  {report.transcript}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            id="modal-retake-btn"
            onClick={onRetake || onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another Session</span>
          </button>

          <button
            id="modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Return to Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
