import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Mic, 
  Square, 
  Sparkles, 
  Clock, 
  Volume2, 
  RotateCcw, 
  Target, 
  Layers,
  ChevronRight,
  Filter,
  AlertCircle,
  Shuffle,
  GraduationCap,
  DollarSign,
  FlaskConical,
  Cog,
  Zap,
  Cpu,
  Code,
  Compass,
  Users,
  Search,
  Wand2,
  Tag,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  HelpCircle,
  MessageSquare,
  PenTool,
  VolumeX,
  Gauge,
  Sliders,
  Play,
  Pause,
  ArrowRight,
  Info,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INTERVIEW_QUESTIONS } from '../data/mockData';
import { AudioWaveform } from './AudioWaveform';
import { InterviewClarifyModal } from './InterviewClarifyModal';
import { MockInterviewDebriefModal } from './MockInterviewDebriefModal';
import { 
  AudioRecorderController, 
  createSpeechRecognizer, 
  speakTextWithBrowser, 
  createWavUrlFromPcm,
  transcribeAudioWithAI 
} from '../utils/audioUtils';
import { 
  InterviewQuestion, 
  FeedbackReport, 
  ExperienceLevel,
  InterviewerPersona,
  InterviewClarification,
  MockSessionState
} from '../types';

interface InterviewPracticeProps {
  onSessionComplete: (report: FeedbackReport, audioUrl?: string) => void;
}

interface DisciplineMeta {
  id: string;
  name: string;
  label: string;
  categoryTag: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  description: string;
  keyTopics: string[];
}

export const DISCIPLINES: DisciplineMeta[] = [
  {
    id: 'all',
    name: 'All Disciplines',
    label: 'All Disciplines',
    categoryTag: 'Universal',
    icon: Briefcase,
    accentColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Explore comprehensive questions across technical, behavioral, operational, and leadership domains.',
    keyTopics: ['Behavioral (STAR)', 'Technical Problem Solving', 'Strategic Execution', 'Leadership']
  },
  {
    id: 'finance',
    name: 'Finance',
    label: 'Finance & Banking',
    categoryTag: 'Finance',
    icon: DollarSign,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Corporate finance, DCF valuation, 3-statement modeling, working capital, risk hedging, and capital budgeting.',
    keyTopics: ['DCF & WACC Valuation', 'Three-Statement Mechanics', 'NPV vs IRR Capital Budgeting', 'FX & Rate Hedging', 'Budget Variance']
  },
  {
    id: 'teaching',
    name: 'Teaching',
    label: 'Teaching & Academia',
    categoryTag: 'Education',
    icon: GraduationCap,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Pedagogical strategy, differentiated instruction, student engagement, classroom management, and assessment frameworks.',
    keyTopics: ['Differentiated Instruction', 'De-escalation & Culture', 'Parent Communication', 'AI in Pedagogy', 'Formative Pacing']
  },
  {
    id: 'chemical',
    name: 'Chemical',
    label: 'Chemical Engineering',
    categoryTag: 'Engineering',
    icon: FlaskConical,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'HAZOP & plant safety, reaction kinetics, fractional distillation, pinch analysis, transport phenomena, and pilot scale-up.',
    keyTopics: ['HAZOP & Safety Interlocks', 'Distillation Hydraulics', 'Batch Scale-Up', 'Pinch Analysis & Heat Exchangers', 'PSM Compliance']
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    label: 'Mechanical Engineering',
    categoryTag: 'Engineering',
    icon: Cog,
    accentColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    description: 'Fatigue & S-N Goodman criteria, GD&T datums & MMC, FEA mesh convergence, DFMEA, and enclosure thermal dissipation.',
    keyTopics: ['Multi-Axial Fatigue & S-N', 'GD&T & Tolerance Stack-Up', 'FEA Convergence & Validation', 'DFMEA & RPN', 'Thermal Management']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    label: 'Electrical Engineering',
    categoryTag: 'Engineering',
    icon: Zap,
    accentColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    description: 'Power distribution, power factor correction, transformer differential protection, arc flash IEEE 1584, and microgrid grid-tie.',
    keyTopics: ['Power Factor & Harmonics', '87T Differential Protection', 'Arc Flash IEEE 1584', 'Grid Synchronization', 'Short-Circuit Duty']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    label: 'Electronics & Comm',
    categoryTag: 'Hardware',
    icon: Cpu,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Embedded RTOS & priority inversion, high-speed PCB signal integrity, DSP FIR/IIR filtering, I2C/SPI debugging, and RF link budgets.',
    keyTopics: ['RTOS & Interrupt Latency', 'High-Speed PCB Signal Integrity', 'DSP Filter Design (FIR/IIR)', 'I2C/SPI Bus Freezes', 'RF Link Budget']
  },
  {
    id: 'software',
    name: 'Software Engineering',
    label: 'Software & Tech',
    categoryTag: 'Tech',
    icon: Code,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    description: 'Distributed systems, high concurrency architectures, memory leaks, database sharding, and technical debt triage.',
    keyTopics: ['System Scalability', 'Production Latency Hotfixes', 'Architecture Debt Triage', 'Caching & Sharding']
  },
  {
    id: 'product',
    name: 'Product Management',
    label: 'Product Management',
    categoryTag: 'Product',
    icon: Compass,
    accentColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    description: 'Product strategy, metric funnel diagnosis, user discovery, feature prioritization, and deprecation runways.',
    keyTopics: ['Funnel Triage', 'Feature Deprecation', 'User Discovery', 'Trade-off Frameworks']
  },
  {
    id: 'leadership',
    name: 'Leadership & Management',
    label: 'Leadership & Mgmt',
    categoryTag: 'Management',
    icon: Users,
    accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    description: 'Delivering difficult feedback, fostering psychological safety, recovering team morale, and organizational change.',
    keyTopics: ['Difficult Feedback', 'Psychological Safety', 'Team Turnaround', 'Cross-Functional Alignment']
  },
  {
    id: 'sales',
    name: 'Sales & Client Relations',
    label: 'Sales & Client',
    categoryTag: 'Business',
    icon: Target,
    accentColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    description: 'Enterprise contract negotiations, price objection handling, crisis SLA de-escalation, and consultative discovery.',
    keyTopics: ['Pricing Objections', 'SLA Outage De-escalation', 'Consultative Discovery', 'Value Anchoring']
  },
  {
    id: 'general',
    name: 'General & HR Behavioral',
    label: 'General HR',
    categoryTag: 'General',
    icon: Layers,
    accentColor: 'text-slate-300 bg-slate-800 border-slate-700',
    description: 'Self-introduction, conflict resolution, dealing with failure, project retrospectives, and professional motivation.',
    keyTopics: ['Elevator Pitch', 'Project Crisis Mitigation', 'Stakeholder Disagreement', 'Failure Retrospective']
  }
];

