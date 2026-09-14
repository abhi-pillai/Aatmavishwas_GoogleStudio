import { FeedbackReport, UserProgress } from '../types';

export const DEFAULT_BADGES: UserProgress['badges'] = [
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
    description: 'Score 85+ on an interview answer',
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
    description: 'Complete 15+ sessions with 85+ average confidence',
    icon: '👑',
    unlocked: false,
  }
];

export function toLocalDateString(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreak(sessions: { timestamp: string }[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const activeDays = new Set<string>();
  for (const s of sessions) {
    if (s.timestamp) {
      const dateStr = toLocalDateString(s.timestamp);
      if (dateStr) activeDays.add(dateStr);
    }
  }

  if (activeDays.size === 0) return 0;

  const today = new Date();
  const todayStr = toLocalDateString(today);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  // If user hasn't practiced today AND hasn't practiced yesterday, streak is 0
  if (!activeDays.has(todayStr) && !activeDays.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date();

  // If they haven't practiced today yet, but practiced yesterday, evaluate streak starting from yesterday
  if (!activeDays.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (activeDays.has(toLocalDateString(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function computeUserProgress(sessions: FeedbackReport[]): UserProgress {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalSpeakingMinutes: 0,
      averageConfidenceScore: 0,
      averageWpm: 0,
      fillerReductionPct: 0,
      streakDays: 0,
      lastActiveDate: '',
      level: 'Novice Speaker',
      badges: DEFAULT_BADGES.map(b => ({ ...b, unlocked: false })),
    };
  }

  const totalSessions = sessions.length;
  const totalSpeakingSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalSpeakingMinutes = Math.max(1, Math.round(totalSpeakingSeconds / 60));
  
  const avgConfidence = Math.round(
    sessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / totalSessions
  );
  
  const avgWpm = Math.round(
    sessions.reduce((sum, s) => sum + (s.wpm || 0), 0) / totalSessions
  );

  const streakDays = calculateStreak(sessions);

  // Compare earliest session with most recent session for filler reduction percentage
  let fillerReductionPct = 0;
  if (sessions.length >= 2) {
    const oldest = sessions[sessions.length - 1];
    const newest = sessions[0];
    const initialFillers = oldest.fillerWordsCount ?? 0;
    const currentFillers = newest.fillerWordsCount ?? 0;
    if (initialFillers > 0) {
      fillerReductionPct = Math.max(0, Math.round(((initialFillers - currentFillers) / initialFillers) * 100));
    }
  }

  // Level progression based on genuine session history
  let level: UserProgress['level'] = 'Novice Speaker';
  if (totalSessions >= 15) {
    level = 'Master Presenter';
  } else if (totalSessions >= 8) {
    level = 'Confident Orator';
  } else if (totalSessions >= 3) {
    level = 'Emerging Communicator';
  }

  // Unlock badges strictly from genuine session performance
  const badges = DEFAULT_BADGES.map(badge => {
    let unlocked = false;
    let dateUnlocked: string | undefined = undefined;

    if (badge.id === 'first_speech' && totalSessions >= 1) {
      unlocked = true;
      dateUnlocked = toLocalDateString(sessions[sessions.length - 1].timestamp);
    } else if (badge.id === 'streak_3' && streakDays >= 3) {
      unlocked = true;
      dateUnlocked = toLocalDateString(new Date());
    } else if (badge.id === 'filler_slayer') {
      const qualifying = sessions.find(s => s.fillerWordsCount <= 1 && s.durationSeconds >= 20);
      if (qualifying) {
        unlocked = true;
        dateUnlocked = toLocalDateString(qualifying.timestamp);
      }
    } else if (badge.id === 'interview_ace') {
      const qualifying = sessions.find(s => s.sessionType === 'interview' && (s.overallScore >= 85 || s.confidenceScore >= 85));
      if (qualifying) {
        unlocked = true;
        dateUnlocked = toLocalDateString(qualifying.timestamp);
      }
    } else if (badge.id === 'gd_moderator') {
      const qualifying = sessions.find(s => s.sessionType === 'gd');
      if (qualifying) {
        unlocked = true;
        dateUnlocked = toLocalDateString(qualifying.timestamp);
      }
    } else if (badge.id === 'orator_master' && totalSessions >= 15 && avgConfidence >= 85) {
      unlocked = true;
      dateUnlocked = toLocalDateString(new Date());
    }

    return {
      ...badge,
      unlocked,
      dateUnlocked,
    };
  });

  return {
    totalSessions,
    totalSpeakingMinutes,
    averageConfidenceScore: avgConfidence,
    averageWpm: avgWpm,
    fillerReductionPct,
    streakDays,
    lastActiveDate: sessions[0]?.timestamp ? toLocalDateString(sessions[0].timestamp) : '',
    level,
    badges,
  };
}
