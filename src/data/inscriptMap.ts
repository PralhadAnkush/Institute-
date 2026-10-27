export type FingerId =
  | 'L-Pinky'
  | 'L-Ring'
  | 'L-Middle'
  | 'L-Index'
  | 'Thumb'
  | 'R-Index'
  | 'R-Middle'
  | 'R-Ring'
  | 'R-Pinky';

export interface KeyDef {
  code: string;
  row: 0 | 1 | 2 | 3 | 4;
  width?: string;
  finger: FingerId;
  hand: 'left' | 'right' | 'both';
  enNormal: string;
  enShift: string;
  mrNormal: string;
  mrShift: string;
  isModifier?: boolean;
}

export interface FingerMeta {
  id: FingerId;
  enLabel: string;
  mrLabel: string;
  shortLabel: string;
  hand: 'left' | 'right' | 'both';
  bgClass: string;
  borderClass: string;
  textClass: string;
  activeBgClass: string;
}

export const FINGER_META: Record<FingerId, FingerMeta> = {
  'L-Pinky': {
    id: 'L-Pinky',
    enLabel: 'Left Pinky Finger',
    mrLabel: 'डावी करंगळी',
    shortLabel: 'L-Pinky · करंगळी',
    hand: 'left',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-800',
    activeBgClass: 'bg-rose-600 text-white border-rose-700',
  },
  'L-Ring': {
    id: 'L-Ring',
    enLabel: 'Left Ring Finger',
    mrLabel: 'डावी अनामिका',
    shortLabel: 'L-Ring · अनामिका',
    hand: 'left',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    activeBgClass: 'bg-amber-600 text-white border-amber-700',
  },
  'L-Middle': {
    id: 'L-Middle',
    enLabel: 'Left Middle Finger',
    mrLabel: 'डावे मधले बोट',
    shortLabel: 'L-Middle · मधले बोट',
    hand: 'left',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-800',
    activeBgClass: 'bg-emerald-600 text-white border-emerald-700',
  },
  'L-Index': {
    id: 'L-Index',
    enLabel: 'Left Index Finger',
    mrLabel: 'डावी तर्जनी',
    shortLabel: 'L-Index · डावी तर्जनी',
    hand: 'left',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-800',
    activeBgClass: 'bg-sky-600 text-white border-sky-700',
  },
  Thumb: {
    id: 'Thumb',
    enLabel: 'Thumb (Spacebar)',
    mrLabel: 'अंगठा (Spacebar)',
    shortLabel: 'Thumb · अंगठा',
    hand: 'both',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-700',
    activeBgClass: 'bg-blue-600 text-white border-blue-700',
  },
  'R-Index': {
    id: 'R-Index',
    enLabel: 'Right Index Finger',
    mrLabel: 'उजवी तर्जनी',
    shortLabel: 'R-Index · उजवी तर्जनी',
    hand: 'right',
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    textClass: 'text-indigo-800',
    activeBgClass: 'bg-indigo-600 text-white border-indigo-700',
  },
  'R-Middle': {
    id: 'R-Middle',
    enLabel: 'Right Middle Finger',
    mrLabel: 'उजवे मधले बोट',
    shortLabel: 'R-Middle · मधले बोट',
    hand: 'right',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
    textClass: 'text-teal-800',
    activeBgClass: 'bg-teal-600 text-white border-teal-700',
  },
  'R-Ring': {
    id: 'R-Ring',
    enLabel: 'Right Ring Finger',
    mrLabel: 'उजवी अनामिका',
    shortLabel: 'R-Ring · अनामिका',
    hand: 'right',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-800',
    activeBgClass: 'bg-orange-600 text-white border-orange-700',
  },
  'R-Pinky': {
    id: 'R-Pinky',
    enLabel: 'Right Pinky Finger',
    mrLabel: 'उजवी करंगळी',
    shortLabel: 'R-Pinky · करंगळी',
    hand: 'right',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-800',
    activeBgClass: 'bg-purple-600 text-white border-purple-700',
  },
};

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 0: Number & Symbol Row
  [
    { code: 'Backquote', row: 0, finger: 'L-Pinky', hand: 'left', enNormal: '`', enShift: '~', mrNormal: 'ॉ', mrShift: 'ऑ' },
    { code: 'Digit1', row: 0, finger: 'L-Pinky', hand: 'left', enNormal: '1', enShift: '!', mrNormal: '१', mrShift: 'ऍ' },
    { code: 'Digit2', row: 0, finger: 'L-Ring', hand: 'left', enNormal: '2', enShift: '@', mrNormal: '२', mrShift: 'ॅ' },
    { code: 'Digit3', row: 0, finger: 'L-Middle', hand: 'left', enNormal: '3', enShift: '#', mrNormal: '३', mrShift: '्र' },
    { code: 'Digit4', row: 0, finger: 'L-Index', hand: 'left', enNormal: '4', enShift: '$', mrNormal: '४', mrShift: 'र्' },
    { code: 'Digit5', row: 0, finger: 'L-Index', hand: 'left', enNormal: '5', enShift: '%', mrNormal: '५', mrShift: 'ज्ञ' },
    { code: 'Digit6', row: 0, finger: 'R-Index', hand: 'right', enNormal: '6', enShift: '^', mrNormal: '६', mrShift: 'त्र' },
    { code: 'Digit7', row: 0, finger: 'R-Index', hand: 'right', enNormal: '7', enShift: '&', mrNormal: '७', mrShift: 'क्ष' },
    { code: 'Digit8', row: 0, finger: 'R-Middle', hand: 'right', enNormal: '8', enShift: '*', mrNormal: '८', mrShift: 'श्र' },
    { code: 'Digit9', row: 0, finger: 'R-Ring', hand: 'right', enNormal: '9', enShift: '(', mrNormal: '९', mrShift: '(' },
    { code: 'Digit0', row: 0, finger: 'R-Pinky', hand: 'right', enNormal: '0', enShift: ')', mrNormal: '०', mrShift: ')' },
    { code: 'Minus', row: 0, finger: 'R-Pinky', hand: 'right', enNormal: '-', enShift: '_', mrNormal: '-', mrShift: 'ः' },
    { code: 'Equal', row: 0, finger: 'R-Pinky', hand: 'right', enNormal: '=', enShift: '+', mrNormal: 'ृ', mrShift: 'ऋ' },
    { code: 'Backspace', row: 0, width: 'w-20', finger: 'R-Pinky', hand: 'right', enNormal: '⌫', enShift: '⌫', mrNormal: '⌫', mrShift: '⌫', isModifier: true },
  ],
  // Row 1: Top QWERTY Row (Vowels / Matras on Left, Consonants on Right)
  [
    { code: 'Tab', row: 1, width: 'w-14', finger: 'L-Pinky', hand: 'left', enNormal: 'Tab', enShift: 'Tab', mrNormal: 'Tab', mrShift: 'Tab', isModifier: true },
    { code: 'KeyQ', row: 1, finger: 'L-Pinky', hand: 'left', enNormal: 'q', enShift: 'Q', mrNormal: 'ौ', mrShift: 'औ' },
    { code: 'KeyW', row: 1, finger: 'L-Ring', hand: 'left', enNormal: 'w', enShift: 'W', mrNormal: 'ै', mrShift: 'ऐ' },
    { code: 'KeyE', row: 1, finger: 'L-Middle', hand: 'left', enNormal: 'e', enShift: 'E', mrNormal: 'ा', mrShift: 'आ' },
    { code: 'KeyR', row: 1, finger: 'L-Index', hand: 'left', enNormal: 'r', enShift: 'R', mrNormal: 'ी', mrShift: 'ई' },
    { code: 'KeyT', row: 1, finger: 'L-Index', hand: 'left', enNormal: 't', enShift: 'T', mrNormal: 'ू', mrShift: 'ऊ' },
    { code: 'KeyY', row: 1, finger: 'R-Index', hand: 'right', enNormal: 'y', enShift: 'Y', mrNormal: 'ब', mrShift: 'भ' },
    { code: 'KeyU', row: 1, finger: 'R-Index', hand: 'right', enNormal: 'u', enShift: 'U', mrNormal: 'ह', mrShift: 'ङ' },
    { code: 'KeyI', row: 1, finger: 'R-Middle', hand: 'right', enNormal: 'i', enShift: 'I', mrNormal: 'ग', mrShift: 'घ' },
    { code: 'KeyO', row: 1, finger: 'R-Ring', hand: 'right', enNormal: 'o', enShift: 'O', mrNormal: 'द', mrShift: 'ध' },
    { code: 'KeyP', row: 1, finger: 'R-Pinky', hand: 'right', enNormal: 'p', enShift: 'P', mrNormal: 'ज', mrShift: 'झ' },
    { code: 'BracketLeft', row: 1, finger: 'R-Pinky', hand: 'right', enNormal: '[', enShift: '{', mrNormal: 'ड', mrShift: 'ढ' },
    { code: 'BracketRight', row: 1, finger: 'R-Pinky', hand: 'right', enNormal: ']', enShift: '}', mrNormal: '़', mrShift: 'ञ' },
    { code: 'Backslash', row: 1, width: 'w-14', finger: 'R-Pinky', hand: 'right', enNormal: '\\', enShift: '|', mrNormal: 'ॉ', mrShift: 'ऑ' },
  ],
  // Row 2: Home Row (Most Important Foundational Row)
  [
    { code: 'CapsLock', row: 2, width: 'w-16', finger: 'L-Pinky', hand: 'left', enNormal: 'Caps', enShift: 'Caps', mrNormal: 'Caps', mrShift: 'Caps', isModifier: true },
    { code: 'KeyA', row: 2, finger: 'L-Pinky', hand: 'left', enNormal: 'a', enShift: 'A', mrNormal: 'ो', mrShift: 'ओ' },
    { code: 'KeyS', row: 2, finger: 'L-Ring', hand: 'left', enNormal: 's', enShift: 'S', mrNormal: 'े', mrShift: 'ए' },
    { code: 'KeyD', row: 2, finger: 'L-Middle', hand: 'left', enNormal: 'd', enShift: 'D', mrNormal: '्', mrShift: 'अ' },
    { code: 'KeyF', row: 2, finger: 'L-Index', hand: 'left', enNormal: 'f', enShift: 'F', mrNormal: 'ि', mrShift: 'इ' },
    { code: 'KeyG', row: 2, finger: 'L-Index', hand: 'left', enNormal: 'g', enShift: 'G', mrNormal: 'ु', mrShift: 'उ' },
    { code: 'KeyH', row: 2, finger: 'R-Index', hand: 'right', enNormal: 'h', enShift: 'H', mrNormal: 'प', mrShift: 'फ' },
    { code: 'KeyJ', row: 2, finger: 'R-Index', hand: 'right', enNormal: 'j', enShift: 'J', mrNormal: 'र', mrShift: 'ऱ' },
    { code: 'KeyK', row: 2, finger: 'R-Middle', hand: 'right', enNormal: 'k', enShift: 'K', mrNormal: 'क', mrShift: 'ख' },
    { code: 'KeyL', row: 2, finger: 'R-Ring', hand: 'right', enNormal: 'l', enShift: 'L', mrNormal: 'त', mrShift: 'थ' },
    { code: 'Semicolon', row: 2, finger: 'R-Pinky', hand: 'right', enNormal: ';', enShift: ':', mrNormal: 'च', mrShift: 'छ' },
    { code: 'Quote', row: 2, finger: 'R-Pinky', hand: 'right', enNormal: "'", enShift: '"', mrNormal: 'ट', mrShift: 'ठ' },
    { code: 'Enter', row: 2, width: 'w-20', finger: 'R-Pinky', hand: 'right', enNormal: 'Enter', enShift: 'Enter', mrNormal: 'Enter', mrShift: 'Enter', isModifier: true },
  ],
  // Row 3: Bottom Row
  [
    { code: 'ShiftLeft', row: 3, width: 'w-24', finger: 'L-Pinky', hand: 'left', enNormal: 'Shift', enShift: 'Shift', mrNormal: 'Shift', mrShift: 'Shift', isModifier: true },
    { code: 'KeyZ', row: 3, finger: 'L-Pinky', hand: 'left', enNormal: 'z', enShift: 'Z', mrNormal: '्र', mrShift: 'र्' },
    { code: 'KeyX', row: 3, finger: 'L-Ring', hand: 'left', enNormal: 'x', enShift: 'X', mrNormal: 'ं', mrShift: 'ँ' },
    { code: 'KeyC', row: 3, finger: 'L-Middle', hand: 'left', enNormal: 'c', enShift: 'C', mrNormal: 'म', mrShift: 'ण' },
    { code: 'KeyV', row: 3, finger: 'L-Index', hand: 'left', enNormal: 'v', enShift: 'V', mrNormal: 'न', mrShift: 'न' },
    { code: 'KeyB', row: 3, finger: 'L-Index', hand: 'left', enNormal: 'b', enShift: 'B', mrNormal: 'व', mrShift: 'व' },
    { code: 'KeyN', row: 3, finger: 'R-Index', hand: 'right', enNormal: 'n', enShift: 'N', mrNormal: 'ल', mrShift: 'ळ' },
    { code: 'KeyM', row: 3, finger: 'R-Index', hand: 'right', enNormal: 'm', enShift: 'M', mrNormal: 'स', mrShift: 'श' },
    { code: 'Comma', row: 3, finger: 'R-Middle', hand: 'right', enNormal: ',', enShift: '<', mrNormal: ',', mrShift: 'ष' },
    { code: 'Period', row: 3, finger: 'R-Ring', hand: 'right', enNormal: '.', enShift: '>', mrNormal: '.', mrShift: '।' },
    { code: 'Slash', row: 3, finger: 'R-Pinky', hand: 'right', enNormal: '/', enShift: '?', mrNormal: 'य', mrShift: '?' },
    { code: 'ShiftRight', row: 3, width: 'w-24', finger: 'R-Pinky', hand: 'right', enNormal: 'Shift', enShift: 'Shift', mrNormal: 'Shift', mrShift: 'Shift', isModifier: true },
  ],
  // Row 4: Spacebar Row
  [
    { code: 'Space', row: 4, width: 'w-80', finger: 'Thumb', hand: 'both', enNormal: 'Space', enShift: 'Space', mrNormal: 'Space (अंतर)', mrShift: 'Space (अंतर)' },
  ],
];

