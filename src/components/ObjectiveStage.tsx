import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Flag,
  RotateCcw,
  X,
} from 'lucide-react';
import { LanguageMode } from '../data/curriculum';
import {
  GCC_TBC_OBJECTIVE_QUESTIONS,
  ObjectiveQuestion,
  generateRandomObjectiveSet,
  getQuestionOptions,
  getQuestionText,
} from '../data/objectiveQuestions';
import { playErrorSound, playKeyClick, playSuccessChime } from '../utils/sound';

interface ObjectiveStageProps {
  language: LanguageMode;
  initialSubMode?: 'test' | 'practice';
  soundEnabled: boolean;
}

const TOPICS = ['All', 'Computer', 'Windows', 'Word', 'Excel', 'PowerPoint', 'Internet'] as const;
type TopicFilter = (typeof TOPICS)[number];

export const ObjectiveStage: React.FC<ObjectiveStageProps> = ({
  language,
  initialSubMode = 'test',
  soundEnabled,
}) => {
  const [subMode, setSubMode] = useState<'test' | 'practice'>(initialSubMode);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('All');

  // 25-Question Test Set (50 Marks, 2 Marks each, 20 Marks passing, 25 Min timer)
  const [testQuestions, setTestQuestions] = useState<ObjectiveQuestion[]>(() =>
    generateRandomObjectiveSet(25)
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  useEffect(() => {
    setSubMode(initialSubMode);
  }, [initialSubMode]);

  const activeQuestions = useMemo(() => {
    if (subMode === 'test') {
      return testQuestions;
    }
    if (topicFilter === 'All') {
      return GCC_TBC_OBJECTIVE_QUESTIONS;
    }
    return GCC_TBC_OBJECTIVE_QUESTIONS.filter((q) => q.topic === topicFilter);
  }, [subMode, testQuestions, topicFilter]);

  const currentQuestion = activeQuestions[currentIdx] || activeQuestions[0];

  const handleStartNewTest = useCallback(() => {
    setTestQuestions(generateRandomObjectiveSet(25));
    setCurrentIdx(0);
    setSelectedAnswers({});
    setElapsedSeconds(0);
    setIsSubmitted(false);
    setShowResultModal(false);
  }, []);

  const handleResetCurrent = useCallback(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setElapsedSeconds(0);
    setIsSubmitted(false);
    setShowResultModal(false);
  }, []);

  // 25-Minute (1500s) Countdown Timer in Test Mode
  useEffect(() => {
    if (subMode !== 'test' || isSubmitted) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= 25 * 60) {
          setIsSubmitted(true);
          setShowResultModal(true);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [subMode, isSubmitted]);

  const handleSelectOption = (optionIdx: number) => {
    if (subMode === 'test' && isSubmitted) return;

    const qId = currentQuestion.id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));

    if (subMode === 'practice') {
      const isRight = optionIdx === currentQuestion.correctIndex;
      if (soundEnabled) {
        if (isRight) playKeyClick(false);
        else playErrorSound();
      }
    } else if (soundEnabled) {
      playKeyClick(false);
    }
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    setShowResultModal(true);
    if (soundEnabled) {
      playSuccessChime();
    }
  };

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    for (const q of activeQuestions) {
      const ans = selectedAnswers[q.id];
      if (ans !== undefined) {
        attempted++;
        if (ans === q.correctIndex) {
          correct++;
        } else {
          wrong++;
        }
      }
    }

    const marksObtained = correct * 2;
    const maxMarks = activeQuestions.length * 2;
    const passingMarks = subMode === 'test' ? 20 : Math.ceil(maxMarks * 0.4);
    const passed = marksObtained >= passingMarks;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return {
      correct,
      wrong,
      attempted,
      unanswered: activeQuestions.length - attempted,
      marksObtained,
      maxMarks,
      passingMarks,
      passed,
      accuracy,
    };
  }, [activeQuestions, selectedAnswers, subMode]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const remainingTestSeconds = Math.max(0, 25 * 60 - elapsedSeconds);

  return (
    <div className="flex flex-col gap-3">
      {/* Top Bar: Mode Switch (Test / Practice), Telemetry & 1-Word Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-mode Toggle: Test (25Q · 50M) vs Practice */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setSubMode('test');
                handleStartNewTest();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                subMode === 'test'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Test (50M)
            </button>
            <button
              type="button"
              onClick={() => {
                setSubMode('practice');
                setCurrentIdx(0);
                setIsSubmitted(false);
                setShowResultModal(false);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                subMode === 'practice'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Practice
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
            <span className="text-slate-400">Q:</span>
            <span className="font-bold text-slate-900">
              {currentIdx + 1}/{activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
            <span className="text-slate-400">Marks:</span>
            <span className="font-bold text-emerald-600">
              {stats.marksObtained}/{stats.maxMarks}
            </span>
          </div>

          {subMode === 'test' && (
            <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
              <span className="text-slate-400">Time:</span>
              <span className="font-bold text-slate-900">
                {formatTimer(remainingTestSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Topic Filter in Practice Mode OR Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {subMode === 'practice' && (
            <div className="flex flex-wrap items-center gap-1 mr-1">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTopicFilter(t);
                    setCurrentIdx(0);
                  }}
                  className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${
                    topicFilter === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleStartNewTest}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitTest}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>

          <button
            type="button"
            onClick={handleResetCurrent}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Objective Layout: Left = Question & Options | Right = Question Number Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT 8 COLUMNS: Question & 4 Options */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold font-mono-tabular">
                #{currentIdx + 1} · {currentQuestion.topic}
              </span>
              <span className="text-xs font-mono-tabular text-slate-500 font-semibold">
                2 Marks
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-devanagari leading-relaxed mb-5">
              {getQuestionText(currentQuestion, language)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getQuestionOptions(currentQuestion, language).map((opt, optIdx) => {
                const chosenIdx = selectedAnswers[currentQuestion.id];
                const isSelected = chosenIdx === optIdx;
                const isCorrectOption = optIdx === currentQuestion.correctIndex;
                const showInstantFeedback = subMode === 'practice' && chosenIdx !== undefined;
                const showReviewFeedback = subMode === 'test' && isSubmitted;

                let btnStyle =
                  'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

                if (showInstantFeedback || showReviewFeedback) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-blue-600 border-blue-700 text-white shadow-xs';
                }

                const optionLetter = ['A', 'B', 'C', 'D'][optIdx];

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all font-devanagari ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                          isSelected && !showInstantFeedback && !showReviewFeedback
                            ? 'bg-white/20 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span className="text-sm sm:text-base font-semibold break-words">
                        {opt}
                      </span>
                    </div>

                    {(showInstantFeedback || showReviewFeedback) && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {(showInstantFeedback || showReviewFeedback) &&
                      isSelected &&
                      !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prev / Next Navigation Bar */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {currentIdx + 1 < activeQuestions.length ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitTest}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Flag className="w-4 h-4" />
                <span>Submit</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: Question Number Palette Grid */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Questions</span>
              <span className="text-xs font-mono-tabular text-blue-600 font-bold">
                {stats.attempted}/{activeQuestions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {activeQuestions.map((q, idx) => {
                const ans = selectedAnswers[q.id];
                const isCurrent = idx === currentIdx;
                const isAnswered = ans !== undefined;
                const isRight = ans === q.correctIndex;

                let pillStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                if (isCurrent) {
                  pillStyle = 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200';
                } else if ((subMode === 'practice' || isSubmitted) && isAnswered) {
                  pillStyle = isRight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-red-50 text-red-700 border-red-300';
                } else if (isAnswered) {
                  pillStyle = 'bg-emerald-600 text-white border-emerald-700';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono-tabular font-bold flex items-center justify-center transition-colors ${pillStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center font-mono-tabular">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] text-emerald-700">Correct</div>
              <div className="text-sm font-bold text-emerald-700">{stats.correct}</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <div className="text-[10px] text-red-700">Wrong</div>
              <div className="text-sm font-bold text-red-700">{stats.wrong}</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-[10px] text-blue-700">Marks</div>
              <div className="text-sm font-bold text-blue-700">
                {stats.marksObtained}/{stats.maxMarks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objective Result Pop-Up Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-blue-600 rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    stats.passed
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-mono-tabular">
                  {stats.passed ? 'PASS' : 'FAIL'} — {stats.marksObtained}/{stats.maxMarks}
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
                    stats.passed ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {stats.marksObtained}/{stats.maxMarks}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Correct</div>
                <div className="text-xl font-bold text-emerald-600 font-mono-tabular mt-0.5">
                  {stats.correct}/{activeQuestions.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Wrong</div>
                <div className="text-xl font-bold text-red-600 font-mono-tabular mt-0.5">
                  {stats.wrong}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Attempted</div>
                <div className="text-xl font-bold text-blue-600 font-mono-tabular mt-0.5">
                  {stats.attempted}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Accuracy</div>
                <div className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5">
                  {stats.accuracy}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Passing</div>
                <div className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5">
                  {stats.passingMarks}/{stats.maxMarks}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Review
              </button>

              <button
                type="button"
                onClick={handleResetCurrent}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>

              <button
                type="button"
                onClick={handleStartNewTest}
                className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
