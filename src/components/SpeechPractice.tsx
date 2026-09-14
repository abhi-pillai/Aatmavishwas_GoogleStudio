import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  AlertCircle, 
  BookOpen, 
  Check, 
  Volume2, 
  Flame, 
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  HardDrive,
  Info,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AudioWaveform } from './AudioWaveform';
import { 
  AudioRecorderController, 
  createSpeechRecognizer, 
  transcribeAudioWithAI,
  checkMediaRecorderSupport,
  MediaRecorderSupportStatus
} from '../utils/audioUtils';
import { FeedbackReport } from '../types';

const SPEECH_PROMPTS = [
  {
    id: 'p1',
    category: 'Leadership & Vision',
    title: 'The Leader I Aspire to Become',
    guidance: 'Outline the core values, communication style, and ethical compass that define your ideal leadership archetype.'
  },
  {
    id: 'p2',
    category: 'Persuasive Oratory',
    title: 'Why Slowing Down is the Secret to Speed',
    guidance: 'Persuade your audience that deliberate reflection yields faster, superior long-term results than relentless rush.'
  },
  {
    id: 'p3',
    category: 'Tech & Society',
    title: 'Human Agency in an Autonomous Era',
    guidance: 'Deliver a structured 2-minute perspective on what irreplaceable human traits we must preserve as AI evolves.'
  },
  {
    id: 'p4',
    category: 'Personal Narrative',
    title: 'A Moment that Shifted My Perspective',
    guidance: 'Tell a compelling personal story with clear scene-setting, a central conflict/epiphany, and an emotional takeaway.'
  }
];

interface SpeechPracticeProps {
  onSessionComplete: (report: FeedbackReport, audioUrl?: string) => void;
}

