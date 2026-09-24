import React from 'react';
import { 
  Award, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { MockSessionState } from '../types';

interface MockInterviewDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: MockSessionState;
  onRestart: () => void;
  onReviewQuestion: (index: number) => void;
}

export const MockInterviewDebriefModal: React.FC<MockInterviewDebriefModalProps> = ({
  isOpen,
  onClose,
  sessionState,
  onRestart,
  onReviewQuestion,
}) => {
  if (!isOpen || !sessionState.overallDebrief) return null;

  const { overallDebrief, completedAnswers } = sessionState;

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
      case 'Hire':
        return 'text-sky-300 bg-sky-500/20 border-sky-500/40';
      case 'Borderline / Needs Polish':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
      default:
        return 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-sky-950/40 to-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Full Mock Interview Simulation Complete</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Executive Hiring Panel Debrief
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Evaluated across all {completedAnswers.length} rounds using real-time STAR criteria, delivery pace, and domain depth.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Executive Verdict Scorecard */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Consensus Hiring Panel Verdict
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <span className={`text-sm sm:text-base font-extrabold px-3 py-1 rounded-xl border ${getRecommendationBadge(overallDebrief.recommendation)}`}>
                  {overallDebrief.recommendation}
                </span>
                <span className="text-slate-400 text-xs">
                  Overall Composite Score: <strong className="text-white text-sm">{overallDebrief.averageScore}/100</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed pt-1">
                {overallDebrief.summary}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0 min-w-[130px]">
              <div className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                {overallDebrief.averageScore}
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-1">
                STAR Rating
              </span>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Key Candidate Strengths
              </span>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                {overallDebrief.keyStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Priority Coaching Focus
              </span>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                {overallDebrief.priorityImprovements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Round-by-Round Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Round-by-Round Breakdown ({completedAnswers.length} Questions)
            </div>

            <div className="space-y-2.5">
              {completedAnswers.map((round, idx) => {
                const score = round.report?.overallScore || 75;
                const words = round.transcript.split(/\s+/).filter(Boolean).length;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="font-bold text-sky-400">Round {idx + 1}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{round.question.category}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{words} words in {round.durationSeconds}s</span>
                      </div>
                      <p className="text-xs font-semibold text-white line-clamp-1">
                        "{round.question.question}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-white font-mono">{score}/100</div>
                        <div className="text-[10px] text-slate-400">
                          {score >= 80 ? 'Mastery' : 'Proficient'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onReviewQuestion(idx);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium rounded-lg transition flex items-center gap-1"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              onRestart();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Fresh Simulation</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Debrief
          </button>
        </div>
      </div>
    </div>
  );
};