export const ALL_KEYS: KeyDef[] = KEYBOARD_ROWS.flat();

export const KEY_BY_CODE: Record<string, KeyDef> = Object.fromEntries(
  ALL_KEYS.map((k) => [k.code, k])
);

export interface TargetKeyInstruction {
  keyDef: KeyDef;
  needsShift: boolean;
  shiftCode: 'ShiftLeft' | 'ShiftRight' | null;
  displayKeyLabel: string;
  charDescription: string;
}

// Named descriptions for special Devanagari combining marks so beginners understand them immediately
export const MARATHI_CHAR_NAMES: Record<string, string> = {
  '्': 'हलंत / पाय मोडणे (Halant - Key D)',
  'ा': 'काना (Kana - Key E)',
  'ि': 'पहिली वेलांटी (First Velanti - Key F)',
  'ी': 'दुसरी वेलांटी (Second Velanti - Key R)',
  'ु': 'पहिला उकार (First Ukar - Key G)',
  'ू': 'दुसरा उकार (Second Ukar - Key T)',
  'े': 'एक मात्रा (Ek Matra - Key S)',
  'ै': 'दोन मात्रे (Don Matre - Key W)',
  'ो': 'काना आणि एक मात्रा (O Matra - Key A)',
  'ौ': 'काना आणि दोन मात्रे (Au Matra - Key Q)',
  'ं': 'अनुस्वार (Anusvara - Key X)',
  'ँ': 'चंद्रबिंदू (Chandrabindu - Shift + X)',
  'ः': 'विसर्ग (Visarga - Shift + -)',
  'ृ': 'ऋकार (Rukar - Key =)',
  'ॉ': 'अर्धा चंद्र आणि काना (Chandra O - Key `)',
  'ॅ': 'अर्धा चंद्र (Chandra E - Shift + 2)',
  ' ': 'Spacebar (अंतर)',
};

