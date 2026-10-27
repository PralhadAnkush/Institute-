import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Award,
  Keyboard,
  Lock,
  Unlock,
  Flag,
  Shuffle,
  Delete,
  X,
} from 'lucide-react';
import {
  KEY_BY_CODE,
  decomposeTextToCodePoints,
  findKeyForChar,
} from '../data/inscriptMap';
import { LanguageMode, UNLIMITED_PASSAGE_POOL } from '../data/curriculum';
import { VirtualKeyboard } from './VirtualKeyboard';
import { KeyHitMiss, SessionModeType } from '../utils/storage';
import { playKeyClick, playErrorSound, playSuccessChime } from '../utils/sound';

export interface SessionCompletionPayload {
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  keystrokes: number;
  errors: number;
  backspaceCount: number;
  marksObtained: number;
  durationSeconds: number;
  keyStats: Record<string, KeyHitMiss>;
  examPassed?: boolean;
}

interface TypingStageProps {
  language: LanguageMode;
  mode: SessionModeType;
  title: string;
  targetText: string;
  requiredReps?: number;
  isAlreadyUnlockedNext?: boolean;
  timeLimitSeconds?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showKeyboard: boolean;
  onToggleKeyboard: () => void;
  showFingerColors: boolean;
  onToggleFingerColors: () => void;
  backspaceEnabled: boolean;
  onToggleBackspace: () => void;
  onComplete: (payload: SessionCompletionPayload) => void;
  onNextItem?: () => void;
  onRequestNewPassage?: () => void;
}

