import { 
  InterviewQuestion, 
  GDTopic, 
  GDParticipant, 
  PresentationDeck, 
  DailyChallenge, 
  FeedbackReport, 
  UserProgress 
} from '../types';

export const INITIAL_USER_PROGRESS: UserProgress = {
  totalSessions: 0,
  totalSpeakingMinutes: 0,
  averageConfidenceScore: 0,
  averageWpm: 0,
  fillerReductionPct: 0,
  streakDays: 0,
  lastActiveDate: '',
  level: 'Novice Speaker',
  badges: [
    {
      id: 'first_speech',
      title: 'Voice Unlocked',
      description: 'Complete your very first practice session in any studio',
      icon: '🎙️',
      unlocked: false,
    },
    {
      id: 'streak_3',
      title: 'Consistency Champion',
      description: 'Maintain a 3-day practice streak',
      icon: '🔥',
      unlocked: false,
    },
    {
      id: 'filler_slayer',
      title: 'Filler Word Slayer',
      description: 'Deliver a speech with 1 or fewer filler words',
      icon: '🎯',
      unlocked: false,
    },
    {
      id: 'interview_ace',
      title: 'STAR Method Ace',
      description: 'Score over 85 on an interview question response',
      icon: '💼',
      unlocked: false,
    },
    {
      id: 'gd_moderator',
      title: 'Discussion Catalyst',
      description: 'Conclude an AI group discussion session',
      icon: '👥',
      unlocked: false,
    },
    {
      id: 'orator_master',
      title: 'Master of Aatmavishwas',
      description: 'Reach 15 total sessions with 85+ average confidence',
      icon: '👑',
      unlocked: false,
    }
  ],
};

export const SAMPLE_HISTORICAL_SESSIONS: FeedbackReport[] = [];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    role: 'General & HR Behavioral',
    category: 'HR / Behavioral',
    question: 'Tell me about yourself and what motivates your professional journey.',
    contextTip: 'Keep it between 90-120 seconds. Focus on the Present (current role/skills), Past (key formative experiences), and Future (why this role aligns).',
    targetDurationSeconds: 100,
    idealKeywords: ['passion', 'impact', 'ownership', 'growth', 'deliver results']
  },
  {
    id: 'iq-2',
    role: 'General & HR Behavioral',
    category: 'HR / Behavioral',
    question: 'Describe a situation where a project went off track. What actions did you take to salvage it?',
    contextTip: 'Use STAR format. Don\'t blame others; highlight your diagnostic capability, corrective measures, and measurable outcome.',
    targetDurationSeconds: 110,
    idealKeywords: ['root cause', 'prioritization', 'communication', 'pivot', 'recovery']
  },
  {
    id: 'iq-3',
    role: 'Software Engineering & Tech',
    category: 'Technical',
    question: 'How do you approach designing a scalable, fault-tolerant system under high concurrency?',
    contextTip: 'Mention decoupling, caching strategies, rate limiting, database sharding, resilience patterns (circuit breakers), and monitoring.',
    targetDurationSeconds: 120,
    idealKeywords: ['horizontal scaling', 'event-driven', 'caching', 'resilience', 'observability']
  },
  {
    id: 'iq-4',
    role: 'Product Management',
    category: 'Problem Solving',
    question: 'How do you decide between building a feature that users are asking for vs. an unasked innovation that addresses an underlying need?',
    contextTip: 'Distinguish customer voice vs customer intent. Discuss discovery interviews, metrics, risk mitigation, and iterative MVP validation.',
    targetDurationSeconds: 120,
    idealKeywords: ['user empathy', 'first principles', 'data-informed', 'hypothesis testing', 'ROI']
  },
  {
    id: 'iq-5',
    role: 'Leadership & Management',
    category: 'Leadership',
    question: 'How do you handle delivering difficult feedback to a high-performing employee whose attitude is disrupting team cohesion?',
    contextTip: 'Emphasize timely 1-on-1 setting, specific observed behaviors rather than personality judgements, empathy, and clear mutual goals.',
    targetDurationSeconds: 110,
    idealKeywords: ['psychological safety', 'behavioral evidence', 'active listening', 'accountability']
  },
  {
    id: 'iq-6',
    role: 'Sales & Client Relations',
    category: 'Problem Solving',
    question: 'Walk me through how you handle a client objection regarding high pricing during final contract negotiations.',
    contextTip: 'Acknowledge the concern, re-anchor on total value/ROI, explore timeline/scope trade-offs rather than immediate discounting.',
    targetDurationSeconds: 90,
    idealKeywords: ['value proposition', 'total cost of ownership', 'ROI', 'mutually beneficial']
  }
];

