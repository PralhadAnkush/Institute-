import React from 'react';
import {
  FINGER_META,
  FingerId,
  KEYBOARD_ROWS,
  KeyDef,
  TargetKeyInstruction,
  KEY_BY_CODE,
} from '../data/inscriptMap';
import { LanguageMode } from '../data/curriculum';

interface VirtualKeyboardProps {
  language: LanguageMode;
  targetInstruction: TargetKeyInstruction | null;
  activeShiftPressed: boolean;
  lastPressedCode: string | null;
  lastPressCorrect: boolean | null;
  showFingerColors: boolean;
  onVirtualKeyPress?: (char: string, keyCode: string) => void;
}

interface VisualFingerSpec {
  id: FingerId;
  homeKeyEn: string;
  homeKeyMr: string;
  heightClass: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  hasBump?: boolean;
}

const LEFT_HAND_FINGERS: VisualFingerSpec[] = [
  {
    id: 'L-Pinky',
    homeKeyEn: 'A',
    homeKeyMr: 'ो',
    heightClass: 'h-14',
    colorBg: 'bg-rose-100',
    colorBorder: 'border-rose-300',
    colorText: 'text-rose-900',
  },
  {
    id: 'L-Ring',
    homeKeyEn: 'S',
    homeKeyMr: 'े',
    heightClass: 'h-18',
    colorBg: 'bg-amber-100',
    colorBorder: 'border-amber-300',
    colorText: 'text-amber-900',
  },
  {
    id: 'L-Middle',
    homeKeyEn: 'D',
    homeKeyMr: '्',
    heightClass: 'h-20',
    colorBg: 'bg-emerald-100',
    colorBorder: 'border-emerald-300',
    colorText: 'text-emerald-900',
  },
  {
    id: 'L-Index',
    homeKeyEn: 'F',
    homeKeyMr: 'ि',
    heightClass: 'h-16',
    colorBg: 'bg-sky-100',
    colorBorder: 'border-sky-300',
    colorText: 'text-sky-900',
    hasBump: true,
  },
];

const RIGHT_HAND_FINGERS: VisualFingerSpec[] = [
  {
    id: 'R-Index',
    homeKeyEn: 'J',
    homeKeyMr: 'र',
    heightClass: 'h-16',
    colorBg: 'bg-indigo-100',
    colorBorder: 'border-indigo-300',
    colorText: 'text-indigo-900',
    hasBump: true,
  },
  {
    id: 'R-Middle',
    homeKeyEn: 'K',
    homeKeyMr: 'क',
    heightClass: 'h-20',
    colorBg: 'bg-emerald-100',
    colorBorder: 'border-emerald-300',
    colorText: 'text-emerald-900',
  },
  {
    id: 'R-Ring',
    homeKeyEn: 'L',
    homeKeyMr: 'त',
    heightClass: 'h-18',
    colorBg: 'bg-amber-100',
    colorBorder: 'border-amber-300',
    colorText: 'text-amber-900',
  },
  {
    id: 'R-Pinky',
    homeKeyEn: ';',
    homeKeyMr: 'च',
    heightClass: 'h-14',
    colorBg: 'bg-rose-100',
    colorBorder: 'border-rose-300',
    colorText: 'text-rose-900',
  },
];