export function findKeyForChar(
  targetChar: string,
  language: 'en' | 'mr',
  upcomingSlice?: string
): TargetKeyInstruction | null {
  if (targetChar === ' ') {
    const spaceKey = KEY_BY_CODE['Space'];
    return {
      keyDef: spaceKey,
      needsShift: false,
      shiftCode: null,
      displayKeyLabel: 'Space',
      charDescription: language === 'mr' ? 'Spacebar (अंगठा)' : 'Spacebar (Thumb)',
    };
  }

  if (language === 'en') {
    for (const k of ALL_KEYS) {
      if (k.isModifier || k.code === 'Space') continue;
      if (k.enNormal === targetChar) {
        return {
          keyDef: k,
          needsShift: false,
          shiftCode: null,
          displayKeyLabel: k.enNormal.toUpperCase(),
          charDescription: `Press '${k.enNormal.toUpperCase()}'`,
        };
      }
      if (k.enShift === targetChar) {
        const shiftCode = k.hand === 'left' ? 'ShiftRight' : 'ShiftLeft';
        return {
          keyDef: k,
          needsShift: true,
          shiftCode,
          displayKeyLabel: `Shift + ${k.enNormal.toUpperCase()}`,
          charDescription: `Hold ${shiftCode === 'ShiftLeft' ? 'Left' : 'Right'} Shift + '${k.enNormal.toUpperCase()}'`,
        };
      }
    }
    return null;
  }

  // Marathi InScript lookup:
  // First check standard single-codepoint normal keys (preferring main letter rows over duplicates)
  const prioritizedKeys = [
    ...KEYBOARD_ROWS[2], // Home row first
    ...KEYBOARD_ROWS[1], // Top row
    ...KEYBOARD_ROWS[3], // Bottom row
    ...KEYBOARD_ROWS[0], // Number row
  ];

  // Check if upcomingSlice starts with a special 3-char conjunct that can also be typed step-by-step,
  // we still highlight the exact next individual character key so step-by-step never confuses the learner,
  // while mentioning the shortcut if applicable.
  for (const k of prioritizedKeys) {
    if (k.isModifier || k.code === 'Space') continue;
    if (k.mrNormal === targetChar) {
      const desc = MARATHI_CHAR_NAMES[targetChar] || `'${targetChar}' (Physical Key: ${k.enNormal.toUpperCase()})`;
      return {
        keyDef: k,
        needsShift: false,
        shiftCode: null,
        displayKeyLabel: `${k.mrNormal} (${k.enNormal.toUpperCase()})`,
        charDescription: desc,
      };
    }
  }

  for (const k of prioritizedKeys) {
    if (k.isModifier || k.code === 'Space') continue;
    if (k.mrShift === targetChar) {
      const shiftCode = k.hand === 'left' ? 'ShiftRight' : 'ShiftLeft';
      const desc = MARATHI_CHAR_NAMES[targetChar] || `'${targetChar}' (Shift + Physical Key ${k.enNormal.toUpperCase()})`;
      return {
        keyDef: k,
        needsShift: true,
        shiftCode,
        displayKeyLabel: `Shift + ${k.enNormal.toUpperCase()} → ${k.mrShift}`,
        charDescription: desc,
      };
    }
  }

  return null;
}