export const SpeechPractice: React.FC<SpeechPracticeProps> = ({ onSessionComplete }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(SPEECH_PROMPTS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveFillers, setLiveFillers] = useState<string[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'warning' | 'error'>('info');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isMicSimulated, setIsMicSimulated] = useState(false);
  
  // MediaRecorder support & buffer diagnostics
  const [supportStatus, setSupportStatus] = useState<MediaRecorderSupportStatus | null>(null);
  const [bufferedStats, setBufferedStats] = useState<{ chunkCount: number; sizeBytes: number } | null>(null);
  const [isMobilePromptOpen, setIsMobilePromptOpen] = useState(false);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const recognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  // Keep ref in sync for event listeners
  isRecordingRef.current = isRecording;

  const activeTitle = isCustom ? (customTitle || 'Custom Speech Topic') : selectedPrompt.title;

  // Live filler detection
  useEffect(() => {
    if (!transcript) return;
    const lower = transcript.toLowerCase();
    const fillers = ['um', 'uh', 'er', 'like', 'basically', 'actually', 'you know'];
    const detected: string[] = [];
    fillers.forEach(f => {
      const reg = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = lower.match(reg);
      if (matches) {
        for (let i = 0; i < matches.length; i++) detected.push(f);
      }
    });
    setLiveFillers(detected);
  }, [transcript]);

  // Check browser support on mount and bind interruption lifecycle handlers
  useEffect(() => {
    const support = checkMediaRecorderSupport();
    setSupportStatus(support);
    if (!support.supported) {
      console.warn('[SpeechPractice] Browser audio support check notice:', support.reason);
    }

    // Interruption handler for browser tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden && isRecordingRef.current) {
        console.warn('[SpeechPractice] Document hidden while recording. Safely stopping to release audio hardware.');
        handleStopRecordingDueToInterruption('Browser tab switched or minimized');
      }
    };

    // Interruption handler for page navigation / unload
    const handlePageTeardown = () => {
      if (recorderRef.current) {
        recorderRef.current.abortRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageTeardown);
    window.addEventListener('beforeunload', handlePageTeardown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageTeardown);
      window.removeEventListener('beforeunload', handlePageTeardown);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) {
        recorderRef.current.abortRecording();
      }
    };
  }, []);

  // Safe handler when an interruption occurs (device disconnect, tab switch, error)
  const handleStopRecordingDueToInterruption = async (reason: string) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();

    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);

    if (recorderRef.current) {
      try {
        const result = await recorderRef.current.stopRecording();
        setBufferedStats({ chunkCount: result.chunkCount, sizeBytes: result.sizeBytes });

        if (result.chunkCount > 0 && result.sizeBytes >= 500 && result.base64) {
          setAudioUrl(result.audioUrl);
          setAudioBase64(result.base64);
          setAudioMimeType(result.mimeType || 'audio/webm');
          setStatusType('warning');
          setStatusNotice(`Recording paused due to interruption (${reason}). Captured ${(result.sizeBytes / 1024).toFixed(1)} KB audio.`);
        } else {
          setStatusType('warning');
          setStatusNotice(`Recording halted due to interruption (${reason}). Audio hardware released safely.`);
        }
      } catch (e) {
        recorderRef.current.cleanupStream();
      }
    }
  };

  const handleStartRecording = async () => {
    // 1. Verify browser support
    const check = checkMediaRecorderSupport();
    setSupportStatus(check);

    if (!check.supported && !check.hasGetUserMedia) {
      setStatusType('error');
      setStatusNotice(check.reason || 'Microphone recording is not supported in this browser.');
      return;
    }

    setTranscript('');
    setLiveFillers([]);
    setRecordingTime(0);
    setAudioUrl(null);
    setAudioBase64(null);
    setBufferedStats(null);
    setIsTranscribing(false);
    setStatusNotice(null);

    const recorder = new AudioRecorderController();
    recorderRef.current = recorder;

    // Register interruption listener for hardware disconnects
    recorder.setInterruptionHandler((reason) => {
      console.warn('[SpeechPractice] Hardware interruption caught:', reason);
      handleStopRecordingDueToInterruption(reason);
    });

    const started = await recorder.startRecording((level) => {
      setAudioLevel(level);
    });

    setIsMicSimulated(recorder.isSimulated || recorder.permissionDismissed);
    if (recorder.lastError) {
      setStatusType(recorder.permissionDismissed ? 'warning' : 'info');
      setStatusNotice(recorder.lastError);
    }

    // Start live speech recognizer (if supported by the browser)
    const recognizer = createSpeechRecognizer((text) => {
      setTranscript(text);
    });
    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }

    setIsRecording(true);
    isRecordingRef.current = true;

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();

    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);

    if (recorderRef.current) {
      const result = await recorderRef.current.stopRecording();

      // Verify audio chunks buffer
      const hasValidChunks = result.chunkCount > 0 && result.sizeBytes >= 500 && !!result.base64;
      setBufferedStats({ chunkCount: result.chunkCount, sizeBytes: result.sizeBytes });

      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }

      // Check if buffer is empty or corrupted before any backend transmission
      if (!hasValidChunks) {
        console.warn('[SpeechPractice] Buffer verification failed:', {
          chunkCount: result.chunkCount,
          sizeBytes: result.sizeBytes,
          error: result.error,
        });

        if (result.error && !transcript.trim()) {
          setStatusType('warning');
          setStatusNotice(result.error);
        } else if (!transcript.trim()) {
          setStatusType('warning');
          setStatusNotice('No audible speech chunks were buffered. Please check that your microphone is unmuted and speak closer to the mic.');
        }
        return;
      }

      // Valid chunks verified! Proceed with backend transmission
      setAudioBase64(result.base64);
      setAudioMimeType(result.mimeType || 'audio/webm');

      // Automatically run verbatim AI transcription on the verified audio buffer
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
          setStatusType('warning');
          setStatusNotice(`Transcription notice: ${transError}`);
        } else {
          setStatusNotice(null);
        }
      } catch (e) {
        console.warn('AI transcription notice:', e);
        if (!transcript.trim()) {
          setStatusType('warning');
          setStatusNotice('Audio captured successfully. You can tap "Transcribe with AI" or edit your transcript directly.');
        }
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBase64) {
      setStatusType('warning');
      setStatusNotice('No recorded audio available. Please record your speech first.');
      return;
    }

    // Verify buffered base64 length before transmitting to backend
    if (audioBase64.length < 200) {
      setStatusType('warning');
      setStatusNotice('The recorded audio buffer is too short to transcribe. Please record a longer speech sample.');
      return;
    }

    setIsTranscribing(true);
    setStatusNotice(null);
    try {
      const { transcript: aiTranscript, error } = await transcribeAudioWithAI(audioBase64, audioMimeType);
      if (aiTranscript && aiTranscript.trim()) {
        setTranscript(aiTranscript);
        setStatusNotice(null);
      } else {
        setStatusType('warning');
        setStatusNotice(error || 'No audible speech detected. You can speak louder or type directly.');
      }
    } catch (e: any) {
      setStatusType('error');
      setStatusNotice('Transcription request failed. You can also paste or edit your text manually.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    setStatusNotice(null);
    let activeTranscript = transcript.trim();

    // Auto-transcribe if user recorded audio with valid buffer but transcript hasn't populated
    if (!activeTranscript && audioBase64 && audioBase64.length >= 200) {
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

    if (!activeTranscript) {
      setStatusType('warning');
      setStatusNotice('Please record your speech, tap Transcribe with AI, or paste your speech before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript,
          durationSeconds: Math.max(10, recordingTime),
          sessionType: 'speech',
          title: activeTitle,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis service responded with an error');
      }

      const report: FeedbackReport = await res.json();

      if (report.overallScore >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onSessionComplete(report, audioUrl || undefined);
    } catch (err: any) {
      console.warn('Speech analysis notice:', err?.message || err);
      setStatusType('error');
      setStatusNotice('The evaluation service is experiencing momentary high traffic. Please tap Analyze again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preset demo speech for instant testing if microphone isn't connected
  const handleLoadDemoSpeech = () => {
    setTranscript(
      "Good evening everyone. Today I want to discuss why embracing authentic vulnerability is actually the highest form of executive presence. When we, um, pretend to have all the answers, we shut down innovation. Like, in our team meetings last month, when we openly admitted the system architecture had flaws, it basically unlocked four creative solutions from junior engineers. In leadership, you know, transparency builds trust ten times faster than artificial perfection."
    );
    setRecordingTime(75);
    setStatusNotice(null);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Live estimated WPM
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedWpm = recordingTime > 5 ? Math.round((words / (recordingTime / 60))) : 0;

  return (
    <div id="speech-practice-module" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-4 md:px-0">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Mic className="w-4 h-4" />
            <span>Speech Practice Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vocal Delivery & Articulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Record your speech, monitor acoustic rhythm in real time, and receive structured feedback on pace, filler suppression, and executive presence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <button
            id="demo-speech-btn"
            onClick={handleLoadDemoSpeech}
            className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 active:bg-indigo-500/30 border border-indigo-500/30 rounded-xl transition flex items-center justify-center gap-2 touch-manipulation"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Load Sample Speech</span>
          </button>
        </div>
      </div>

      {/* Browser Support Diagnostic Alert */}
      {supportStatus && !supportStatus.supported && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Microphone Capture Limitation</span>
              <span className="text-amber-300/90 text-xs">{supportStatus.reason} You can still practice using text, or tap "Load Sample Speech".</span>
            </div>
          </div>
          <button
            onClick={() => setSupportStatus(null)}
            className="self-end sm:self-center px-2.5 py-1 text-xs text-amber-400 hover:text-white rounded border border-amber-500/30 hover:bg-amber-500/20 transition min-h-[36px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mobile Topic Accordion Toggle (< lg screens) */}
      <div className="lg:hidden p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Topic</span>
          <p className="text-sm font-bold text-white truncate">{activeTitle}</p>
        </div>
        <button
          onClick={() => setIsMobilePromptOpen(!isMobilePromptOpen)}
          className="px-3 py-1.5 min-h-[44px] rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/25 flex items-center gap-1.5 shrink-0 touch-manipulation"
        >
          <span>{isMobilePromptOpen ? 'Hide Topics' : 'Change Topic'}</span>
          {isMobilePromptOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Prompt Selection & Outline (Always visible on desktop, toggleable on mobile) */}
        <div className={`${isMobilePromptOpen ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-4`}>
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Speech Topic
              </span>
              <button
                id="toggle-custom-topic-btn"
                onClick={() => setIsCustom(!isCustom)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1 min-h-[36px] flex items-center"
              >
                {isCustom ? 'Pick Preset Topic' : '+ Custom Topic'}
              </button>
            </div>

            {isCustom ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter your speech title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
                <p className="text-[11px] text-slate-400">Choose any topic: conference keynote, wedding toast, or company update.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5">
                {SPEECH_PROMPTS.map((p) => {
                  const isSelected = selectedPrompt.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPrompt(p);
                        setIsMobilePromptOpen(false);
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl border cursor-pointer transition min-h-[44px] touch-manipulation ${
                        isSelected 
                          ? 'bg-indigo-600/15 border-indigo-500/60 shadow-sm' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-indigo-400 mb-0.5">{p.category}</div>
                      <div className="text-xs sm:text-sm font-bold text-white leading-snug">{p.title}</div>
                      {isSelected && (
                        <p className="text-xs text-slate-300 mt-2 italic border-t border-slate-800/80 pt-1.5 leading-relaxed">
                          "{p.guidance}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preparation Scratchpad */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Speaker Outline Notes</span>
                <span className="text-[10px] text-slate-500">Optional</span>
              </label>
              <textarea
                rows={3}
                placeholder="Bullet point your key arguments: Hook, Problem, 3 Pillars, Call to Action..."
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Recording & Analysis Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[380px] sm:min-h-[460px] space-y-4 sm:space-y-6 shadow-sm">
            {/* Top Bar: Topic title and Real-time HUD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Focus</span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{activeTitle}</h3>
              </div>

              {/* Real-time stats HUD (Responsive 3-column layout on mobile, horizontal flex on desktop) */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2.5 text-xs">
                <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 min-h-[44px] justify-center text-center">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="sm:hidden">Time</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">{formatTime(recordingTime)}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 min-h-[44px] justify-center text-center">
                  <span className="text-[10px] sm:text-xs text-slate-400">WPM</span>
                  <span className={`font-mono font-bold text-xs sm:text-sm ${
                    estimatedWpm >= 130 && estimatedWpm <= 165 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {estimatedWpm > 0 ? estimatedWpm : '--'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 min-h-[44px] justify-center text-center">
                  <span className="text-[10px] sm:text-xs text-slate-400">Fillers</span>
                  <span className={`font-mono font-bold text-xs sm:text-sm ${liveFillers.length > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {liveFillers.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Audio Waveform Visualizer */}
            <div className="space-y-2.5">
              <AudioWaveform isRecording={isRecording} audioLevel={audioLevel} />
              
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold animate-pulse text-center px-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isMicSimulated ? 'bg-amber-400' : 'bg-rose-500'}`} />
                  <span className={isMicSimulated ? 'text-amber-300' : 'text-rose-400'}>
                    {isMicSimulated
                      ? 'Rehearsal active (Interactive acoustic flow). Speak naturally or edit text below.'
                      : 'Recording live speech audio... Audio stream actively buffered.'}
                  </span>
                </div>
              )}

              {/* Verified buffer diagnostic pill */}
              {!isRecording && bufferedStats && bufferedStats.chunkCount > 0 && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Buffered: <strong className="text-slate-200">{(bufferedStats.sizeBytes / 1024).toFixed(1)} KB</strong> across <strong className="text-slate-200">{bufferedStats.chunkCount} chunks</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Live Transcript Display / Editor */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Speech Transcript
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {isTranscribing && (
                    <span className="flex items-center gap-1.5 text-indigo-400 font-semibold animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Gemini verbatim transcribing...
                    </span>
                  )}
                  {!isRecording && audioBase64 && !isTranscribing && (
                    <button
                      id="retranscribe-speech-btn"
                      onClick={handleTranscribeWithAI}
                      className="px-2.5 py-1 min-h-[36px] rounded bg-indigo-500/15 hover:bg-indigo-500/25 active:bg-indigo-500/35 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition touch-manipulation"
                      title="Re-run Gemini AI transcription on recorded audio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Transcribe with AI</span>
                    </button>
                  )}
                  <span className="text-slate-400">{words} words captured</span>
                </div>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak into your microphone to record. Speech is transcribed verbatim using Gemini AI when you stop, or you can paste / edit your draft directly..."
                rows={5}
                className="w-full p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none shadow-inner"
              />
            </div>

            {/* Live Fillers Alert Strip */}
            {liveFillers.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-amber-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Detected fillers in draft:</span>
                  <span className="font-mono font-bold">{[...new Set(liveFillers)].join(', ')}</span>
                </div>
                <span className="text-[11px] text-amber-400/80">Tip: Substitute with a 1s breath</span>
              </div>
            )}

            {/* In-app Status Notification Banner */}
            {statusNotice && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                statusType === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                  : statusType === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate sm:whitespace-normal">{statusNotice}</span>
                </div>
                <button 
                  onClick={() => setStatusNotice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Bar (Responsive full width on mobile, inline on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!isRecording ? (
                  <button
                    id="start-speech-recording-btn"
                    onClick={handleStartRecording}
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:from-indigo-700 active:to-indigo-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2.5 touch-manipulation cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    id="stop-speech-recording-btn"
                    onClick={handleStopRecording}
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2.5 touch-manipulation cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop & Complete</span>
                  </button>
                )}

                {transcript && !isRecording && (
                  <button
                    id="clear-speech-btn"
                    onClick={() => { 
                      setTranscript(''); 
                      setRecordingTime(0); 
                      setAudioUrl(null); 
                      setAudioBase64(null);
                      setBufferedStats(null);
                    }}
                    className="min-h-[48px] min-w-[48px] p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded-xl transition flex items-center justify-center shrink-0 touch-manipulation"
                    title="Clear transcript & recording"
                    aria-label="Clear transcript"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                id="analyze-speech-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || isRecording || !transcript.trim()}
                className={`w-full sm:w-auto min-h-[48px] px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition flex items-center justify-center gap-2.5 touch-manipulation ${
                  isAnalyzing || isRecording || !transcript.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Delivery with AI...' : 'Generate Feedback Report'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

