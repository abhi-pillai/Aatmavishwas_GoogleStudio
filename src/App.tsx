/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mic, 
  Briefcase, 
  Users, 
  Presentation, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Award,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { FeedbackReport, UserProgress } from './types';
import { computeUserProgress } from './utils/progressUtils';
import { SpeechPractice } from './components/SpeechPractice';
import { InterviewPractice } from './components/InterviewPractice';
import { GroupDiscussionPractice } from './components/GroupDiscussionPractice';
import { PresentationPractice } from './components/PresentationPractice';
import { DailyChallenges } from './components/DailyChallenges';
import { ProgressDashboard } from './components/ProgressDashboard';
import { FeedbackModal } from './components/FeedbackModal';
import { CoachChatModal } from './components/CoachChatModal';

type ActiveTab = 'speech' | 'interview' | 'gd' | 'presentation' | 'challenges' | 'progress';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('speech');
  
  // Real user sessions only — purge any legacy mock seeds
  const [sessions, setSessions] = useState<FeedbackReport[]>(() => {
    try {
      const saved = localStorage.getItem('aatmavishwas_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy historical sessions
          const clean = parsed.filter(
            (s) => s.id !== 'sess-101' && s.id !== 'sess-102' && s.id !== 'sess-103'
          );
          return clean;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved sessions:', err);
    }
    return [];
  });

  // Progress metrics computed dynamically and authentically from real sessions
  const progress: UserProgress = useMemo(() => {
    return computeUserProgress(sessions);
  }, [sessions]);

  const [activeReport, setActiveReport] = useState<FeedbackReport | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(undefined);
  const [isCoachChatOpen, setIsCoachChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync genuine sessions to local storage
  useEffect(() => {
    localStorage.setItem('aatmavishwas_sessions', JSON.stringify(sessions));
    localStorage.setItem('aatmavishwas_progress', JSON.stringify(progress));
  }, [sessions, progress]);

  // Handler when any practice session finishes and generates a report
  const handleSessionComplete = (report: FeedbackReport, audioUrl?: string) => {
    setSessions((prev) => [report, ...prev]);
    setActiveReport(report);
    setActiveAudioUrl(audioUrl);
  };

  // Reset/clear history handler
  const handleClearHistory = () => {
    setSessions([]);
    localStorage.removeItem('aatmavishwas_sessions');
    localStorage.removeItem('aatmavishwas_progress');
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'speech', label: 'Speech Studio', icon: Mic },
    { id: 'interview', label: 'Interview Prep', icon: Briefcase },
    { id: 'gd', label: 'Group Discussion', icon: Users },
    { id: 'presentation', label: 'Slide Rehearsal', icon: Presentation },
    { id: 'challenges', label: 'Daily Drills', icon: Zap },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Aatmavishwas
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Coach
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Confidence & Public Speaking Acceleration Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Streak & Coach Chat Launcher */}
          <div className="flex items-center gap-2.5">
            {/* Real Streak Indicator */}
            <div 
              title={progress.streakDays > 0 ? `${progress.streakDays} consecutive day practice streak` : 'Complete a practice session today to start your streak!'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                progress.streakDays > 0
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <Flame className={`w-4 h-4 ${progress.streakDays > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-500'}`} />
              <span>{progress.streakDays}d Streak</span>
            </div>

            {/* AI Coach Button */}
            <button
              id="open-coach-chat-btn"
              onClick={() => setIsCoachChatOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">Ask Coach Vani</span>
              <span className="sm:hidden">Coach</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'speech' && (
          <SpeechPractice onSessionComplete={handleSessionComplete} />
        )}
        {activeTab === 'interview' && (
          <InterviewPractice onSessionComplete={handleSessionComplete} />
        )}
        {activeTab === 'gd' && (
          <GroupDiscussionPractice onSessionComplete={handleSessionComplete} />
        )}
        {activeTab === 'presentation' && (
          <PresentationPractice onSessionComplete={handleSessionComplete} />
        )}
        {activeTab === 'challenges' && (
          <DailyChallenges onSessionComplete={handleSessionComplete} streakDays={progress.streakDays} />
        )}
        {activeTab === 'progress' && (
          <ProgressDashboard 
            progress={progress} 
            sessions={sessions} 
            onViewReport={(rep) => {
              setActiveReport(rep);
              setActiveAudioUrl(undefined);
            }}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aatmavishwas Communication Coach &bull; Powered by Gemini AI</span>
          <span>Build Articulation &bull; Command Presence &bull; Speak Without Fear</span>
        </div>
      </footer>

      {/* Structured AI Feedback Modal */}
      <FeedbackModal
        isOpen={!!activeReport}
        report={activeReport}
        onClose={() => setActiveReport(null)}
        recordedAudioUrl={activeAudioUrl}
      />

      {/* AI Speech Coach Chat Modal */}
      <CoachChatModal
        isOpen={isCoachChatOpen}
        onClose={() => setIsCoachChatOpen(false)}
      />
    </div>
  );
}