/**
 * Normalizes target text into an array of sequential Unicode code points (NFC)
 * so Marathi consonantal bases, halants, and matras are practiced in authentic InScript typing order.
 */
export function decomposeTextToCodePoints(text: string): string[] {
  const normalized = text.normalize('NFC').replace(/\r\n/g, ' ').replace(/\n/g, ' ');
  return Array.from(normalized);
}

/**
 * Groups code points into visual Devanagari/English grapheme clusters (or words)
 * for clean visual rendering while keeping exact codepoint index boundaries.
 */
export interface TokenSpan {
  text: string;
  startIndex: number;
  endIndex: number; // inclusive
  isSpace: boolean;
}

export function groupCodePointsIntoWords(codePoints: string[]): TokenSpan[] {
  const spans: TokenSpan[] = [];
  let i = 0;
  while (i < codePoints.length) {
    if (codePoints[i] === ' ') {
      spans.push({
        text: ' ',
        startIndex: i,
        endIndex: i,
        isSpace: true,
      });
      i++;
    } else {
      const start = i;
      let word = '';
      while (i < codePoints.length && codePoints[i] !== ' ') {
        word += codePoints[i];
        i++;
      }
      spans.push({
        text: word,
        startIndex: start,
        endIndex: i - 1,
        isSpace: false,
      });
    }
  }
  return spans;
}
