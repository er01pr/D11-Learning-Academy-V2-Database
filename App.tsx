import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, CheckCircle2, ArrowRight, Trophy, Star, AlertCircle, FileText, Download, Sparkles, MessageCircle, Presentation, ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import Quiz from './components/Quiz';
import AuthForm from './components/AuthForm';
import ManagerDashboard from './components/ManagerDashboard';
import AITutor from './components/AITutor';
import ErrorBoundary from './components/ErrorBoundary';
import { LessonSkeleton, DashboardSkeleton } from './components/LoadingSkeletons';
import LessonNotes from './components/LessonNotes';
import { AchievementBadges } from './components/Achievements';
import StudyRecommendation from './components/StudyRecommendation';
import Certificate from './components/Certificate';
import TrainingDecks from './components/TrainingDecks';
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
  const [currentView, setCurrentView] = useState<'learning' | 'dashboard' | 'training-decks'>('learning');

  // Progress State
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // AI Tutor State
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // Certificate State
  const [showCertificate, setShowCertificate] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const totalLessonsCount = useMemo(() =>
    CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0),
  []);

  const isCourseComplete = completedLessons.size === totalLessonsCount;

  // Calculate average quiz score for certificate
  const avgQuizScore = useMemo(() => {
    const scores = Object.values(quizScores);
    if (scores.length === 0) return 0;
    const totalQuestions = CURRICULUM.flatMap(m => m.lessons).reduce((acc, l) => {
      if (l.quiz && quizScores[l.id] !== undefined) return acc + l.quiz.length;
      return acc;
    }, 0);
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  }, [quizScores]);

  // Calculate Unlocked Lessons based on completion sequence
  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set<string>();
    if (CURRICULUM.length > 0 && CURRICULUM[0].lessons.length > 0) {
      unlocked.add(CURRICULUM[0].lessons[0].id);
    }

    const allLessons: Lesson[] = [];
    CURRICULUM.forEach(m => allLessons.push(...m.lessons));

    for (let i = 0; i < allLessons.length - 1; i++) {
      const currentLesson = allLessons[i];
      const nextLesson = allLessons[i + 1];

      if (completedLessons.has(currentLesson.id)) {
        unlocked.add(nextLesson.id);
      } else {
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
             setUser({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'Advisor',
                email: session.user.email || ''
             });
          }
        } else {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCompletedLessons(new Set());
        setQuizScores({});
        setCurrentView('learning');
        setIsAITutorOpen(false);
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
        setIsLoadingProgress(true);
        try {
          const progress = await db.getProgress(user.id);
          setCompletedLessons(new Set(progress.completedLessonIds));
          setQuizScores(progress.quizScores || {});
        } catch (error) {
          console.error("Failed to load progress:", error);
        } finally {
          setIsLoadingProgress(false);
        }
      };
      loadProgress();
    } else {
      setCompletedLessons(new Set());
      setQuizScores({});
    }
  }, [user]);

  // Update learning streak when lessons are completed
  useEffect(() => {
    if (completedLessons.size > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem('learning_streak_last_date');
      const storedCount = parseInt(localStorage.getItem('learning_streak_count') || '0', 10);

      if (lastDate !== today) {
        const last = lastDate ? new Date(lastDate) : null;
        const now = new Date(today);
        const diffDays = last ? Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        const newCount = diffDays === 1 ? storedCount + 1 : 1;
        localStorage.setItem('learning_streak_last_date', today);
        localStorage.setItem('learning_streak_count', String(newCount));
      }
    }
  }, [completedLessons]);

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

    if (!isCurrentlyCompleted) {
      if (activeLesson.quiz && activeLesson.quiz.length > 0) {
        const bestScore = quizScores[activeLesson.id] || 0;
        const totalQuestions = activeLesson.quiz.length;
        const percentage = (bestScore / totalQuestions) * 100;

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
      <div className="min-h-screen bg-fwd-orange flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium animate-pulse">Initializing Academy...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-fwd-grey font-sans text-fwd-green">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-fwd-green/50 z-30 md:hidden backdrop-blur-sm"
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
        quizScores={quizScores}
        totalLessons={totalLessonsCount}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-fwd-grey shadow-sm z-20">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-fwd-green hover:bg-fwd-grey rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <span className="font-bold text-fwd-green">Aquila11 Academy</span>
            </div>
        </div>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {currentView === 'training-decks' ? (
                  <ErrorBoundary fallbackTitle="Training decks error">
                    <TrainingDecks />
                  </ErrorBoundary>
                ) : currentView === 'dashboard' ? (
                  <ErrorBoundary fallbackTitle="Dashboard error">
                    <ManagerDashboard user={user} />
                  </ErrorBoundary>
                ) : isLoadingProgress ? (
                  <LessonSkeleton />
                ) : (
                  /* LEARNING VIEW */
                  <>
                    {/* Course Completion Banner */}
                    {isCourseComplete && (
                      <div className="relative overflow-hidden bg-fwd-orange rounded-3xl p-6 text-white shadow-soft mb-8 animate-in fade-in slide-in-from-top duration-700">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                          <div className="bg-white/20 p-4 rounded-full">
                            <Trophy className="w-12 h-12 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-1">Curriculum mastery achieved!</h2>
                            <p className="opacity-90">Congratulations, {user.name}. You have successfully completed all Aquila11 Financial Academy training modules.</p>
                          </div>
                          <div className="md:ml-auto">
                            <button
                              onClick={() => setShowCertificate(true)}
                              className="bg-white text-fwd-orange px-6 py-2.5 rounded-xl font-bold hover:bg-fwd-orange-20 transition-colors shadow-sm"
                            >
                              View certification
                            </button>
                          </div>
                        </div>
                        <Star className="absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
                      </div>
                    )}

                    {/* Smart Study Recommendation */}
                    <StudyRecommendation
                      completedLessonIds={completedLessons}
                      quizScores={quizScores}
                      modules={CURRICULUM}
                    />

                    <div className="flex items-center gap-2 text-sm text-fwd-green/60 mb-4">
                        <div className="flex items-center gap-1 hover:text-fwd-orange cursor-pointer" onClick={() => setActiveLesson(INITIAL_LESSON)}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Curriculum</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-fwd-green font-medium">{activeModule?.title}</span>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <ErrorBoundary fallbackTitle="Video player error">
                          <section className="group">
                              <VideoPlayer videoId={activeLesson.videoId} title={activeLesson.title} />
                          </section>
                        </ErrorBoundary>

                        <section className="bg-white rounded-3xl shadow-soft border border-fwd-grey/50 p-8 md:p-10">
                            <h2 className="text-3xl font-bold text-fwd-green mb-6 tracking-tight">
                                {activeLesson.title}
                            </h2>

                            <div className="prose prose-orange max-w-none mb-8 text-fwd-green">
                                <h3 className="text-xs font-bold text-fwd-orange uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-fwd-orange" />
                                  Lesson summary
                                </h3>
                                <p className="leading-relaxed text-lg">
                                    {activeLesson.summary}
                                </p>
                            </div>

                            {activeLesson.resources && activeLesson.resources.length > 0 && (
                                <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-xs font-bold text-fwd-orange uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-fwd-orange" />
                                        Supplementary resources
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {activeLesson.resources.map((resource, idx) => (
                                            <a
                                                key={idx}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 rounded-xl border border-fwd-grey bg-white hover:border-fwd-orange hover:shadow-md transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-fwd-orange-20 flex items-center justify-center text-fwd-orange shrink-0 group-hover:scale-110 transition-transform">
                                                    {resource.type === 'canva' ? <Presentation className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-fwd-green text-sm truncate">{resource.title}</p>
                                                    <p className="text-xs text-fwd-green/50">
                                                      {resource.type === 'canva' ? 'Training Deck' : resource.type === 'pdf' ? 'PDF Document' : 'External Link'}
                                                    </p>
                                                </div>
                                                {resource.type === 'canva' || resource.type === 'link' ? (
                                                  <ExternalLink className="w-4 h-4 text-fwd-green/40 group-hover:text-fwd-orange transition-colors" />
                                                ) : (
                                                  <Download className="w-4 h-4 text-fwd-green/40 group-hover:text-fwd-orange transition-colors" />
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 pt-8 border-t border-fwd-grey">
                                {completionError && (
                                  <div className="p-4 bg-fwd-orange-20 border border-fwd-orange-50 rounded-xl flex items-center gap-3 text-sm text-fwd-green animate-pulse">
                                    <AlertCircle className="w-5 h-5 text-fwd-orange" />
                                    {completionError}
                                  </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <button
                                    onClick={toggleCompletion}
                                    className={`
                                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200
                                      ${completedLessons.has(activeLesson.id)
                                        ? 'bg-fwd-green-20 border-fwd-green-20 text-fwd-green'
                                        : 'bg-white border-fwd-grey text-fwd-green hover:border-fwd-green'}
                                    `}
                                  >
                                    {completedLessons.has(activeLesson.id) ? (
                                      <><CheckCircle2 className="w-5 h-5" /><span>Completed</span></>
                                    ) : (
                                      <><div className="w-5 h-5 rounded-full border-2 border-fwd-grey" /><span>Mark as complete</span></>
                                    )}
                                  </button>

                                  <button
                                    onClick={goToNextLesson}
                                    disabled={isNextLocked()}
                                    className={`
                                      w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md
                                      ${isNextLocked()
                                        ? 'bg-fwd-grey cursor-not-allowed text-fwd-green/50'
                                        : 'bg-fwd-orange hover:bg-fwd-orange-80 active:scale-[0.98]'}
                                    `}
                                  >
                                    <span>Next lesson</span>
                                    {isNextLocked() ? <span>🔒</span> : <ArrowRight className="w-5 h-5" />}
                                  </button>
                                </div>
                            </div>
                        </section>

                        {/* Lesson Notes */}
                        <ErrorBoundary fallbackTitle="Notes error">
                          <LessonNotes lessonId={activeLesson.id} userId={user.id} />
                        </ErrorBoundary>

                        {/* Quiz */}
                        {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                          <ErrorBoundary fallbackTitle="Quiz error">
                            <section>
                              <Quiz questions={activeLesson.quiz} onScoreUpdate={handleQuizComplete} />
                            </section>
                          </ErrorBoundary>
                        )}

                        {/* Achievements */}
                        <section className="bg-white rounded-3xl shadow-soft border border-fwd-grey/50 p-6">
                          <AchievementBadges
                            completedLessonIds={completedLessons}
                            quizScores={quizScores}
                            totalLessons={totalLessonsCount}
                            modules={CURRICULUM}
                          />
                        </section>
                    </div>
                  </>
                )}
            </div>
        </main>

        {/* AI Tutor Floating Button */}
        {currentView === 'learning' && (
          <button
            onClick={() => setIsAITutorOpen(!isAITutorOpen)}
            className={`
              fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95
              ${isAITutorOpen
                ? 'bg-fwd-green text-white'
                : 'bg-fwd-orange text-white'}
            `}
            title="AI Learning Assistant"
          >
            {isAITutorOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </button>
        )}

        {/* AI Tutor Drawer */}
        {isAITutorOpen && currentView === 'learning' && (
          <div className="fixed bottom-24 right-6 z-40 w-[400px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <ErrorBoundary fallbackTitle="AI Tutor error">
              <AITutor lesson={activeLesson} user={user} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate
          userName={user.name}
          completionDate={new Date()}
          avgQuizScore={avgQuizScore}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default App;