const HOME_ROW_CODES = new Set([
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyF',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Semicolon',
]);

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  language,
  targetInstruction,
  activeShiftPressed,
  lastPressedCode,
  lastPressCorrect,
  showFingerColors,
  onVirtualKeyPress,
}) => {
  const targetKeyCode = targetInstruction?.keyDef.code || null;
  const targetShiftCode = targetInstruction?.shiftCode || null;
  const effectiveShiftView = activeShiftPressed || Boolean(targetInstruction?.needsShift);

  const activeFingerId = targetInstruction?.keyDef.finger || null;
  const shiftFingerId: FingerId | null =
    targetShiftCode === 'ShiftLeft'
      ? 'L-Pinky'
      : targetShiftCode === 'ShiftRight'
      ? 'R-Pinky'
      : null;

  // Track the finger that corresponds to the actively pressed physical/virtual key
  const pressedKeyDef = lastPressedCode ? KEY_BY_CODE[lastPressedCode] || null : null;
  const pressedFingerId: FingerId | null = pressedKeyDef ? pressedKeyDef.finger : null;

  const activeTargetKeyLabel = targetInstruction
    ? language === 'mr'
      ? `${targetInstruction.keyDef.enNormal.toUpperCase()} (${
          targetInstruction.needsShift
            ? targetInstruction.keyDef.mrShift
            : targetInstruction.keyDef.mrNormal
        })`
      : targetInstruction.keyDef.enNormal.toUpperCase()
    : '';

  const handleKeyClick = (key: KeyDef) => {
    if (!onVirtualKeyPress || key.isModifier) return;

    // Trigger subtle haptic vibration on devices supporting navigator.vibrate
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (_) {
        // Safe ignore
      }
    }

    if (key.code === 'Space') {
      onVirtualKeyPress(' ', 'Space');
      return;
    }

    const char =
      language === 'mr'
        ? effectiveShiftView
          ? key.mrShift
          : key.mrNormal
        : effectiveShiftView
        ? key.enShift
        : key.enNormal;

    onVirtualKeyPress(char, key.code);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 select-none shadow-xs">
      <div className="flex flex-col xl:flex-row items-center justify-center gap-4">
        {/* LEFT VISUAL HAND (ASDF + Thumb) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-end gap-1.5 px-2">
            {LEFT_HAND_FINGERS.map((f) => {
              const isMainActive = activeFingerId === f.id;
              const isShiftActive = shiftFingerId === f.id;
              const isActive = isMainActive || isShiftActive;
              const isPressed = pressedFingerId === f.id;

              return (
                <div key={f.id} className="flex flex-col items-center">
                  {/* Active Target Badge Above Fingertip */}
                  <div className="h-5 flex items-center justify-center mb-0.5">
                    {isMainActive && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold font-devanagari whitespace-nowrap shadow-xs animate-bounce">
                        {activeTargetKeyLabel}
                      </span>
                    )}
                    {isShiftActive && !isMainActive && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold whitespace-nowrap shadow-xs">
                        Shift
                      </span>
                    )}
                  </div>

                  {/* Finger Column with Haptic Bounce & Glow */}
                  <div
                    className={`w-9 ${f.heightClass} rounded-t-full border-2 flex flex-col items-center justify-between py-1.5 transition-all duration-100 ${
                      isPressed
                        ? lastPressCorrect === false
                          ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] translate-y-1 scale-95'
                          : 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.7)] translate-y-1 scale-95'
                        : isActive
                        ? 'bg-blue-600 border-blue-700 text-white shadow-[0_0_16px_rgba(37,99,235,0.6)] ring-2 ring-blue-300 -translate-y-1.5'
                        : `${f.colorBg} ${f.colorBorder} ${f.colorText}`
                    }`}
                  >
                    {/* Fingernail / Home Key Cap */}
                    <div
                      className={`w-6 h-6 rounded-full flex flex-col items-center justify-center text-[10px] font-bold leading-none ${
                        isActive || isPressed
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'bg-white/90 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono">{f.homeKeyEn}</span>
                      {language === 'mr' && (
                        <span className="text-[9px] font-devanagari">{f.homeKeyMr}</span>
                      )}
                    </div>

                    {f.hasBump && (
                      <span
                        className={`w-3 h-0.5 rounded-full ${
                          isActive || isPressed ? 'bg-white' : 'bg-slate-500'
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Left Thumb */}
            <div className="flex flex-col items-center ml-0.5">
              <div className="h-5 flex items-center justify-center mb-0.5">
                {activeFingerId === 'Thumb' && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold animate-bounce">
                    Space
                  </span>
                )}
              </div>
              <div
                className={`w-9 h-11 rounded-t-2xl rounded-br-xl border-2 rotate-12 origin-bottom-left flex items-center justify-center transition-all duration-100 ${
                  pressedKeyDef?.code === 'Space'
                    ? lastPressCorrect === false
                      ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] translate-y-1'
                      : 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.7)] translate-y-1'
                    : activeFingerId === 'Thumb'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-[0_0_16px_rgba(37,99,235,0.6)] ring-2 ring-blue-300 -translate-y-1'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-[9px] font-bold">Space</span>
              </div>
            </div>
          </div>

          {/* Left Palm Base */}
          <div className="w-44 h-7 bg-slate-100 border-2 border-t-0 border-slate-300 rounded-b-3xl flex items-center justify-center text-[11px] font-bold text-slate-600 shadow-2xs">
            Left Hand (A S D F)
          </div>
        </div>

        {/* CENTER: PHYSICAL KEYBOARD GRID WITH HAPTIC-LIKE ANIMATIONS & GLOW */}
        <div className="flex flex-col gap-1.5 items-center overflow-x-auto py-1">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center gap-1.5 w-full min-w-[640px]">
              {row.map((key) => {
                const isTargetKey = key.code === targetKeyCode;
                const isTargetShift = key.code === targetShiftCode;
                const isHighlighted = isTargetKey || isTargetShift;
                const isJustPressed = key.code === lastPressedCode;
                const fingerMeta = FINGER_META[key.finger];
                const isHomeBump = key.code === 'KeyF' || key.code === 'KeyJ';
                const isHomeRowRest = HOME_ROW_CODES.has(key.code);

                // Base resting style with 3D keycap tactile bevel
                let containerStyle =
                  'bg-white border-slate-300 text-slate-800 shadow-[0_3px_0_0_#cbd5e1] hover:bg-slate-50 hover:shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] active:shadow-none active:scale-[0.96]';

                if (showFingerColors && !key.isModifier && !isHighlighted && !isJustPressed) {
                  containerStyle = `${fingerMeta.bgClass} ${fingerMeta.borderClass} ${fingerMeta.textClass} shadow-[0_3px_0_0_#cbd5e1]`;
                }

                if (isHighlighted && !isJustPressed) {
                  // Glowing blue target key with pulsing halo
                  containerStyle =
                    'bg-gradient-to-b from-blue-600 to-blue-700 border-blue-800 text-white -translate-y-0.5 shadow-[0_0_18px_rgba(37,99,235,0.7),0_3px_0_0_#1e40af] ring-2 ring-blue-300 ring-offset-1 animate-pulse';
                }

                if (isJustPressed) {
                  // Haptic-like depressed mechanical switch with intense glow effect
                  if (lastPressCorrect === false) {
                    containerStyle =
                      'bg-gradient-to-b from-rose-500 to-rose-600 border-rose-700 text-white translate-y-[3px] scale-[0.93] shadow-[0_0_22px_rgba(244,63,94,0.95)] ring-2 ring-rose-400 ring-offset-1';
                  } else {
                    containerStyle =
                      'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-700 text-white translate-y-[3px] scale-[0.93] shadow-[0_0_22px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400 ring-offset-1';
                  }
                }

                const widthClass = key.width ? key.width : 'w-11';

                return (
                  <button
                    key={key.code}
                    type="button"
                    onClick={() => handleKeyClick(key)}
                    className={`relative h-10 ${widthClass} rounded-xl border border-b-[3px] px-1 py-0.5 flex flex-col justify-between transition-all duration-75 select-none ${containerStyle} ${
                      isHomeRowRest && !isHighlighted && !isJustPressed ? 'ring-1 ring-slate-400/50' : ''
                    }`}
                  >
                    {/* Ripple glow ping on press */}
                    {isJustPressed && (
                      <span className="absolute inset-0 rounded-xl bg-white/40 animate-ping pointer-events-none" />
                    )}

                    {key.isModifier || key.code === 'Space' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
                          {key.enNormal}
                        </span>
                      </div>
                    ) : language === 'mr' ? (
                      <>
                        <div className="flex items-center justify-between w-full leading-none">
                          <span
                            className={`text-[9px] font-devanagari ${
                              isHighlighted || isJustPressed
                                ? 'text-white font-semibold'
                                : effectiveShiftView
                                ? 'text-blue-700 font-bold'
                                : 'opacity-60'
                            }`}
                          >
                            {key.mrShift}
                          </span>
                          <span
                            className={`text-[9px] font-mono ${
                              isHighlighted || isJustPressed ? 'text-white font-bold' : 'opacity-55'
                            }`}
                          >
                            {key.enNormal.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-center w-full leading-none pb-0.5">
                          <span className="text-sm font-bold font-devanagari">
                            {effectiveShiftView ? key.mrShift : key.mrNormal}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between w-full leading-none">
                          <span
                            className={`text-[9px] font-mono ${
                              isHighlighted || isJustPressed ? 'text-white font-semibold' : 'opacity-50'
                            }`}
                          >
                            {key.enShift !== key.enNormal.toUpperCase() ? key.enShift : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-center w-full leading-none pb-0.5">
                          <span className="text-xs font-bold font-mono">
                            {effectiveShiftView ? key.enShift : key.enNormal.toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}

                    {isHomeBump && (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                          isHighlighted || isJustPressed ? 'bg-white shadow-2xs' : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* RIGHT VISUAL HAND (Thumb + JKL;) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-end gap-1.5 px-2">
            {/* Right Thumb */}
            <div className="flex flex-col items-center mr-0.5">
              <div className="h-5 flex items-center justify-center mb-0.5">
                {activeFingerId === 'Thumb' && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold animate-bounce">
                    Space
                  </span>
                )}
              </div>
              <div
                className={`w-9 h-11 rounded-t-2xl rounded-bl-xl border-2 -rotate-12 origin-bottom-right flex items-center justify-center transition-all duration-100 ${
                  pressedKeyDef?.code === 'Space'
                    ? lastPressCorrect === false
                      ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] translate-y-1'
                      : 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.7)] translate-y-1'
                    : activeFingerId === 'Thumb'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-[0_0_16px_rgba(37,99,235,0.6)] ring-2 ring-blue-300 -translate-y-1'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-[9px] font-bold">Space</span>
              </div>
            </div>

            {RIGHT_HAND_FINGERS.map((f) => {
              const isMainActive = activeFingerId === f.id;
              const isShiftActive = shiftFingerId === f.id;
              const isActive = isMainActive || isShiftActive;
              const isPressed = pressedFingerId === f.id;

              return (
                <div key={f.id} className="flex flex-col items-center">
                  {/* Active Target Badge Above Fingertip */}
                  <div className="h-5 flex items-center justify-center mb-0.5">
                    {isMainActive && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold font-devanagari whitespace-nowrap shadow-xs animate-bounce">
                        {activeTargetKeyLabel}
                      </span>
                    )}
                    {isShiftActive && !isMainActive && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold whitespace-nowrap shadow-xs">
                        Shift
                      </span>
                    )}
                  </div>

                  {/* Finger Column with Haptic Bounce & Glow */}
                  <div
                    className={`w-9 ${f.heightClass} rounded-t-full border-2 flex flex-col items-center justify-between py-1.5 transition-all duration-100 ${
                      isPressed
                        ? lastPressCorrect === false
                          ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] translate-y-1 scale-95'
                          : 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.7)] translate-y-1 scale-95'
                        : isActive
                        ? 'bg-blue-600 border-blue-700 text-white shadow-[0_0_16px_rgba(37,99,235,0.6)] ring-2 ring-blue-300 -translate-y-1.5'
                        : `${f.colorBg} ${f.colorBorder} ${f.colorText}`
                    }`}
                  >
                    {/* Fingernail / Home Key Cap */}
                    <div
                      className={`w-6 h-6 rounded-full flex flex-col items-center justify-center text-[10px] font-bold leading-none ${
                        isActive || isPressed
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'bg-white/90 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono">{f.homeKeyEn}</span>
                      {language === 'mr' && (
                        <span className="text-[9px] font-devanagari">{f.homeKeyMr}</span>
                      )}
                    </div>

                    {f.hasBump && (
                      <span
                        className={`w-3 h-0.5 rounded-full ${
                          isActive || isPressed ? 'bg-white' : 'bg-slate-500'
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Palm Base */}
          <div className="w-44 h-7 bg-slate-100 border-2 border-t-0 border-slate-300 rounded-b-3xl flex items-center justify-center text-[11px] font-bold text-slate-600 shadow-2xs">
            Right Hand (J K L ;)
          </div>
        </div>
      </div>
    </div>
  );
};
