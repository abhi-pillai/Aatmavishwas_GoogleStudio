import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation, 
  Mic, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  Upload, 
  FileText, 
  Layers, 
  CheckCircle2,
  Lightbulb,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESENTATION_DECKS } from '../data/mockData';
import { PresentationDeck, PresentationSlide, FeedbackReport } from '../types';
import { AudioRecorderController, createSpeechRecognizer, transcribeAudioWithAI } from '../utils/audioUtils';
import { AudioWaveform } from './AudioWaveform';

interface PresentationPracticeProps {
  onSessionComplete: (report: FeedbackReport, audioUrl?: string) => void;
}

export const PresentationPractice: React.FC<PresentationPracticeProps> = ({ onSessionComplete }) => {
  const [selectedDeck, setSelectedDeck] = useState<PresentationDeck>(PRESENTATION_DECKS[0]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [totalRehearsalTime, setTotalRehearsalTime] = useState(0);
  const [slideTimers, setSlideTimers] = useState<number[]>([0, 0, 0, 0]);
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
  const timerIntervalRef = useRef<any>(null);

  const currentSlide = selectedDeck.slides[currentSlideIndex] || selectedDeck.slides[0];

  useEffect(() => {
    setSlideTimers(new Array(selectedDeck.slides.length).fill(0));
    setCurrentSlideIndex(0);
  }, [selectedDeck]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) recorderRef.current.stopRecording().catch(() => {});
    };
  }, []);

  const handleStartRehearsal = async () => {
    setTranscript('');
    setTotalRehearsalTime(0);
    setSlideTimers(new Array(selectedDeck.slides.length).fill(0));
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

    setIsRecording(true);
    timerIntervalRef.current = setInterval(() => {
      setTotalRehearsalTime((prev) => prev + 1);
      setSlideTimers((prev) => {
        const copy = [...prev];
        copy[currentSlideIndex] = (copy[currentSlideIndex] || 0) + 1;
        return copy;
      });
    }, 1000);
  };

  const handleStopRehearsal = async () => {
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
          console.warn('AI transcription error in presentation:', e);
        } finally {
          setIsTranscribing(false);
        }
      }
    }
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBase64) {
      setStatusNotice('No recorded audio available. Please record your rehearsal first.');
      return;
    }
    setIsTranscribing(true);
    setStatusNotice(null);
    try {
      const { transcript: aiTranscript, error } = await transcribeAudioWithAI(audioBase64, audioMimeType);
      if (aiTranscript && aiTranscript.trim()) {
        setTranscript(aiTranscript);
      } else {
        setStatusNotice(error || 'No audible rehearsal speech detected.');
      }
    } catch (e: any) {
      setStatusNotice('Transcription request failed.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < selectedDeck.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
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

    setIsAnalyzing(true);
    const slideTimingBreakdown = selectedDeck.slides.map((s, i) => 
      `Slide ${i + 1} (${s.title}): ${slideTimers[i] || 0}s (Target: ${s.targetDurationSeconds}s)`
    ).join('; ');

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript || 'In this presentation rehearsal, I walked through the executive slide deck, maintaining steady pacing and clear vocal emphasis across each key slide transition.',
          durationSeconds: Math.max(15, totalRehearsalTime),
          sessionType: 'presentation',
          title: `Rehearsal: ${selectedDeck.title}`,
          questionContext: `Presentation Slides Timing: ${slideTimingBreakdown}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis service error');
      }

      const report: FeedbackReport = await res.json();

      report.actionableDrills.unshift('Rehearse verbal bridge phrases between slides (e.g. "Now that we have established X, let us examine how Y accelerates this...").');

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSessionComplete(report, audioUrl || undefined);
    } catch (err: any) {
      console.warn('Presentation eval notice:', err?.message || err);
      setStatusNotice('The evaluation service is experiencing momentary high traffic. Please tap Evaluate again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSamplePresentationSpeech = () => {
    setTranscript(
      "Good afternoon everyone. Let's begin by examining the invisible problem in temperature-sensitive cold supply chains. Over $35 Billion in critical pharmaceuticals and food spoil annually. Existing data loggers merely report failure post-mortem. EcoTrack changes this with autonomous telemetry pods providing continuous real-time alerts. In Q2 alone, we achieved $420K ARR across 14 enterprise fleets. With this $2.5M seed round, we will expand satellite-link telemetry and double our market reach."
    );
    setTotalRehearsalTime(95);
    setSlideTimers([25, 30, 22, 18]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div id="presentation-practice-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Presentation className="w-4 h-4" />
            Presentation & Pitch Rehearsal Studio
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Slide Flow, Pacing & Visual Narrative
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rehearse your pitch slide-by-slide, monitor time spent per slide, and get feedback on transitions, engagement, and delivery rhythm.
          </p>
        </div>

        <button
          id="load-sample-pitch-btn"
          onClick={handleLoadSamplePresentationSpeech}
          className="px-3.5 py-2 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition flex items-center gap-2 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Sample Pitch Walkthrough</span>
        </button>
      </div>

      {/* Deck Selector & Presentation Stage */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">{selectedDeck.title}</h3>
            <p className="text-xs text-slate-400">{selectedDeck.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Select Deck:</span>
          <select
            id="select-presentation-deck-dropdown"
            value={selectedDeck.id}
            onChange={(e) => {
              const found = PRESENTATION_DECKS.find(d => d.id === e.target.value);
              if (found) setSelectedDeck(found);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {PRESENTATION_DECKS.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Simulated Slide Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 shadow-2xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
            {/* Top Slide Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SLIDE {currentSlide.slideNumber} OF {selectedDeck.slides.length}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Slide Time: <strong className="font-mono text-white">{formatTime(slideTimers[currentSlideIndex] || 0)}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Target: ~{currentSlide.targetDurationSeconds}s</span>
              </div>
            </div>

            {/* Slide Body */}
            <div className="my-6 space-y-4 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {currentSlide.title}
              </h2>

              <ul className="space-y-3 pt-2">
                {currentSlide.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Speaker Notes Box */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Presenter Coaching Cue:</strong>
                <span>{currentSlide.speakerNotesTip}</span>
              </div>
            </div>

            {/* Bottom Slide Navigator Controls */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
              <button
                id="prev-slide-btn"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {selectedDeck.slides.map((_, i) => (
                  <button
                    key={i}
                    id={`slide-dot-${i + 1}`}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      currentSlideIndex === i ? 'bg-purple-500 w-6' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                id="next-slide-btn"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === selectedDeck.slides.length - 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rehearsal Controls & Slide Timing Analytics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[440px] space-y-5">
            {/* Rehearsal Master Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Rehearsal Timing
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(totalRehearsalTime)} Total</span>
                </div>
              </div>

              <AudioWaveform isRecording={isRecording} audioLevel={audioLevel} />
            </div>

            {/* Slide-by-slide Timing Progress */}
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Slide Time Allocation
              </span>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedDeck.slides.map((s, idx) => {
                  const spent = slideTimers[idx] || 0;
                  const isCurrent = currentSlideIndex === idx;
                  const pct = Math.min(100, Math.round((spent / s.targetDurationSeconds) * 100));
                  return (
                    <div 
                      key={s.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isCurrent 
                          ? 'bg-purple-950/40 border-purple-500/50' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">Slide {idx + 1}</span>
                        <span className="font-mono text-slate-400">{formatTime(spent)} / ~{s.targetDurationSeconds}s</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pct > 100 ? 'bg-amber-400' : 'bg-purple-500'}`} 
                          style={{ width: `${Math.min(100, pct)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Audio Transcript Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Spoken Transcript (Verbatim AI Transcribe)</span>
                <div className="flex items-center gap-2">
                  {isTranscribing && (
                    <span className="text-purple-400 text-[10px] animate-pulse">
                      Transcribing with Gemini...
                    </span>
                  )}
                  {!isRecording && audioBase64 && !isTranscribing && (
                    <button
                      id="retranscribe-pres-btn"
                      onClick={handleTranscribeWithAI}
                      className="px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[10px] font-medium transition"
                    >
                      Transcribe with AI
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speech is recorded while presenting across slides..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none resize-none"
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

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {!isRecording ? (
                <button
                  id="start-presentation-rehearsal-btn"
                  onClick={handleStartRehearsal}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Rehearsal Recording</span>
                </button>
              ) : (
                <button
                  id="stop-presentation-rehearsal-btn"
                  onClick={handleStopRehearsal}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Rehearsal</span>
                </button>
              )}

              <button
                id="analyze-presentation-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || isRecording || (!transcript.trim() && totalRehearsalTime === 0)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  isAnalyzing || isRecording || (!transcript.trim() && totalRehearsalTime === 0)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Deck Flow...' : 'Evaluate Pitch & Slide Flow'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
