import { LanguageMode, LessonItem } from '../data/curriculum';

export interface LessonProgressRecord {
  lessonId: string;
  bestWpm: number;
  bestAccuracy: number;
  bestMarksOutOf40: number;
  stars: 1 | 2 | 3;
  attempts: number;
  completedReps: number;
  lastCompletedAt: string;
}

export interface KeyHitMiss {
  hits: number;
  misses: number;
}

export type SessionModeType =
  | 'lesson'
  | 'exam'
  | 'practice-7m'
  | 'unlimited'
  | 'custom'
  | 'weak-keys';

export interface TypingSessionRecord {
  id: string;
  mode: SessionModeType;
  language: LanguageMode;
  title: string;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  keystrokes: number;
  errors: number;
  backspaceCount: number;
  marksObtained: number; // Out of 40 Marks (MSCE Pune GCC-TBC standard)
  maxMarks: 40;
  passingMarks: 16;
  durationSeconds: number;
  timestamp: string;
  examBenchmarkWpm?: number;
  examPassed?: boolean;
}

export interface CustomPassageItem {
  id: string;
  language: LanguageMode;
  title: string;
  text: string;
  createdAt: string;
}

export interface UserProgressStore {
  lessonRecords: Record<string, LessonProgressRecord>;
  keyTelemetry: Record<LanguageMode, Record<string, KeyHitMiss>>;
  sessionHistory: TypingSessionRecord[];
  customPassages: CustomPassageItem[];
  totalPracticeSeconds: number;
}

const STORAGE_KEY = 'lipitype_gcctbc_progress_v2';

const DEFAULT_CUSTOM_PASSAGES: CustomPassageItem[] = [
  {
    id: 'custom-mr-default-1',
    language: 'mr',
    title: 'GCC-TBC मराठी सराव परिच्छेद १: ई-प्रशासन',
    text: 'महाराष्ट्रातील प्रत्येक गावात डिजिटल सेवा पोहोचल्यामुळे विद्यार्थ्यांना आणि शेतकऱ्यांना ऑनलाइन माहिती मिळणे अत्यंत सोपे झाले आहे. मराठी इनस्क्रिप्ट टंकलेखनाचा नियमित सराव केल्यास शासकीय संगणक टंकलेखन परीक्षेत ४० पैकी उत्तम गुण मिळतात.',
    createdAt: '2026-10-08',
  },
  {
    id: 'custom-en-default-1',
    language: 'en',
    title: 'GCC-TBC English Custom Drill 1: Official Correspondence',
    text: 'Clear written communication and rapid touch typing allow modern professionals to document decisions, respond to stakeholders, and execute projects with high precision.',
    createdAt: '2026-10-09',
  },
];

export function loadUserProgress(): UserProgressStore {
  if (typeof window === 'undefined') {
    return getInitialStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<UserProgressStore>;
    return {
      lessonRecords: parsed.lessonRecords || {},
      keyTelemetry: {
        en: parsed.keyTelemetry?.en || {},
        mr: parsed.keyTelemetry?.mr || {},
      },
      sessionHistory: parsed.sessionHistory || [],
      customPassages:
        parsed.customPassages && parsed.customPassages.length > 0
          ? parsed.customPassages
          : DEFAULT_CUSTOM_PASSAGES,
      totalPracticeSeconds: parsed.totalPracticeSeconds || 0,
    };
  } catch {
    return getInitialStore();
  }
}

function getInitialStore(): UserProgressStore {
  return {
    lessonRecords: {},
    keyTelemetry: {
      en: {
        a: { hits: 42, misses: 2 },
        s: { hits: 38, misses: 1 },
        d: { hits: 45, misses: 2 },
        f: { hits: 50, misses: 1 },
        j: { hits: 48, misses: 2 },
        k: { hits: 40, misses: 3 },
        l: { hits: 36, misses: 4 },
        ';': { hits: 22, misses: 5 },
        p: { hits: 18, misses: 4 },
        q: { hits: 14, misses: 3 },
      },
      mr: {
        'क': { hits: 44, misses: 2 },
        'र': { hits: 52, misses: 1 },
        'त': { hits: 39, misses: 2 },
        'ा': { hits: 60, misses: 2 },
        'ि': { hits: 32, misses: 6 },
        'ी': { hits: 28, misses: 5 },
        '्': { hits: 25, misses: 7 },
        'ण': { hits: 18, misses: 5 },
        'ळ': { hits: 16, misses: 4 },
        'श': { hits: 20, misses: 4 },
      },
    },
    sessionHistory: [
      {
        id: 'seed-1',
        mode: 'exam',
        language: 'mr',
        title: 'GCC-TBC मराठी ३० WPM स्पीड पॅसेज १ — ई-ऑफिस व डिजिटल प्रशासन',
        netWpm: 31,
        grossWpm: 32,
        accuracy: 96,
        keystrokes: 1060,
        errors: 4,
        backspaceCount: 2,
        marksObtained: 35,
        maxMarks: 40,
        passingMarks: 16,
        durationSeconds: 420,
        timestamp: 'Yesterday',
        examBenchmarkWpm: 30,
        examPassed: true,
      },
      {
        id: 'seed-2',
        mode: 'exam',
        language: 'en',
        title: 'GCC-TBC English 30 WPM Speed Passage 1 — Institutional Supply Contract',
        netWpm: 34,
        grossWpm: 35,
        accuracy: 97,
        keystrokes: 1120,
        errors: 3,
        backspaceCount: 0,
        marksObtained: 37,
        maxMarks: 40,
        passingMarks: 16,
        durationSeconds: 420,
        timestamp: 'Yesterday',
        examBenchmarkWpm: 30,
        examPassed: true,
      },
    ],
    customPassages: DEFAULT_CUSTOM_PASSAGES,
    totalPracticeSeconds: 840,
  };
}