export const GD_TOPICS: GDTopic[] = [
  {
    id: 'gdt-1',
    title: 'Generative AI in Education: Empowering Critical Thinkers or Diluting Core Skills?',
    category: 'Technology & Society',
    brief: 'With generative AI transforming homework, coding, and essay composition, how should educational institutions adapt their assessment frameworks?',
    keyPerspectives: [
      'AI as an equalizer and interactive personalized tutor',
      'Risk of cognitive atrophy and loss of foundational problem-solving abilities',
      'Need to shift assessments toward verbal defense, live debate, and meta-cognition'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-2',
    title: 'Hybrid Work vs. Full Return-to-Office: The Ultimate Productivity Debate',
    category: 'Workplace & Culture',
    brief: 'Executives argue for spontaneous watercooler collaboration; employees champion autonomy and reduced commute burnout. Where lies the sustainable equilibrium?',
    keyPerspectives: [
      'Async communication efficiency and talent globalization',
      'Onboarding challenges and mentorship deficit for junior talent',
      'Outcome-based measurement vs presence-based surveillance'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-3',
    title: 'Corporate Social Responsibility: Genuine Ethics or Strategic Marketing?',
    category: 'Business & Ethics',
    brief: 'Do modern ESG initiatives and sustainability campaigns represent authentic corporate transformation or polished public relations shielding profit-first operations?',
    keyPerspectives: [
      'Consumer and investor accountability driving tangible systemic change',
      'Greenwashing risks and discrepancy between press releases and supply chain practices',
      'Regulatory compliance standards versus voluntary commitments'
    ],
    suggestedDurationMinutes: 5
  }
];

export const DEFAULT_GD_PARTICIPANTS: GDParticipant[] = [
  {
    id: 'p-1',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Data-driven & Structured Analyst',
    persona: 'analytical',
    speakingTimeSeconds: 45
  },
  {
    id: 'p-2',
    name: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Big-Picture Strategic Synthesizer',
    persona: 'strategic',
    speakingTimeSeconds: 38
  },
  {
    id: 'p-3',
    name: 'Priya Nambiar',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Pragmatic & Critical Inquirer',
    persona: 'challenger',
    speakingTimeSeconds: 40
  }
];

export const PRESENTATION_DECKS: PresentationDeck[] = [
  {
    id: 'deck-1',
    title: 'Startup Seed Pitch: EcoTrack IoT',
    description: 'A 4-slide investor pitch covering Problem, Solution, Market Traction, and Funding Ask.',
    totalSlides: 4,
    slides: [
      {
        id: 's1',
        slideNumber: 1,
        title: 'Problem: The Invisible Cost of Supply Chain Cold-Loss',
        bulletPoints: [
          '$35 Billion in temperature-sensitive pharmaceuticals and perishable food spoil annually during transit.',
          'Existing data loggers are post-mortem only: you find out goods spoiled after delivery.',
          'Zero real-time telematics intervention or micro-climate alerts.'
        ],
        speakerNotesTip: 'Hook investors with the staggering $35B financial waste. Speak with urgency and emotional conviction.',
        targetDurationSeconds: 45
      },
      {
        id: 's2',
        slideNumber: 2,
        title: 'Solution: EcoTrack Autonomous Telemetry Pods',
        bulletPoints: [
          'Ultra-low-power cellular sensors with 12-month battery life.',
          'Sub-minute anomalous temperature & vibration detection sent straight to dispatch.',
          'Automated route rerouting and insurance-backed SLA compliance.'
        ],
        speakerNotesTip: 'Pivot with confidence. Emphasize why this hardware-software moat is defensible and proprietary.',
        targetDurationSeconds: 60
      },
      {
        id: 's3',
        slideNumber: 3,
        title: 'Traction: Proven Commercial Velocity',
        bulletPoints: [
          '$420K ARR across 14 enterprise pilot contracts in Q2.',
          '99.8% sensor reliability across 250,000 transit miles.',
          'Zero cargo loss recorded for all onboarded logistics fleets.'
        ],
        speakerNotesTip: 'Adopt a steady, grounded cadence. Let the metrics do the heavy lifting; avoid overselling.',
        targetDurationSeconds: 45
      },
      {
        id: 's4',
        slideNumber: 4,
        title: 'The Ask: $2.5M Seed Round',
        bulletPoints: [
          '50% R&D: Next-gen satellite-linked low-profile tags.',
          '35% Go-To-Market: Expanding enterprise cold-chain sales team.',
          '15% Working Capital & Global Certification Compliance.'
        ],
        speakerNotesTip: 'Conclude decisively. Make the ask clear, articulate your 18-month milestones, and invite discussion.',
        targetDurationSeconds: 40
      }
    ]
  },
  {
    id: 'deck-2',
    title: 'Executive Brief: Next-Gen AI Strategy',
    description: 'A 3-slide internal stakeholder briefing on implementing responsible AI workflows.',
    totalSlides: 3,
    slides: [
      {
        id: 's2-1',
        slideNumber: 1,
        title: 'Current State: The Fragmentation of Internal Tools',
        bulletPoints: [
          'Teams are utilizing disjointed AI tools with inconsistent data privacy controls.',
          'Duplicate compute costs rising by 45% quarter-over-quarter.',
          'Lack of centralized compliance audit trail.'
        ],
        speakerNotesTip: 'Present challenges constructively without sounding alarmist.',
        targetDurationSeconds: 50
      },
      {
        id: 's2-2',
        slideNumber: 2,
        title: 'Strategic Blueprint: The Unified Intelligence Hub',
        bulletPoints: [
          'Centralized gateway with role-based access control and PII scrubbing.',
          'Shared prompt libraries and domain-tuned models.',
          'Expected 30% reduction in developer setup time.'
        ],
        speakerNotesTip: 'Highlight the dual advantages: superior security paired with cost efficiencies.',
        targetDurationSeconds: 60
      },
      {
        id: 's2-3',
        slideNumber: 3,
        title: 'Rollout Roadmap & Success Metrics',
        bulletPoints: [
          'Phase 1 (Month 1): Pilot with Product & Customer Support teams.',
          'Phase 2 (Month 2-3): Enterprise-wide self-service onboarding.',
          'Target Metric: 80% daily active adoption with 100% compliance adherence.'
        ],
        speakerNotesTip: 'Close with an inspiring vision of empowerment across all departments.',
        targetDurationSeconds: 45
      }
    ]
  }
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc-1',
    type: 'impromptu',
    title: "Today's Impromptu: The Gift of Failure",
    prompt: "Deliver a 90-second speech on why an unexpected failure in your life taught you more than an easy success. Frame it with a clear beginning, turning point, and lasting insight.",
    prepTimeSeconds: 30,
    speakingTimeSeconds: 90,
    evaluationCriteria: [
      'Narrative structure (Hook, Climax, Takeaway)',
      'Vocal variety and emotional resonance',
      'Absence of filler words during transitions'
    ],
    completedToday: false
  },
  {
    id: 'dc-2',
    type: 'opinion',
    title: 'Should Social Media Algorithms Be Legally Transparent?',
    prompt: "Take a definitive stance on whether social media platforms must open their recommendation algorithms to public auditing. Support your view with two distinct real-world arguments.",
    prepTimeSeconds: 30,
    speakingTimeSeconds: 90,
    evaluationCriteria: [
      'Clarity of central thesis in the first 15 seconds',
      'Use of transition phrases (Furthermore, Conversely, Consequently)',
      'Decisive closing call-to-action'
    ],
    completedToday: false
  },
  {
    id: 'dc-3',
    type: 'storytelling',
    title: 'The 60-Second Micro-Story: A Stranger’s Kindness',
    prompt: "Narrate an authentic or fictional story in 60 seconds about a brief, unexpected interaction with a stranger that altered someone's perspective on life.",
    prepTimeSeconds: 20,
    speakingTimeSeconds: 60,
    evaluationCriteria: [
      'Sensory detail and vivid scene setting',
      'Pacing control without rushing against the timer',
      'Natural conversational cadence'
    ],
    completedToday: false
  }
];
