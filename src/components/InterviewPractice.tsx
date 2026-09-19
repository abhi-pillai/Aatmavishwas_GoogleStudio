import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Mic, 
  Square, 
  Sparkles, 
  Clock, 
  Volume2, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Target, 
  Layers,
  ChevronRight,
  Filter,
  AlertCircle,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INTERVIEW_QUESTIONS } from '../data/mockData';
import { AudioWaveform } from './AudioWaveform';
import { 
  AudioRecorderController, 
  createSpeechRecognizer, 
  speakTextWithBrowser, 
  createWavUrlFromPcm,
  transcribeAudioWithAI 
} from '../utils/audioUtils';
import { InterviewQuestion, FeedbackReport } from '../types';

interface InterviewPracticeProps {
  onSessionComplete: (report: FeedbackReport, audioUrl?: string) => void;
}

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({ onSessionComplete }) => {
  const roles = [
    'All Roles',
    'General & HR Behavioral',
    'Software Engineering & Tech',
    'Product Management',
    'Leadership & Management',
    'Sales & Client Relations'
  ];

  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(INTERVIEW_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const recognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const filteredQuestions = selectedRole === 'All Roles'
    ? INTERVIEW_QUESTIONS
    : INTERVIEW_QUESTIONS.filter(q => q.role === selectedRole);

  const handleRandomQuestion = () => {
    setIsCustomMode(false);
    const candidates = filteredQuestions.filter(q => q.id !== currentQuestion.id);
    const pool = candidates.length > 0 ? candidates : INTERVIEW_QUESTIONS.filter(q => q.id !== currentQuestion.id);
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setCurrentQuestion(picked);
      setTranscript('');
      setRecordingTime(0);
      setStatusNotice(`Switched to question: "${picked.question.slice(0, 50)}..."`);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) recorderRef.current.stopRecording().catch(() => {});
    };
  }, []);

  const handleReadQuestion = async () => {
    setIsPlayingTTS(true);
    const textToSpeak = isCustomMode ? customQuestion : currentQuestion.question;
    
    // First try server-side TTS with WAV formatting
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, voice: 'Kore' }),
      });
      const data = await res.json();
      if (data?.audioBase64) {
        const wavUrl = createWavUrlFromPcm(data.audioBase64, 24000);
        if (wavUrl) {
          const audio = new Audio(wavUrl);
          audio.onended = () => {
            setIsPlayingTTS(false);
            URL.revokeObjectURL(wavUrl);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(wavUrl);
            speakTextWithBrowser(textToSpeak, () => setIsPlayingTTS(false));
          };
          audio.play().catch(() => {
            speakTextWithBrowser(textToSpeak, () => setIsPlayingTTS(false));
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Server TTS failed, using browser fallback');
    }

    // Fallback to browser SpeechSynthesis
    speakTextWithBrowser(textToSpeak, () => setIsPlayingTTS(false));
  };

  const handleStartRecording = async () => {
    setTranscript('');
    setRecordingTime(0);
    setAudioUrl(null);
    setAudioBase64(null);
    setIsTranscribing(false);
    setStatusNotice(null);

    const recorder = new AudioRecorderController();
    recorderRef.current = recorder;

    await recorder.startRecording((level) => {
      setAudioLevel(level);
    });

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

    setIsRecording(true);
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();

    setIsRecording(false);
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
          console.warn('AI transcription error in interview:', e);
        } finally {
          setIsTranscribing(false);
        }
      }
    }
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBase64) {
      setStatusNotice('No recorded audio available. Please record your answer first.');
      return;
    }
    setIsTranscribing(true);
    setStatusNotice(null);
    try {
      const { transcript: aiTranscript, error } = await transcribeAudioWithAI(audioBase64, audioMimeType);
      if (aiTranscript && aiTranscript.trim()) {
        setTranscript(aiTranscript);
      } else {
        setStatusNotice(error || 'No audible answer detected. You can speak louder or type directly.');
      }
    } catch (e: any) {
      setStatusNotice('Transcription request failed. You can paste or type your response.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
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

    if (!activeTranscript) {
      setStatusNotice('Please speak or type your interview answer first.');
      return;
    }

    setIsAnalyzing(true);
    const activeQ = isCustomMode ? customQuestion : currentQuestion.question;

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript,
          durationSeconds: Math.max(10, recordingTime),
          sessionType: 'interview',
          title: `Interview: ${activeQ.slice(0, 45)}...`,
          questionContext: activeQ,
          role: selectedRole !== 'All Roles' ? selectedRole : currentQuestion.role,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis service error');
      }

      const report: FeedbackReport = await res.json();

      if (report.overallScore >= 80) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onSessionComplete(report, audioUrl || undefined);
    } catch (err: any) {
      console.warn('Interview analysis notice:', err?.message || err);
      setStatusNotice('The evaluation service is experiencing momentary high traffic. Please tap Evaluate again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleAnswer = () => {
    setTranscript(
      "In my previous position as a technical lead, our microservices experienced a severe latency spike during Black Friday, threatening customer checkouts. My task was to diagnose the bottleneck and coordinate emergency mitigation. I immediately gathered the on-call team, isolated our redis caching layer which had exceeded maximum memory evictions, and dynamically redirected non-critical telemetry traffic. As a result, API response times dropped from 3.2 seconds back to 140 milliseconds within 18 minutes, safeguarding an estimated $200K in transactional volume with zero data loss."
    );
    setRecordingTime(85);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div id="interview-practice-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            Interview Simulation Suite
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Role-Based Behavioral & Technical Interviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate realistic hiring inquiries, practice the STAR method (Situation, Task, Action, Result), and receive rigorous AI evaluation.
          </p>
        </div>

        <button
          id="load-sample-interview-answer-btn"
          onClick={handleLoadSampleAnswer}
          className="px-3.5 py-2 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition flex items-center gap-2 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Model STAR Answer</span>
        </button>
      </div>

      {/* Role Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {roles.map((r) => (
          <button
            key={r}
            id={`role-filter-${r.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setSelectedRole(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedRole === r
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Main Interview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Questions List & STAR Cheat Sheet */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Questions ({filteredQuestions.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="random-interview-q-btn"
                  onClick={handleRandomQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition"
                  title="Pick a random interview question"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Random</span>
                </button>
                <button
                  id="toggle-custom-interview-q-btn"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-lg hover:bg-sky-500/10 transition"
                >
                  {isCustomMode ? 'Standard Q' : '+ Custom'}
                </button>
              </div>
            </div>

            {isCustomMode ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Paste the interview question you want to practice..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredQuestions.map((q) => {
                  const isSelected = currentQuestion.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setCurrentQuestion(q)}
                      className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                        isSelected 
                          ? 'bg-sky-500/15 border-sky-500/60 shadow-sm ring-1 ring-sky-500/30' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                          {q.category}
                        </span>
                        {isSelected && <span className="text-[9px] font-bold text-sky-400">Selected</span>}
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STAR Method Guide Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
            <span className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              The STAR Framework Guide
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong className="text-white">S - Situation:</strong> Context in 1-2 sentences.</li>
              <li><strong className="text-white">T - Task:</strong> Your explicit responsibility.</li>
              <li><strong className="text-white">A - Action:</strong> Concrete steps you directed.</li>
              <li><strong className="text-white">R - Result:</strong> Quantifiable business impact.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Question Stage & Audio Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[460px] space-y-5">
            {/* Interviewer Question Prompter */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Interviewer Prompt
                </span>
                <button
                  id="speak-question-tts-btn"
                  onClick={handleReadQuestion}
                  disabled={isPlayingTTS}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isPlayingTTS ? 'Reading Question...' : 'Listen via Voice'}</span>
                </button>
              </div>

              <p className="text-base font-bold text-white leading-relaxed">
                "{isCustomMode ? (customQuestion || 'Enter your question on the left...') : currentQuestion.question}"
              </p>

              {!isCustomMode && currentQuestion.contextTip && (
                <div className="text-xs text-slate-400 flex items-start gap-1.5 border-t border-slate-800/80 pt-2">
                  <span className="text-sky-400 font-semibold shrink-0">Coach Tip:</span>
                  <span>{currentQuestion.contextTip}</span>
                </div>
              )}
            </div>

            {/* Timer & Waveform */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="font-mono font-bold text-white text-sm">{formatTime(recordingTime)}</span>
                  <span className="text-slate-500">/ Target: ~{currentQuestion.targetDurationSeconds}s</span>
                </div>
                {isRecording && (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Recording Your Answer
                  </span>
                )}
              </div>

              <AudioWaveform isRecording={isRecording} audioLevel={audioLevel} />
            </div>

            {/* Live Response Editor / Transcript */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Spoken Answer (Verbatim Gemini AI Transcription)</span>
                <div className="flex items-center gap-3">
                  {isTranscribing && (
                    <span className="flex items-center gap-1 text-sky-400 font-semibold animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Gemini transcribing...
                    </span>
                  )}
                  {!isRecording && audioBase64 && !isTranscribing && (
                    <button
                      id="retranscribe-interview-btn"
                      onClick={handleTranscribeWithAI}
                      className="px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-medium flex items-center gap-1 transition"
                      title="Re-run Gemini AI transcription on your recorded response"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Transcribe with AI</span>
                    </button>
                  )}
                  <span>{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </label>
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click 'Start Response' and speak into your microphone. Your answer will be transcribed here for STAR framework analysis..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* In-app Status Notification Banner */}
            {statusNotice && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{statusNotice}</span>
                </div>
                <button 
                  onClick={() => setStatusNotice(null)}
                  className="text-amber-400 hover:text-white text-xs px-2 py-0.5 rounded ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    id="start-interview-answer-btn"
                    onClick={handleStartRecording}
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2.5"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Response</span>
                  </button>
                ) : (
                  <button
                    id="stop-interview-answer-btn"
                    onClick={handleStopRecording}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2.5"
                  >
                    <Square className="w-4 h-4" />
                    <span>Finish Answering</span>
                  </button>
                )}

                {transcript && !isRecording && (
                  <button
                    id="reset-interview-answer-btn"
                    onClick={() => { setTranscript(''); setRecordingTime(0); setAudioUrl(null); }}
                    className="p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                    title="Clear response"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                id="analyze-interview-answer-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || isRecording || !transcript.trim()}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition flex items-center gap-2.5 ${
                  isAnalyzing || isRecording || !transcript.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Evaluating STAR Answer...' : 'Evaluate Answer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