export function saveUserProgress(store: UserProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota errors
  }
}

export function isLessonUnlocked(
  store: UserProgressStore,
  lessonIndex: number,
  lessons: LessonItem[]
): boolean {
  if (lessonIndex <= 0) return true;
  const prevLesson = lessons[lessonIndex - 1];
  if (!prevLesson) return true;
  const prevRecord = store.lessonRecords[prevLesson.id];
  if (!prevRecord) return false;
  return (prevRecord.completedReps || prevLesson.requiredReps) >= prevLesson.requiredReps;
}

export function recordSessionCompletion(
  currentStore: UserProgressStore,
  session: Omit<TypingSessionRecord, 'id' | 'timestamp'>,
  sessionKeyStats: Record<string, KeyHitMiss>,
  lessonTargetWpm?: number,
  lessonId?: string,
  lessonRequiredReps?: number
): UserProgressStore {
  const updated: UserProgressStore = {
    ...currentStore,
    lessonRecords: { ...currentStore.lessonRecords },
    keyTelemetry: {
      en: { ...currentStore.keyTelemetry.en },
      mr: { ...currentStore.keyTelemetry.mr },
    },
    sessionHistory: [...currentStore.sessionHistory],
    customPassages: [...currentStore.customPassages],
    totalPracticeSeconds: currentStore.totalPracticeSeconds + Math.max(1, session.durationSeconds),
  };

  // Merge per-key telemetry
  const langMap = updated.keyTelemetry[session.language];
  Object.entries(sessionKeyStats).forEach(([char, stat]) => {
    if (char === ' ') return;
    const prev = langMap[char] || { hits: 0, misses: 0 };
    langMap[char] = {
      hits: prev.hits + stat.hits,
      misses: prev.misses + stat.misses,
    };
  });

  // Update lesson record if mode === 'lesson'
  if (session.mode === 'lesson' && lessonId) {
    const prevLesson = updated.lessonRecords[lessonId];
    const target = lessonTargetWpm || 20;
    let stars: 1 | 2 | 3 = 1;
    if (session.accuracy >= 95 && session.netWpm >= target * 1.1) {
      stars = 3;
    } else if (session.accuracy >= 90 && session.netWpm >= target * 0.85) {
      stars = 2;
    }

    const reqReps = lessonRequiredReps || 5;
    updated.lessonRecords[lessonId] = {
      lessonId,
      bestWpm: prevLesson ? Math.max(prevLesson.bestWpm, session.netWpm) : session.netWpm,
      bestAccuracy: prevLesson ? Math.max(prevLesson.bestAccuracy, session.accuracy) : session.accuracy,
      bestMarksOutOf40: prevLesson
        ? Math.max(prevLesson.bestMarksOutOf40 || 0, session.marksObtained)
        : session.marksObtained,
      stars: prevLesson ? (Math.max(prevLesson.stars, stars) as 1 | 2 | 3) : stars,
      attempts: (prevLesson?.attempts || 0) + 1,
      completedReps: Math.max(prevLesson?.completedReps || 0, reqReps),
      lastCompletedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
  }

  const newRecord: TypingSessionRecord = {
    ...session,
    id: `sess-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  updated.sessionHistory = [newRecord, ...updated.sessionHistory].slice(0, 40);
  saveUserProgress(updated);
  return updated;
}

export interface WeakKeyMetric {
  char: string;
  hits: number;
  misses: number;
  total: number;
  errorRate: number;
}

export function getSortedWeakKeys(
  store: UserProgressStore,
  language: LanguageMode
): WeakKeyMetric[] {
  const map = store.keyTelemetry[language] || {};
  return Object.entries(map)
    .map(([char, stat]) => {
      const total = stat.hits + stat.misses;
      const errorRate = total > 0 ? Math.round((stat.misses / total) * 100) : 0;
      return {
        char,
        hits: stat.hits,
        misses: stat.misses,
        total,
        errorRate,
      };
    })
    .filter((item) => item.total >= 2 && item.misses > 0)
    .sort((a, b) => b.errorRate - a.errorRate || b.misses - a.misses);
}

const MARATHI_WORD_BANK_BY_CHAR: Record<string, string[]> = {
  'ि': ['किरण', 'विचार', 'शिस्त', 'निर्णय', 'परिश्रम', 'तितर', 'तिलक'],
  'ी': ['नदी', 'माहिती', 'जननी', 'गती', 'शक्ती', 'पाणी', 'धरती'],
  '्': ['शिस्त', 'प्रगती', 'सत्य', 'अभ्यास', 'पुस्तक', 'स्वच्छ', 'कर्म'],
  'ण': ['शिक्षण', 'कारण', 'आपण', 'प्रणाली', 'कणा', 'णमोकार', 'ग्रामीण'],
  'ळ': ['सकाळ', 'काळजी', 'शाळा', 'कमळ', 'तळमळ', 'वेळ', 'फळबाग'],
  'श': ['यश', 'शाळा', 'प्रशासन', 'दिशा', 'आकाश', 'शांतता', 'विशेष'],
  'ष': ['विशेष', 'भाषा', 'विषय', 'संतोष', 'धनुष्य', 'मनुष्य', 'कृषी'],
  'ु': ['पुस्तक', 'सुंदर', 'कुमार', 'दुपार', 'चतुर', 'मधुर', 'हुशार'],
  'ू': ['सूर्य', 'एकूण', 'मूलभूत', 'मजबूत', 'कौतुक', 'पाऊस', 'दूर'],
  'े': ['देश', 'सेवा', 'प्रेरणा', 'नेहमी', 'वेग', 'रेषा', 'एकता'],
  'ो': ['लोक', 'योजना', 'कोणताही', 'मोठा', 'सोपे', 'बोलणे', 'योगदान'],
  'ा': ['महाराष्ट्र', 'कामाचा', 'सराव', 'आदर', 'भारत', 'सामान्य', 'कार्यालय'],
};

const ENGLISH_WORD_BANK_BY_CHAR: Record<string, string[]> = {
  ';': ['ask;', 'fall;', 'glass;', 'shall;', 'flash;', 'skill;', 'focus;'],
  p: ['purpose', 'practice', 'progress', 'paper', 'people', 'prepare', 'prompt'],
  q: ['quality', 'quick', 'quiet', 'quote', 'quarter', 'question', 'acquire'],
  z: ['zone', 'zeal', 'zero', 'citizen', 'organize', 'analyze', 'realize'],
  x: ['exact', 'excel', 'exam', 'execute', 'example', 'index', 'context'],
  k: ['skill', 'knowledge', 'keyboard', 'keep', 'keystroke', 'marker', 'work'],
  l: ['level', 'logical', 'letter', 'clear', 'local', 'legal', 'quality'],
};

export function generateWeakKeyDrill(
  store: UserProgressStore,
  language: LanguageMode
): { title: string; focusKeys: string[]; text: string } {
  const weakList = getSortedWeakKeys(store, language).slice(0, 5);

  if (language === 'mr') {
    const keys = weakList.length > 0 ? weakList.map((w) => w.char) : ['ि', 'ी', '्', 'ण', 'ळ'];
    const words: string[] = [];
    keys.forEach((k) => {
      const bank = MARATHI_WORD_BANK_BY_CHAR[k] || [`${k}र`, `क${k}त`, `प${k}न`, `स${k}म`];
      words.push(...bank);
    });
    const sequence: string[] = [];
    for (let i = 0; i < 32; i++) {
      sequence.push(words[i % words.length]);
    }
    return {
      title: `GCC-TBC कमकुवत अक्षरे विशेष सराव (${keys.join(', ')})`,
      focusKeys: keys,
      text: sequence.join(' '),
    };
  } else {
    const keys = weakList.length > 0 ? weakList.map((w) => w.char) : [';', 'p', 'q', 'l', 'k'];
    const words: string[] = [];
    keys.forEach((k) => {
      const bank =
        ENGLISH_WORD_BANK_BY_CHAR[k.toLowerCase()] || [
          `${k}art`,
          `s${k}ill`,
          `ta${k}e`,
          `wor${k}`,
        ];
      words.push(...bank);
    });
    const sequence: string[] = [];
    for (let i = 0; i < 32; i++) {
      sequence.push(words[i % words.length]);
    }
    return {
      title: `GCC-TBC Targeted Weak-Key Drill (${keys.map((k) => k.toUpperCase()).join(', ')})`,
      focusKeys: keys,
      text: sequence.join(' '),
    };
  }
}
