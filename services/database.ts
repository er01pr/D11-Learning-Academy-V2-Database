import { User, UserProgress } from '../types';
import { supabase } from './supabaseClient';

export const db = {
  // Authentication
  register: async (name: string, email: string, password: string): Promise<User> => {
    // We pass the 'name' in options.data. 
    // The Database Trigger 'handle_new_user' will read this and create the profile row automatically.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    // We no longer manually insert into 'profiles' here. 
    // The trigger handles it, which is the industry standard for Supabase.
    return { id: authData.user.id, name, email };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    // Fetch profile created by the trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist yet (e.g. legacy users), we might need to handle it
      return { id: authData.user.id, name: 'Advisor', email };
    }

    return { id: authData.user.id, name: profile.name, email };
  },

  // Progress Management
  getProgress: async (userId: string): Promise<UserProgress> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('progress')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching progress:', error);
      return { completedLessonIds: [], quizScores: {} };
    }
    
    return data.progress as UserProgress;
  },

  saveProgress: async (userId: string, progress: UserProgress): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({ progress })
      .eq('id', userId);

    if (error) throw error;
  },

  updateLessonCompletion: async (userId: string, lessonId: string, completed: boolean): Promise<UserProgress> => {
    const progress = await db.getProgress(userId);
    const set = new Set(progress.completedLessonIds);
    if (completed) set.add(lessonId);
    else set.delete(lessonId);
    
    const updated = { ...progress, completedLessonIds: Array.from(set) };
    await db.saveProgress(userId, updated);
    return updated;
  },

  saveQuizScore: async (userId: string, lessonId: string, score: number): Promise<UserProgress> => {
    const progress = await db.getProgress(userId);
    const updated = { 
      ...progress, 
      quizScores: { ...progress.quizScores, [lessonId]: Math.max(progress.quizScores[lessonId] || 0, score) } 
    };
    await db.saveProgress(userId, updated);
    return updated;
  }
};