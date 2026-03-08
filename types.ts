export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link';
}

export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  summary: string;
  moduleId: string;
  quiz?: Question[];
  resources?: Resource[];
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
  title?: string;
  password?: string;
}

export interface UserProgress {
  completedLessonIds: string[];
  quizScores: Record<string, number>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}