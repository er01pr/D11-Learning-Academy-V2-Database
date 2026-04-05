import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { db } from '../services/database';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isInitializing: boolean;
  completedLessons: Set<string>;
  setCompletedLessons: React.Dispatch<React.SetStateAction<Set<string>>>;
  quizScores: Record<string, number>;
  setQuizScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
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
              title: profile.title || 'Financial Wealth Planner',
            });
          } else {
            setUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Advisor',
              email: session.user.email || '',
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCompletedLessons(new Set());
        setQuizScores({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user progress when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        const progress = await db.getProgress(user.id);
        if (progress) {
          setCompletedLessons(new Set(progress.completedLessonIds));
          setQuizScores(progress.quizScores || {});
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    };

    loadProgress();
  }, [user]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isInitializing,
    completedLessons,
    setCompletedLessons,
    quizScores,
    setQuizScores,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
