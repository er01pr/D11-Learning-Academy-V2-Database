import React, { useState, useMemo } from 'react';
import { Module, Lesson, User } from '../types';
import { PlayCircle, CheckCircle2, BookOpen, Search, LogOut, User as UserIcon, Trophy } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  activeLessonId: string;
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  modules, 
  activeLessonId, 
  completedLessonIds, 
  onSelectLesson, 
  isOpen, 
  onCloseMobile,
  user,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const totalLessons = useMemo(() => 
    modules.reduce((acc, m) => acc + m.lessons.length, 0), 
  [modules]);
  
  const completionPercentage = useMemo(() => 
    totalLessons > 0 ? Math.round((completedLessonIds.size / totalLessons) * 100) : 0,
  [completedLessonIds, totalLessons]);

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

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-corporate-900 text-white transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-corporate-800 bg-corporate-900 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white p-2 rounded-lg shadow-md">
             <BookOpen className="w-6 h-6 text-corporate-900" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">D11 Academy</h1>
            <p className="text-xs text-corporate-100 opacity-80">Advisor Excellence</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-corporate-400 uppercase tracking-widest">Training Progress</span>
            <span className="text-xs font-bold text-corporate-500">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-corporate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-corporate-500 transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search curriculum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-corporate-800/50 border border-corporate-700 text-white placeholder-corporate-400 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-corporate-500 transition-all"
          />
          <Search className="w-4 h-4 text-corporate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* User Section */}
      {user && (
        <div className="px-6 py-4 border-b border-corporate-800 bg-corporate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-corporate-800 flex items-center justify-center border border-corporate-700 shadow-inner">
              <UserIcon className="w-5 h-5 text-corporate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">{user.name}</p>
              <p className="text-[10px] text-corporate-500 truncate uppercase tracking-widest font-bold">Licensed Advisor</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-corporate-400 hover:text-white border border-corporate-800 hover:bg-corporate-800 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-corporate-800">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <div key={module.id} className="mb-6 px-4">
              <h3 className="text-[10px] font-bold text-corporate-500 uppercase tracking-[0.2em] mb-3 px-2">
                {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedLessonIds.has(lesson.id);
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        onSelectLesson(lesson);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-start gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 text-left group relative overflow-hidden
                        ${isActive 
                          ? 'bg-corporate-500 text-white shadow-lg shadow-corporate-500/20' 
                          : 'text-corporate-100 hover:bg-corporate-800 hover:text-white'}
                      `}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        {isActive ? (
                          <PlayCircle className="w-5 h-5 text-white" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-corporate-700 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-corporate-700 group-hover:bg-corporate-500 transition-colors" />
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-corporate-400 text-sm italic">
            <p>No training modules found.</p>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="mx-4 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
             <Trophy className="w-8 h-8 text-yellow-500 shrink-0" />
             <div>
               <p className="text-xs font-bold text-yellow-500 uppercase tracking-tighter">Course Master</p>
               <p className="text-[10px] text-yellow-500/70">All modules completed.</p>
             </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-corporate-800 bg-corporate-900 text-center shrink-0">
          <p className="text-[10px] text-corporate-500 font-bold uppercase tracking-widest">&copy; 2024 D11 Financial Group</p>
      </div>
    </aside>
  );
};

export default Sidebar;