export interface ExperienceLevelOption {
  id: ExperienceLevel;
  label: string;
  shortLabel: string;
  badgeClass: string;
  description: string;
}

export const EXPERIENCE_LEVEL_OPTIONS: ExperienceLevelOption[] = [
  {
    id: 'All Levels',
    label: 'All Levels',
    shortLabel: 'All Levels',
    badgeClass: 'text-slate-300',
    description: 'Comprehensive spectrum across all career tiers'
  },
  {
    id: 'Fresher',
    label: 'Fresher (College / Graduate)',
    shortLabel: 'Fresher',
    badgeClass: 'text-emerald-400',
    description: 'Core concepts, capstones, academic rigor & learning agility'
  },
  {
    id: '0-2 yrs',
    label: '0-2 yrs (Junior)',
    shortLabel: '0-2 yrs',
    badgeClass: 'text-sky-400',
    description: 'Sprint delivery, hands-on production troubleshooting & team standards'
  },
  {
    id: '3-5 yrs',
    label: '3-5 yrs (Mid-Level)',
    shortLabel: '3-5 yrs',
    badgeClass: 'text-indigo-400',
    description: 'End-to-end feature ownership, trade-off analysis & performance optimization'
  },
  {
    id: 'Senior',
    label: 'Senior (5-8+ yrs)',
    shortLabel: 'Senior',
    badgeClass: 'text-amber-400',
    description: 'System / plant architecture, high-stakes trade-offs, reliability & mentorship'
  },
  {
    id: 'Lead / Executive',
    label: 'Lead / Executive',
    shortLabel: 'Lead / Exec',
    badgeClass: 'text-purple-400',
    description: 'Strategic vision, organizational leadership & crisis governance'
  }
];

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Senior Hiring Director',
    voice: 'Kore',
    style: 'Calm, structured & encouraging',
    avatarSeed: 'ER',
    welcomeMessage: 'Welcome! Take a breath, speak naturally, and walk me through your real-world experience step-by-step.'
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Principal Bar-Raiser',
    voice: 'Fenrir',
    style: 'Technical, analytical & probing',
    avatarSeed: 'MV',
    welcomeMessage: 'Hello. I look for technical rigor, trade-off awareness, and clear root-cause diagnosis in your responses.'
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Head of Talent & Culture',
    voice: 'Aoede',
    style: 'Empathetic, clear & conversational',
    avatarSeed: 'PS',
    welcomeMessage: 'Glad to meet you! I want to understand how you collaborate, communicate under pressure, and deliver impact.'
  }
];

