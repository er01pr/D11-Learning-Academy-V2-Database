'use client';

import React, { useState, useMemo } from 'react';
import { Brain, ChevronDown } from 'lucide-react';

interface CoachingInsightsProps {
  downlines: {
    name: string;
    progress: { completedLessonIds: string[]; quizScores: Record<string, number> };
  }[];
  totalLessons: number;
  modules: { id: string; title: string; lessons: { id: string }[] }[];
}

export default function CoachingInsights({ downlines, totalLessons, modules }: CoachingInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const insights = useMemo(() => {
    if (!downlines.length || totalLessons === 0) return [];

    const result: string[] = [];

    // Calculate completion percentage for each downline
    const completionMap = downlines.map((d) => ({
      name: d.name,
      completedCount: d.progress.completedLessonIds.length,
      percentage: Math.round((d.progress.completedLessonIds.length / totalLessons) * 100),
      progress: d.progress,
    }));

    // 1. Struggling advisors: completion < 25%
    const struggling = completionMap.filter((d) => d.percentage < 25);
    if (struggling.length > 0) {
      const names = struggling.map((d) => d.name);
      if (names.length === 1) {
        result.push(
          `⚠️ ${names[0]} is falling behind with less than 25% completion. Consider scheduling a check-in.`
        );
      } else {
        const last = names.pop();
        result.push(
          `⚠️ ${names.join(', ')} and ${last} are falling behind with less than 25% completion. Consider scheduling a check-in.`
        );
      }
    }

    // 2. Star performers: completion > 75%
    const stars = completionMap.filter((d) => d.percentage > 75);
    for (const star of stars) {
      result.push(
        `⭐ ${star.name} is leading the pack at ${star.percentage}% completion. Great candidate for peer mentoring.`
      );
    }

    // 3. Hardest and easiest modules
    if (modules.length > 0) {
      const moduleCompletions = modules.map((mod) => {
        const lessonIds = new Set(mod.lessons.map((l) => l.id));
        const totalModuleLessons = lessonIds.size;

        if (totalModuleLessons === 0) {
          return { title: mod.title, avgCompletion: 0 };
        }

        const avgCompletion =
          downlines.reduce((sum, d) => {
            const completedInModule = d.progress.completedLessonIds.filter((id) =>
              lessonIds.has(id)
            ).length;
            return sum + (completedInModule / totalModuleLessons) * 100;
          }, 0) / downlines.length;

        return { title: mod.title, avgCompletion: Math.round(avgCompletion) };
      });

      const sorted = [...moduleCompletions].sort((a, b) => a.avgCompletion - b.avgCompletion);
      const hardest = sorted[0];
      const easiest = sorted[sorted.length - 1];

      if (hardest && modules.length > 1) {
        result.push(
          `📊 ${hardest.title} appears to be the most challenging — team average is only ${hardest.avgCompletion}% complete.`
        );
      }

      if (easiest && modules.length > 1 && easiest.title !== hardest.title) {
        result.push(
          `✅ ${easiest.title} is the easiest module — team average is ${easiest.avgCompletion}% complete.`
        );
      }

      if (hardest) {
        result.push(
          `💡 Suggested action: Hold a group review session on ${hardest.title} this week.`
        );
      }
    }

    // 5. Team average quiz score
    const allScores = downlines.flatMap((d) => Object.values(d.progress.quizScores));
    if (allScores.length > 0) {
      const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      result.push(
        `📝 Team average quiz score is ${avgScore}%.${avgScore < 70 ? ' Consider reinforcing key concepts before moving forward.' : ' The team is performing well on assessments.'}`
      );
    }

    return result;
  }, [downlines, totalLessons, modules]);

  return (
    <div className="bg-white rounded-3xl border border-fwd-grey shadow-soft overflow-hidden">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 hover:bg-fwd-grey/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fwd-green flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-fwd-green">AI Coaching Insights</h3>
            <p className="text-xs text-fwd-green/50">{insights.length} insights for your team</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-fwd-green/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 bg-fwd-grey/20 rounded-xl text-sm text-fwd-green leading-relaxed"
            >
              {insight}
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-sm text-fwd-green/40 italic">No team data available yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
