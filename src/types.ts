export type PracticeMode = 
  | 'speech' 
  | 'interview' 
  | 'gd' 
  | 'presentation' 
  | 'challenges' 
  | 'analytics' 
  | 'coach';

export interface FillerWordItem {
  word: string;
  count: number;
  contextExample?: string;
}

export interface VocabularyUpgrade {
  original: string;
  suggested: string;
  explanation: string;
}

export interface SlideFeedbackItem {
  slideNumber: number;
  slideTitle: string;
  status: 'Strong' | 'Needs Work' | 'Rushed' | 'Overtime';
  feedback: string;
}

export interface BridgePhraseItem {
  fromSlide: string;
  toSlide: string;
  suggestedPhrase: string;
}

export interface PresentationReview {
  slideCoverageScore: number;
  visualNarrativeAlignment: string;
  timeAllocationCritique: string;
  shortcomings: string[];
  presentationImprovements: string[];
  slideBySlideFeedback: SlideFeedbackItem[];
  bridgePhraseSuggestions: BridgePhraseItem[];
}

export interface FeedbackReport {
  id: string;
  timestamp: string;
  sessionType: 'speech' | 'interview' | 'gd' | 'presentation' | 'challenge';
  title: string;
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  wpmStatus: 'Too Slow' | 'Optimal' | 'Too Fast';
  fillerWordsCount: number;
  fillerWordsBreakdown: FillerWordItem[];
  clarityScore: number;       // 0-100
  confidenceScore: number;    // 0-100
  vocabularyScore: number;    // 0-100
  pacingScore: number;        // 0-100
  structureScore: number;     // 0-100
  overallScore: number;       // 0-100
  strengths: string[];
  improvements: string[];
  vocabularyUpgrades: VocabularyUpgrade[];
  executiveSummary: string;
  actionableDrills: string[];
  transcript: string;
  // Specific metadata
  starAnalysis?: {
    situation: string;
    task: string;
    action: string;
    result: string;
    score: number;
  };
  sampleImprovedResponse?: string;
  presentationReview?: PresentationReview;
}

export interface InterviewQuestion {
  id: string;
  role: string;
  category: 'HR / Behavioral' | 'Technical' | 'Leadership' | 'Problem Solving';
  question: string;
  contextTip: string;
  targetDurationSeconds: number;
  idealKeywords: string[];
}

export interface GDParticipant {
  id: string;
  name: string;
  avatar: string;
  roleDescription: string;
  persona: 'analytical' | 'strategic' | 'challenger' | 'collaborative';
  speakingTimeSeconds: number;
}

export interface GDMessage {
  id: string;
  senderId: string;
  senderName: string;
  isUser: boolean;
  avatar: string;
  text: string;
  timestamp: string;
  durationSeconds: number;
}

export interface GDTopic {
  id: string;
  title: string;
  category: string;
  brief: string;
  keyPerspectives: string[];
  suggestedDurationMinutes: number;
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  speakerNotesTip: string;
  targetDurationSeconds: number;
}

export interface PresentationDeck {
  id: string;
  title: string;
  description: string;
  totalSlides: number;
  slides: PresentationSlide[];
  isUploaded?: boolean;
  fileName?: string;
}

export interface SpeechPrompt {
  id: string;
  category: string;
  title: string;
  guidance: string;
}

export interface DailyChallenge {
  id: string;
  type: 'opinion' | 'debate' | 'storytelling' | 'impromptu' | 'pitch' | 'warmup' | 'explanation';
  title: string;
  prompt: string;
  prepTimeSeconds: number;
  speakingTimeSeconds: number;
  evaluationCriteria: string[];
  completedToday?: boolean;
}

export interface UserProgress {
  totalSessions: number;
  totalSpeakingMinutes: number;
  averageConfidenceScore: number;
  averageWpm: number;
  fillerReductionPct: number;
  streakDays: number;
  lastActiveDate: string;
  level: 'Novice Speaker' | 'Emerging Communicator' | 'Confident Orator' | 'Master Presenter';
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    dateUnlocked?: string;
  }>;
}

export interface CoachChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  photoURL?: string;
  bio?: string;
}

