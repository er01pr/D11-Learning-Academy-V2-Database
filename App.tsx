import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, CheckCircle2, ArrowRight, Trophy, Star, AlertCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import Quiz from './components/Quiz';
import AuthForm from './components/AuthForm';
import ManagerDashboard from './components/ManagerDashboard';
import { CURRICULUM, INITIAL_LESSON } from './constants';
import { Lesson, User } from './types';
import { db } from './services/database';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // Initialize user as null. We rely on Supabase to verify session on mount.
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Navigation State
  const [activeLesson, setActiveLesson] = useState<Lesson>(INITIAL_LESSON);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'learning' | 'dashboard'>('learning');
  
  // Progress State
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [completionError, setCompletionError] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const totalLessonsCount = useMemo(() => 
    CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0), 
  []);

  const isCourseComplete = completedLessons.size === totalLessonsCount;

  // Calculate Unlocked Lessons based on completion sequence
  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set<string>();
    // The first lesson of the first module is always unlocked
    if (CURRICULUM.length > 0 && CURRICULUM[0].lessons.length > 0) {
      unlocked.add(CURRICULUM[0].lessons[0].id);
    }

    // Flatten curriculum
    const allLessons: Lesson[] = [];
    CURRICULUM.forEach(m => allLessons.push(...m.lessons));

    // Iterate to unlock subsequent lessons
    for (let i = 0; i < allLessons.length - 1; i++) {
      const currentLesson = allLessons[i];
      const nextLesson = allLessons[i + 1];

      // If current is complete, unlock next
      if (completedLessons.has(currentLesson.id)) {
        unlocked.add(nextLesson.id);
      } else {
        // If current is NOT complete, the chain stops here
        break; 
      }
    }
    return unlocked;
  }, [completedLessons]);

  // Initial session check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email, title')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name,
              email: profile.email,
              title: profile.title || 'Financial Wealth Planner'
            });
          } else {
             // Fallback if profile missing but auth valid
             setUser({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'Advisor',
                email: session.user.email || ''
             });
          }
        } else {
          // No active session found
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();

    // Listen for auth state changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCompletedLessons(new Set());
        setQuizScores({});
        setCurrentView('learning');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user progress
  useEffect(() => {
    if (user) {
      const loadProgress = async () => {
        try {
          const progress = await db.getProgress(user.id);
          setCompletedLessons(new Set(progress.completedLessonIds));
          setQuizScores(progress.quizScores || {});
        } catch (error) {
          console.error("Failed to load progress:", error);
        }
      };
      loadProgress();
    } else {
      setCompletedLessons(new Set());
      setQuizScores({});
    }
  }, [user]);

  // Clear error when changing lessons and scroll to top
  useEffect(() => {
    setCompletionError(null);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeLesson.id, currentView]);

  const activeModule = CURRICULUM.find(m => m.id === activeLesson.moduleId);

  const toggleCompletion = async () => {
    if (!user) return;
    setCompletionError(null);

    const isCurrentlyCompleted = completedLessons.has(activeLesson.id);

    // If trying to mark as complete (not un-completing)
    if (!isCurrentlyCompleted) {
      // Check Quiz Requirements
      if (activeLesson.quiz && activeLesson.quiz.length > 0) {
        const bestScore = quizScores[activeLesson.id] || 0;
        const totalQuestions = activeLesson.quiz.length;
        const percentage = (bestScore / totalQuestions) * 100;
        
        // Require 66% passing score
        if (percentage < 66) {
          setCompletionError("You must pass the quiz (66%+) before completing this lesson.");
          return;
        }
      }
    }

    try {
      const updatedProgress = await db.updateLessonCompletion(user.id, activeLesson.id, !isCurrentlyCompleted);
      setCompletedLessons(new Set(updatedProgress.completedLessonIds));
    } catch (error) {
      console.error("Failed to update completion:", error);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user) return;
    try {
      const updated = await db.saveQuizScore(user.id, activeLesson.id, score);
      setQuizScores(updated.quizScores);
      // If they passed, clear any previous error about not passing
      const totalQuestions = activeLesson.quiz?.length || 1;
      if ((score / totalQuestions) * 100 >= 66) {
        setCompletionError(null);
      }
    } catch (error) {
      console.error("Failed to save quiz score:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const goToNextLesson = useCallback(() => {
    let currentModuleIndex = CURRICULUM.findIndex(m => m.id === activeLesson.moduleId);
    if (currentModuleIndex === -1) return;

    const currentModule = CURRICULUM[currentModuleIndex];
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);

    let nextLesson: Lesson | null = null;

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      nextLesson = currentModule.lessons[currentLessonIndex + 1];
    } else if (currentModuleIndex < CURRICULUM.length - 1) {
      const nextModule = CURRICULUM[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        nextLesson = nextModule.lessons[0];
      }
    }

    if (nextLesson) {
      if (unlockedLessonIds.has(nextLesson.id)) {
        setActiveLesson(nextLesson);
      } else {
        setCompletionError("Please complete the current lesson and quiz to unlock the next topic.");
      }
    }
  }, [activeLesson, unlockedLessonIds]);

  const isLastLesson = () => {
    const lastModule = CURRICULUM[CURRICULUM.length - 1];
    const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
    return activeLesson.id === lastLesson.id;
  };

  const isNextLocked = () => {
     if (isLastLesson()) return true;
     let currentModuleIndex = CURRICULUM.findIndex(m => m.id === activeLesson.moduleId);
     const currentModule = CURRICULUM[currentModuleIndex];
     const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);
     
     let nextId = "";
     if (currentLessonIndex < currentModule.lessons.length - 1) {
        nextId = currentModule.lessons[currentLessonIndex + 1].id;
     } else if (currentModuleIndex < CURRICULUM.length - 1) {
        const nextModule = CURRICULUM[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) nextId = nextModule.lessons[0].id;
     }
     
     return !unlockedLessonIds.has(nextId);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-corporate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 border-4 border-corporate-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium animate-pulse">Initializing Academy...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-corporate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        modules={CURRICULUM}
        activeLessonId={activeLesson.id}
        completedLessonIds={completedLessons}
        unlockedLessonIds={unlockedLessonIds}
        onSelectLesson={(lesson) => {
          setActiveLesson(lesson);
          setCurrentView('learning');
        }}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-20">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <span className="font-bold text-corporate-900">D11 Academy</span>
            </div>
        </div>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {currentView === 'dashboard' ? (
                  <ManagerDashboard user={user} />
                ) : (
                  /* LEARNING VIEW */
                  <>
                    {/* Course Completion Banner */}
                    {isCourseComplete && (
                      <div className="relative overflow-hidden bg-gradient-to-r from-corporate-500 to-corporate-600 rounded-2xl p-6 text-white shadow-xl mb-8 animate-in fade-in slide-in-from-top duration-700">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                          <div className="bg-white/20 p-4 rounded-full">
                            <Trophy className="w-12 h-12 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-1">Curriculum Mastery Achieved!</h2>
                            <p className="opacity-90">Congratulations, {user.name}. You have successfully completed all D11 Financial Academy training modules.</p>
                          </div>
                          <div className="md:ml-auto">
                            <button className="bg-white text-corporate-600 px-6 py-2.5 rounded-lg font-bold hover:bg-corporate-50 transition-colors shadow-sm">
                              View Certification
                            </button>
                          </div>
                        </div>
                        <Star className="absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1 hover:text-corporate-500 cursor-pointer" onClick={() => setActiveLesson(INITIAL_LESSON)}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Curriculum</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-corporate-800 font-medium">{activeModule?.title}</span>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <section className="group">
                            <VideoPlayer videoId={activeLesson.videoId} title={activeLesson.title} />
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                {activeLesson.title}
                            </h2>
                            
                            <div className="prose prose-blue max-w-none mb-8">
                                <h3 className="text-xs font-bold text-corporate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-corporate-500" />
                                  Lesson Summary
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {activeLesson.summary}
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
                                {completionError && (
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800 animate-pulse">
                                    <AlertCircle className="w-4 h-4" />
                                    {completionError}
                                  </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <button 
                                    onClick={toggleCompletion}
                                    className={`
                                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border font-bold text-sm transition-all duration-200
                                      ${completedLessons.has(activeLesson.id)
                                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}
                                    `}
                                  >
                                    {completedLessons.has(activeLesson.id) ? (
                                      <><CheckCircle2 className="w-5 h-5" /><span>Completed</span></>
                                    ) : (
                                      <><div className="w-5 h-5 rounded-full border-2 border-gray-300" /><span>Mark as Complete</span></>
                                    )}
                                  </button>

                                  <button 
                                    onClick={goToNextLesson}
                                    disabled={isNextLocked()}
                                    className={`
                                      w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white transition-all shadow-md
                                      ${isNextLocked()
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-corporate-900 hover:bg-corporate-800 active:scale-[0.98]'}
                                    `}
                                  >
                                    <span>Next Lesson</span>
                                    {isNextLocked() ? <span>🔒</span> : <ArrowRight className="w-5 h-5" />}
                                  </button>
                                </div>
                            </div>
                        </section>

                        {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                          <section>
                            <Quiz questions={activeLesson.quiz} onScoreUpdate={handleQuizComplete} />
                          </section>
                        )}
                    </div>
                  </>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;