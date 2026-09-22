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
  BookOpen
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
import { InterviewQuestion, FeedbackReport, ExperienceLevel } from '../types';

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
    badgeClass: 'text-slate-300 bg-slate-800 border-slate-700',
    description: 'Comprehensive spectrum across all career tiers'
  },
  {
    id: 'Fresher',
    label: 'Fresher (College / Graduate)',
    shortLabel: 'Fresher',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Core concepts, capstones, academic rigor & learning agility'
  },
  {
    id: '0-2 yrs',
    label: '0-2 yrs (Junior)',
    shortLabel: '0-2 yrs',
    badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Sprint delivery, hands-on production troubleshooting & team standards'
  },
  {
    id: '3-5 yrs',
    label: '3-5 yrs (Mid-Level)',
    shortLabel: '3-5 yrs',
    badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    description: 'End-to-end feature ownership, trade-off analysis & performance optimization'
  },
  {
    id: 'Senior',
    label: 'Senior (5-8+ yrs)',
    shortLabel: 'Senior',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'System / plant architecture, high-stakes trade-offs, reliability & mentorship'
  },
  {
    id: 'Lead / Executive',
    label: 'Lead / Executive',
    shortLabel: 'Lead / Exec',
    badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Strategic vision, organizational leadership & crisis governance'
  }
];

