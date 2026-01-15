import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, CheckCircle2, ArrowRight, Trophy, Star } from 'lucide-react';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import Quiz from './components/Quiz';
import AuthForm from './components/AuthForm';
import { CURRICULUM, INITIAL_LESSON } from './constants';
import { Lesson, User } from './types';
import { db } from './services/database';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('d11_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson>(INITIAL_LESSON);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const totalLessonsCount = useMemo(() => 
    CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0), 
  []);

  const isCourseComplete = completedLessons.size === totalLessonsCount;

  // Initial session check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name,
              email: profile.email
            });
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // Load user progress
  useEffect(() => {
    if (user) {
      localStorage.setItem('d11_current_user', JSON.stringify(user));
      const loadProgress = async () => {
        try {
          const progress = await db.getProgress(user.id);
          setCompletedLessons(new Set(progress.completedLessonIds));
        } catch (error) {
          console.error("Failed to load progress:", error);
        }
      };
      loadProgress();
    } else if (!isInitializing) {
      localStorage.removeItem('d11_current_user');
      setCompletedLessons(new Set());
    }
  }, [user, isInitializing]);

  const activeModule = CURRICULUM.find(m => m.id === activeLesson.moduleId);

  const toggleCompletion = async () => {
    if (!user) return;
    try {
      const isCompleted = completedLessons.has(activeLesson.id);
      const updatedProgress = await db.updateLessonCompletion(user.id, activeLesson.id, !isCompleted);
      setCompletedLessons(new Set(updatedProgress.completedLessonIds));
    } catch (error) {
      console.error("Failed to update completion:", error);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user) return;
    try {
      await db.saveQuizScore(user.id, activeLesson.id, score);
    } catch (error) {
      console.error("Failed to save quiz score:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const goToNextLesson = useCallback(() => {
    let currentModuleIndex = CURRICULUM.findIndex(m => m.id === activeLesson.moduleId);
    if (currentModuleIndex === -1) return;

    const currentModule = CURRICULUM[currentModuleIndex];
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setActiveLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < CURRICULUM.length - 1) {
      const nextModule = CURRICULUM[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        setActiveLesson(nextModule.lessons[0]);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLesson]);

  const isLastLesson = () => {
    const lastModule = CURRICULUM[CURRICULUM.length - 1];
    const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
    return activeLesson.id === lastLesson.id;
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
          className="fixed inset-0 bg-gray-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        modules={CURRICULUM}
        activeLessonId={activeLesson.id}
        completedLessonIds={completedLessons}
        onSelectLesson={setActiveLesson}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {/* Course Completion Banner */}
                {isCourseComplete && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl mb-8 animate-in fade-in slide-in-from-top duration-700">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                      <div className="bg-white/20 p-4 rounded-full">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-1">Curriculum Mastery Achieved!</h2>
                        <p className="opacity-90">Congratulations, {user.name}. You have successfully completed all D11 Financial Academy training modules.</p>
                      </div>
                      <div className="md:ml-auto">
                        <button className="bg-white text-amber-600 px-6 py-2.5 rounded-lg font-bold hover:bg-amber-50 transition-colors shadow-sm">
                           View Certification
                        </button>
                      </div>
                    </div>
                    {/* Decorative stars */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="group">
                            <VideoPlayer videoId={activeLesson.videoId} title={activeLesson.title} />
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {activeLesson.title}
                                </h2>
                            </div>
                            
                            <div className="prose prose-blue max-w-none mb-8">
                                <h3 className="text-xs font-bold text-corporate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-corporate-500" />
                                  Lesson Summary
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {activeLesson.summary}
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button 
                                      onClick={toggleCompletion}
                                      className={`
                                        flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-sm transition-all duration-200
                                        ${completedLessons.has(activeLesson.id)
                                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}
                                      `}
                                    >
                                      {completedLessons.has(activeLesson.id) ? (
                                        <>
                                          <CheckCircle2 className="w-5 h-5" />
                                          <span>Completed</span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                          <span>Mark as Complete</span>
                                        </>
                                      )}
                                    </button>
                                </div>

                                <button 
                                  onClick={goToNextLesson}
                                  disabled={isLastLesson()}
                                  className={`
                                    w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white transition-all shadow-md
                                    ${isLastLesson() 
                                      ? 'bg-gray-300 cursor-not-allowed' 
                                      : 'bg-corporate-900 hover:bg-corporate-800 active:scale-[0.98]'}
                                  `}
                                >
                                  <span>Next Lesson</span>
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </section>

                        {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                          <section>
                             <Quiz questions={activeLesson.quiz} onScoreUpdate={handleQuizComplete} />
                          </section>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                        
                        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-corporate-50 rounded-lg">
                                    <Star className="w-5 h-5 text-corporate-500" />
                                </div>
                                <h4 className="font-bold text-gray-900">Advisor Support</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                You are connected as <strong>{user.email}</strong>. If you experience playback issues, please check your network or contact support.
                            </p>
                            <button className="w-full text-xs font-bold bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all uppercase tracking-widest">
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;