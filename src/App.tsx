/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Menu,
  BookOpen,
  Award,
  FileText,
  Plus,
  X,
  Lock,
  Check,
  Infinity as InfinityIcon,
  Clock,
  BarChart2,
  ListChecks,
} from 'lucide-react';
import {
  ENGLISH_LESSONS,
  GccTbcPassage,
  LanguageMode,
  LessonItem,
  MARATHI_LESSONS,
  generateDynamicGccPassage,
} from './data/curriculum';
import { TypingStage, SessionCompletionPayload } from './components/TypingStage';
import { ObjectiveStage } from './components/ObjectiveStage';
import { ProgressDashboard } from './components/ProgressDashboard';
import {
  CustomPassageItem,
  SessionModeType,
  UserProgressStore,
  generateWeakKeyDrill,
  isLessonUnlocked,
  loadUserProgress,
  recordSessionCompletion,
  saveUserProgress,
} from './utils/storage';

type NavView =
  | 'lessons'
  | 'exam'
  | 'practice-7m'
  | 'unlimited'
  | 'objective'
  | 'custom'
  | 'progress';

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('lessons');
  const [language, setLanguage] = useState<LanguageMode>('mr');
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState<boolean>(false);

  const [selectedLessonIdMr, setSelectedLessonIdMr] = useState<string>(MARATHI_LESSONS[0].id);
  const [selectedLessonIdEn, setSelectedLessonIdEn] = useState<string>(ENGLISH_LESSONS[0].id);

  const [benchmarkWpm, setBenchmarkWpm] = useState<30 | 40>(30);
  const [, setPassageRunCount] = useState<number>(1);
  const [currentDynamicPassage, setCurrentDynamicPassage] = useState<GccTbcPassage>(() =>
    generateDynamicGccPassage('mr', 30, 1)
  );

  const [activeCustomId, setActiveCustomId] = useState<string>('custom-mr-default-1');
  const [newCustomTitle, setNewCustomTitle] = useState<string>('');
  const [newCustomText, setNewCustomText] = useState<string>('');
  const [showNewCustomForm, setShowNewCustomForm] = useState<boolean>(false);
  const [weakKeyDrillData, setWeakKeyDrillData] = useState<{
    title: string;
    focusKeys: string[];
    text: string;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [showFingerColors, setShowFingerColors] = useState<boolean>(true);
  const [backspaceEnabled, setBackspaceEnabled] = useState<boolean>(true);

  const [progress, setProgress] = useState<UserProgressStore>(() => loadUserProgress());

  const currentLessons = language === 'mr' ? MARATHI_LESSONS : ENGLISH_LESSONS;

  const activeLessonIndex = useMemo(() => {
    const id = language === 'mr' ? selectedLessonIdMr : selectedLessonIdEn;
    const idx = currentLessons.findIndex((l) => l.id === id);
    return idx >= 0 ? idx : 0;
  }, [language, selectedLessonIdMr, selectedLessonIdEn, currentLessons]);

  const activeLesson = currentLessons[activeLessonIndex] || currentLessons[0];

  const isNextLessonAlreadyUnlocked = useMemo(() => {
    if (activeLessonIndex + 1 >= currentLessons.length) return false;
    return isLessonUnlocked(progress, activeLessonIndex + 1, currentLessons);
  }, [progress, activeLessonIndex, currentLessons]);

  const handleGenerateNewPassage = useCallback(
    (targetLang: LanguageMode = language, targetWpm: 30 | 40 = benchmarkWpm) => {
      setPassageRunCount((prev) => {
        const nextCount = prev + 1;
        setCurrentDynamicPassage(generateDynamicGccPassage(targetLang, targetWpm, nextCount));
        return nextCount;
      });
    },
    [language, benchmarkWpm]
  );

  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    setWeakKeyDrillData(null);
    handleGenerateNewPassage(newLang, benchmarkWpm);
  };

  const handleBenchmarkChange = (newWpm: 30 | 40) => {
    setBenchmarkWpm(newWpm);
    handleGenerateNewPassage(language, newWpm);
  };

  const languageCustomPassages = useMemo(
    () => progress.customPassages.filter((p) => p.language === language),
    [progress.customPassages, language]
  );

  const activeCustomPassage = useMemo(() => {
    return (
      languageCustomPassages.find((p) => p.id === activeCustomId) ||
      languageCustomPassages[0] || {
        id: 'fallback',
        language,
        title: 'Custom',
        text:
          language === 'mr'
            ? 'दररोज नियमित सराव केल्याने मराठी इनस्क्रिप्ट टंकलेखनाचा वेग वाढतो आणि GCC-TBC परीक्षेत ४० पैकी उत्तम गुण मिळतात.'
            : 'Regular deliberate practice builds lasting touch typing speed and accuracy for the GCC-TBC 40-mark speed passage.',
        createdAt: 'Today',
      }
    );
  }, [languageCustomPassages, activeCustomId, language]);

  const handleAttemptSelectLesson = (lesson: LessonItem, lessonIdx: number) => {
    const unlocked = isLessonUnlocked(progress, lessonIdx, currentLessons);
    if (!unlocked) return;

    if (lesson.language === 'mr') {
      setSelectedLessonIdMr(lesson.id);
    } else {
      setSelectedLessonIdEn(lesson.id);
    }
    setWeakKeyDrillData(null);
    setActiveView('lessons');
    setIsLeftMenuOpen(false);
  };

  const handleNextLesson = () => {
    if (activeLessonIndex + 1 < currentLessons.length) {
      const next = currentLessons[activeLessonIndex + 1];
      if (next.language === 'mr') {
        setSelectedLessonIdMr(next.id);
      } else {
        setSelectedLessonIdEn(next.id);
      }
      setWeakKeyDrillData(null);
    }
  };

  const handleLaunchWeakKeyDrill = useCallback(() => {
    const drill = generateWeakKeyDrill(progress, language);
    setWeakKeyDrillData(drill);
    setActiveView('lessons');
    setIsLeftMenuOpen(false);
  }, [progress, language]);

  const handleSessionComplete = useCallback(
    (payload: SessionCompletionPayload) => {
      let mode: SessionModeType = 'lesson';
      let title = `#${activeLesson.levelNumber}`;
      let targetWpm = activeLesson.targetWpm;
      let lessonId: string | undefined = activeLesson.id;
      let requiredReps: number | undefined = activeLesson.requiredReps;

      if (weakKeyDrillData && activeView === 'lessons') {
        mode = 'weak-keys';
        title = 'Drill';
        lessonId = undefined;
      } else if (activeView === 'practice-7m') {
        mode = 'practice-7m';
        title = 'Practice';
        targetWpm = currentDynamicPassage.benchmarkWpm;
        lessonId = undefined;
      } else if (activeView === 'unlimited') {
        mode = 'unlimited';
        title = 'Unlimited';
        targetWpm = 30;
        lessonId = undefined;
      } else if (activeView === 'exam') {
        mode = 'exam';
        title = 'Exam';
        targetWpm = currentDynamicPassage.benchmarkWpm;
        lessonId = undefined;
      } else if (activeView === 'custom') {
        mode = 'custom';
        title = 'Custom';
        lessonId = undefined;
      }

      setProgress((prev) =>
        recordSessionCompletion(
          prev,
          {
            mode,
            language,
            title,
            netWpm: payload.netWpm,
            grossWpm: payload.grossWpm,
            accuracy: payload.accuracy,
            keystrokes: payload.keystrokes,
            errors: payload.errors,
            backspaceCount: payload.backspaceCount,
            marksObtained: payload.marksObtained,
            maxMarks: 40,
            passingMarks: 16,
            durationSeconds: payload.durationSeconds,
            examBenchmarkWpm: currentDynamicPassage.benchmarkWpm,
            examPassed: payload.examPassed,
          },
          payload.keyStats,
          targetWpm,
          lessonId,
          requiredReps
        )
      );
    },
    [
      activeLesson,
      weakKeyDrillData,
      activeView,
      currentDynamicPassage,
      language,
    ]
  );

  const handleSaveCustomPassage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newCustomTitle.trim();
    const trimmedText = newCustomText.trim();
    if (!trimmedTitle || !trimmedText) return;

    const newItem: CustomPassageItem = {
      id: `custom-${Date.now()}`,
      language,
      title: trimmedTitle,
      text: trimmedText,
      createdAt: 'Today',
    };

    const updated: UserProgressStore = {
      ...progress,
      customPassages: [newItem, ...progress.customPassages],
    };
    setProgress(updated);
    saveUserProgress(updated);
    setActiveCustomId(newItem.id);
    setNewCustomTitle('');
    setNewCustomText('');
    setShowNewCustomForm(false);
  };

  const handleResetProgress = () => {
    window.localStorage.removeItem('lipitype_gcctbc_progress_v2');
    setProgress(loadUserProgress());
  };

  const selectMenuView = (view: NavView) => {
    setWeakKeyDrillData(null);
    setActiveView(view);
    setIsLeftMenuOpen(false);
    if (view === 'exam' || view === 'practice-7m' || view === 'unlimited') {
      handleGenerateNewPassage(language, benchmarkWpm);
    }
  };

  const activeModeOneWord = useMemo(() => {
    switch (activeView) {
      case 'lessons':
        return 'Lessons';
      case 'exam':
        return 'Exam';
      case 'practice-7m':
        return 'Practice';
      case 'unlimited':
        return 'Unlimited';
      case 'objective':
        return 'Objective';
      case 'custom':
        return 'Custom';
      case 'progress':
        return 'Result';
    }
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar with Centered Bold Brand Title */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1440px] mx-auto grid grid-cols-3 items-center gap-3">
          {/* Left: Menu + Active Mode */}
          <div className="flex items-center gap-2.5 justify-self-start">
            <button
              type="button"
              onClick={() => setIsLeftMenuOpen(true)}
              aria-label="Menu"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold">Menu</span>
            </button>

            <span className="text-xs font-semibold text-blue-600">{activeModeOneWord}</span>
          </div>

          {/* Center: Bold Attractive Institute Name */}
          <div className="justify-self-center text-center">
            <h1 className="text-sm sm:text-lg md:text-xl font-extrabold tracking-wide bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent whitespace-nowrap select-none">
              Prima Computer Typing Institute
            </h1>
          </div>

          {/* Right: WPM & Language Switcher */}
          <div className="flex items-center gap-2 justify-self-end">
            {(activeView === 'exam' || activeView === 'practice-7m') && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleBenchmarkChange(30)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    benchmarkWpm === 30
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  30WPM
                </button>
                <button
                  type="button"
                  onClick={() => handleBenchmarkChange(40)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    benchmarkWpm === 40
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  40WPM
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors font-devanagari ${
                  language === 'mr'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Left 3-Line Menu Drawer (1-Word Items Only) */}
      {isLeftMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsLeftMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          />

          <aside className="relative z-10 w-64 max-w-[80vw] bg-white h-full border-r border-slate-200 flex flex-col justify-between overflow-y-auto p-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsLeftMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => selectMenuView('lessons')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'lessons'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Lessons</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('exam')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'exam'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Exam</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('practice-7m')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'practice-7m'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Practice</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('unlimited')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'unlimited'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <InfinityIcon className="w-4 h-4 shrink-0" />
                  <span>Unlimited</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('objective')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'objective'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ListChecks className="w-4 h-4 shrink-0" />
                  <span>Objective</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('custom')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Custom</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectMenuView('progress')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeView === 'progress'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>Result</span>
                </button>
              </div>

              {/* Compact Numbered Grid Inside Drawer */}
              <div className="pt-3 border-t border-slate-100">
                <div className="grid grid-cols-4 gap-1.5">
                  {currentLessons.map((lesson, idx) => {
                    const unlocked = isLessonUnlocked(progress, idx, currentLessons);
                    const completed = Boolean(progress.lessonRecords[lesson.id]);
                    const isSelected = activeView === 'lessons' && lesson.id === activeLesson.id;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleAttemptSelectLesson(lesson, idx)}
                        className={`h-8 rounded-lg text-xs font-mono-tabular font-bold flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : completed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : unlocked
                            ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        }`}
                      >
                        {lesson.levelNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-2.5 flex flex-col gap-2.5">
        {activeView === 'lessons' && (
          <div className="flex flex-col gap-2.5">
            {/* Side-by-Side Numbered Strip (Only Numbers 1..16) */}
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
              {currentLessons.map((lesson, idx) => {
                const unlocked = isLessonUnlocked(progress, idx, currentLessons);
                const completed = Boolean(progress.lessonRecords[lesson.id]);
                const isCurrent = !weakKeyDrillData && lesson.id === activeLesson.id;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => handleAttemptSelectLesson(lesson, idx)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono-tabular transition-all shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-700'
                        : completed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : unlocked
                        ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>{lesson.levelNumber}</span>
                    {completed ? (
                      <Check className="w-3 h-3" />
                    ) : !unlocked ? (
                      <Lock className="w-3 h-3" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {weakKeyDrillData ? (
              <TypingStage
                language={language}
                mode="weak-keys"
                title="Drill"
                targetText={weakKeyDrillData.text}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                showKeyboard={showKeyboard}
                onToggleKeyboard={() => setShowKeyboard((k) => !k)}
                showFingerColors={showFingerColors}
                onToggleFingerColors={() => setShowFingerColors((f) => !f)}
                backspaceEnabled={backspaceEnabled}
                onToggleBackspace={() => setBackspaceEnabled((b) => !b)}
                onComplete={handleSessionComplete}
              />
            ) : (
              <TypingStage
                language={language}
                mode="lesson"
                title={`#${activeLesson.levelNumber}`}
                targetText={activeLesson.text}
                requiredReps={activeLesson.requiredReps}
                isAlreadyUnlockedNext={isNextLessonAlreadyUnlocked}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                showKeyboard={showKeyboard}
                onToggleKeyboard={() => setShowKeyboard((k) => !k)}
                showFingerColors={showFingerColors}
                onToggleFingerColors={() => setShowFingerColors((f) => !f)}
                backspaceEnabled={backspaceEnabled}
                onToggleBackspace={() => setBackspaceEnabled((b) => !b)}
                onComplete={handleSessionComplete}
                onNextItem={
                  activeLessonIndex + 1 < currentLessons.length ? handleNextLesson : undefined
                }
              />
            )}
          </div>
        )}

        {(activeView === 'exam' || activeView === 'practice-7m') && (
          <TypingStage
            language={language}
            mode={activeView === 'exam' ? 'exam' : 'practice-7m'}
            title={activeView === 'exam' ? 'Exam' : 'Practice'}
            timeLimitSeconds={7 * 60}
            targetText={currentDynamicPassage.text}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            showKeyboard={showKeyboard}
            onToggleKeyboard={() => setShowKeyboard((k) => !k)}
            showFingerColors={showFingerColors}
            onToggleFingerColors={() => setShowFingerColors((f) => !f)}
            backspaceEnabled={backspaceEnabled}
            onToggleBackspace={() => setBackspaceEnabled((b) => !b)}
            onComplete={handleSessionComplete}
            onRequestNewPassage={() => handleGenerateNewPassage(language, benchmarkWpm)}
          />
        )}

        {activeView === 'unlimited' && (
          <TypingStage
            language={language}
            mode="unlimited"
            title="Unlimited"
            targetText={currentDynamicPassage.text}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            showKeyboard={showKeyboard}
            onToggleKeyboard={() => setShowKeyboard((k) => !k)}
            showFingerColors={showFingerColors}
            onToggleFingerColors={() => setShowFingerColors((f) => !f)}
            backspaceEnabled={backspaceEnabled}
            onToggleBackspace={() => setBackspaceEnabled((b) => !b)}
            onComplete={handleSessionComplete}
            onRequestNewPassage={() => handleGenerateNewPassage(language, benchmarkWpm)}
          />
        )}

        {activeView === 'objective' && (
          <ObjectiveStage language={language} soundEnabled={soundEnabled} />
        )}

        {activeView === 'custom' && (
          <div className="flex flex-col gap-2.5">
            <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {languageCustomPassages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCustomId(item.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold font-devanagari transition-colors ${
                      item.id === activeCustomPassage.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowNewCustomForm((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {showNewCustomForm && (
              <form
                onSubmit={handleSaveCustomPassage}
                className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5"
              >
                <input
                  type="text"
                  required
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-devanagari"
                />
                <textarea
                  rows={2}
                  required
                  value={newCustomText}
                  onChange={(e) => setNewCustomText(e.target.value)}
                  placeholder="Passage"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-devanagari"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCustomForm(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <TypingStage
              language={language}
              mode="custom"
              title="Custom"
              targetText={activeCustomPassage.text}
              timeLimitSeconds={7 * 60}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              showKeyboard={showKeyboard}
              onToggleKeyboard={() => setShowKeyboard((k) => !k)}
              showFingerColors={showFingerColors}
              onToggleFingerColors={() => setShowFingerColors((f) => !f)}
              backspaceEnabled={backspaceEnabled}
              onToggleBackspace={() => setBackspaceEnabled((b) => !b)}
              onComplete={handleSessionComplete}
            />
          </div>
        )}

        {activeView === 'progress' && (
          <ProgressDashboard
            language={language}
            progress={progress}
            onStartWeakKeyDrill={handleLaunchWeakKeyDrill}
            onSelectLesson={(lesson) => {
              const idx = currentLessons.findIndex((l) => l.id === lesson.id);
              handleAttemptSelectLesson(lesson, idx >= 0 ? idx : 0);
            }}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>
    </div>
  );
}
