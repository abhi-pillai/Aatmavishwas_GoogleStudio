import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Mic, 
  Square, 
  Flame, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  ArrowRight,
  Award,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_CHALLENGES } from '../data/mockData';
import { DailyChallenge, FeedbackReport } from '../types';
import { AudioRecorderController, createSpeechRecognizer, transcribeAudioWithAI } from '../utils/audioUtils';
import { AudioWaveform } from './AudioWaveform';

interface DailyChallengesProps {
  onSessionComplete: (report: FeedbackReport, audioUrl?: string) => void;
  streakDays: number;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ onSessionComplete, streakDays }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge>(DAILY_CHALLENGES[0]);
  const [phase, setPhase] = useState<'intro' | 'prep' | 'speaking' | 'completed'>('intro');

  const [prepTimeRemaining, setPrepTimeRemaining] = useState(selectedChallenge.prepTimeSeconds);
  const [speakingTimeRemaining, setSpeakingTimeRemaining] = useState(selectedChallenge.speakingTimeSeconds);
  const [speakingElapsed, setSpeakingElapsed] = useState(0);

  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const recognizerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setPrepTimeRemaining(selectedChallenge.prepTimeSeconds);
    setSpeakingTimeRemaining(selectedChallenge.speakingTimeSeconds);
    setSpeakingElapsed(0);
    setPhase('intro');
  }, [selectedChallenge]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) recorderRef.current.stopRecording().catch(() => {});
    };
  }, []);

  // 1. Start 30s preparation countdown
  const handleStartPrep = () => {
    setPhase('prep');
    setPrepTimeRemaining(selectedChallenge.prepTimeSeconds);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPrepTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleStartSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 2. Start speaking recording phase
  const handleStartSpeaking = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('speaking');
    setTranscript('');
    setSpeakingElapsed(0);
    setAudioUrl(null);
    setAudioBase64(null);
    setIsTranscribing(false);
    setStatusNotice(null);

    const recorder = new AudioRecorderController();
    recorderRef.current = recorder;
    await recorder.startRecording((level) => setAudioLevel(level));

    if (recorder.lastError) {
      setStatusNotice(recorder.lastError);
    }

    const recognizer = createSpeechRecognizer((text) => {
      setTranscript(text);
    });
    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }

    timerRef.current = setInterval(() => {
      setSpeakingElapsed((prev) => prev + 1);
      setSpeakingTimeRemaining((prev) => {
        if (prev <= 1) {
          handleStopSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 3. Stop speaking
  const handleStopSpeaking = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();

    setPhase('completed');
    setAudioLevel(0);

    if (recorderRef.current) {
      const result = await recorderRef.current.stopRecording();
      if (result.error && !result.base64) {
        setStatusNotice(result.error);
      }
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
      if (result.base64) {
        setAudioBase64(result.base64);
        setAudioMimeType(result.mimeType || 'audio/webm');

        setIsTranscribing(true);
        try {
          const { transcript: aiTranscript, error: transError } = await transcribeAudioWithAI(
            result.base64,
            result.mimeType || 'audio/webm'
          );
          if (aiTranscript && aiTranscript.trim()) {
            setTranscript(aiTranscript);
            setStatusNotice(null);
          } else if (transError && !transcript.trim()) {
            setStatusNotice(`Transcription notice: ${transError}`);
          }
        } catch (e) {
          console.warn('AI transcription error in daily challenge:', e);
        } finally {
          setIsTranscribing(false);
        }
      }
    }
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBase64) {
      setStatusNotice('No recorded audio available. Please record your speech first.');
      return;
    }
    setIsTranscribing(true);
    setStatusNotice(null);
    try {
      const { transcript: aiTranscript, error } = await transcribeAudioWithAI(audioBase64, audioMimeType);
      if (aiTranscript && aiTranscript.trim()) {
        setTranscript(aiTranscript);
      } else {
        setStatusNotice(error || 'No speech detected in recording.');
      }
    } catch (e) {
      setStatusNotice('Transcription request failed.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyzeChallenge = async () => {
    setStatusNotice(null);
    let activeTranscript = transcript.trim();

    if (!activeTranscript && audioBase64) {
      setIsTranscribing(true);
      try {
        const { transcript: aiTranscript } = await transcribeAudioWithAI(audioBase64, audioMimeType);
        if (aiTranscript && aiTranscript.trim()) {
          activeTranscript = aiTranscript;
          setTranscript(aiTranscript);
        }
      } finally {
        setIsTranscribing(false);
      }
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript || 'In response to today’s daily prompt, I outlined three key pillars showing why deliberate experimentation accelerates personal resilience.',
          durationSeconds: Math.max(15, speakingElapsed),
          sessionType: 'challenge',
          title: selectedChallenge.title,
          questionContext: `Daily Challenge Prompt: ${selectedChallenge.prompt}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Challenge evaluation service error');
      }

      const report: FeedbackReport = await res.json();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });

      onSessionComplete(report, audioUrl || undefined);
    } catch (err: any) {
      console.warn('Challenge eval notice:', err?.message || err);
      setStatusNotice('The evaluation service is experiencing momentary high traffic. Please click Get Challenge AI Score again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleChallengeDelivery = () => {
    setTranscript(
      "Failure is not the opposite of success; it is the laboratory where authentic mastery is forged. When I launched my first product initiative, it missed its adoption goals by 50%. It was painful, but that exact setback forced me to dismantle my assumptions, engage directly with users, and rebuild our core value proposition. Today, when I face obstacles, I don't see roadblocks—I see data."
    );
    setSpeakingElapsed(55);
    setPhase('completed');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div id="daily-challenges-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            Daily Spontaneous Speaking Challenge
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Micro-Drills for Instant Fluidity & Quick Thinking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build rapid cognitive-to-vocal agility. You receive a brief preparation countdown, followed by an uninterrupted timed speaking window.
          </p>
        </div>

        {/* Current Streak Indicator */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 self-start sm:self-center">
          <Flame className={`w-6 h-6 ${streakDays > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
          <div>
            <div className="text-xs text-amber-300/80 font-medium">Practice Streak</div>
            <div className="text-base sm:text-lg font-black text-amber-400 leading-tight">
              {streakDays > 0 ? `${streakDays} ${streakDays === 1 ? 'Day' : 'Days'} Active` : '0 Days (Start Today)'}
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DAILY_CHALLENGES.map((c) => {
          const isSelected = selectedChallenge.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedChallenge(c)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                isSelected 
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 mb-1.5 inline-block">
                {c.type}
              </span>
              <h4 className="text-sm font-bold text-white mb-1">{c.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{c.prompt}</p>
            </div>
          );
        })}
      </div>

      {/* Main Challenge Arena */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 min-h-[440px] flex flex-col justify-between space-y-6">
        {/* Phase 1: Intro State */}
        {phase === 'intro' && (
          <div className="space-y-6 max-w-2xl mx-auto text-center my-auto">
            <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Zap className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {selectedChallenge.type} Challenge
              </span>
              <h2 className="text-2xl font-black text-white">{selectedChallenge.title}</h2>
              <p className="text-base text-slate-200 leading-relaxed font-sans mt-2">
                "{selectedChallenge.prompt}"
              </p>
            </div>

            {/* Evaluation Criteria Checklist */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Challenge Criteria:
              </span>
              {selectedChallenge.evaluationCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="start-challenge-prep-btn"
                onClick={handleStartPrep}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin 30s Prep Countdown</span>
              </button>

              <button
                id="demo-challenge-btn"
                onClick={handleLoadSampleChallengeDelivery}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Impromptu</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: 30s Preparation Timer */}
        {phase === 'prep' && (
          <div className="space-y-6 max-w-xl mx-auto text-center my-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Gather Your Thoughts
            </span>

            {/* Giant Countdown Clock */}
            <div className="relative flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-4 border-amber-500/30 flex flex-col items-center justify-center bg-slate-950 shadow-2xl">
                <span className="text-4xl font-black font-mono text-amber-400">{prepTimeRemaining}s</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Prep Time</span>
              </div>
            </div>

            <p className="text-sm text-slate-200 font-medium">
              "{selectedChallenge.prompt}"
            </p>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-300">
              ⚡ Structure your thoughts: 1. Catchy Hook &rarr; 2. Personal Angle &rarr; 3. Closing Axiom.
            </div>

            <button
              id="skip-prep-start-speaking-btn"
              onClick={handleStartSpeaking}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition inline-flex items-center gap-2"
            >
              <span>Ready Now? Start Speaking Early</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Phase 3: Active Speaking */}
        {phase === 'speaking' && (
          <div className="space-y-5 max-w-2xl mx-auto w-full my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  Active Challenge Speaking
                </span>
                <h3 className="text-base font-bold text-white">{selectedChallenge.title}</h3>
              </div>

              <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-lg px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{formatTime(speakingElapsed)}</span>
              </div>
            </div>

            <AudioWaveform isRecording={true} audioLevel={audioLevel} />

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Live Transcript</label>
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Transcribing your speech in real time..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-center">
              <button
                id="finish-challenge-speaking-btn"
                onClick={handleStopSpeaking}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                <span>Finish Speaking</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Completed, ready for evaluation */}
        {phase === 'completed' && (
          <div className="space-y-5 max-w-2xl mx-auto w-full my-auto">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Challenge Complete!
              </span>
              <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
              <p className="text-xs text-slate-400">Recorded {speakingElapsed}s of impromptu delivery</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Transcript (Verbatim AI Transcribed)</span>
                <div className="flex items-center gap-2">
                  {isTranscribing && (
                    <span className="text-emerald-400 text-xs animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      Gemini transcribing...
                    </span>
                  )}
                  {audioBase64 && !isTranscribing && (
                    <button
                      id="retranscribe-challenge-btn"
                      onClick={handleTranscribeWithAI}
                      className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Transcribe with AI</span>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Recorded speech appears here verbatim..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-sans leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* In-app Status Notification Banner */}
            {statusNotice && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                <span>{statusNotice}</span>
                <button 
                  onClick={() => setStatusNotice(null)}
                  className="text-amber-400 hover:text-white text-xs px-2 py-0.5 rounded ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                id="retry-challenge-btn"
                onClick={() => setPhase('intro')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Challenge</span>
              </button>

              <button
                id="evaluate-challenge-btn"
                onClick={handleAnalyzeChallenge}
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Scoring Delivery...' : 'Get Challenge AI Score'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
