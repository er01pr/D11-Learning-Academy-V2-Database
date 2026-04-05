import React, { useState, useMemo, useEffect } from 'react';
import { Module, Lesson, User } from '../types';
import { PlayCircle, CheckCircle2, BookOpen, Search, LogOut, User as UserIcon, ChevronDown, ChevronRight, Lock, Link, Check, Users, GraduationCap, StickyNote, Presentation } from 'lucide-react';
import { MANAGERIAL_ROLES } from '../constants';
import { AchievementBadges } from './Achievements';

interface SidebarProps {
  modules: Module[];
  activeLessonId: string;
  completedLessonIds: Set<string>;
  unlockedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  user: User | null;
  onLogout: () => void;
  currentView: 'learning' | 'dashboard' | 'training-decks';
  onChangeView: (view: 'learning' | 'dashboard' | 'training-decks') => void;
  quizScores?: Record<string, number>;
  totalLessons?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  modules, 
  activeLessonId, 
  completedLessonIds,
  unlockedLessonIds, 
  onSelectLesson, 
  isOpen, 
  onCloseMobile,
  user,
  onLogout,
  currentView,
  onChangeView,
  quizScores = {},
  totalLessons = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Auto-expand the module containing the active lesson
  useEffect(() => {
    const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLessonId));
    if (activeModule) {
      setExpandedModuleId(activeModule.id);
    }
  }, [activeLessonId, modules]);

  const lessonCount = totalLessons || modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const completionPercentage = useMemo(() =>
    lessonCount > 0 ? Math.round((completedLessonIds.size / lessonCount) * 100) : 0,
  [completedLessonIds, lessonCount]);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.map(module => ({
      ...module,
      lessons: module.lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(query) ||
        lesson.summary.toLowerCase().includes(query)
      )
    })).filter(module => module.lessons.length > 0);
  }, [modules, searchQuery]);

  const toggleModule = (moduleId: string) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
    } else {
      setExpandedModuleId(moduleId);
    }
  };

  const isManager = useMemo(() => {
    if (!user || !user.title) return false;
    return MANAGERIAL_ROLES.some(role => user.title?.toLowerCase() === role.toLowerCase());
  }, [user]);

  const handleCopyLink = () => {
    if (!user) return;
    const inviteLink = `${window.location.origin}?upline=${user.id}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-fwd-grey transform transition-transform duration-300 ease-in-out shadow-soft flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-fwd-grey bg-white shrink-0">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-fwd-orange flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-fwd-green leading-tight">Aquila11 Financial<br/>Academy</h1>
            </div>
        </div>

        {/* View Switcher */}
        {isManager ? (
          <div className="grid grid-cols-3 gap-1.5 mb-6 p-1.5 bg-fwd-grey rounded-lg">
             <button
                onClick={() => onChangeView('learning')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                   currentView === 'learning' ? 'bg-fwd-orange text-white shadow-sm' : 'text-fwd-green hover:bg-white/50'
                }`}
             >
                <BookOpen className="w-3.5 h-3.5" />
                Learn
             </button>
             <button
                onClick={() => onChangeView('dashboard')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                   currentView === 'dashboard' ? 'bg-fwd-orange text-white shadow-sm' : 'text-fwd-green hover:bg-white/50'
                }`}
             >
                <Users className="w-3.5 h-3.5" />
                Team
             </button>
             <button
                onClick={() => onChangeView('training-decks')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                   currentView === 'training-decks' ? 'bg-fwd-orange text-white shadow-sm' : 'text-fwd-green hover:bg-white/50'
                }`}
             >
                <Presentation className="w-3.5 h-3.5" />
                Decks
             </button>
          </div>
        ) : (
          <button
            onClick={() => onChangeView(currentView === 'training-decks' ? 'learning' : 'training-decks')}
            className={`w-full flex items-center justify-center gap-2 mb-6 py-2.5 text-xs font-bold rounded-lg border transition-all ${
              currentView === 'training-decks'
                ? 'bg-fwd-orange text-white border-fwd-orange shadow-sm'
                : 'bg-white border-fwd-orange text-fwd-orange hover:bg-fwd-orange hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            Training Decks
          </button>
        )}

        {currentView === 'learning' && (
          <div className="mb-6 animate-in fade-in">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-fwd-green uppercase tracking-widest">Training progress</span>
              <span className="text-xs font-bold text-fwd-orange">{completionPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-fwd-grey rounded-full overflow-hidden">
              <div 
                className="h-full bg-fwd-orange transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {currentView === 'learning' && (
          <div className="relative animate-in fade-in">
            <input
              type="text"
              placeholder="Search curriculum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-fwd-grey/50 border border-fwd-grey text-fwd-green placeholder-fwd-green/50 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-fwd-orange focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-fwd-green/50 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* User Section */}
      {user && (
        <div className="px-6 py-4 border-b border-fwd-grey bg-white space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-fwd-orange-20 flex items-center justify-center border border-fwd-orange-50 shrink-0">
              <UserIcon className="w-5 h-5 text-fwd-orange" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-fwd-green">{user.name}</p>
              <p className="text-[10px] text-fwd-green/70 truncate uppercase tracking-widest font-bold">
                {user.title || 'Financial Wealth Planner'}
              </p>
            </div>
          </div>

          {isManager && (
            <button 
              onClick={handleCopyLink}
              className={`
                w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border
                ${linkCopied 
                  ? 'bg-fwd-green-20 border-fwd-green text-fwd-green' 
                  : 'bg-white border-fwd-orange text-fwd-orange hover:bg-fwd-orange hover:text-white'}
              `}
            >
              {linkCopied ? (
                <><Check className="w-3.5 h-3.5" />Link copied!</>
              ) : (
                <><Link className="w-3.5 h-3.5" />Copy recruitment link</>
              )}
            </button>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-fwd-green/70 hover:text-fwd-orange hover:bg-fwd-orange-20 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-fwd-grey">
        {currentView === 'dashboard' ? (
           <div className="px-6 text-center text-fwd-green/60 text-sm animate-in slide-in-from-right-4">
              <div className="mb-4 bg-fwd-orange-20 p-6 rounded-3xl">
                <Users className="w-8 h-8 text-fwd-orange mx-auto mb-3" />
                <p className="font-bold text-fwd-green mb-1">Team overview</p>
                <p className="text-xs">Monitor advisor performance and progress through the curriculum.</p>
              </div>
           </div>
        ) : currentView === 'training-decks' ? (
           <div className="px-6 text-center text-fwd-green/60 text-sm animate-in slide-in-from-right-4">
              <div className="mb-4 bg-fwd-orange-20 p-6 rounded-3xl">
                <Presentation className="w-8 h-8 text-fwd-orange mx-auto mb-3" />
                <p className="font-bold text-fwd-green mb-1">Training Decks</p>
                <p className="text-xs">Browse the Aquila11 training module presentation covering all key concepts.</p>
              </div>
           </div>
        ) : (
          <>
            {filteredModules.length > 0 ? (
              filteredModules.map((module) => {
                const isExpanded = searchQuery.trim().length > 0 || expandedModuleId === module.id;
                return (
                  <div key={module.id} className="mb-4 px-4">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-fwd-green/70 uppercase tracking-[0.1em] mb-2 px-3 py-1 hover:text-fwd-orange transition-colors"
                    >
                      <span>{module.title}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {isExpanded && (
                      <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {module.lessons.map((lesson) => {
                          const isActive = lesson.id === activeLessonId;
                          const isCompleted = completedLessonIds.has(lesson.id);
                          const isUnlocked = unlockedLessonIds.has(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              disabled={!isUnlocked}
                              onClick={() => {
                                onSelectLesson(lesson);
                                onCloseMobile();
                              }}
                              className={`
                                w-full flex items-start gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left group relative overflow-hidden
                                ${isActive 
                                  ? 'bg-fwd-orange text-white shadow-md' 
                                  : isUnlocked 
                                    ? 'text-fwd-green hover:bg-fwd-orange-20'
                                    : 'text-fwd-green/30 cursor-not-allowed'}
                              `}
                            >
                              <div className="relative shrink-0 mt-0.5">
                                {isActive ? (
                                  <PlayCircle className="w-5 h-5 text-white" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-fwd-green" />
                                ) : !isUnlocked ? (
                                  <Lock className="w-5 h-5 text-fwd-green/30" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-fwd-green/30 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-fwd-green/30 group-hover:bg-fwd-orange transition-colors" />
                                  </div>
                                )}
                              </div>
                              <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                              {user && localStorage.getItem(`notes_${user.id}_${lesson.id}`) && (
                                <StickyNote className="w-3 h-3 text-fwd-orange/50 shrink-0 ml-auto" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center text-fwd-green/50 text-sm italic">
                <p>No training modules found.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-fwd-grey bg-white text-center shrink-0">
          <p className="text-[10px] text-fwd-green/50 font-bold uppercase tracking-widest">&copy; 2024 Aquila11 Financial Group</p>
      </div>
    </aside>
  );
};

export default Sidebar;