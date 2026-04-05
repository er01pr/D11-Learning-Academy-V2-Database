"use client";

import React, { useState, useMemo } from "react";
import { Lightbulb, X } from "lucide-react";

interface StudyRecommendationProps {
  completedLessonIds: Set<string>;
  quizScores: Record<string, number>;
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      quiz?: { id: string }[];
    }[];
  }[];
}

export default function StudyRecommendation({
  completedLessonIds,
  quizScores,
  modules,
}: StudyRecommendationProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const recommendation = useMemo(() => {
    const allLessons = modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
    );
    const totalLessons = allLessons.length;

    if (totalLessons === 0) return null;

    const completedCount = allLessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);

    // If no lessons completed, suggest starting from the beginning
    if (completedCount === 0) {
      return "Start with Module 1, Lesson 1 to begin your training journey.";
    }

    // Find weak areas: lessons where quiz score < 66% of total quiz questions
    const weakLessons: string[] = [];
    for (const lesson of allLessons) {
      if (!lesson.quiz || lesson.quiz.length === 0) continue;
      const totalQuestions = lesson.quiz.length;
      const score = quizScores[lesson.id] ?? 0;
      const threshold = Math.ceil(totalQuestions * 0.66);
      if (score < threshold && completedLessonIds.has(lesson.id)) {
        weakLessons.push(lesson.title);
      }
    }

    if (weakLessons.length > 0) {
      return `Consider revisiting ${weakLessons[0]} — your quiz score could improve.`;
    }

    // All lessons completed with good scores
    if (completedCount === totalLessons) {
      return "Excellent! You've mastered the entire curriculum. 🎉";
    }

    // Find the next uncompleted lesson in sequence
    const nextLesson = allLessons.find(
      (l) => !completedLessonIds.has(l.id)
    );
    if (nextLesson) {
      return `Continue to ${nextLesson.title} to keep your momentum.`;
    }

    return null;
  }, [completedLessonIds, quizScores, modules]);

  if (isDismissed || !recommendation) return null;

  return (
    <div className="bg-gradient-to-r from-fwd-orange-20 to-white rounded-3xl border border-fwd-orange-50 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-fwd-orange flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-fwd-green text-sm mb-1">
              Smart Recommendation
            </h3>
            <p className="text-fwd-green/70 text-sm leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-fwd-green/30 hover:text-fwd-green transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
