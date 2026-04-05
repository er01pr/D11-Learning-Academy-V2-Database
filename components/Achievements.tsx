'use client';

import React, { useState, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AchievementData {
  completedLessonIds: Set<string>;
  quizScores: Record<string, number>;
  totalLessons: number;
  moduleLessonIds: Record<string, string[]>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: AchievementData) => boolean;
}

interface AchievementBadgesProps {
  completedLessonIds: Set<string>;
  quizScores: Record<string, number>;
  totalLessons: number;
  modules: { id: string; lessons: { id: string }[] }[];
}

// ─── Badge Definitions ───────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👣',
    condition: (d) => d.completedLessonIds.size >= 1,
  },
  {
    id: 'module-master',
    name: 'Module Master',
    description: 'Complete all lessons in a module',
    icon: '🏅',
    condition: (d) =>
      Object.values(d.moduleLessonIds).some(
        (ids) => ids.length > 0 && ids.every((id) => d.completedLessonIds.has(id))
      ),
  },
  {
    id: 'quiz-ace',
    name: 'Quiz Ace',
    description: 'Score 100% on any quiz',
    icon: '🎯',
    condition: (d) => Object.values(d.quizScores).some((score) => score >= 3),
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: '7-day learning streak',
    icon: '🔥',
    condition: () => false, // Streak is tracked separately via localStorage
  },
  {
    id: 'graduate',
    name: 'Graduate',
    description: 'Complete all 16 lessons',
    icon: '🎓',
    condition: (d) => d.completedLessonIds.size >= d.totalLessons,
  },
];

// ─── Streak Helpers ──────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getStreak(): number {
  if (typeof window === 'undefined') return 0;

  const lastDate = localStorage.getItem('learning_streak_last_date');
  const storedCount = localStorage.getItem('learning_streak_count');

  if (!lastDate || !storedCount) return 0;

  const today = getToday();
  const last = new Date(lastDate);
  const now = new Date(today);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Streak is still active if last activity was today or yesterday
  if (diffDays <= 1) {
    return parseInt(storedCount, 10);
  }

  // Streak has expired
  return 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AchievementBadges({
  completedLessonIds,
  quizScores,
  totalLessons,
  modules,
}: AchievementBadgesProps) {
  const [streakDays] = useState<number>(() => getStreak());

  const achievementData = useMemo<AchievementData>(() => {
    const moduleLessonIds: Record<string, string[]> = {};
    for (const mod of modules) {
      moduleLessonIds[mod.id] = mod.lessons.map((l) => l.id);
    }

    return {
      completedLessonIds,
      quizScores,
      totalLessons,
      moduleLessonIds,
    };
  }, [completedLessonIds, quizScores, totalLessons, modules]);

  // Override the 'on-fire' badge condition with the live streak value
  const isStreakEarned = streakDays >= 7;

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold text-fwd-green/60 uppercase tracking-widest">
        Achievements
      </h4>
      <div className="flex flex-wrap gap-2">
        {BADGES.map((badge) => {
          const earned =
            badge.id === 'on-fire'
              ? isStreakEarned
              : badge.condition(achievementData);

          return (
            <div
              key={badge.id}
              title={`${badge.name}: ${badge.description}`}
              className={`
                relative group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                ${
                  earned
                    ? 'bg-fwd-orange/20 text-fwd-orange border border-fwd-orange/50 shadow-sm'
                    : 'bg-fwd-grey/30 text-fwd-green/30 border border-fwd-grey'
                }
              `}
            >
              <span className={earned ? '' : 'grayscale opacity-50'}>
                {badge.icon}
              </span>
              <span>{badge.name}</span>
              {earned && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-fwd-orange rounded-full animate-ping opacity-50" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-fwd-green/50">
        <span>🔥</span>
        <span>{streakDays}-day streak</span>
      </div>
    </div>
  );
}
