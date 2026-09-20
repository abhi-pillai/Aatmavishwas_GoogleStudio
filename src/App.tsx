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
import { useAuth } from './contexts/AuthContext';
import { SpeechPractice } from './components/SpeechPractice';
import { InterviewPractice } from './components/InterviewPractice';
import { GroupDiscussionPractice } from './components/GroupDiscussionPractice';
import { PresentationPractice } from './components/PresentationPractice';
import { DailyChallenges } from './components/DailyChallenges';
import { ProgressDashboard } from './components/ProgressDashboard';
import { FeedbackModal } from './components/FeedbackModal';
import { CoachChatModal } from './components/CoachChatModal';
import { UserMenu } from './components/UserMenu';
import { AuthModal } from './components/AuthModal';

type ActiveTab = 'speech' | 'interview' | 'gd' | 'presentation' | 'challenges' | 'progress';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('speech');
  const { currentUser, userProfile, saveSessionToCloud, loadCloudSessions, clearCloudSessions } = useAuth();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleOpenAuth = (_mode?: 'signin' | 'signup') => {
    setAuthModalOpen(true);
  };
  
  // Real user sessions only — purge any legacy mock seeds
  const [sessions, setSessions] = useState<FeedbackReport[]>(() => {
    try {
      const saved = localStorage.getItem('aatmavishwas_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // Cloud synchronization on auth state change
  useEffect(() => {
    let isMounted = true;

    async function syncWithCloud() {
      if (currentUser) {
        try {
          const cloudList = await loadCloudSessions();
          if (!isMounted) return;

          if (cloudList && cloudList.length > 0) {
            // Merge cloud sessions with any new local ones, preserving uniqueness
            setSessions((prevLocal) => {
              const map = new Map<string, FeedbackReport>();
              cloudList.forEach((s) => map.set(s.id, s));
              prevLocal.forEach((s) => {
                if (!map.has(s.id)) {
                  map.set(s.id, s);
                  saveSessionToCloud(s); // back up existing local session to cloud
                }
              });
              const combined = Array.from(map.values()).sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              return combined;
            });
          } else if (sessions.length > 0) {
            // First time user with existing local sessions — back them up to Firestore
            sessions.forEach((s) => saveSessionToCloud(s));
          }
        } catch (err) {
          console.warn('Failed to sync sessions with cloud:', err);
        }
      }
    }

    syncWithCloud();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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
    if (currentUser) {
      saveSessionToCloud(report);
    }
  };

  // Reset/clear history handler
  const handleClearHistory = () => {
    setSessions([]);
    localStorage.removeItem('aatmavishwas_sessions');
    localStorage.removeItem('aatmavishwas_progress');
    if (currentUser) {
      clearCloudSessions();
    }
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

          {/* Right Action Tools: Streak, Coach Chat, User Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
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
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">Ask Coach Vani</span>
              <span className="sm:hidden">Coach</span>
            </button>

            {/* User Account Menu / Auth Triggers */}
            <UserMenu onOpenAuth={handleOpenAuth} />

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
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
            <div className="space-y-1">
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
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-3 ${
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

            {!currentUser && (
              <div className="pt-3 border-t border-slate-800">
                <button
                  id="mobile-signin-btn"
                  onClick={() => {
                    handleOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold bg-white text-slate-900 rounded-xl shadow-sm hover:bg-slate-100 transition active:scale-98"
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
            )}
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
            onOpenAuth={handleOpenAuth}
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

      {/* Google Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