export const getExperienceBadgeClass = (level?: string) => {
  switch (level) {
    case 'Fresher':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case '0-2 yrs':
      return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    case '3-5 yrs':
      return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    case 'Senior':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'Lead / Executive':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    default:
      return 'text-slate-400 bg-slate-800 border-slate-700';
  }
};

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({ onSessionComplete }) => {
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>(INTERVIEW_QUESTIONS);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All Disciplines');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<ExperienceLevel>('All Levels');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(INTERVIEW_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // AI Dynamic Generation state
  const [showAIGenDrawer, setShowAIGenDrawer] = useState(false);
  const [aiFocusTopic, setAiFocusTopic] = useState('');
  const [aiExperienceLevel, setAiExperienceLevel] = useState<ExperienceLevel>('0-2 yrs');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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

  // Filter questions based on discipline, experience level, category, and search query
  const filteredQuestions = allQuestions.filter((q) => {
    // Discipline filter
    const matchesDiscipline = selectedDiscipline === 'All Disciplines' ||
      q.discipline === selectedDiscipline ||
      q.role.toLowerCase().includes(selectedDiscipline.toLowerCase()) ||
      (selectedDiscipline === 'Finance' && (q.discipline === 'Finance' || q.role.toLowerCase().includes('finance'))) ||
      (selectedDiscipline === 'Teaching' && (q.discipline === 'Teaching' || q.role.toLowerCase().includes('teach'))) ||
      (selectedDiscipline === 'Chemical' && (q.discipline === 'Chemical' || q.role.toLowerCase().includes('chemical'))) ||
      (selectedDiscipline === 'Mechanical' && (q.discipline === 'Mechanical' || q.role.toLowerCase().includes('mechanical'))) ||
      (selectedDiscipline === 'Electrical' && (q.discipline === 'Electrical' || q.role.toLowerCase().includes('electrical'))) ||
      (selectedDiscipline === 'Electronics' && (q.discipline === 'Electronics' || q.role.toLowerCase().includes('electronic')));

    // Experience level filter
    const matchesLevel = selectedExperienceLevel === 'All Levels' ||
      q.experienceLevel === selectedExperienceLevel;

    // Category filter
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;

    // Search query filter
    const matchesSearch = !searchQuery.trim() || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contextTip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.discipline && q.discipline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.experienceLevel && q.experienceLevel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.idealKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDiscipline && matchesLevel && matchesCategory && matchesSearch;
  });

  // Current active discipline object
  const activeDisciplineMeta = DISCIPLINES.find(d => d.name === selectedDiscipline) || DISCIPLINES[0];

  const handleRandomQuestion = () => {
    setIsCustomMode(false);
    const candidates = filteredQuestions.filter(q => q.id !== currentQuestion.id);
    const pool = candidates.length > 0 ? candidates : allQuestions.filter(q => q.id !== currentQuestion.id);
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setCurrentQuestion(picked);
      setTranscript('');
      setRecordingTime(0);
      setStatusNotice(`Switched question [${picked.experienceLevel || 'All Levels'}]: "${picked.question.slice(0, 50)}..."`);
    }
  };

  const handleSelectDiscipline = (dispName: string) => {
    setSelectedDiscipline(dispName);
    setIsCustomMode(false);
    // Find first question matching the discipline and current experience level if possible
    const matchingWithLevel = allQuestions.filter(q => {
      const matchDisp = dispName === 'All Disciplines' || 
        q.discipline === dispName || 
        q.role.toLowerCase().includes(dispName.toLowerCase());
      const matchLvl = selectedExperienceLevel === 'All Levels' || q.experienceLevel === selectedExperienceLevel;
      return matchDisp && matchLvl;
    });

    if (matchingWithLevel.length > 0 && !matchingWithLevel.some(q => q.id === currentQuestion.id)) {
      setCurrentQuestion(matchingWithLevel[0]);
    } else if (matchingWithLevel.length === 0) {
      const matchingAny = allQuestions.filter(q => 
        dispName === 'All Disciplines' || 
        q.discipline === dispName || 
        q.role.toLowerCase().includes(dispName.toLowerCase())
      );
      if (matchingAny.length > 0 && !matchingAny.some(q => q.id === currentQuestion.id)) {
        setCurrentQuestion(matchingAny[0]);
      }
    }
  };

  const handleSelectExperienceLevel = (level: ExperienceLevel) => {
    setSelectedExperienceLevel(level);
    setIsCustomMode(false);
    
    // Auto-select a question matching both discipline and new level if current doesn't match
    const matching = allQuestions.filter(q => {
      const matchDisp = selectedDiscipline === 'All Disciplines' || 
        q.discipline === selectedDiscipline || 
        q.role.toLowerCase().includes(selectedDiscipline.toLowerCase());
      const matchLvl = level === 'All Levels' || q.experienceLevel === level;
      return matchDisp && matchLvl;
    });

    if (matching.length > 0 && !matching.some(q => q.id === currentQuestion.id)) {
      setCurrentQuestion(matching[0]);
    }
  };

  const handleGenerateAIQuestion = async (customFocus?: string, customLevel?: ExperienceLevel) => {
    setIsGeneratingAI(true);
    setStatusNotice(null);
    const targetDiscipline = selectedDiscipline === 'All Disciplines' ? 'Finance' : selectedDiscipline;
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

      if (!res.ok) throw new Error('Generation service error');

      const generatedQ: InterviewQuestion = await res.json();
      if (generatedQ && generatedQ.question) {
        setAllQuestions(prev => [generatedQ, ...prev]);
        setCurrentQuestion(generatedQ);
        setIsCustomMode(false);
        setShowAIGenDrawer(false);
        setAiFocusTopic('');
        setStatusNotice(`Generated new ${generatedQ.discipline || targetDiscipline} (${generatedQ.experienceLevel || targetLevel}) question with Gemini AI!`);
      }
    } catch (err: any) {
      console.warn('AI question generation notice:', err);
      setStatusNotice('Generated inquiry using discipline heuristics.');
    } finally {
      setIsGeneratingAI(false);
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

  // Discipline-specific model STAR answers
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

    if (activeDisp.includes('electr') && !activeDisp.includes('electron')) {
      setTranscript(
        "At our multi-megawatt industrial manufacturing plant, adding variable frequency drives to high-pressure blowers degraded plant power factor to 0.76 lagging and introduced 12% total harmonic distortion (THD), triggering utility penalty surcharges. As plant electrical engineer, I was responsible for restoring power factor above 0.95 without causing resonant harmonic tripping. I analyzed harmonic spectrum measurements, designed a 450 kVAR automatic detuned capacitor bank with 7% series iron-core reactors tuned below the 5th harmonic, and upgraded the breaker relay coordination. This brought operating power factor to 0.97, reduced THD below IEEE 519 limits to 3.8%, and saved $48,000 annually in billing penalties."
      );
      setRecordingTime(104);
      return;
    }

    if (activeDisp.includes('electron')) {
      setTranscript(
        "During thermal chamber stress-testing of our connected automotive telematics unit at 85°C, the system experienced sporadic watchdog resets and I2C bus freeze to the inertial measurement unit. My task was to isolate the root cause and deliver an unshakeable firmware/hardware patch before mass production ramp. I connected a mixed-signal oscilloscope and protocol analyzer, identifying that bus capacitance of 320pF combined with a weak 10k pull-up resistor caused rise times of 1.4 microseconds that violated fast-mode specs at high temperatures. I resized pull-ups to 2.2k and instituted a 9-clock bus-clearing sequence in RTOS initialization, eliminating all watchdog timeouts over 500 continuous hours of thermal qualification."
      );
      setRecordingTime(100);
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Interview Simulation Suite
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Role & Discipline-Specific Interview Simulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice realistic hiring inquiries tailored to <span className="text-emerald-400 font-semibold">Finance</span>, <span className="text-amber-400 font-semibold">Teaching</span>, <span className="text-purple-400 font-semibold">Chemical</span>, <span className="text-orange-400 font-semibold">Mechanical</span>, <span className="text-yellow-400 font-semibold">Electrical</span>, <span className="text-cyan-400 font-semibold">Electronics</span>, and tech disciplines. Evaluated using the rigorous STAR framework.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start md:self-center">
          <button
            id="open-ai-gen-drawer-btn"
            onClick={() => setShowAIGenDrawer(!showAIGenDrawer)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate AI Question</span>
          </button>

          <button
            id="load-sample-interview-answer-btn"
            onClick={handleLoadSampleAnswer}
            className="px-3.5 py-2 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition flex items-center gap-2 active:scale-95"
            title="Load an authentic, discipline-tailored STAR sample answer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Model STAR Answer</span>
          </button>
        </div>
      </div>

      {/* AI Custom Question Drawer */}
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

          <p className="text-xs text-slate-300">
            Generate an authentic, specialized interview inquiry calibrated for <strong className="text-white">{selectedDiscipline === 'All Disciplines' ? 'your field' : selectedDiscipline}</strong> and tailored to your specific seniority level.
          </p>

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
                {selectedDiscipline === 'All Disciplines' ? 'Universal / Cross-Discipline' : selectedDiscipline}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              id="ai-focus-topic-input"
              placeholder={`Optional specific topic (e.g. ${
                selectedDiscipline.includes('Finance') ? 'WACC & Debt Structuring, DCF multiples' :
                selectedDiscipline.includes('Teaching') ? 'Classroom De-escalation, Neurodiversity' :
                selectedDiscipline.includes('Chemical') ? 'HAZOP runaway reaction, Pinch analysis' :
                selectedDiscipline.includes('Mechanical') ? 'FEA mesh singularities, GD&T datums' :
                selectedDiscipline.includes('Electrical') ? 'Arc Flash IEEE 1584, Power Factor THD' :
                selectedDiscipline.includes('Electronics') ? 'RTOS priority inversion, High-speed PCB' :
                'System design, Scalability, Behavioral'
              })...`}
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
                onClick={() => handleSelectDiscipline(disp.name)}
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
                onClick={() => handleSelectExperienceLevel(lvl.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500/50 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isSelected ? lvl.badgeClass : 'text-slate-400 bg-slate-900 border-slate-800'
                  }`}>
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

      {/* Discipline Summary & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Active Discipline Brief */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <activeDisciplineMeta.icon className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">{activeDisciplineMeta.label}</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-sky-300 font-semibold border border-slate-700">
                {activeDisciplineMeta.categoryTag}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {activeDisciplineMeta.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 font-semibold">Key Areas:</span>
              {activeDisciplineMeta.keyTopics.map((top, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {top}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {['All', 'Technical', 'Problem Solving', 'HR / Behavioral', 'Leadership'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-md transition whitespace-nowrap text-[10px] font-semibold ${
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Questions List & STAR Cheat Sheet */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inquiries ({filteredQuestions.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="random-interview-q-btn"
                  onClick={handleRandomQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition"
                  title="Pick a random interview question in this discipline"
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
                  rows={4}
                  placeholder="Paste or write the interview question you want to practice..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
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
                    const isSelected = currentQuestion.id === q.id;
                    return (
                      <div
                        key={q.id}
                        id={`q-item-${q.id}`}
                        onClick={() => setCurrentQuestion(q)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                          isSelected 
                            ? 'bg-sky-500/15 border-sky-500/60 shadow-sm ring-1 ring-sky-500/30' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                              {q.category}
                            </span>
                            {q.experienceLevel && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getExperienceBadgeClass(q.experienceLevel)}`}>
                                {q.experienceLevel}
                              </span>
                            )}
                            {q.discipline && (
                              <span className="text-[9px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                {q.discipline}
                              </span>
                            )}
                          </div>
                          {isSelected && <span className="text-[9px] font-bold text-sky-400 shrink-0">Active</span>}
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

          {/* STAR Method Guide Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2.5 text-xs">
            <span className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              The STAR Interview Framework
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li><strong className="text-white">S - Situation:</strong> Context, baseline metric, and challenge in 1-2 sentences.</li>
              <li><strong className="text-white">T - Task:</strong> Your explicit responsibility or mandate as an engineer/lead.</li>
              <li><strong className="text-white">A - Action:</strong> Concrete technical steps, calculations, or diagnostics you directed.</li>
              <li><strong className="text-white">R - Result:</strong> Quantifiable operational, safety, or fiscal business impact.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Question Stage & Audio Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[500px] space-y-5">
            {/* Interviewer Question Prompter */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Interviewer Prompt
                  </span>
                  {!isCustomMode && currentQuestion.experienceLevel && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getExperienceBadgeClass(currentQuestion.experienceLevel)}`}>
                      {currentQuestion.experienceLevel}
                    </span>
                  )}
                  {!isCustomMode && currentQuestion.discipline && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-semibold border border-sky-800/60">
                      {currentQuestion.discipline}
                    </span>
                  )}
                  {!isCustomMode && currentQuestion.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      {currentQuestion.category}
                    </span>
                  )}
                </div>

                <button
                  id="speak-question-tts-btn"
                  onClick={handleReadQuestion}
                  disabled={isPlayingTTS}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isPlayingTTS ? 'Reading Question...' : 'Listen via Voice'}</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{isCustomMode ? (customQuestion || 'Enter your question on the left...') : currentQuestion.question}"
              </p>

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
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Keywords to integrate:
                  </span>
                  {currentQuestion.idealKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Timer & Waveform */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="font-mono font-bold text-white text-sm">{formatTime(recordingTime)}</span>
                  <span className="text-slate-500">/ Target: ~{currentQuestion.targetDurationSeconds || 110}s</span>
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
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between flex-wrap gap-2">
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
                placeholder="Click 'Start Response' and speak into your microphone. Your answer will be transcribed in real time for STAR framework evaluation..."
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
                <span>{isAnalyzing ? 'Evaluating STAR Answer...' : 'Evaluate Answer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
