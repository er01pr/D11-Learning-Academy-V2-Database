import { User, UserProgress } from '../types';
import { supabase } from './supabaseClient';
import { CURRICULUM } from '../constants';

const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const generateRandomProgress = (): UserProgress => {
  const completedLessonIds: string[] = [];
  const quizScores: Record<string, number> = {};
  const allLessons = CURRICULUM.flatMap(m => m.lessons);
  const completedCount = Math.floor(Math.random() * (allLessons.length + 1));
  for (let i = 0; i < completedCount; i++) {
    const lesson = allLessons[i];
    completedLessonIds.push(lesson.id);
    if (lesson.quiz && lesson.quiz.length > 0) {
      const total = lesson.quiz.length;
      const passed = Math.random() > 0.2;
      const minPass = Math.ceil(total * 0.7);
      const score = passed 
        ? Math.floor(Math.random() * (total - minPass + 1)) + minPass 
        : Math.floor(Math.random() * minPass);
      quizScores[lesson.id] = score;
    }
  }
  return { completedLessonIds, quizScores };
};

const generateMockDownlines = (rootManagerName: string): (User & { progress: UserProgress, level: string, uplineName: string })[] => {
  const mockData: (User & { progress: UserProgress, level: string, uplineName: string })[] = [];
  const unitManagerA: User = { id: 'mock-um-a', name: 'Marcus (Unit Manager)', email: 'marcus.unit@d11.com', title: 'Financial Wealth Unit Manager' };
  mockData.push({ ...unitManagerA, progress: generateRandomProgress(), level: 'Direct', uplineName: rootManagerName });
  const unitManagerB: User = { id: 'mock-um-b', name: 'Sarah (Unit Manager)', email: 'sarah.unit@d11.com', title: 'Financial Wealth Unit Manager' };
  mockData.push({ ...unitManagerB, progress: generateRandomProgress(), level: 'Direct', uplineName: rootManagerName });
  const unitManagerC: User = { id: 'mock-um-c', name: 'David (Indirect Unit Manager)', email: 'david.sub@d11.com', title: 'Financial Wealth Unit Manager' };
  mockData.push({ ...unitManagerC, progress: generateRandomProgress(), level: 'Indirect (via Marcus)', uplineName: 'Marcus (Unit Manager)' });
  for (let i = 1; i <= 6; i++) {
    mockData.push({
      id: `mock-adv-a-${i}`,
      name: `Advisor A-${i}`,
      email: `advisor.a${i}@d11.com`,
      title: 'Financial Wealth Planner',
      progress: generateRandomProgress(),
      level: 'Indirect (via Marcus)',
      uplineName: 'Marcus (Unit Manager)'
    });
  }
  for (let i = 1; i <= 6; i++) {
    mockData.push({
      id: `mock-adv-b-${i}`,
      name: `Advisor B-${i}`,
      email: `advisor.b${i}@d11.com`,
      title: 'Financial Wealth Planner',
      progress: generateRandomProgress(),
      level: 'Indirect (via Sarah)',
      uplineName: 'Sarah (Unit Manager)'
    });
  }
  return mockData;
};

export const db = {
  register: async (name: string, email: string, password: string, managerId?: string | null): Promise<{ user: User, session: any }> => {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
    let safeManagerId = null;
    if (managerId && typeof managerId === 'string' && isValidUUID(managerId)) {
         try {
             const { data, error } = await supabase.from('profiles').select('id').eq('id', managerId).maybeSingle();
             if (!error && data) safeManagerId = managerId;
         } catch (err) { console.warn("Error checking manager ID:", err); }
    }
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, full_name: name, manager_id: safeManagerId } }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');
    await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: name,
        email: email,
        progress: { completedLessonIds: [], quizScores: {} }
    }, { onConflict: 'id' });
    return { 
        user: { id: authData.user.id, name, email },
        session: authData.session 
    };
  },

  verifyOtp: async (email: string, token: string): Promise<User> => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) throw error;
    if (!data.user) throw new Error('Verification failed.');
    const { data: profile } = await supabase.from('profiles').select('name, title').eq('id', data.user.id).single();
    return { id: data.user.id, name: profile?.name || 'Advisor', email, title: profile?.title || 'Financial Wealth Planner' };
  },

  login: async (email: string, password: string): Promise<User> => {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    const { data: profile } = await supabase.from('profiles').select('name, title').eq('id', authData.user.id).single();
    return { id: authData.user.id, name: profile?.name || 'Advisor', email, title: profile?.title || 'Financial Wealth Planner' };
  },

  getProgress: async (userId: string): Promise<UserProgress> => {
    if (userId === 'demo-brandita-id') {
         const stored = localStorage.getItem('demo_progress');
         return stored ? JSON.parse(stored) : { completedLessonIds: [], quizScores: {} };
    }
    const { data, error } = await supabase.from('profiles').select('progress').eq('id', userId).single();
    if (error) return { completedLessonIds: [], quizScores: {} };
    return (data.progress as UserProgress) || { completedLessonIds: [], quizScores: {} };
  },

  saveProgress: async (userId: string, progress: UserProgress): Promise<void> => {
    if (userId === 'demo-brandita-id') {
        localStorage.setItem('demo_progress', JSON.stringify(progress));
        return;
    }
    const { error } = await supabase.from('profiles').upsert({ id: userId, progress }, { onConflict: 'id' });
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
  },

  seedDemoProgress: async (userId: string): Promise<void> => {
    await db.saveProgress(userId, generateRandomProgress());
  },

  getDownlines: async (managerId: string): Promise<(User & { progress: UserProgress, level: string, uplineName: string })[]> => {
    if (managerId === 'demo-brandita-id') {
        return new Promise((resolve) => { setTimeout(() => resolve(generateMockDownlines('Brandita')), 800); });
    }
    const { data: directs, error } = await supabase.from('profiles').select('id, name, email, title, progress').eq('manager_id', managerId);
    if (error) return [];
    let allDownlines: (User & { progress: UserProgress, level: string, uplineName: string })[] = [];
    if (directs) {
        for (const row of directs) {
            allDownlines.push({
                id: row.id,
                name: row.name,
                email: row.email,
                title: row.title,
                progress: (row.progress as UserProgress) || { completedLessonIds: [], quizScores: {} },
                level: 'Direct',
                uplineName: 'You'
            });
            if (row.title && row.title.includes('Manager')) {
                const { data: indirects } = await supabase.from('profiles').select('id, name, email, title, progress').eq('manager_id', row.id);
                if (indirects) {
                    indirects.forEach(subRow => {
                        allDownlines.push({
                            id: subRow.id,
                            name: subRow.name,
                            email: subRow.email,
                            title: subRow.title,
                            progress: (subRow.progress as UserProgress) || { completedLessonIds: [], quizScores: {} },
                            level: 'Indirect',
                            uplineName: row.name
                        });
                    });
                }
            }
        }
    }
    return allDownlines;
  },

  getUserName: async (userId: string): Promise<string | null> => {
    if (userId === 'demo-brandita-id') return 'Brandita'; 
    if (!isValidUUID(userId)) return null;
    const { data } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
    return data?.name || null;
  }
};