export const COMMON_FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so yeah', 'sort of'];

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({ onSessionComplete }) => {
  // Questions and Filters
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>(INTERVIEW_QUESTIONS);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All Disciplines');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<ExperienceLevel>('All Levels');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(INTERVIEW_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Simulation Versatility: Single Question vs Full Mock Panel (3 Questions)
  const [simulationMode, setSimulationMode] = useState<'single' | 'mock-panel'>('single');
  const [mockSession, setMockSession] = useState<MockSessionState>({
    isActive: false,
    questionIndex: 0,
    totalQuestions: 3,
    questions: [],
    completedAnswers: []
  });
  const [showDebriefModal, setShowDebriefModal] = useState(false);

  // Interviewer Persona & Voice Controls
  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>(INTERVIEWER_PERSONAS[0]);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(1.0);
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState<boolean>(false);
  const [interviewerStatus, setInterviewerStatus] = useState<string>('Ready for inquiry');

  // Question Understanding & Clarification Modal
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [clarificationData, setClarificationData] = useState<InterviewClarification | null>(null);
  const [isLoadingClarification, setIsLoadingClarification] = useState(false);

  // Communication Modes: 'voice' | 'star-builder' | 'text-outline'
  const [communicationMode, setCommunicationMode] = useState<'voice' | 'star-builder' | 'text-outline'>('voice');
  
  // Guided STAR Builder states
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');
  const [isPolishingSTAR, setIsPolishingSTAR] = useState(false);

  // Quick Communication Guide Drawer
  const [showCommunicationGuide, setShowCommunicationGuide] = useState(false);

  // AI Question Generation State
  const [showAIGenDrawer, setShowAIGenDrawer] = useState(false);
  const [aiFocusTopic, setAiFocusTopic] = useState('');
  const [aiExperienceLevel, setAiExperienceLevel] = useState<ExperienceLevel>('0-2 yrs');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Recording & Transcription state
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
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const recognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Filter questions based on discipline, experience level, category, and search query
  const filteredQuestions = allQuestions.filter((q) => {
    const matchesDiscipline = selectedDiscipline === 'All Disciplines' ||
      q.discipline === selectedDiscipline ||
      q.role.toLowerCase().includes(selectedDiscipline.toLowerCase()) ||
      (selectedDiscipline === 'Finance' && (q.discipline === 'Finance' || q.role.toLowerCase().includes('finance'))) ||
      (selectedDiscipline === 'Teaching' && (q.discipline === 'Teaching' || q.role.toLowerCase().includes('teach'))) ||
      (selectedDiscipline === 'Chemical' && (q.discipline === 'Chemical' || q.role.toLowerCase().includes('chemical'))) ||
      (selectedDiscipline === 'Mechanical' && (q.discipline === 'Mechanical' || q.role.toLowerCase().includes('mechanical'))) ||
      (selectedDiscipline === 'Electrical' && (q.discipline === 'Electrical' || q.role.toLowerCase().includes('electrical'))) ||
      (selectedDiscipline === 'Electronics' && (q.discipline === 'Electronics' || q.role.toLowerCase().includes('electronic')));

    const matchesLevel = selectedExperienceLevel === 'All Levels' || q.experienceLevel === selectedExperienceLevel;
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contextTip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.discipline && q.discipline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.experienceLevel && q.experienceLevel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.idealKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDiscipline && matchesLevel && matchesCategory && matchesSearch;
  });

  const activeDisciplineMeta = DISCIPLINES.find(d => d.name === selectedDiscipline) || DISCIPLINES[0];

  // Live Communication Metrics (calculated in real time)
  const currentWords = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = currentWords.length;
  const calculatedWpm = recordingTime > 4 ? Math.round((wordCount / recordingTime) * 60) : 0;
  
  const detectedFillers = COMMON_FILLERS.map(f => {
    const regex = new RegExp(`\\b${f}\\b`, 'gi');
    const matches = transcript.match(regex);
    return { word: f, count: matches ? matches.length : 0 };
  }).filter(item => item.count > 0);
  const totalFillers = detectedFillers.reduce((acc, curr) => acc + curr.count, 0);

  // Stop any active audio and timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) recorderRef.current.stopRecording().catch(() => {});
      if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement.src = '';
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentAudioElement]);

  // Handle question auto-read if enabled
  useEffect(() => {
    if (autoSpeakQuestion && currentQuestion && !isRecording) {
      handleReadQuestion(currentQuestion.question);
    }
  }, [currentQuestion.id, autoSpeakQuestion]);

  // Voice playback with speed support and multi-model fallback
  const handleReadQuestion = async (textToSpeakParam?: string) => {
    const textToSpeak = textToSpeakParam || (isCustomMode ? customQuestion : currentQuestion.question);
    if (!textToSpeak.trim()) return;

    if (currentAudioElement) {
      currentAudioElement.pause();
      setCurrentAudioElement(null);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlayingTTS(true);
    setInterviewerStatus(`${selectedPersona.name} is speaking...`);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToSpeak, 
          voice: selectedPersona.voice 
        }),
      });

      const data = await res.json();
      if (data?.audioBase64) {
        const wavUrl = createWavUrlFromPcm(data.audioBase64, 24000);
        if (wavUrl) {
          const audio = new Audio(wavUrl);
          audio.playbackRate = voicePlaybackSpeed;
          setCurrentAudioElement(audio);

          audio.onended = () => {
            setIsPlayingTTS(false);
            setInterviewerStatus('Listening for your response');
            URL.revokeObjectURL(wavUrl);
            setCurrentAudioElement(null);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(wavUrl);
            speakBrowserFallback(textToSpeak);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Server TTS failed, using browser fallback:', e);
    }

    speakBrowserFallback(textToSpeak);
  };

  const speakBrowserFallback = (text: string) => {
    speakTextWithBrowser(text, () => {
      setIsPlayingTTS(false);
      setInterviewerStatus('Listening for your response');
    }, voicePlaybackSpeed);
  };

  const handleStopSpeakingTTS = () => {
    if (currentAudioElement) {
      currentAudioElement.pause();
      setCurrentAudioElement(null);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
    setInterviewerStatus('Ready for inquiry');
  };

  // Fetch question explanation & clarification
  const handleOpenClarification = async () => {
    setShowClarifyModal(true);
    if (clarificationData) return; // already loaded for this question

    setIsLoadingClarification(true);
    try {
      const res = await fetch('/api/interview/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: isCustomMode ? customQuestion : currentQuestion.question,
          discipline: currentQuestion.discipline || selectedDiscipline,
          experienceLevel: currentQuestion.experienceLevel || selectedExperienceLevel,
          category: currentQuestion.category
        })
      });
      if (res.ok) {
        const data: InterviewClarification = await res.json();
        setClarificationData(data);
      }
    } catch (e) {
      console.warn('Failed to clarify question:', e);
    } finally {
      setIsLoadingClarification(false);
    }
  };

  // Ask interviewer for clarification during interview
  const handleAskInterviewer = async (inquiry: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/interview/ask-interviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: isCustomMode ? customQuestion : currentQuestion.question,
          candidateInquiry: inquiry,
          discipline: currentQuestion.discipline || selectedDiscipline,
          personaName: `${selectedPersona.name} (${selectedPersona.role})`,
          experienceLevel: currentQuestion.experienceLevel || selectedExperienceLevel
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply || null;
      }
    } catch (e) {
      console.warn('Ask interviewer error:', e);
    }
    return `That's a great clarifying question! In this scenario, feel free to assume standard enterprise constraints and focus on explaining your diagnostic methodology.`;
  };

  // Change question handler (clears clarification cache)
  const handleSelectQuestion = (q: InterviewQuestion) => {
    setCurrentQuestion(q);
    setIsCustomMode(false);
    setClarificationData(null);
    setTranscript('');
    setRecordingTime(0);
    setStarSituation('');
    setStarTask('');
    setStarAction('');
    setStarResult('');
  };

  const handleRandomQuestion = () => {
    setIsCustomMode(false);
    const candidates = filteredQuestions.filter(q => q.id !== currentQuestion.id);
    const pool = candidates.length > 0 ? candidates : allQuestions.filter(q => q.id !== currentQuestion.id);
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      handleSelectQuestion(picked);
      setStatusNotice(`Switched question [${picked.experienceLevel || 'All Levels'}]: "${picked.question.slice(0, 50)}..."`);
    }
  };

  // STAR synthesis and polish
  const handlePolishSTARAnswer = async () => {
    setIsPolishingSTAR(true);
    setStatusNotice(null);
    try {
      const res = await fetch('/api/interview/polish-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: isCustomMode ? customQuestion : currentQuestion.question,
          starNotes: {
            situation: starSituation,
            task: starTask,
            action: starAction,
            result: starResult
          },
          rawNotes: communicationMode === 'text-outline' ? transcript : undefined,
          experienceLevel: currentQuestion.experienceLevel || selectedExperienceLevel
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.polishedAnswer) {
          setTranscript(data.polishedAnswer);
          setStatusNotice(`AI polished your response into a natural spoken narrative (${data.wordCount} words).`);
        }
      }
    } catch (e) {
      console.warn('Polish STAR error:', e);
      // Fallback simple merge
      const merged = [
        starSituation && `When ${starSituation}`,
        starTask && `My goal was to ${starTask}`,
        starAction && `I took action by ${starAction}`,
        starResult && `Ultimately, ${starResult}`
      ].filter(Boolean).join('. ');
      if (merged) setTranscript(merged + '.');
    } finally {
      setIsPolishingSTAR(false);
    }
  };

  const handleMergeSTARToTranscript = () => {
    const parts = [
      starSituation.trim() && `Situation: ${starSituation.trim()}`,
      starTask.trim() && `Task: ${starTask.trim()}`,
      starAction.trim() && `Action: ${starAction.trim()}`,
      starResult.trim() && `Result: ${starResult.trim()}`
    ].filter(Boolean);

    if (parts.length > 0) {
      setTranscript(parts.join('\n\n'));
      setStatusNotice('Merged STAR sections into your spoken answer.');
    }
  };

  // Recording Handlers
  const handleStartRecording = async () => {
    setTranscript('');
    setRecordingTime(0);
    setAudioUrl(null);
    setAudioBase64(null);
    setIsTranscribing(false);
    setStatusNotice(null);
    setInterviewerStatus(`Listening to your response...`);

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
    setInterviewerStatus('Recording completed');

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
          console.warn('AI transcription error:', e);
        } finally {
          setIsTranscribing(false);
        }
      }
    }
  };

  // Evaluation Handler
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
      setStatusNotice('Please speak, outline with the STAR builder, or type your response first.');
      return;
    }

    setIsAnalyzing(true);
    setInterviewerStatus('Evaluating answer with STAR rubric...');
    const activeQ = isCustomMode ? customQuestion : currentQuestion.question;
    const activeDisciplineLabel = currentQuestion.discipline || (selectedDiscipline !== 'All Disciplines' ? selectedDiscipline : currentQuestion.role);
    const activeLevelLabel = currentQuestion.experienceLevel || (selectedExperienceLevel !== 'All Levels' ? selectedExperienceLevel : '0-2 yrs');

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript,
          durationSeconds: Math.max(10, recordingTime),
          sessionType: 'interview',
          title: `Interview [${activeDisciplineLabel} - ${activeLevelLabel}]: ${activeQ.slice(0, 35)}...`,
          questionContext: activeQ,
          role: activeDisciplineLabel,
          experienceLevel: activeLevelLabel,
        }),
      });

      if (!res.ok) throw new Error('Analysis service error');

      const report: FeedbackReport = await res.json();

      if (report.overallScore >= 80) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // If in Mock Panel Mode, save question answer and advance or debrief
      if (simulationMode === 'mock-panel' && mockSession.isActive) {
        const updatedCompleted = [
          ...mockSession.completedAnswers,
          {
            question: currentQuestion,
            transcript: activeTranscript,
            durationSeconds: Math.max(10, recordingTime),
            report
          }
        ];

        if (mockSession.questionIndex < mockSession.totalQuestions - 1) {
          const nextIndex = mockSession.questionIndex + 1;
          const nextQ = mockSession.questions[nextIndex];
          setMockSession(prev => ({
            ...prev,
            questionIndex: nextIndex,
            completedAnswers: updatedCompleted
          }));
          if (nextQ) {
            handleSelectQuestion(nextQ);
            setStatusNotice(`Advancing to Question ${nextIndex + 1} of ${mockSession.totalQuestions}.`);
          }
        } else {
          // Finished Mock Panel! Compute final debrief
          const avgScore = Math.round(
            updatedCompleted.reduce((acc, c) => acc + (c.report?.overallScore || 75), 0) / updatedCompleted.length
          );
          const recommendation = avgScore >= 85 ? 'Strong Hire' : avgScore >= 75 ? 'Hire' : avgScore >= 65 ? 'Borderline / Needs Polish' : 'Not Ready';
          
          const debriefData = {
            recommendation: recommendation as any,
            summary: `Across 3 rigorous interview inquiries, you maintained an average composite rating of ${avgScore}/100. ${
              avgScore >= 80 
                ? 'Your answers showed crisp STAR framework structure, actionable technical context, and convincing outcome quantification.' 
                : 'Good conceptual foundation. Focus on structuring actions more systematically and replacing hesitations with deliberate pauses.'
            }`,
            averageScore: avgScore,
            keyStrengths: [
              'Clear alignment with the STAR framework across technical challenges.',
              'Good articulation of individual responsibility and leadership decisions.',
              'Pacing and vocabulary maintained a professional, confident demeanor.'
            ],
            priorityImprovements: [
              'Quantify business or operational metrics more specifically in the Result phase.',
              'Limit filler phrases during cognitive transitions between technical points.',
              'Frame initial problem contexts more concisely to leave 70% of time for Actions.'
            ]
          };

          setMockSession(prev => ({
            ...prev,
            isActive: false,
            completedAnswers: updatedCompleted,
            overallDebrief: debriefData
          }));
          setShowDebriefModal(true);
        }
      }

      onSessionComplete(report, audioUrl || undefined);
    } catch (err: any) {
      console.warn('Interview analysis error:', err);
      setStatusNotice('Evaluation service is experiencing high traffic. Please tap Evaluate again.');
    } finally {
      setIsAnalyzing(false);
      setInterviewerStatus('Evaluation completed');
    }
  };

  // Start Realistic Mock Interview Simulation (3 rounds)
  const handleStartMockInterview = () => {
    const pool = filteredQuestions.length >= 3 ? filteredQuestions : allQuestions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected3 = shuffled.slice(0, 3);

    setMockSession({
      isActive: true,
      questionIndex: 0,
      totalQuestions: 3,
      questions: selected3,
      completedAnswers: []
    });
    setSimulationMode('mock-panel');
    handleSelectQuestion(selected3[0]);
    setStatusNotice('Started Realistic Mock Interview Simulation (3 Rounds). Question 1 is live!');
  };

  const handleGenerateAIQuestion = async (customFocus?: string, customLevel?: ExperienceLevel) => {
    setIsGeneratingAI(true);
    setStatusNotice(null);
    const targetDiscipline = selectedDiscipline === 'All Disciplines' ? 'Software Engineering' : selectedDiscipline;
    const targetLevel = (customLevel || aiExperienceLevel || (selectedExperienceLevel !== 'All Levels' ? selectedExperienceLevel : '0-2 yrs')) as string;
    const focus = customFocus !== undefined ? customFocus : aiFocusTopic;

    try {
      const res = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline: targetDiscipline,
          category: selectedCategory !== 'All' ? selectedCategory : 'Technical',
          focusTopic: focus.trim() || undefined,
          experienceLevel: targetLevel
        })
      });

      if (!res.ok) throw new Error('Generation error');
      const generatedQ: InterviewQuestion = await res.json();
      if (generatedQ && generatedQ.question) {
        setAllQuestions(prev => [generatedQ, ...prev]);
        handleSelectQuestion(generatedQ);
        setShowAIGenDrawer(false);
        setAiFocusTopic('');
        setStatusNotice(`Generated new ${generatedQ.discipline || targetDiscipline} (${generatedQ.experienceLevel || targetLevel}) question!`);
      }
    } catch (err: any) {
      console.warn('AI question generation error:', err);
      setStatusNotice('Generated inquiry using discipline heuristics.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Load Model STAR Answer
  const handleLoadSampleAnswer = () => {
    const activeDisp = (currentQuestion.discipline || selectedDiscipline).toLowerCase();

    if (activeDisp.includes('finance')) {
      setTranscript(
        "In my previous role as financial analyst at an industrial manufacturing firm, our division faced an unexpected 18% spike in raw steel prices, compressing quarterly gross margins below our bank covenant threshold. My task was to remodel our quarterly cash flows, perform sensitivity analysis on working capital, and present mitigation options to the CFO. I immediately audited our accounts payable cycles, renegotiated vendor payment terms to 60 days, and executed a 6-month forward contract to lock in steel indices. Consequently, we averted covenant breaches, stabilized our operating cash flow by $1.4M, and protected our projected net margin."
      );
      setRecordingTime(92);
      return;
    }

    if (activeDisp.includes('teach')) {
      setTranscript(
        "During the fall semester, I taught an inclusive 10th-grade science class where 30% of students were struggling with thermodynamics concepts while advanced students were disengaged by standard pacing. My responsibility was to restructure our unit plan without leaving anyone behind. I introduced tiered labs with three complexity tracks, implemented daily 3-minute formative exit tickets, and assigned peer mentorship pods with inquiry-based real-world challenges. By the final benchmark assessment, class median comprehension improved from 64% to 88%, and 100% of students met or exceeded regional proficiency standards."
      );
      setRecordingTime(96);
      return;
    }

    if (activeDisp.includes('chem')) {
      setTranscript(
        "During the commissioning of our continuous catalytic hydrogenation unit, we observed abnormal temperature spikes in the second-stage tubular reactor, indicating localized hot spots and risk of thermal runaway. As lead process safety engineer, my mandate was to halt escalation and redesign the feed quench protocol. I led an emergency HAZOP session, re-evaluated the Damköhler and Biot numbers, and reconfigured the distributed cold hydrogen quench injection nozzles. Within 36 hours, reactor bed temperatures stabilized within a strict ±2°C delta, eliminating runaway risk and achieving 99.2% stoichiometric conversion safely."
      );
      setRecordingTime(98);
      return;
    }

    if (activeDisp.includes('mech')) {
      setTranscript(
        "During endurance testing of our high-speed robotic drive arm, dynamic load cells recorded unexpected harmonic vibration causing premature fatigue micro-cracking in the secondary linkage bearing housing at only 200,000 cycles versus our 1-million cycle target. My task was to perform root-cause failure analysis and re-engineer the housing. I verified our FEA stress singularities against physical strain gauge readings, identified insufficient radius fillets causing stress concentrations with a Kt of 2.4, and revised our GD&T datum scheme to MMC with an increased 5mm blend radius and 7075-T6 aluminum alloy. The revised assembly survived 1.5 million cycles with zero fatigue deflection."
      );
      setRecordingTime(102);
      return;
    }

    // Default Tech/Behavioral STAR
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
    <div id="interview-practice-module" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 tracking-wide">
            <Briefcase className="w-4 h-4" />
            <span>Interactive Interview Studio</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-normal">Multi-Disciplinary & Seniority Calibrated</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Role & Seniority-Calibrated Interview Simulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice realistic hiring inquiries with active AI voice, real-time question breakdown, and versatile communication via <strong className="text-white">Microphone</strong>, <strong className="text-white">Guided STAR Builder</strong>, or <strong className="text-white">Text Notes</strong>.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <button
            id="how-to-communicate-btn"
            onClick={() => setShowCommunicationGuide(!showCommunicationGuide)}
            className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Read how to easily interact and communicate in this simulation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>How to Communicate</span>
          </button>

          {simulationMode === 'single' ? (
            <button
              id="start-mock-interview-session-btn"
              onClick={handleStartMockInterview}
              className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Launch a realistic 3-question mock interview panel with final hiring debrief"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Full Mock Interview (3 Rounds)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSimulationMode('single');
                setMockSession(prev => ({ ...prev, isActive: false }));
              }}
              className="px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Exit Panel (Switch to Single Drill)</span>
            </button>
          )}

          <button
            id="open-ai-gen-drawer-btn"
            onClick={() => setShowAIGenDrawer(!showAIGenDrawer)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Question Studio</span>
          </button>
        </div>
      </div>

      {/* "How to Communicate With Ease" Quick Guide Drawer */}
      {showCommunicationGuide && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-4 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>How to Communicate With Ease & Master the Simulation</span>
            </div>
            <button
              onClick={() => setShowCommunicationGuide(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Mic className="w-4 h-4 text-sky-400" />
                <span>1. Spoken Communication</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Click <strong>"Start Response"</strong> to talk naturally. Your mic level is visualized in real-time, with automatic transcription and live delivery pacing stats.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>2. Understand Every Question</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Unsure what an inquiry means? Tap <strong>"Explain Question"</strong> to see a plain-English translation, interviewer expectations, and a confident opening sentence.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <PenTool className="w-4 h-4 text-indigo-400" />
                <span>3. Guided STAR Builder</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Prefer structuring thoughts first? Use the <strong>STAR Builder tab</strong> to outline Situation, Task, Action, and Result, then tap <strong>"AI Polish"</strong> for a spoken script.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mock Interview Progress Stepper (if Mock Panel active) */}
      {simulationMode === 'mock-panel' && mockSession.isActive && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
              {mockSession.questionIndex + 1}/3
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Mock Panel Round {mockSession.questionIndex + 1}: {mockSession.questionIndex === 0 ? 'Fundamentals & Context' : mockSession.questionIndex === 1 ? 'Technical / System Deep Dive' : 'High-Stakes Crisis & Conflict'}
              </div>
              <div className="text-[11px] text-slate-400">
                Answer each round to receive the comprehensive Executive Panel Hiring Verdict.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => {
              const isPast = idx < mockSession.questionIndex;
              const isCurrent = idx === mockSession.questionIndex;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                    isPast
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Dynamic Generation Drawer */}
      {showAIGenDrawer && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3.5 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <span>Gemini AI Question Studio — {selectedDiscipline === 'All Disciplines' ? 'Multi-Disciplinary' : selectedDiscipline}</span>
            </div>
            <button
              onClick={() => setShowAIGenDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Target Seniority Level:
              </label>
              <select
                id="ai-level-select"
                value={aiExperienceLevel}
                onChange={(e) => setAiExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Fresher">Fresher (Academic coursework, capstones & fundamentals)</option>
                <option value="0-2 yrs">0-2 yrs (Junior production troubleshooting & sprint execution)</option>
                <option value="3-5 yrs">3-5 yrs (Mid-level feature ownership & trade-offs)</option>
                <option value="Senior">Senior (5-8+ yrs architecture, reliability & trade-offs)</option>
                <option value="Lead / Executive">Lead / Executive (Strategic vision, org culture & governance)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                Target Discipline:
              </label>
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-indigo-300 font-semibold truncate">
                {selectedDiscipline === 'All Disciplines' ? 'Software Engineering / Multi-Discipline' : selectedDiscipline}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              id="ai-focus-topic-input"
              placeholder="Optional specific focus (e.g. Distributed Caching, DCF Modeling, HAZOP Protocol)..."
              value={aiFocusTopic}
              onChange={(e) => setAiFocusTopic(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              id="submit-ai-question-gen-btn"
              onClick={() => handleGenerateAIQuestion()}
              disabled={isGeneratingAI}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              {isGeneratingAI ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Question</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Discipline Navigation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            Select Discipline
          </span>
          <span className="text-[11px] text-slate-500">
            {allQuestions.length} curated & AI questions across 11 disciplines
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {DISCIPLINES.map((disp) => {
            const Icon = disp.icon;
            const isSelected = selectedDiscipline === disp.name;
            const count = allQuestions.filter(q => 
              disp.name === 'All Disciplines' || 
              q.discipline === disp.name || 
              q.role.toLowerCase().includes(disp.name.toLowerCase())
            ).length;

            return (
              <button
                key={disp.id}
                id={`discipline-btn-${disp.id}`}
                onClick={() => {
                  setSelectedDiscipline(disp.name);
                  setIsCustomMode(false);
                  const matching = allQuestions.filter(q => 
                    disp.name === 'All Disciplines' || q.discipline === disp.name || q.role.toLowerCase().includes(disp.name.toLowerCase())
                  );
                  if (matching.length > 0) handleSelectQuestion(matching[0]);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 ring-1 ring-sky-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-400'}`} />
                <span>{disp.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-sky-700/80 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Experience Level Calibration
          </span>
          <span className="text-[11px] text-slate-400">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'} matching <span className="text-white font-semibold">{selectedExperienceLevel}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {EXPERIENCE_LEVEL_OPTIONS.map((lvl) => {
            const isSelected = selectedExperienceLevel === lvl.id;
            const count = allQuestions.filter(q => {
              const matchDisp = selectedDiscipline === 'All Disciplines' || 
                q.discipline === selectedDiscipline || 
                q.role.toLowerCase().includes(selectedDiscipline.toLowerCase());
              const matchLvl = lvl.id === 'All Levels' || q.experienceLevel === lvl.id;
              return matchDisp && matchLvl;
            }).length;

            return (
              <button
                key={lvl.id}
                id={`level-filter-btn-${lvl.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => {
                  setSelectedExperienceLevel(lvl.id);
                  setIsCustomMode(false);
                  const matching = allQuestions.filter(q => {
                    const matchDisp = selectedDiscipline === 'All Disciplines' || q.discipline === selectedDiscipline || q.role.toLowerCase().includes(selectedDiscipline.toLowerCase());
                    const matchLvl = lvl.id === 'All Levels' || q.experienceLevel === lvl.id;
                    return matchDisp && matchLvl;
                  });
                  if (matching.length > 0) handleSelectQuestion(matching[0]);
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500/50 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-sky-300' : 'text-slate-400'}`}>
                    {lvl.shortLabel}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white truncate">
                  {lvl.id === 'All Levels' ? 'All Seniorities' : lvl.id}
                </div>
                <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                  {lvl.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Questions List & Interviewer Settings */}
        <div className="lg:col-span-1 space-y-4">
          {/* Interviewer Persona Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interviewer Persona
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Speed:</span>
                {[0.8, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setVoicePlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                      voicePlaybackSpeed === spd
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-300 text-xs">
                    {selectedPersona.avatarSeed}
                  </div>
                  {isPlayingTTS && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{selectedPersona.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({selectedPersona.role})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    {interviewerStatus}
                  </div>
                </div>
              </div>

              <select
                value={selectedPersona.id}
                onChange={(e) => {
                  const p = INTERVIEWER_PERSONAS.find(item => item.id === e.target.value);
                  if (p) setSelectedPersona(p);
                }}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
              >
                {INTERVIEWER_PERSONAS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={autoSpeakQuestion}
                  onChange={(e) => setAutoSpeakQuestion(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
                />
                <span>Auto-speak questions on selection</span>
              </label>

              {isPlayingTTS ? (
                <button
                  onClick={handleStopSpeakingTTS}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>Stop Voice</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Questions List & Search */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inquiries ({filteredQuestions.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="random-interview-q-btn"
                  onClick={handleRandomQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition cursor-pointer"
                  title="Pick a random interview question in this discipline"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Random</span>
                </button>
                <button
                  id="toggle-custom-interview-q-btn"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-lg hover:bg-sky-500/10 transition cursor-pointer"
                >
                  {isCustomMode ? 'Standard Q' : '+ Custom'}
                </button>
              </div>
            </div>

            {/* In-column Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {isCustomMode ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder="Paste or write the interview question you want to practice..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {filteredQuestions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">No matching questions found.</p>
                    <button
                      onClick={() => handleGenerateAIQuestion()}
                      className="text-xs text-sky-400 hover:underline font-semibold"
                    >
                      Generate AI question for this discipline →
                    </button>
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isSelected = currentQuestion.id === q.id && !isCustomMode;
                    return (
                      <div
                        key={q.id}
                        id={`q-item-${q.id}`}
                        onClick={() => handleSelectQuestion(q)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                          isSelected 
                            ? 'bg-sky-500/15 border-sky-500/60 shadow-sm ring-1 ring-sky-500/30' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-300">{q.category}</span>
                            {q.experienceLevel && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="font-semibold text-sky-400">{q.experienceLevel}</span>
                              </>
                            )}
                            {q.discipline && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span>{q.discipline}</span>
                              </>
                            )}
                          </div>
                          {isSelected && <span className="font-bold text-sky-400 shrink-0">Active</span>}
                        </div>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Question Stage & Versatile Communication Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[540px] space-y-5">
            {/* Interviewer Active Prompter & Understanding Tools */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Interviewer Prompt
                  </span>
                  {!isCustomMode && currentQuestion.experienceLevel && (
                    <span className="text-slate-400">
                      / <strong className="text-white">{currentQuestion.experienceLevel}</strong>
                    </span>
                  )}
                  {!isCustomMode && currentQuestion.discipline && (
                    <span className="text-slate-500">
                      / {currentQuestion.discipline}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Understand / Explain Question Button */}
                  <button
                    id="explain-interview-question-btn"
                    onClick={handleOpenClarification}
                    className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Translate this question into plain English and see what the interviewer expects"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Explain Question</span>
                  </button>

                  {/* Ask Clarification Button */}
                  <button
                    id="ask-interviewer-clarification-btn"
                    onClick={() => {
                      setShowClarifyModal(true);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Ask the interviewer for scope or technical clarification"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ask Clarification</span>
                  </button>

                  {/* Listen Voice TTS */}
                  <button
                    id="speak-question-tts-btn"
                    onClick={() => handleReadQuestion()}
                    disabled={isPlayingTTS}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingTTS ? 'Speaking...' : 'Listen via Voice'}</span>
                  </button>
                </div>
              </div>

              {/* The Spoken Inquiry Text */}
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{isCustomMode ? (customQuestion || 'Enter your question on the left...') : currentQuestion.question}"
              </p>

              {/* Coach Tip & Keywords */}
              {!isCustomMode && currentQuestion.contextTip && (
                <div className="text-xs text-slate-300 flex items-start gap-2 border-t border-slate-800/80 pt-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sky-300 font-bold mr-1.5">Coach Tip:</span>
                    <span>{currentQuestion.contextTip}</span>
                  </div>
                </div>
              )}

              {!isCustomMode && currentQuestion.idealKeywords && currentQuestion.idealKeywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-medium">Keywords to hit:</span>
                  {currentQuestion.idealKeywords.map((kw, i) => (
                    <span key={i} className="text-slate-300 font-medium">
                      {kw}{i < currentQuestion.idealKeywords.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Communication Mode Tabs (Voice vs Guided STAR vs Direct Text) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    id="comm-mode-voice-tab"
                    onClick={() => setCommunicationMode('voice')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      communicationMode === 'voice'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Mic</span>
                  </button>

                  <button
                    id="comm-mode-star-tab"
                    onClick={() => setCommunicationMode('star-builder')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      communicationMode === 'star-builder'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>STAR Builder</span>
                  </button>

                  <button
                    id="comm-mode-text-tab"
                    onClick={() => setCommunicationMode('text-outline')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      communicationMode === 'text-outline'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Text & Notes</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="load-sample-interview-answer-btn"
                    onClick={handleLoadSampleAnswer}
                    className="px-2.5 py-1 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Load an authentic, discipline-tailored STAR sample answer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Load Model STAR</span>
                  </button>
                </div>
              </div>

              {/* Live Audio Visualizer / Timer Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="font-mono font-bold text-white text-sm">{formatTime(recordingTime)}</span>
                    <span className="text-slate-500">/ Target: ~{currentQuestion.targetDurationSeconds || 110}s</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Pace Metric */}
                    {recordingTime > 5 && (
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-sky-400" />
                        <span>{calculatedWpm} WPM</span>
                        <span className={`text-[10px] font-semibold ${
                          calculatedWpm >= 130 && calculatedWpm <= 165 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          ({calculatedWpm < 130 ? 'Measured' : calculatedWpm > 165 ? 'Fast' : 'Ideal Tempo'})
                        </span>
                      </span>
                    )}

                    {isRecording && (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Microphone Active & Listening
                      </span>
                    )}
                  </div>
                </div>

                <AudioWaveform isRecording={isRecording} audioLevel={audioLevel} />
              </div>
            </div>

            {/* TAB 1: Voice Mode Workspace */}
            {communicationMode === 'voice' && (
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <span>Spoken Answer (Verbatim Gemini AI Transcription)</span>
                  <div className="flex items-center gap-3">
                    {isTranscribing && (
                      <span className="flex items-center gap-1 text-sky-400 font-semibold animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Gemini transcribing...
                      </span>
                    )}
                    <span>{wordCount} words</span>
                  </div>
                </label>

                <textarea
                  rows={5}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Click 'Start Response' below and speak into your microphone. Your spoken words will be transcribed in real time for STAR framework evaluation..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-sans leading-relaxed resize-none flex-1"
                />

                {/* Live Filler Word HUD */}
                {totalFillers > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Filler Words Detected ({totalFillers}):
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {detectedFillers.map((f, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-200 font-medium">
                          "{f.word}": {f.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Guided STAR Builder */}
            {communicationMode === 'star-builder' && (
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Construct your answer with structured STAR milestones:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePolishSTARAnswer}
                      disabled={isPolishingSTAR || (!starSituation && !starTask && !starAction && !starResult)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-semibold flex items-center gap-1 transition text-xs cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isPolishingSTAR ? 'Polishing with AI...' : 'AI Polish into Spoken Response'}</span>
                    </button>
                    <button
                      onClick={handleMergeSTARToTranscript}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Merge into Answer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-sky-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <span>[S] Situation</span>
                      <span className="text-slate-500 font-normal">(Context & baseline metric)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={starSituation}
                      onChange={(e) => setStarSituation(e.target.value)}
                      placeholder="e.g. During peak trading hours, our latency spiked by 18%..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <span>[T] Task</span>
                      <span className="text-slate-500 font-normal">(Your specific responsibility)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={starTask}
                      onChange={(e) => setStarTask(e.target.value)}
                      placeholder="e.g. My mandate was to diagnose root cause and prevent covenant breach..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <span>[A] Action</span>
                      <span className="text-slate-500 font-normal">(Technical steps & calculations)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={starAction}
                      onChange={(e) => setStarAction(e.target.value)}
                      placeholder="e.g. I isolated our memory evictions, tuned thread pools, and led a HAZOP review..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <span>[R] Result</span>
                      <span className="text-slate-500 font-normal">(Quantifiable impact & metric)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={starResult}
                      onChange={(e) => setStarResult(e.target.value)}
                      placeholder="e.g. Latency dropped to 140ms and preserved $1.4M in operational margin..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {transcript && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Generated Spoken Response ({wordCount} words)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                      {transcript}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Text & Notes Workspace */}
            {communicationMode === 'text-outline' && (
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Type or paste your answer notes:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePolishSTARAnswer}
                      disabled={isPolishingSTAR || !transcript.trim()}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-semibold flex items-center gap-1 transition text-xs cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isPolishingSTAR ? 'Polishing...' : 'AI Expand into Complete Answer'}</span>
                    </button>
                    {transcript && (
                      <button
                        onClick={() => handleReadQuestion(transcript)}
                        disabled={isPlayingTTS}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen to My Answer</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Outline key bullet points or write out your complete response. You can then click 'AI Expand into Complete Answer' or evaluate directly..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-sans leading-relaxed resize-none flex-1"
                />
              </div>
            )}

            {/* In-app Status Notification Banner */}
            {statusNotice && (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{statusNotice}</span>
                </div>
                <button 
                  onClick={() => setStatusNotice(null)}
                  className="text-sky-400 hover:text-white text-xs px-2 py-0.5 rounded ml-2"
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
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2.5 active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Response</span>
                  </button>
                ) : (
                  <button
                    id="stop-interview-answer-btn"
                    onClick={handleStopRecording}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2.5 active:scale-95 cursor-pointer"
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
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAnalyzing 
                    ? 'Evaluating STAR Answer...' 
                    : simulationMode === 'mock-panel' && mockSession.isActive
                    ? `Submit Round ${mockSession.questionIndex + 1} of 3`
                    : 'Evaluate Answer'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clarification & Question Understanding Modal */}
      <InterviewClarifyModal
        isOpen={showClarifyModal}
        onClose={() => setShowClarifyModal(false)}
        question={isCustomMode ? customQuestion : currentQuestion.question}
        discipline={currentQuestion.discipline || selectedDiscipline}
        experienceLevel={currentQuestion.experienceLevel || selectedExperienceLevel}
        category={currentQuestion.category}
        interviewer={selectedPersona}
        clarificationData={clarificationData}
        isLoadingClarification={isLoadingClarification}
        onUseOpeningLine={(opening) => {
          setTranscript(opening + ' ');
          setStatusNotice(`Applied suggested opening sentence to your response.`);
        }}
        onAskInterviewer={handleAskInterviewer}
        onPlayTTS={(text) => handleReadQuestion(text)}
        isPlayingTTS={isPlayingTTS}
      />

      {/* Mock Interview Full Panel Debrief Modal */}
      <MockInterviewDebriefModal
        isOpen={showDebriefModal}
        onClose={() => setShowDebriefModal(false)}
        sessionState={mockSession}
        onRestart={handleStartMockInterview}
        onReviewQuestion={(index) => {
          const q = mockSession.completedAnswers[index]?.question;
          if (q) handleSelectQuestion(q);
        }}
      />
    </div>
  );
};
