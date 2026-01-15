export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  summary: string;
  moduleId: string;
  quiz?: Question[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for the mock DB
}

export interface UserProgress {
  completedLessonIds: string[];
  quizScores: Record<string, number>; // lessonId -> best score
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}