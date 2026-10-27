import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  Play,
  Trash2,
} from 'lucide-react';
import {
  ENGLISH_LESSONS,
  LanguageMode,
  LessonItem,
  MARATHI_LESSONS,
} from '../data/curriculum';
import {
  UserProgressStore,
  getSortedWeakKeys,
} from '../utils/storage';

interface ProgressDashboardProps {
  language: LanguageMode;
  progress: UserProgressStore;
  onStartWeakKeyDrill: () => void;
  onSelectLesson: (lesson: LessonItem) => void;
  onResetProgress: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  language,
  progress,
  onStartWeakKeyDrill,
  onSelectLesson,
  onResetProgress,
}) => {
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const lessons = language === 'mr' ? MARATHI_LESSONS : ENGLISH_LESSONS;
  const weakKeys = getSortedWeakKeys(progress, language);
  const langSessions = progress.sessionHistory.filter((s) => s.language === language);

  const completedLessonsCount = lessons.filter(
    (l) => Boolean(progress.lessonRecords[l.id])
  ).length;

  const bestMarksOutOf40 =
    langSessions.length > 0
      ? Math.max(...langSessions.map((s) => s.marksObtained ?? 0))
      : 0;

  const bestWpm =
    langSessions.length > 0
      ? Math.max(...langSessions.map((s) => s.netWpm))
      : 0;

  const practiceMinutes = Math.max(1, Math.round(progress.totalPracticeSeconds / 60));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Marks</span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono-tabular mt-1">
            {bestMarksOutOf40}/40
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>WPM</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {bestWpm}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Lessons</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {completedLessonsCount}/{lessons.length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Minutes</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {practiceMinutes}
          </div>
        </div>
      </div>

      {/* Weak Keys */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Keys</h3>
          <button
            type="button"
            onClick={onStartWeakKeyDrill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Drill</span>
          </button>
        </div>

        {weakKeys.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">-</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-3">
            {weakKeys.slice(0, 8).map((item) => (
              <div
                key={item.char}
                className="border border-slate-200 rounded-lg p-2.5 flex items-center justify-between"
              >
                <span className="text-lg font-bold text-slate-900 font-devanagari">
                  {item.char}
                </span>
                <span className="text-xs font-mono-tabular text-red-600 font-semibold">
                  {item.errorRate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lessons & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 mb-2 border-b border-slate-100">
            Lessons
          </h3>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {lessons.map((lesson) => {
              const rec = progress.lessonRecords[lesson.id];
              return (
                <div
                  key={lesson.id}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-slate-900 font-mono-tabular">
                    #{lesson.levelNumber}
                  </span>
                  <div className="flex items-center gap-3">
                    {rec && (
                      <span className="text-xs font-mono-tabular text-emerald-600 font-bold">
                        {rec.bestWpm} WPM
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">History</h3>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-semibold"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-0.5 rounded border border-slate-200 text-xs text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {langSessions.map((sess) => {
              const marks = sess.marksObtained ?? 35;
              return (
                <div key={sess.id} className="py-2 flex items-center justify-between text-xs font-mono-tabular">
                  <span className="font-semibold text-slate-800">{sess.mode}</span>
                  <span className="text-blue-600 font-bold">{sess.netWpm} WPM</span>
                  <span className={marks >= 16 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {marks}/40
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