export const TypingStage: React.FC<TypingStageProps> = ({
  language,
  mode,
  title,
  targetText,
  requiredReps = 1,
  isAlreadyUnlockedNext = false,
  timeLimitSeconds,
  soundEnabled,
  onToggleSound,
  showKeyboard,
  onToggleKeyboard,
  showFingerColors,
  onToggleFingerColors,
  backspaceEnabled,
  onToggleBackspace,
  onComplete,
  onNextItem,
  onRequestNewPassage,
}) => {
  const [dynamicText, setDynamicText] = useState<string>(targetText);
  const [unlimitedChunkIdx, setUnlimitedChunkIdx] = useState<number>(1);

  const effectiveTargetReps = mode === 'lesson' ? Math.max(1, requiredReps) : 1;
  const [completedReps, setCompletedReps] = useState<number>(0);

  const targetCodePoints = useMemo(() => decomposeTextToCodePoints(dynamicText), [dynamicText]);

  const [typedCodePoints, setTypedCodePoints] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [completedRepsCharCount, setCompletedRepsCharCount] = useState<number>(0);
  const [completedRepsErrors, setCompletedRepsErrors] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [activeShiftPressed, setActiveShiftPressed] = useState<boolean>(false);
  const [lastPressedCode, setLastPressedCode] = useState<string | null>(null);
  const [lastPressCorrect, setLastPressCorrect] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [keyStats, setKeyStats] = useState<Record<string, KeyHitMiss>>({});
  const [fontSizeLevel, setFontSizeLevel] = useState<'md' | 'lg' | 'xl'>('lg');

  const stageRef = useRef<HTMLDivElement>(null);
  const typedEndRef = useRef<HTMLSpanElement>(null);
  const leftPassageBoxRef = useRef<HTMLDivElement>(null);
  const completionFiredRef = useRef<boolean>(false);
  const pressedTimerRef = useRef<number | null>(null);

  const passageFontClass = useMemo(() => {
    if (language === 'mr') {
      switch (fontSizeLevel) {
        case 'md':
          return 'text-[20px] leading-[2.1] font-devanagari';
        case 'xl':
          return 'text-[28px] leading-[2.4] font-devanagari';
        case 'lg':
        default:
          return 'text-[23px] leading-[2.2] font-devanagari';
      }
    } else {
      switch (fontSizeLevel) {
        case 'md':
          return 'text-[17px] leading-[1.8] font-mono-tabular';
        case 'xl':
          return 'text-[24px] leading-[2.0] font-mono-tabular';
        case 'lg':
        default:
          return 'text-[20px] leading-[1.85] font-mono-tabular';
      }
    }
  }, [language, fontSizeLevel]);

  const currentIndex = typedCodePoints.length;

  const resetSession = useCallback(() => {
    if (pressedTimerRef.current) {
      window.clearTimeout(pressedTimerRef.current);
    }
    setDynamicText(targetText);
    setUnlimitedChunkIdx(1);
    setCompletedReps(0);
    setTypedCodePoints([]);
    setStartTime(null);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setCompletedRepsCharCount(0);
    setCompletedRepsErrors(0);
    setBackspaceCount(0);
    setLastPressedCode(null);
    setLastPressCorrect(null);
    setIsCompleted(false);
    setShowResultModal(false);
    setKeyStats({});
    completionFiredRef.current = false;
    if (leftPassageBoxRef.current) {
      leftPassageBoxRef.current.scrollTop = 0;
    }
    setTimeout(() => {
      stageRef.current?.focus();
    }, 30);
  }, [targetText]);

  useEffect(() => {
    resetSession();
  }, [targetText, language, timeLimitSeconds, mode, resetSession]);



  useEffect(() => {
    if (!startTime || isCompleted) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      const secs = Math.max(1, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(secs);

      if (timeLimitSeconds && secs >= timeLimitSeconds) {
        setIsCompleted(true);
        setShowResultModal(true);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [startTime, isCompleted, timeLimitSeconds]);

  const currentPassErrors = useMemo(() => {
    let errs = 0;
    for (let i = 0; i < typedCodePoints.length; i++) {
      if (typedCodePoints[i] !== targetCodePoints[i]) {
        errs++;
      }
    }
    return errs;
  }, [typedCodePoints, targetCodePoints]);

  const totalErrors = completedRepsErrors + currentPassErrors;
  const totalTypedChars = completedRepsCharCount + typedCodePoints.length;
  const totalCorrectChars = Math.max(0, totalTypedChars - totalErrors);

  const metrics = useMemo(() => {
    const minutes = Math.max(elapsedSeconds, 1) / 60;
    const grossWpm = startTime ? Math.round(totalTypedChars / 5 / minutes) : 0;
    const uncorrectedPenalty = Math.round(totalErrors / 5 / minutes);
    const netWpm = Math.max(0, grossWpm - uncorrectedPenalty);
    const accuracy =
      totalTypedChars > 0
        ? Math.max(0, Math.min(100, Math.round((totalCorrectChars / totalTypedChars) * 100)))
        : 100;
    const remainingSeconds = timeLimitSeconds
      ? Math.max(0, timeLimitSeconds - elapsedSeconds)
      : elapsedSeconds;

    const totalTargetChars =
      mode === 'lesson'
        ? targetCodePoints.length * effectiveTargetReps
        : targetCodePoints.length;
    const completionRatio =
      totalTargetChars > 0 ? Math.min(1, totalTypedChars / totalTargetChars) : 0;

    const grossMarksFromCompletion =
      mode === 'unlimited'
        ? 40
        : Math.max(
            totalTypedChars > 0 ? Math.min(40, Math.round(completionRatio * 40 * 10) / 10) : 0,
            0
          );

    const mistakePenalty = totalErrors * 1 + backspaceCount * 0.5;
    const livePoolMarks = Math.max(0, Math.round((40 - mistakePenalty) * 10) / 10);

    const earnedMarksOutOf40 =
      totalErrors > 24
        ? 0
        : Math.max(0, Math.round((grossMarksFromCompletion - mistakePenalty) * 10) / 10);

    const displayMarks = isCompleted ? earnedMarksOutOf40 : livePoolMarks;

    return {
      grossWpm,
      netWpm,
      accuracy,
      remainingSeconds,
      mistakePenalty,
      earnedMarksOutOf40,
      displayMarks,
    };
  }, [
    elapsedSeconds,
    startTime,
    totalTypedChars,
    totalErrors,
    totalCorrectChars,
    timeLimitSeconds,
    mode,
    targetCodePoints.length,
    effectiveTargetReps,
    backspaceCount,
    isCompleted,
  ]);

  useEffect(() => {
    if (isCompleted && !completionFiredRef.current) {
      completionFiredRef.current = true;
      setShowResultModal(true);
      if (soundEnabled) {
        playSuccessChime();
      }
      const examPassed = metrics.earnedMarksOutOf40 >= 16;

      onComplete({
        netWpm: metrics.netWpm,
        grossWpm: metrics.grossWpm,
        accuracy: metrics.accuracy,
        keystrokes: totalKeystrokes,
        errors: totalErrors,
        backspaceCount,
        marksObtained: metrics.earnedMarksOutOf40,
        durationSeconds: Math.max(1, elapsedSeconds),
        keyStats,
        examPassed,
      });
    }
  }, [
    isCompleted,
    soundEnabled,
    metrics,
    onComplete,
    totalKeystrokes,
    totalErrors,
    backspaceCount,
    elapsedSeconds,
    keyStats,
  ]);

  useEffect(() => {
    if (typedEndRef.current) {
      typedEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
    if (leftPassageBoxRef.current && targetCodePoints.length > 0) {
      const box = leftPassageBoxRef.current;
      const ratio = Math.min(1, currentIndex / targetCodePoints.length);
      const maxScroll = box.scrollHeight - box.clientHeight;
      if (maxScroll > 0) {
        box.scrollTop = Math.max(0, ratio * maxScroll - 20);
      }
    }
  }, [currentIndex, targetCodePoints.length]);

  const targetChar = targetCodePoints[currentIndex] || '';
  const upcomingSlice = targetCodePoints.slice(currentIndex, currentIndex + 3).join('');
  const targetInstruction = useMemo(() => {
    if (!targetChar || isCompleted) return null;
    return findKeyForChar(targetChar, language, upcomingSlice);
  }, [targetChar, language, upcomingSlice, isCompleted]);

  const processCharacterInput = useCallback(
    (inputStr: string, physicalCode: string) => {
      if (isCompleted || currentIndex >= targetCodePoints.length) return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      const inputCodePoints = Array.from(inputStr.normalize('NFC'));
      const expectedSingle = targetCodePoints[currentIndex];
      const expectedMulti = targetCodePoints
        .slice(currentIndex, currentIndex + inputCodePoints.length)
        .join('');

      setTotalKeystrokes((prev) => prev + 1);

      // Trigger tactile haptic vibration & on-screen key depression with spring-back
      if (pressedTimerRef.current) {
        window.clearTimeout(pressedTimerRef.current);
      }
      setLastPressedCode(physicalCode);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch (_) {
          // ignore
        }
      }
      pressedTimerRef.current = window.setTimeout(() => {
        setLastPressedCode(null);
      }, 180);

      const isMultiMatch =
        inputCodePoints.length > 1 && inputCodePoints.join('') === expectedMulti;
      const isSingleMatch = inputStr === expectedSingle;

      const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const asciiDigitIndex = '0123456789'.indexOf(inputStr);
      const isDigitEquivalent =
        language === 'mr' &&
        asciiDigitIndex !== -1 &&
        devanagariDigits[asciiDigitIndex] === expectedSingle;

      const isCorrect = isMultiMatch || isSingleMatch || isDigitEquivalent;

      if (isCorrect) {
        if (soundEnabled) {
          playKeyClick(expectedSingle === ' ');
        }
        setLastPressCorrect(true);
        setKeyStats((prev) => {
          const stat = prev[expectedSingle] || { hits: 0, misses: 0 };
          return {
            ...prev,
            [expectedSingle]: { hits: stat.hits + 1, misses: stat.misses },
          };
        });
      } else {
        if (soundEnabled) {
          playErrorSound();
        }
        setLastPressCorrect(false);
        setKeyStats((prev) => {
          const stat = prev[expectedSingle] || { hits: 0, misses: 0 };
          return {
            ...prev,
            [expectedSingle]: { hits: stat.hits, misses: stat.misses + 1 },
          };
        });
      }

      const charsToAdd = isMultiMatch
        ? inputCodePoints
        : isDigitEquivalent
        ? [expectedSingle]
        : inputCodePoints;

      const nextTyped = [...typedCodePoints, ...charsToAdd];

      if (nextTyped.length >= targetCodePoints.length) {
        const nextRepCount = completedReps + 1;
        setCompletedReps(nextRepCount);

        if (mode === 'lesson' && nextRepCount < effectiveTargetReps) {
          if (soundEnabled) {
            playSuccessChime();
          }
          let repErrs = 0;
          for (let i = 0; i < nextTyped.length; i++) {
            if (nextTyped[i] !== targetCodePoints[i]) repErrs++;
          }
          setCompletedRepsCharCount((prev) => prev + nextTyped.length);
          setCompletedRepsErrors((prev) => prev + repErrs);
          setTypedCodePoints([]);
        } else if (mode === 'unlimited') {
          if (soundEnabled) {
            playSuccessChime();
          }
          let passErrs = 0;
          for (let i = 0; i < nextTyped.length; i++) {
            if (nextTyped[i] !== targetCodePoints[i]) passErrs++;
          }
          setCompletedRepsCharCount((prev) => prev + nextTyped.length);
          setCompletedRepsErrors((prev) => prev + passErrs);
          setTypedCodePoints([]);

          const pool = UNLIMITED_PASSAGE_POOL[language];
          const nextIdx = (unlimitedChunkIdx + Math.floor(Math.random() * (pool.length - 1)) + 1) % pool.length;
          setDynamicText(pool[nextIdx]);
          setUnlimitedChunkIdx((prev) => prev + 1);
          if (leftPassageBoxRef.current) {
            leftPassageBoxRef.current.scrollTop = 0;
          }
        } else {
          setTypedCodePoints(nextTyped);
          setIsCompleted(true);
          setShowResultModal(true);
        }
      } else {
        setTypedCodePoints(nextTyped);
      }
    },
    [
      completedReps,
      currentIndex,
      effectiveTargetReps,
      isCompleted,
      language,
      mode,
      soundEnabled,
      startTime,
      targetCodePoints,
      typedCodePoints,
    ]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Shift') {
      setActiveShiftPressed(true);
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'CapsLock') return;

    if (e.code === 'Space') {
      e.preventDefault();
      processCharacterInput(' ', 'Space');
      return;
    }

    if (e.code === 'Backspace' || e.code === 'Delete') {
      e.preventDefault();
      if (pressedTimerRef.current) {
        window.clearTimeout(pressedTimerRef.current);
      }
      setLastPressedCode('Backspace');
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch (_) {}
      }
      pressedTimerRef.current = window.setTimeout(() => {
        setLastPressedCode(null);
      }, 180);

      if (!backspaceEnabled) return;

      if (typedCodePoints.length > 0 && !isCompleted) {
        setBackspaceCount((prev) => prev + 1);
        setTypedCodePoints((prev) => prev.slice(0, -1));
      }
      return;
    }

    const mappedKey = KEY_BY_CODE[e.code];
    if (mappedKey && !mappedKey.isModifier) {
      e.preventDefault();
      if (language === 'mr') {
        const isDirectDevanagari = /[\u0900-\u097F]/.test(e.key);
        const mappedChar = isDirectDevanagari
          ? e.key
          : e.shiftKey
          ? mappedKey.mrShift
          : mappedKey.mrNormal;
        processCharacterInput(mappedChar, e.code);
      } else {
        const mappedChar = e.shiftKey ? mappedKey.enShift : mappedKey.enNormal;
        processCharacterInput(mappedChar, e.code);
      }
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      processCharacterInput(e.key, e.code);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Shift') {
      setActiveShiftPressed(false);
    }
  };

  const handleManualSubmit = () => {
    if (!startTime) {
      setStartTime(Date.now() - 1000);
      setElapsedSeconds(1);
    }
    setIsCompleted(true);
    setShowResultModal(true);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const canGoNextLesson =
    isAlreadyUnlockedNext || (mode === 'lesson' && completedReps >= effectiveTargetReps);

  const liveTypedString = useMemo(() => typedCodePoints.join(''), [typedCodePoints]);

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className="outline-none flex flex-col gap-2.5"
    >
      {/* Minimal 1-Word Telemetry & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold text-slate-900 font-devanagari">{title}</span>

          {mode === 'lesson' && (
            <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
              <span className="text-slate-400">Reps:</span>
              <span className="font-bold text-blue-600">
                {completedReps}/{effectiveTargetReps}
              </span>
            </div>
          )}

          {mode === 'unlimited' && (
            <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
              <span className="text-slate-400">Passage:</span>
              <span className="font-bold text-blue-600">#{unlimitedChunkIdx}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
            <span className="text-slate-400">Marks:</span>
            <span
              className={`font-bold ${
                metrics.displayMarks >= 16 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {metrics.displayMarks}/40
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
            <span className="text-slate-400">WPM:</span>
            <span className="font-bold text-blue-600">{metrics.netWpm}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
            <span className="text-slate-400">Time:</span>
            <span className="font-bold text-slate-900">{formatTimer(metrics.remainingSeconds)}</span>
          </div>
        </div>

        {/* 1-Word Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleBackspace}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
              backspaceEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <Delete className="w-3.5 h-3.5" />
            <span>{backspaceEnabled ? 'Backspace' : 'Locked'}</span>
          </button>

          {onRequestNewPassage && (
            <button
              type="button"
              onClick={() => {
                if (mode === 'unlimited') {
                  const pool = UNLIMITED_PASSAGE_POOL[language];
                  const nextIdx = (unlimitedChunkIdx + Math.floor(Math.random() * (pool.length - 1)) + 1) % pool.length;
                  setDynamicText(pool[nextIdx]);
                  setUnlimitedChunkIdx((prev) => prev + 1);
                  setTypedCodePoints([]);
                  if (leftPassageBoxRef.current) leftPassageBoxRef.current.scrollTop = 0;
                }
                onRequestNewPassage();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualSubmit}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>

          <button
            type="button"
            onClick={resetSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {mode === 'lesson' && onNextItem && (
            <button
              type="button"
              disabled={!canGoNextLesson}
              onClick={onNextItem}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                canGoNextLesson
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              {canGoNextLesson ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Next</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleFingerColors}
            className={`p-1 rounded-lg border transition-colors ${
              showFingerColors
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showFingerColors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleKeyboard}
            className={`p-1 rounded-lg border transition-colors ${
              showKeyboard
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Large High-Clarity Passage & Typing Boxes */}
      <div
        onClick={() => stageRef.current?.focus()}
        className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch cursor-text flex-1"
      >
        {/* LEFT: Spacious High-Clarity Reference Passage */}
        <div className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[250px] sm:min-h-[280px] md:min-h-[310px] max-h-[440px] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Passage</span>
              <span className="text-xs text-slate-400 font-mono-tabular font-medium">
                ({targetCodePoints.length} chars)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'lesson' && (
                <span className="text-xs font-mono-tabular text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {Math.min(completedReps + 1, effectiveTargetReps)}/{effectiveTargetReps}
                </span>
              )}
              {mode === 'unlimited' && (
                <span className="text-xs font-mono-tabular text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Passage #{unlimitedChunkIdx}
                </span>
              )}

              {/* Text Size Control */}
              <button
                type="button"
                title="Change Text Size"
                onClick={(e) => {
                  e.stopPropagation();
                  setFontSizeLevel((curr) => (curr === 'xl' ? 'md' : curr === 'md' ? 'lg' : 'xl'));
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[11px]">Size:</span>
                <span className="text-blue-600 uppercase text-[11px] font-extrabold">{fontSizeLevel}</span>
              </button>
            </div>
          </div>

          <div
            ref={leftPassageBoxRef}
            className={`tracking-wide select-none flex-1 overflow-y-auto pr-2 text-slate-900 whitespace-pre-wrap break-words font-medium ${passageFontClass}`}
          >
            {dynamicText}
          </div>
        </div>

        {/* RIGHT: Spacious High-Clarity Live Typing Sheet */}
        <div className="bg-white border-2 border-blue-600 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[250px] sm:min-h-[280px] md:min-h-[310px] max-h-[440px] shadow-xs ring-2 ring-blue-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-bold text-blue-700">Type</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 font-mono-tabular">
                Accuracy: <strong className="text-blue-700">{metrics.accuracy}%</strong>
              </span>
              <span className="text-xs text-slate-500 font-mono-tabular bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {totalKeystrokes} keys
              </span>
            </div>
          </div>

          <div
            className={`tracking-wide flex-1 overflow-y-auto pr-2 rounded-xl bg-blue-50/20 p-3.5 border border-blue-100 min-h-[140px] ${passageFontClass}`}
          >
            {liveTypedString ? (
              <span className="text-slate-900 whitespace-pre-wrap break-words font-medium">
                {liveTypedString}
              </span>
            ) : (
              <span className="text-slate-400 italic">Type...</span>
            )}
            <span
              ref={typedEndRef}
              className="inline-block w-0.5 h-6 bg-blue-600 align-middle ml-0.5 shadow-[0_0_8px_rgba(37,99,235,0.9)] animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* Visual Keyboard Directly Below */}
      {showKeyboard && (
        <VirtualKeyboard
          language={language}
          targetInstruction={targetInstruction}
          activeShiftPressed={activeShiftPressed}
          lastPressedCode={lastPressedCode}
          lastPressCorrect={lastPressCorrect}
          showFingerColors={showFingerColors}
          onVirtualKeyPress={(char, code) => processCharacterInput(char, code)}
        />
      )}

      {/* Result Pop-Up Modal (1-Word Labels) */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-blue-600 rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    metrics.earnedMarksOutOf40 >= 16
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {mode === 'exam' || mode === 'practice-7m' ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-mono-tabular">
                  {metrics.earnedMarksOutOf40 >= 16 ? 'PASS' : 'FAIL'} — {metrics.earnedMarksOutOf40}/40
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Marks</div>
                <div
                  className={`text-xl font-bold font-mono-tabular mt-0.5 ${
                    metrics.earnedMarksOutOf40 >= 16 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {metrics.earnedMarksOutOf40}/40
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">WPM</div>
                <div className="text-xl font-bold text-blue-600 font-mono-tabular mt-0.5">
                  {metrics.netWpm}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Accuracy</div>
                <div className="text-xl font-bold text-emerald-600 font-mono-tabular mt-0.5">
                  {metrics.accuracy}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Mistakes</div>
                <div className="text-xl font-bold text-red-600 font-mono-tabular mt-0.5">
                  {totalErrors}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Backspace</div>
                <div className="text-xl font-bold text-amber-600 font-mono-tabular mt-0.5">
                  {backspaceCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Penalty</div>
                <div className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5">
                  -{metrics.mistakePenalty}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetSession}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>

              {onRequestNewPassage && (
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    onRequestNewPassage();
                  }}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              )}

              {onNextItem && canGoNextLesson && (
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    onNextItem();
                  }}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
