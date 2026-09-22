import { 
  InterviewQuestion, 
  GDTopic, 
  GDParticipant, 
  PresentationDeck, 
  DailyChallenge, 
  FeedbackReport, 
  UserProgress,
  SpeechPrompt
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

export const SPEECH_PROMPTS: SpeechPrompt[] = [
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
  },
  {
    id: 'p5',
    category: 'Clarity & Analogies',
    title: 'Explain Quantum Computing to a 10-Year-Old',
    guidance: 'Break down quantum superposition and entanglement using an accessible everyday metaphor (like spinning coins or enchanted books).'
  },
  {
    id: 'p6',
    category: 'Executive Presence',
    title: 'Defending an Unpopular Truth to Skeptical Stakeholders',
    guidance: 'Present an uncomfortable reality that people resist hearing, backing it with empathetic framing, indisputable data, and a clear path forward.'
  },
  {
    id: 'p7',
    category: 'Crisis & Tough Truths',
    title: 'Crisis Address: Steering the Team Through a Crucial Pivot',
    guidance: 'Announce a major strategic pivot or project discontinuation with transparency, emotional steadiness, and forward-looking momentum.'
  },
  {
    id: 'p8',
    category: 'Inspirational Keynote',
    title: 'Commencement Address: Redefining Failure as Iteration',
    guidance: 'Inspire graduates to dismantle their fear of judgment and treat setbacks as inevitable research and development for character.'
  },
  {
    id: 'p9',
    category: 'Persuasive Oratory',
    title: 'Why Most Resolutions Fail by February (and How to Fix Them)',
    guidance: 'Deconstruct why willpower fails and persuade your listeners to re-engineer their micro-environments and identity habits instead.'
  },
  {
    id: 'p10',
    category: 'Philosophical & Culture',
    title: 'The Invisible Value of Maintenance Over Flashy Creation',
    guidance: 'Advocate for unsung caretakers, systems engineers, and maintainers who keep our world functioning while innovators receive the limelight.'
  },
  {
    id: 'p11',
    category: 'Personal Narrative',
    title: 'How an Unlikely Encounter Shattered My Prejudices',
    guidance: 'Share a raw narrative about a person who completely challenged an assumption you held, highlighting vulnerability and personal growth.'
  },
  {
    id: 'p12',
    category: 'Leadership & Vision',
    title: 'The Architecture of Discipline: Why Motivation is Overrated',
    guidance: 'Deliver a punchy argument demonstrating why motivation is a fleeting emotion, whereas automated routines build unstoppable momentum.'
  },
  {
    id: 'p13',
    category: 'Tech & Society',
    title: 'The Attention Economy: Reclaiming Deep Focus in a Distracted World',
    guidance: 'Address the cognitive epidemic of notification fatigue and propose a radical philosophy for reclaiming deep, uninterrupted intellect.'
  },
  {
    id: 'p14',
    category: 'Inspirational Keynote',
    title: 'A Tribute to an Unsung Hero in My Life',
    guidance: 'Deliver a moving, vivid tribute to someone whose quiet sacrifices shaped who you are today, emphasizing specific sensory anecdotes.'
  },
  {
    id: 'p15',
    category: 'Clarity & Analogies',
    title: 'Pitching an Audacious Climate Moonshot in 2 Minutes',
    guidance: 'Pitch an ambitious breakthrough clean technology with emotional hook, technological feasibility, and a thrilling call to collective action.'
  },
  {
    id: 'p16',
    category: 'Philosophical & Culture',
    title: 'The Paradox of Choice: Why Having Less Unlocks More Freedom',
    guidance: 'Examine how an explosion of daily options induces paralysis and fatigue, and make the case for voluntary constraints and minimalism.'
  }
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    role: 'General & HR Behavioral',
    discipline: 'General & HR Behavioral',
    experienceLevel: 'Fresher',
    category: 'HR / Behavioral',
    question: 'Tell me about yourself and what motivates your professional journey.',
    contextTip: 'Keep it between 90-120 seconds. Focus on the Present (current studies/skills), Past (key formative projects/internships), and Future (why this role aligns).',
    targetDurationSeconds: 100,
    idealKeywords: ['passion', 'impact', 'ownership', 'growth', 'deliver results']
  },
  {
    id: 'iq-2',
    role: 'General & HR Behavioral',
    discipline: 'General & HR Behavioral',
    experienceLevel: '0-2 yrs',
    category: 'HR / Behavioral',
    question: 'Describe a situation where a project went off track. What actions did you take to salvage it?',
    contextTip: 'Use STAR format. Don\'t blame others; highlight your diagnostic capability, corrective measures, and measurable outcome.',
    targetDurationSeconds: 110,
    idealKeywords: ['root cause', 'prioritization', 'communication', 'pivot', 'recovery']
  },
  {
    id: 'iq-3',
    role: 'Software Engineering & Tech',
    discipline: 'Software Engineering',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'How do you approach designing a scalable, fault-tolerant system under high concurrency?',
    contextTip: 'Mention decoupling, caching strategies, rate limiting, database sharding, resilience patterns (circuit breakers), and monitoring.',
    targetDurationSeconds: 120,
    idealKeywords: ['horizontal scaling', 'event-driven', 'caching', 'resilience', 'observability']
  },
  {
    id: 'iq-4',
    role: 'Product Management',
    discipline: 'Product Management',
    experienceLevel: '3-5 yrs',
    category: 'Problem Solving',
    question: 'How do you decide between building a feature that users are asking for vs. an unasked innovation that addresses an underlying need?',
    contextTip: 'Distinguish customer voice vs customer intent. Discuss discovery interviews, metrics, risk mitigation, and iterative MVP validation.',
    targetDurationSeconds: 120,
    idealKeywords: ['user empathy', 'first principles', 'data-informed', 'hypothesis testing', 'ROI']
  },
  {
    id: 'iq-5',
    role: 'Leadership & Management',
    discipline: 'Leadership & Management',
    experienceLevel: 'Lead / Executive',
    category: 'Leadership',
    question: 'How do you handle delivering difficult feedback to a high-performing employee whose attitude is disrupting team cohesion?',
    contextTip: 'Emphasize timely 1-on-1 setting, specific observed behaviors rather than personality judgements, empathy, and clear mutual goals.',
    targetDurationSeconds: 110,
    idealKeywords: ['psychological safety', 'behavioral evidence', 'active listening', 'accountability']
  },
  {
    id: 'iq-6',
    role: 'Sales & Client Relations',
    discipline: 'Sales & Client Relations',
    experienceLevel: '3-5 yrs',
    category: 'Problem Solving',
    question: 'Walk me through how you handle a client objection regarding high pricing during final contract negotiations.',
    contextTip: 'Acknowledge the concern, re-anchor on total value/ROI, explore timeline/scope trade-offs rather than immediate discounting.',
    targetDurationSeconds: 90,
    idealKeywords: ['value proposition', 'total cost of ownership', 'ROI', 'mutually beneficial']
  },
  {
    id: 'iq-7',
    role: 'General & HR Behavioral',
    discipline: 'General & HR Behavioral',
    experienceLevel: '0-2 yrs',
    category: 'HR / Behavioral',
    question: 'Tell me about a time you had a strong disagreement with a senior stakeholder or teammate. How did you handle it?',
    contextTip: 'Showcase emotional maturity, listening to the opposing thesis, bringing objective data to the table, and committing fully to the final decision.',
    targetDurationSeconds: 110,
    idealKeywords: ['disagree and commit', 'objective data', 'active listening', 'shared mission']
  },
  {
    id: 'iq-8',
    role: 'General & HR Behavioral',
    discipline: 'General & HR Behavioral',
    experienceLevel: '3-5 yrs',
    category: 'HR / Behavioral',
    question: 'What is your greatest professional failure, and what structural changes did you implement in response?',
    contextTip: 'Pick a genuine setback, take full accountability without defensive excuses, and prove how it catalyzed permanent improvement.',
    targetDurationSeconds: 100,
    idealKeywords: ['ownership', 'retrospective', 'safeguards', 'resilience', 'humility']
  },
  {
    id: 'iq-9',
    role: 'Software Engineering & Tech',
    discipline: 'Software Engineering',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'Walk me through a time you diagnosed and resolved an elusive memory leak or severe latency spike in a production environment.',
    contextTip: 'Structure logically: symptom detection, observability telemetry (profilers, traces), hypothesis isolation, targeted hotfix, and post-mortem guards.',
    targetDurationSeconds: 120,
    idealKeywords: ['flame graphs', 'heap dump', 'telemetry', 'root cause', 'circuit breaker']
  },
  {
    id: 'iq-10',
    role: 'Software Engineering & Tech',
    discipline: 'Software Engineering',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'How do you systematically balance shipping quick tactical product features against addressing chronic architectural technical debt?',
    contextTip: 'Discuss debt categorization (interest vs principal), establishing dedicated allocation quotas, and articulating technical debt in business risk terms.',
    targetDurationSeconds: 110,
    idealKeywords: ['business impact', 'velocity', 'refactoring', 'risk matrix', 'code maintainability']
  },
  {
    id: 'iq-11',
    role: 'Product Management',
    discipline: 'Product Management',
    experienceLevel: '3-5 yrs',
    category: 'Problem Solving',
    question: 'If your primary onboarding conversion metric plummeted by 20% over a 48-hour window, what would be your diagnostic playbook?',
    contextTip: 'Outline systematic triage: instrument verification, cohort segmentation (OS, region, version), recent deploy diffs, user session replay, and triage war room.',
    targetDurationSeconds: 110,
    idealKeywords: ['funnel analysis', 'cohort breakdown', 'root cause', 'triage', 'rollout rollback']
  },
  {
    id: 'iq-12',
    role: 'Product Management',
    discipline: 'Product Management',
    experienceLevel: 'Senior',
    category: 'Problem Solving',
    question: 'How do you gracefully sunset or deprecate a legacy feature that still has a vocal minority of enthusiastic users?',
    contextTip: 'Cover usage metrics, clear advance communication runway, viable migration pathways, customer support readiness, and empathy for affected workflows.',
    targetDurationSeconds: 100,
    idealKeywords: ['migration path', 'stakeholder transparency', 'data-driven sunset', 'customer empathy']
  },
  {
    id: 'iq-13',
    role: 'Leadership & Management',
    discipline: 'Leadership & Management',
    experienceLevel: 'Lead / Executive',
    category: 'Leadership',
    question: 'How do you deliberately cultivate psychological safety so that junior teammates feel empowered to flag flaws in senior plans?',
    contextTip: 'Discuss modeling vulnerability, praising productive dissent, running blameless post-mortems, and asking open-ended prompting questions in meetings.',
    targetDurationSeconds: 110,
    idealKeywords: ['blameless culture', 'intellectual humility', 'empowerment', 'open dissent']
  },
  {
    id: 'iq-14',
    role: 'Leadership & Management',
    discipline: 'Leadership & Management',
    experienceLevel: 'Lead / Executive',
    category: 'Leadership',
    question: 'Describe how you mobilized and restored morale across a discouraged team following an unexpected project cancellation or re-org.',
    contextTip: 'Acknowledge grief and frustration candidly, highlight salvageable engineering assets, and reconnect individuals with immediate meaningful goals.',
    targetDurationSeconds: 115,
    idealKeywords: ['empathy', 'transparent vision', 're-anchoring purpose', 'small wins']
  },
  {
    id: 'iq-15',
    role: 'Sales & Client Relations',
    discipline: 'Sales & Client Relations',
    experienceLevel: 'Senior',
    category: 'Problem Solving',
    question: 'How do you de-escalate and rebuild trust with an enterprise client immediately following a catastrophic SLA outage on their critical path?',
    contextTip: 'Focus on extreme ownership, avoiding blame games, providing an hourly transparency cadence, root-cause transparency, and contractual remediation.',
    targetDurationSeconds: 105,
    idealKeywords: ['executive ownership', 'transparent cadence', 'preventative roadmap', 'restitution']
  },
  {
    id: 'iq-16',
    role: 'Sales & Client Relations',
    discipline: 'Sales & Client Relations',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'How do you uncover a prospective buyer\'s unspoken organizational roadblocks when they seem guarded during discovery calls?',
    contextTip: 'Discuss consultative questioning, psychological safety, asking third-party reference questions, and focusing on their personal KPI pressures.',
    targetDurationSeconds: 100,
    idealKeywords: ['consultative inquiry', 'uncovering latent needs', 'active listening', 'trusted advisor']
  },

  // ---------------------------------------------------------------------------
  // SOFTWARE ENGINEERING - ADDITIONAL LEVEL SPECIFIC
  // ---------------------------------------------------------------------------
  {
    id: 'iq-swe-fresher-1',
    role: 'Software Engineering',
    discipline: 'Software Engineering',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Walk me through your final year college capstone project. What data structures and database models did you pick, and why?',
    contextTip: 'Explain problem statement, technology stack justification, time/space complexity trade-offs in your code, and key lessons learned from bugs encountered.',
    targetDurationSeconds: 110,
    idealKeywords: ['data structures', 'time complexity', 'database schema', 'REST API', 'unit testing']
  },
  {
    id: 'iq-swe-0-2-1',
    role: 'Software Engineering',
    discipline: 'Software Engineering',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'Describe a situation where a code review from a senior engineer contained significant feedback or requested a complete refactor. How did you handle it?',
    contextTip: 'Emphasize receptive growth mindset, seeking clarification without defensiveness, learning design patterns from the feedback, and delivering the refined implementation.',
    targetDurationSeconds: 105,
    idealKeywords: ['code review', 'refactoring', 'clean code', 'design patterns', 'collaboration']
  },
  {
    id: 'iq-swe-senior-1',
    role: 'Software Engineering',
    discipline: 'Software Engineering',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'How do you architect distributed microservices to ensure eventual consistency, handle network partitions, and prevent catastrophic cascading failures?',
    contextTip: 'Discuss Saga pattern (orchestration vs choreography), idempotent consumers, outbox pattern, dead-letter queues, and graceful circuit breaking.',
    targetDurationSeconds: 120,
    idealKeywords: ['eventual consistency', 'Saga pattern', 'idempotency', 'dead-letter queue', 'circuit breaker', 'distributed systems']
  },

  // ---------------------------------------------------------------------------
  // FINANCE DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-fin-fresher-1',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain the fundamental difference between Enterprise Value (EV) and Equity Value, and walk through how net debt and non-operating assets bridge them.',
    contextTip: 'Define EV as the value of core operating assets attributable to all capital providers. Equity Value is attributable only to shareholders. EV = Equity Value + Total Debt + Preferred Stock + Minority Interest - Cash.',
    targetDurationSeconds: 105,
    idealKeywords: ['Enterprise Value', 'Equity Value', 'Net Debt', 'capital structure', 'market capitalization']
  },
  {
    id: 'iq-fin-1',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Walk me through how a $10 increase in depreciation cascades through the Income Statement, Cash Flow Statement, and Balance Sheet (assuming a 20% tax rate).',
    contextTip: 'Break it down systematically: Operating income drops by $10, tax expense decreases by $2, so net income decreases by $8. On Cash Flow from Operations, net income starts -$8, you add back $10 non-cash depreciation, leaving net cash +$2. On Balance Sheet, cash is +$2, PP&E is -$10, balancing retained earnings -$8.',
    targetDurationSeconds: 115,
    idealKeywords: ['non-cash expense', 'tax shield', 'operating cash flow', 'PP&E', 'retained earnings', 'three-statement link']
  },
  {
    id: 'iq-fin-2',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'How do you reconcile conflicting investment recommendations between Net Present Value (NPV) and Internal Rate of Return (IRR) for mutually exclusive projects?',
    contextTip: 'Explain reinvestment rate assumptions (WACC vs IRR), differences in project scale and cash flow timing, and why NPV is theoretically superior for maximizing total shareholder wealth under capital constraints.',
    targetDurationSeconds: 110,
    idealKeywords: ['NPV', 'IRR', 'reinvestment rate', 'cost of capital', 'capital rationing', 'wealth maximization']
  },
  {
    id: 'iq-fin-3',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'How do you calculate Unlevered Free Cash Flow in a Discounted Cash Flow (DCF) model, and how do you estimate terminal value via the Gordon Growth method?',
    contextTip: 'State formula clearly: EBIT*(1 - Tax Rate) + D&A - CapEx - Change in Net Working Capital. Discount at WACC. Terminal Value = Final Year UFCF * (1 + g) / (WACC - g), explaining why growth rate must not exceed long-term GDP.',
    targetDurationSeconds: 120,
    idealKeywords: ['unlevered free cash flow', 'WACC', 'terminal value', 'Gordon growth', 'CapEx', 'working capital']
  },
  {
    id: 'iq-fin-4',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: '3-5 yrs',
    category: 'Leadership',
    question: 'Describe a time you detected a material forecast anomaly or accounting variance in a division\'s budget. How did you challenge senior management constructively?',
    contextTip: 'Use STAR structure: specify how you validated variance through ledger analysis, presented findings neutrally with scenario models, avoided accusatory language, and instituted permanent control reconciliations.',
    targetDurationSeconds: 110,
    idealKeywords: ['variance analysis', 'internal controls', 'materiality', 'scenario modeling', 'diplomatic communication']
  },
  {
    id: 'iq-fin-5',
    role: 'Finance & Banking',
    discipline: 'Finance',
    experienceLevel: 'Senior',
    category: 'Problem Solving',
    question: 'How would you structure a hedging strategy to protect an international operating margin against severe foreign exchange swings and rising debt interest rates?',
    contextTip: 'Distinguish transaction from translation exposure. Explain matching foreign revenues with local currency expenses, deploying forward currency contracts, and utilizing interest rate swaps (fixed-to-floating or floating-to-fixed).',
    targetDurationSeconds: 115,
    idealKeywords: ['FX hedging', 'forward contracts', 'interest rate swap', 'currency risk', 'margin preservation']
  },

  // ---------------------------------------------------------------------------
  // TEACHING & EDUCATION DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-teach-fresher-1',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: 'Fresher',
    category: 'HR / Behavioral',
    question: 'Why did you choose education as your vocation, and how did your student-teaching practicum shape your core teaching philosophy?',
    contextTip: 'Share your authentic origin story, concrete instructional experiences with diverse learners during student teaching, and commitment to fostering a growth mindset.',
    targetDurationSeconds: 105,
    idealKeywords: ['teaching philosophy', 'student-centered', 'growth mindset', 'practicum', 'engagement']
  },
  {
    id: 'iq-teach-1',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: '3-5 yrs',
    category: 'Technical',
    question: 'How do you apply differentiated instruction to design a lesson plan that challenges advanced learners while supporting struggling or neurodiverse students?',
    contextTip: 'Detail tiered assignments, multi-modal content delivery (visual, kinesthetic, auditory), flexible grouping, and using real-time formative checkpoints (exit tickets, quick polls) to adapt pacing.',
    targetDurationSeconds: 120,
    idealKeywords: ['differentiated instruction', 'scaffolding', 'formative assessment', 'multi-modal learning', 'inclusive classroom']
  },
  {
    id: 'iq-teach-2',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'What is your classroom management philosophy when handling an emotionally dysregulated or persistently defiant student without derailing peer learning?',
    contextTip: 'Emphasize proactive classroom norms, non-verbal proximity cues, privately acknowledging the student\'s feelings, offering choices to de-escalate power struggles, and implementing restorative reflection.',
    targetDurationSeconds: 115,
    idealKeywords: ['de-escalation', 'restorative justice', 'trauma-informed', 'proximity control', 'emotional regulation']
  },
  {
    id: 'iq-teach-3',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: '0-2 yrs',
    category: 'HR / Behavioral',
    question: 'Walk me through a time an anxious or frustrated parent disputed their child\'s assessment grade or behavioral report. How did you resolve it?',
    contextTip: 'Use STAR: acknowledge parental dedication, anchor discussion in objective curriculum standards and a portfolio of student work samples, and build a collaborative weekly progress tracker together.',
    targetDurationSeconds: 110,
    idealKeywords: ['empathetic listening', 'objective rubric', 'student portfolio', 'collaborative partnership', 'growth mindset']
  },
  {
    id: 'iq-teach-4',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: 'Senior',
    category: 'Leadership',
    question: 'How do you integrate modern AI tools and interactive technology into your curriculum while preserving students\' independent critical thinking and ethical integrity?',
    contextTip: 'Discuss Socratic inquiry, project-based learning with oral defense, treating AI as a brainstorming dialogue partner rather than an answer machine, and transparent citation norms.',
    targetDurationSeconds: 120,
    idealKeywords: ['critical thinking', 'Socratic method', 'digital ethics', 'authentic assessment', 'inquiry-based learning']
  },
  {
    id: 'iq-teach-5',
    role: 'Teaching & Education',
    discipline: 'Teaching',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'How do you leverage formative assessment data to adjust your instructional trajectory in real time during a challenging multi-week unit?',
    contextTip: 'Differentiate formative vs summative. Highlight quick feedback loops (think-pair-share, digital polling), pinpointing specific conceptual bottlenecks, and re-teaching via alternative pedagogical analogies.',
    targetDurationSeconds: 110,
    idealKeywords: ['formative assessment', 'data-informed teaching', 'feedback loop', 'conceptual mastery', 're-teaching']
  },

  // ---------------------------------------------------------------------------
  // CHEMICAL ENGINEERING DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-chem-fresher-1',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain the physical significance of the dimensionless Reynolds and Prandtl numbers in sizing fluid transport piping and convective heat exchangers.',
    contextTip: 'Define Reynolds (ratio of inertial to viscous forces, laminar vs turbulent transition at Re=2100) and Prandtl (ratio of momentum diffusivity to thermal diffusivity, thermal vs velocity boundary layer thickness).',
    targetDurationSeconds: 110,
    idealKeywords: ['Reynolds number', 'Prandtl number', 'dimensionless analysis', 'boundary layer', 'laminar vs turbulent']
  },
  {
    id: 'iq-chem-1',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'Walk me through the methodology of conducting a HAZOP (Hazard and Operability) review for a pressurized exothermic catalytic reactor system.',
    contextTip: 'Explain parameter guide words (No flow, High temperature, Reverse pressure). Cover cooling jacket failure scenarios, runaway thermal dynamics, emergency quench systems, rupture disks, and SIL safety interlocks.',
    targetDurationSeconds: 120,
    idealKeywords: ['HAZOP', 'exothermic runaway', 'P&ID', 'guide words', 'rupture disk', 'safety instrumented systems']
  },
  {
    id: 'iq-chem-2',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'How do you diagnose and resolve column flooding, weeping, or foaming in an industrial fractional distillation column based on differential pressure indicators?',
    contextTip: 'Analyze delta-P: high pressure drop indicates liquid backup/flooding; abnormally low indicates weeping. Discuss adjusting vapor boilup rate, reflux ratio, tray hydraulics, feed pre-heat, and anti-foam injection.',
    targetDurationSeconds: 115,
    idealKeywords: ['distillation column', 'column flooding', 'weeping', 'differential pressure', 'reflux ratio', 'tray hydraulics']
  },
  {
    id: 'iq-chem-3',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: '3-5 yrs',
    category: 'Technical',
    question: 'When scaling up a batch chemical synthesis process from 2-liter benchtop glassware to a 10,000-liter plant reactor, what transport phenomena limitations do you solve?',
    contextTip: 'Address decreased surface-area-to-volume ratio, heat dissipation bottlenecks, mixing impeller power numbers, Reynolds/Froude scaling, mass transfer rate across phases, and local hot spots.',
    targetDurationSeconds: 120,
    idealKeywords: ['scale-up', 'surface-area-to-volume', 'heat transfer coefficient', 'Reynolds number', 'mass transfer', 'residence time']
  },
  {
    id: 'iq-chem-4',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'Explain how you utilize Pinch Analysis to optimize a plant\'s Heat Exchanger Network (HEN) and reduce external utility consumption.',
    contextTip: 'Explain hot and cold composite curves, identifying the pinch temperature (delta T min), and the core thermodynamic axiom: never transfer heat across the pinch point to avoid doubling utility penalties.',
    targetDurationSeconds: 115,
    idealKeywords: ['pinch analysis', 'composite curves', 'minimum approach temperature', 'heat integration', 'energy conservation']
  },
  {
    id: 'iq-chem-5',
    role: 'Chemical Engineering',
    discipline: 'Chemical',
    experienceLevel: 'Senior',
    category: 'HR / Behavioral',
    question: 'Describe an instance where operational pressure to maintain production throughput conflicted with safety or emissions compliance. How did you act?',
    contextTip: 'Emphasize Stop-Work Authority, unwavering Process Safety Management (PSM), gathering volatile organic compound or pressure data, briefing the plant superintendent objectively, and executing a safe controlled shutdown.',
    targetDurationSeconds: 110,
    idealKeywords: ['process safety management', 'stop-work authority', 'environmental compliance', 'root cause', 'integrity']
  },

  // ---------------------------------------------------------------------------
  // MECHANICAL ENGINEERING DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-mech-fresher-1',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain the engineering stress-strain curve for ductile mild steel from proportional limit to ultimate tensile strength (UTS) and necking fracture.',
    contextTip: 'Define elastic region, Young\'s Modulus (Hooke\'s Law), upper/lower yield points, plastic strain hardening, UTS, necking instability, and fracture toughness.',
    targetDurationSeconds: 110,
    idealKeywords: ['stress-strain curve', 'yield strength', 'Hooke\'s Law', 'Young\'s modulus', 'ultimate tensile strength', 'necking']
  },
  {
    id: 'iq-mech-1',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'How do you evaluate multi-axial cyclic fatigue life on a structural drive component, and how do you apply the Goodman diagram and S-N fatigue curve?',
    contextTip: 'Explain alternating vs mean stress components, Marin endurance limit factors (surface finish, size, reliability), notch sensitivity (Kf vs Kt), and determining the factor of safety against high-cycle fatigue.',
    targetDurationSeconds: 120,
    idealKeywords: ['fatigue life', 'Goodman diagram', 'S-N curve', 'endurance limit', 'stress concentration', 'cyclic loading']
  },
  {
    id: 'iq-mech-2',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: 'Fresher',
    category: 'Problem Solving',
    question: 'How do you establish Geometric Dimensioning & Tolerancing (GD&T) datums and position tolerances to ensure interchangeable assembly without unnecessarily inflating machining scrap?',
    contextTip: 'Discuss the 3-2-1 datum reference frame, selecting functional contact surfaces, applying Maximum Material Condition (MMC) bonus tolerances, and running statistical tolerance stack-up analysis (RSS vs worst-case).',
    targetDurationSeconds: 120,
    idealKeywords: ['GD&T', 'datum reference frame', 'maximum material condition', 'true position', 'tolerance stack-up', 'DFM']
  },
  {
    id: 'iq-mech-3',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'What verification protocols do you follow to validate the convergence and physical credibility of a Finite Element Analysis (FEA) simulation before physical prototyping?',
    contextTip: 'Detail mesh convergence studies (h vs p refinement), inspecting element aspect ratios and Jacobian, checking boundary condition realism, avoiding artificial singularities at sharp re-entrant corners, and strain gauge validation.',
    targetDurationSeconds: 115,
    idealKeywords: ['FEA', 'mesh convergence', 'Von Mises stress', 'boundary conditions', 'Jacobian ratio', 'empirical validation']
  },
  {
    id: 'iq-mech-4',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: '3-5 yrs',
    category: 'Problem Solving',
    question: 'Walk me through how you conduct a Design Failure Mode and Effects Analysis (DFMEA) for a high-torque mechanical gearbox or robotic transmission.',
    contextTip: 'Cover identifying failure modes (tooth bending fatigue, pitting, lubrication breakdown), scoring Severity, Occurrence, and Detection, and calculating RPN to drive preventative engineering changes.',
    targetDurationSeconds: 115,
    idealKeywords: ['DFMEA', 'risk priority number', 'failure mode', 'gearbox lubrication', 'preventative redesign']
  },
  {
    id: 'iq-mech-5',
    role: 'Mechanical Engineering',
    discipline: 'Mechanical',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'How do you size heat sinks, thermal interface materials (TIM), and forced convection airflow for an electronics enclosure dissipating 400W in a 50°C ambient environment?',
    contextTip: 'Calculate total junction-to-ambient thermal resistance (R_theta). Select TIM thermal conductivity, compute required fin surface area, evaluate fan static pressure vs CFM operating curve, and ensure turbulent airflow across fins.',
    targetDurationSeconds: 115,
    idealKeywords: ['thermal resistance', 'forced convection', 'heat sink sizing', 'static pressure', 'thermal interface material']
  },

  // ---------------------------------------------------------------------------
  // ELECTRICAL ENGINEERING DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-ee-fresher-1',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain the fundamental differences between Star (Wye) and Delta 3-phase AC configurations in terms of line vs phase voltage and currents.',
    contextTip: 'In Star: V_line = sqrt(3) * V_phase, I_line = I_phase, provides neutral conductor for single-phase loads. In Delta: V_line = V_phase, I_line = sqrt(3) * I_phase, widely used for heavy industrial induction motors.',
    targetDurationSeconds: 105,
    idealKeywords: ['star wye', 'delta connection', 'line voltage', 'phase current', 'three-phase AC', 'neutral point']
  },
  {
    id: 'iq-ee-1',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain why poor power factor causes severe efficiency and capacity penalties on industrial distribution networks, and how you design an automatic capacitor bank correction system.',
    contextTip: 'Explain real power (kW), reactive power (kVAR), apparent power (kVA), increased I^2*R copper losses, voltage sag, and sizing detuned reactors to avoid harmonic resonance with non-linear VFD loads.',
    targetDurationSeconds: 120,
    idealKeywords: ['power factor correction', 'reactive power', 'kVAR', 'apparent power', 'harmonic resonance', 'copper losses']
  },
  {
    id: 'iq-ee-2',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: 'Senior',
    category: 'Problem Solving',
    question: 'How do you design a biased differential protection scheme (ANSI 87T) for a large 3-phase substation transformer, and how do you prevent nuisance tripping during energization?',
    contextTip: 'Apply Kirchhoff\'s Current Law across CT secondary loops. Explain CT ratio matching, vector group phase-shift compensation, percentage slope restraint, and 2nd harmonic restraint to filter magnetizing inrush current.',
    targetDurationSeconds: 120,
    idealKeywords: ['differential protection', '87T relay', 'magnetizing inrush', '2nd harmonic restraint', 'current transformer', 'slope characteristic']
  },
  {
    id: 'iq-ee-3',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: '3-5 yrs',
    category: 'Problem Solving',
    question: 'Walk me through how you conduct an Arc Flash study according to IEEE 1584, calculate incident energy levels, and determine safe approach boundaries for maintenance crews.',
    contextTip: 'Cover collecting one-line diagrams, calculating bolted fault currents, determining upstream relay clearing times from time-current curves (TCC), calculating cal/cm² at working distance, and establishing NFPA 70E PPE categories.',
    targetDurationSeconds: 120,
    idealKeywords: ['arc flash', 'IEEE 1584', 'incident energy', 'clearing time', 'time-current curve', 'NFPA 70E PPE']
  },
  {
    id: 'iq-ee-4',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: '0-2 yrs',
    category: 'Technical',
    question: 'What electrical conditions must be satisfied before synchronizing an islanded renewable microgrid to the utility grid, and how do you protect against unintentional islanding under IEEE 1547?',
    contextTip: 'Must match voltage magnitude, frequency, phase angle, and phase sequence (A-B-C rotation). Discuss Phase-Locked Loops (PLL), active/passive anti-islanding detection (frequency drift, ROCOF), and inverter LCL filters.',
    targetDurationSeconds: 115,
    idealKeywords: ['grid synchronization', 'IEEE 1547', 'anti-islanding', 'phase-locked loop', 'ROCOF', 'phase sequence']
  },
  {
    id: 'iq-ee-5',
    role: 'Electrical Engineering',
    discipline: 'Electrical',
    experienceLevel: 'Senior',
    category: 'Technical',
    question: 'How do you calculate symmetrical and asymmetrical short-circuit fault duties to properly rate high-voltage switchgear and coordinate protective circuit breakers?',
    contextTip: 'Explain Thevenin system impedance, subtransient (X"d) vs transient reactances, DC offset decay dictated by system X/R ratio, and ensuring switchgear symmetrical interrupting and peak making capacities exceed fault levels.',
    targetDurationSeconds: 115,
    idealKeywords: ['short circuit calculation', 'Thevenin impedance', 'X/R ratio', 'asymmetrical fault current', 'switchgear rating']
  },

  // ---------------------------------------------------------------------------
  // ELECTRONICS & COMMUNICATION DISCIPLINE
  // ---------------------------------------------------------------------------
  {
    id: 'iq-ece-fresher-1',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'Explain the difference between synchronous (e.g., SPI) and asynchronous (e.g., UART) serial communication protocols, and when you would select one over the other.',
    contextTip: 'Detail clock line presence in SPI (master generates SCK, higher data throughput, full-duplex) versus start/stop framing bits and agreed baud rate in UART (fewer wires, point-to-point, lower speed).',
    targetDurationSeconds: 105,
    idealKeywords: ['SPI', 'UART', 'baud rate', 'synchronous vs asynchronous', 'clock signal', 'full-duplex']
  },
  {
    id: 'iq-ece-1',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: '3-5 yrs',
    category: 'Technical',
    question: 'How do you handle interrupt latency, race conditions, and priority inversion in a resource-constrained embedded system running a real-time operating system (RTOS)?',
    contextTip: 'Explain keeping ISRs minimal via deferred task processing (FreeRTOS task notifications/queues), using mutexes with Priority Inheritance protocol to prevent priority inversion, and disabling interrupts only for critical sections.',
    targetDurationSeconds: 120,
    idealKeywords: ['RTOS', 'priority inversion', 'priority inheritance', 'interrupt service routine', 'race condition', 'mutex']
  },
  {
    id: 'iq-ece-2',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: 'Senior',
    category: 'Problem Solving',
    question: 'What layout and routing rules do you enforce on a multilayer high-speed PCB to guarantee Signal Integrity (SI) and Power Integrity (PI) for DDR or high-speed differential pairs?',
    contextTip: 'Detail controlled impedance stack-up (e.g. 90-ohm diff, 50-ohm single), uninterrupted ground return path planes, length matching within skew budget, placing decoupling capacitors close to BGA pins, and avoiding split planes.',
    targetDurationSeconds: 120,
    idealKeywords: ['signal integrity', 'controlled impedance', 'differential pair', 'ground return path', 'power integrity', 'decoupling']
  },
  {
    id: 'iq-ece-3',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: 'Fresher',
    category: 'Technical',
    question: 'In Digital Signal Processing (DSP), compare FIR (Finite Impulse Response) vs IIR (Infinite Impulse Response) filters. When is an IIR filter preferable despite phase non-linearity?',
    contextTip: 'Contrast FIR (inherent stability, strictly linear phase response, requires higher tap count/computation) with IIR (recursive feedback, can model sharp roll-off with minimal poles/zeros, low memory footprint, potential limit cycle oscillations).',
    targetDurationSeconds: 115,
    idealKeywords: ['FIR filter', 'IIR filter', 'linear phase', 'computational complexity', 'filter stability', 'group delay']
  },
  {
    id: 'iq-ece-4',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: '0-2 yrs',
    category: 'Problem Solving',
    question: 'Walk me through how you isolate and fix an intermittent bus freeze on an I2C sensor bus where SDA is stuck low at elevated operating temperatures.',
    contextTip: 'Check pull-up resistor sizing relative to bus capacitance (rise time vs sink current capability), evaluate slave clock stretching timeouts, utilize a mixed-signal oscilloscope to inspect bus rise times, and implement a 9-clock master reset pulse.',
    targetDurationSeconds: 115,
    idealKeywords: ['I2C bus lockup', 'clock stretching', 'pull-up sizing', 'bus capacitance', 'oscilloscope', 'slave reset']
  },
  {
    id: 'iq-ece-5',
    role: 'Electronics & Communication',
    discipline: 'Electronics',
    experienceLevel: '3-5 yrs',
    category: 'Technical',
    question: 'How do you calculate the RF Link Budget for an IoT wireless node (e.g., LoRa or BLE), and what strategies do you deploy to combat multipath Rayleigh fading in indoor environments?',
    contextTip: 'Break down link budget equation: Prx = Ptx + Gtx + Grx - FreeSpacePathLoss - CableLoss - FadeMargin. Discuss receiver sensitivity, antenna matching networks (Smith chart), spatial diversity, and spread-spectrum modulation.',
    targetDurationSeconds: 120,
    idealKeywords: ['RF link budget', 'Friis transmission', 'multipath fading', 'fade margin', 'receiver sensitivity', 'antenna matching']
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
  },
  {
    id: 'gdt-4',
    title: 'Autonomous Vehicles & Moral Dilemmas: Who Programs the Ethics of Survival?',
    category: 'Technology & Society',
    brief: 'When self-driving algorithms face an unavoidable collision, should they prioritize passenger safety or minimize total statistical casualties? Who bears legal accountability?',
    keyPerspectives: [
      'Utilitarian calculus vs passenger-contract rights in split-second decisions',
      'Legal liability distribution between automakers, software engineers, and passengers',
      'The ethical benchmark: comparing imperfect AI against far more erratic human drivers'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-5',
    title: 'Universal Basic Income (UBI): Vital Cushion for Automation or Economic Hazard?',
    category: 'Economics & Policy',
    brief: 'As automation and AI compress white-collar and blue-collar labor demand, is unconditional guaranteed income essential for social stability or an inflationary disincentive to work?',
    keyPerspectives: [
      'Eradicating extreme poverty and fostering entrepreneurial risk-taking',
      'Fiscal funding feasibility, sovereign debt concerns, and potential inflationary pressure',
      'Psychological link between human identity, structured work, and societal purpose'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-6',
    title: 'The 4-Day Work Week: Peak Organizational Efficiency or Operational Nightmare?',
    category: 'Workplace & Culture',
    brief: 'Global pilot studies demonstrate equal or improved productivity with reduced burnout under a 32-hour work week. Can this scale beyond tech into health, logistics, and retail?',
    keyPerspectives: [
      'Focus-enhancing elimination of unnecessary meetings and administrative clutter',
      'Unequal applicability across shift-based and client-facing 24/7 service industries',
      'Work intensity compression vs genuine cognitive rest'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-7',
    title: 'Social Media Age Limits: Protecting Developing Minds vs. Restricting Digital Freedom',
    category: 'Policy & Governance',
    brief: 'Several governments are contemplating or legislating strict bans on smartphone or social media accounts for minors under 16. Is this essential public health or unenforceable overreach?',
    keyPerspectives: [
      'Documented correlation with adolescent anxiety, depressive symptoms, and sleep deprivation',
      'Digital literacy necessity and the risk of pushing youth into unregulated dark channels',
      'Inherent privacy and digital ID verification trade-offs required to enforce age gates'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-8',
    title: 'Moonlighting & Dual Employment: Worker Sovereignty vs. Employer Loyalty',
    category: 'Business & Ethics',
    brief: 'With remote work enabling professionals to hold concurrent freelance gigs or full-time roles, should organizations embrace dual work or enforce strict exclusivity?',
    keyPerspectives: [
      'Worker rights to utilize non-work hours for economic growth and multi-skill expansion',
      'Intellectual property contamination, conflict of interest, and cognitive exhaustion risks',
      'The evolution from time-based contracts to deliverable-based milestone contracts'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-9',
    title: 'Central Bank Digital Currencies (CBDCs): Financial Modernization or Total Surveillance?',
    category: 'Finance & Economics',
    brief: 'As central banks develop sovereign digital currencies, do they represent seamless financial rails and rapid stimulus, or an existential threat to transactional privacy?',
    keyPerspectives: [
      'Elimination of transaction friction, cross-border remittance fees, and money laundering',
      'Government capability to monitor, freeze, or program citizen spending behavior',
      'Disintermediation risk for commercial retail banks and systemic liquidity'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-10',
    title: 'Electric Vehicles: Green Revolution or Shifting the Environmental Burden?',
    category: 'Environment & Energy',
    brief: 'While EVs eliminate tailpipe emissions, rare earth lithium/cobalt mining and fossil-heavy electrical grids create hidden ecological costs. Are EVs the ultimate answer?',
    keyPerspectives: [
      'Lifecycle carbon reduction trajectory as renewable electrical grids expand',
      'Geopolitical tensions, ecological degradation, and labor ethics in mineral extraction',
      'The superior climate argument for electrified public transit over 2-ton personal EVs'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-11',
    title: 'Is Meritocracy a Genuine Reality or an Elaborate Comforting Myth?',
    category: 'Abstract & Philosophy',
    brief: 'Does modern corporate and academic success primarily reflect individual talent and relentless grit, or is it heavily pre-determined by social capital, zip code, and luck?',
    keyPerspectives: [
      'The motivating power of meritocratic belief in driving individual agency and excellence',
      'Cumulative socio-economic headstarts and invisible bias in traditional hiring filters',
      'Balancing reward for high performance with systemic fairness and equal opportunity'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-12',
    title: 'Deepfakes & Synthetic Media: Is the Truth Legally Defendable in the Age of Generative Video?',
    category: 'Technology & Society',
    brief: 'When hyper-realistic video, audio, and documents can be manufactured on consumer laptops, how do legal systems, journalistic media, and democratic elections preserve shared truth?',
    keyPerspectives: [
      'Cryptographic provenance standards (C2PA) and watermarking verification technology',
      'The "Liar\'s Dividend": bad actors dismissing authentic evidence as synthetic deepfakes',
      'First amendment and creative parody protections versus defamatory disinformation'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-13',
    title: 'Space Commercialization: Humanity\'s Multiplanetary Future or Extreme Vanity Waste?',
    category: 'Science & Society',
    brief: 'With billions poured into lunar bases and Mars colonization, critics ask whether capital should instead prioritize urgent terrestrial crises like poverty and climate adaptation.',
    keyPerspectives: [
      'Technological spin-offs (solar cells, water purification, telecommunications) benefiting Earth',
      'Existential hedge ensuring species longevity against planetary-scale catastrophes',
      'Opportunity cost when billions are invested in rockets while planetary biospheres collapse'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-14',
    title: 'Hustle Culture vs. Work-Life Integration: Redefining Career Ambition in the 2020s',
    category: 'Workplace & Culture',
    brief: 'Does the romanticization of 70-hour weeks and constant grind produce legendary breakthroughs, or does it primarily generate chronic burnout and hollow personal lives?',
    keyPerspectives: [
      'Outsized compounding returns of intense obsession during formative career stages',
      'Diminishing cognitive returns and creative atrophy caused by chronic sleep deprivation',
      'Redefining ambition around sustainable stamina, deep focus, and holistic life design'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-15',
    title: 'Are Four-Year College Degrees Obsolete in an Agile, Skills-First Economy?',
    category: 'Education & Career',
    brief: 'With tech giants removing degree requirements and industry skill half-lives shrinking to three years, are conventional degrees worth hundreds of thousands in tuition debt?',
    keyPerspectives: [
      'The enduring value of broad liberal arts education, critical reasoning, and peer networks',
      'Rise of vocational apprenticeships, industry certifications, and demonstrable portfolios',
      'The credentialism barrier that disproportionately penalizes underprivileged self-taught talent'
    ],
    suggestedDurationMinutes: 5
  },
  {
    id: 'gdt-16',
    title: 'Healthcare Commercialization: Should Essential Life-Saving Medicine Be Run for Profit?',
    category: 'Healthcare & Policy',
    brief: 'Pharmaceutical firms argue that enormous profit margins fund multi-billion-dollar R&D risks. Critics contend that monetizing human suffering leads to artificial scarcity.',
    keyPerspectives: [
      'Incentive structures driving venture investment into unprecedented cures and vaccine platforms',
      'Price gouging on off-patent, century-old essentials (e.g. insulin) due to patent thickets',
      'Public-private hybrid prize models decoupling research incentives from unit pricing'
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
  },
  {
    id: 'deck-3',
    title: 'Product Launch: PulseCare AI Health Wearable',
    description: 'A 4-slide high-energy consumer launch keynote unveiling next-generation continuous biosensing.',
    totalSlides: 4,
    slides: [
      {
        id: 's3-1',
        slideNumber: 1,
        title: 'The Silent Epidemic: Reactive Healthcare',
        bulletPoints: [
          '80% of chronic cardiovascular events show subtle biometric warning signs 48 hours prior.',
          'Current consumer smartwatches only alert users after critical thresholds are breached.',
          'The missing link: Predictive micro-vascular optical telemetry.'
        ],
        speakerNotesTip: 'Open with high emotional resonance. Create contrast between today\'s anxiety and tomorrow\'s preventative peace of mind.',
        targetDurationSeconds: 45
      },
      {
        id: 's3-2',
        slideNumber: 2,
        title: 'Introducing PulseCare Band: Continuous Predictive Health',
        bulletPoints: [
          'Clinical-grade PPG sensors sampling arterial stiffness and autonomic nervous recovery at 500Hz.',
          'Edge AI model processing continuous vitals locally without battery drain.',
          'Seamless 14-day continuous battery life with titanium hypoallergenic chassis.'
        ],
        speakerNotesTip: 'Speak with awe and precision. Emphasize why the hardware elegance matches the underlying medical rigor.',
        targetDurationSeconds: 55
      },
      {
        id: 's3-3',
        slideNumber: 3,
        title: 'Clinical Validation & Regulatory Clearance',
        bulletPoints: [
          'Validated across 12,000-patient multi-center clinical trials with 96.4% anomaly specificity.',
          'FDA 510(k) cleared for continuous arrhythmia and nocturnal respiratory monitoring.',
          'Integrated directly with Epic and Cerner EHR platforms for clinician telemetry.'
        ],
        speakerNotesTip: 'Ground your claims firmly with institutional credibility to earn stakeholder and customer trust.',
        targetDurationSeconds: 50
      },
      {
        id: 's3-4',
        slideNumber: 4,
        title: 'Global Launch Strategy & Availability',
        bulletPoints: [
          'Tier 1 direct-to-consumer rollout across North America, EU, and Japan this October.',
          'Partnered with 3 premier national health insurers for subsidized patient coverage.',
          'Pre-orders open today with global delivery starting in 6 weeks.'
        ],
        speakerNotesTip: 'End on an inspiring crescendo. Issue a clear, decisive call to action for early adopters.',
        targetDurationSeconds: 45
      }
    ]
  },
  {
    id: 'deck-4',
    title: 'All-Hands Keynote: Navigating Industry Turbulence',
    description: 'A 3-slide transparent executive address framing market headwinds into focused operational clarity.',
    totalSlides: 3,
    slides: [
      {
        id: 's4-1',
        slideNumber: 1,
        title: 'The Macro Environment: Shifting from Growth at All Costs to Endurance',
        bulletPoints: [
          'Capital markets have repriced risk; customer procurement cycles have lengthened by 35%.',
          'Competitors relying on subsidized burns are pulling back and consolidating.',
          'Our mission is unchanged, but our operating rhythm must become ruthlessly prioritized.'
        ],
        speakerNotesTip: 'Deliver this with absolute candor and calm authority. Do not minimize the external difficulty.',
        targetDurationSeconds: 55
      },
      {
        id: 's4-2',
        slideNumber: 2,
        title: 'The 3 Pillar Defense: Our Operational North Stars',
        bulletPoints: [
          'Pillar 1: Deepening retention with top-tier enterprise accounts over speculative outbound.',
          'Pillar 2: Shipping our core AI automation engine 2 quarters ahead of target.',
          'Pillar 3: Extending our cash runway to 36 months through infrastructure efficiency.'
        ],
        speakerNotesTip: 'Pivot from realism to conviction. Give the team 3 concrete handles they can mentally anchor upon.',
        targetDurationSeconds: 65
      },
      {
        id: 's4-3',
        slideNumber: 3,
        title: 'Our Greatest Advantage: Velocity and Trust',
        bulletPoints: [
          'Market downturns don\'t destroy enduring companies—they prune fragile ones.',
          'Every breakthrough product in our industry history was built during a macro winter.',
          'We have the talent, the balance sheet, and the resolve. Let\'s execute with excellence.'
        ],
        speakerNotesTip: 'Close with profound belief and psychological safety. Thank the team for their dedication.',
        targetDurationSeconds: 50
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
  },
  {
    id: 'dc-4',
    type: 'pitch',
    title: 'The 60-Second Elevator Pitch: Sell an Everyday Pencil',
    prompt: "Persuade an audience that a humble wooden pencil is the most revolutionary, distraction-free creative thinking instrument in existence. Make it irresistible.",
    prepTimeSeconds: 25,
    speakingTimeSeconds: 60,
    evaluationCriteria: [
      'Unexpected compelling hook in the first 10 seconds',
      'Reframing an ordinary commodity as an indispensable cognitive tool',
      'Crisp, charismatic delivery with zero vocal hesitation'
    ],
    completedToday: false
  },
  {
    id: 'dc-5',
    type: 'explanation',
    title: 'Explain Black Holes to a Beginner in 75 Seconds',
    prompt: "Explain what a black hole is, how it forms, and why light cannot escape, using a memorable everyday analogy (such as a waterfall or a heavy bowling ball on a trampoline).",
    prepTimeSeconds: 25,
    speakingTimeSeconds: 75,
    evaluationCriteria: [
      'Zero unexplained scientific jargon',
      'Consistent use of a vivid mental picture',
      'Steady, deliberate cadence (130-150 WPM)'
    ],
    completedToday: false
  },
  {
    id: 'dc-6',
    type: 'warmup',
    title: 'Articulation Sprint: Tongue Twisters & Consonant Precision',
    prompt: "Recite this articulation sequence with crisp consonant punch and zero mumbling: 'Peter Piper picked a peck of pickled peppers. She sells seashells by the seashore. Truly rural, red leather, yellow leather. Unique New York, you know you need unique New York.'",
    prepTimeSeconds: 15,
    speakingTimeSeconds: 45,
    evaluationCriteria: [
      'Crisp plosive consonants (P, T, K, B, D, G)',
      'Clean sibilants without rushing or slurring',
      'Open vocal resonance and rhythmic breathing'
    ],
    completedToday: false
  },
  {
    id: 'dc-7',
    type: 'impromptu',
    title: 'Crisis Control: 90-Second Emergency Press Briefing',
    prompt: "You are the head of communications for a cloud provider experiencing a worldwide database outage. Deliver a 90-second briefing taking responsibility, outlining mitigation steps, and reassuring affected enterprises.",
    prepTimeSeconds: 30,
    speakingTimeSeconds: 90,
    evaluationCriteria: [
      'Executive gravity, steady eye contact, and grounded vocal tone',
      'Clear chronological status structure (Current Status, Root Cause, ETA)',
      'Empathetic framing without defensive deflection'
    ],
    completedToday: false
  },
  {
    id: 'dc-8',
    type: 'opinion',
    title: 'Why Boredom Is the Ultimate Fuel for Original Thought',
    prompt: "Argue why constant digital stimulation is murdering original human creativity, and why modern society desperately needs to rediscover the art of intentional boredom.",
    prepTimeSeconds: 30,
    speakingTimeSeconds: 90,
    evaluationCriteria: [
      'Thought-provoking counter-intuitive thesis',
      'Compelling contrast between passive consumption and active incubation',
      'Persuasive, memorable final sentence'
    ],
    completedToday: false
  },
  {
    id: 'dc-9',
    type: 'impromptu',
    title: 'Halftime Locker Room Pep Talk: 60 Seconds to Turn the Game',
    prompt: "Your team is trailing at halftime in the championship game. Deliver an electrifying 60-second motivational speech that dispels self-doubt, re-ignites hunger, and unites the squad.",
    prepTimeSeconds: 20,
    speakingTimeSeconds: 60,
    evaluationCriteria: [
      'Dynamic vocal projection and emotional urgency',
      'Short, punchy rhythmic sentences',
      'Unifying rallying cry that commands immediate action'
    ],
    completedToday: false
  },
  {
    id: 'dc-10',
    type: 'storytelling',
    title: 'Metaphor Master: Describe Your Career as an Extreme Sport',
    prompt: "Select an extreme sport (e.g. big-wave surfing, solo mountaineering, whitewater kayaking) and use it as an extended metaphor to describe your professional growth and lessons.",
    prepTimeSeconds: 25,
    speakingTimeSeconds: 75,
    evaluationCriteria: [
      'Cohesive thematic metaphor woven across the entire duration',
      'Vivid sensory verbs and emotional turning points',
      'Grounded professional takeaway'
    ],
    completedToday: false
  }
];
