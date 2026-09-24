import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  MessageSquare, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { InterviewClarification, InterviewerPersona } from '../types';

interface InterviewClarifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  discipline: string;
  experienceLevel: string;
  category: string;
  interviewer: InterviewerPersona;
  clarificationData: InterviewClarification | null;
  isLoadingClarification: boolean;
  onUseOpeningLine: (opening: string) => void;
  onAskInterviewer: (inquiry: string) => Promise<string | null>;
  onPlayTTS: (text: string) => void;
  isPlayingTTS: boolean;
}

export const InterviewClarifyModal: React.FC<InterviewClarifyModalProps> = ({
  isOpen,
  onClose,
  question,
  discipline,
  experienceLevel,
  category,
  interviewer,
  clarificationData,
  isLoadingClarification,
  onUseOpeningLine,
  onAskInterviewer,
  onPlayTTS,
  isPlayingTTS,
}) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'ask'>('explain');
  const [customInquiry, setCustomInquiry] = useState('');
  const [inquiryHistory, setInquiryHistory] = useState<Array<{ sender: 'user' | 'interviewer'; text: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  if (!isOpen) return null;

  const quickInquiries = [
    'Can you explain this question in simpler terms?',
    'What scale or system constraints should I assume?',
    'What key trade-off are you most interested in hearing?',
    'Can I share an example from a previous project or coursework?'
  ];

  const handleSendInquiry = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || isAsking) return;

    setInquiryHistory(prev => [...prev, { sender: 'user', text: q }]);
    setCustomInquiry('');
    setIsAsking(true);

    try {
      const reply = await onAskInterviewer(q);
      if (reply) {
        setInquiryHistory(prev => [...prev, { sender: 'interviewer', text: reply }]);
      }
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Understanding the Inquiry · {discipline} · {experienceLevel}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Interviewer Clarification & Question Breakdown
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Prompt Recap */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Active Question
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium italic">
            "{question}"
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2">
          <button
            onClick={() => setActiveTab('explain')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'explain'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plain-English Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ask'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask {interviewer.name} (Clarification)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'explain' && (
            <>
              {isLoadingClarification ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
                  <p className="text-xs text-slate-400">
                    Consulting hiring director heuristics & synthesizing plain-English breakdown...
                  </p>
                </div>
              ) : clarificationData ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Plain English Translation */}
                  <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                      In Plain English
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      {clarificationData.plainEnglishSummary}
                    </p>
                  </div>

                  {/* Interviewer Intent & Calibration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        What They Are Secretly Testing
                      </span>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {clarificationData.interviewerIntent}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Expectations for {experienceLevel}
                      </span>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {clarificationData.levelSpecificAdvice}
                      </p>
                    </div>
                  </div>

                  {/* Key Points to Cover */}
                  {clarificationData.keyPointsToCover && clarificationData.keyPointsToCover.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Key Elements to Include in Your Answer
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {clarificationData.keyPointsToCover.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">·</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pitfalls to Avoid */}
                  {clarificationData.pitfallsToAvoid && clarificationData.pitfallsToAvoid.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Common Pitfalls & Traps to Avoid
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {clarificationData.pitfallsToAvoid.map((pitfall, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">✕</span>
                            <span>{pitfall}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Opening */}
                  {clarificationData.suggestedOpening && (
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                          Suggested Confident Opening Sentence
                        </span>
                        <p className="text-xs text-slate-200 italic">
                          "{clarificationData.suggestedOpening}"
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onUseOpeningLine(clarificationData.suggestedOpening);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition active:scale-95"
                      >
                        <span>Use As Starter</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Click 'Explain Question' to break down what this question means in plain English.
                </div>
              )}
            </>
          )}

          {activeTab === 'ask' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0">
                  {interviewer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white">{interviewer.name}</div>
                  <div className="text-slate-400 text-[11px]">{interviewer.role} · {interviewer.style}</div>
                </div>
              </div>

              {/* Quick Inquiry Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-medium">
                  Tap to ask a common clarifying question:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickInquiries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendInquiry(q)}
                      disabled={isAsking}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition text-left cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dialog History */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {inquiryHistory.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    Ask {interviewer.name} for clarification, system scale constraints, or rephrasing before answering.
                  </div>
                ) : (
                  inquiryHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs space-y-1.5 ${
                        item.sender === 'user'
                          ? 'bg-sky-500/10 border border-sky-500/30 text-sky-200 ml-6'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>{item.sender === 'user' ? 'You (Candidate)' : interviewer.name}</span>
                        {item.sender === 'interviewer' && (
                          <button
                            onClick={() => onPlayTTS(item.text)}
                            disabled={isPlayingTTS}
                            className="flex items-center gap-1 text-sky-400 hover:text-sky-300"
                            title="Listen to interviewer reply"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
                      <p className="leading-relaxed">{item.text}</p>
                    </div>
                  ))
                )}
                {isAsking && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 mr-6 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>{interviewer.name} is clarifying...</span>
                  </div>
                )}
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder={`Ask ${interviewer.name} anything about this question...`}
                  value={customInquiry}
                  onChange={(e) => setCustomInquiry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInquiry(customInquiry)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendInquiry(customInquiry)}
                  disabled={!customInquiry.trim() || isAsking}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Tip: Top interviewees always clarify ambiguous assumptions before answering.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
