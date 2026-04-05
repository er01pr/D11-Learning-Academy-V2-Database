'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StickyNote, ChevronDown } from 'lucide-react';

interface LessonNotesProps {
  lessonId: string;
  userId: string;
}

export default function LessonNotes({ lessonId, userId }: LessonNotesProps) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const storageKey = `notes_${userId}_${lessonId}`;

  // Load notes from localStorage on mount and when lessonId changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setNotes(saved ?? '');
    setLastSaved(null);
    setIsSaving(false);
  }, [storageKey]);

  // Auto-save with 1-second debounce
  useEffect(() => {
    // Skip the initial load — only save after user edits
    const currentStored = localStorage.getItem(storageKey);
    if (notes === (currentStored ?? '')) return;

    setIsSaving(true);

    const timeout = setTimeout(() => {
      localStorage.setItem(storageKey, notes);
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      setIsSaving(false);
    };
  }, [notes, storageKey]);

  // Clear "Saved" indicator after 2 seconds
  useEffect(() => {
    if (!lastSaved) return;

    const timeout = setTimeout(() => {
      setLastSaved(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [lastSaved]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-fwd-grey/50 shadow-soft overflow-hidden">
      {/* Header - always visible, clickable to toggle */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-5 hover:bg-fwd-grey/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-fwd-orange-20 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-fwd-orange" />
          </div>
          <span className="font-bold text-fwd-green text-sm">My Notes</span>
          {notes.trim() && !isExpanded && (
            <span className="text-xs text-fwd-green/40">&bull; Has notes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-fwd-orange animate-pulse">Saving...</span>
          )}
          {lastSaved && !isSaving && (
            <span className="text-xs text-fwd-green/40">Saved &#10003;</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-fwd-green/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Notes area - shown when expanded */}
      {isExpanded && (
        <div className="px-5 pb-5 animate-in slide-in-from-top-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes for this lesson here... They'll auto-save as you type."
            className="w-full h-40 p-4 bg-fwd-grey/20 border border-fwd-grey rounded-xl text-sm text-fwd-green placeholder-fwd-green/30 focus:outline-none focus:ring-2 focus:ring-fwd-orange resize-none"
          />
        </div>
      )}
    </div>
  );
}
