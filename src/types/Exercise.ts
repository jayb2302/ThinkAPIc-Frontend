export type Difficulty = 'easy' | 'medium' | 'hard';

export const difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};


export interface ExerciseOption {
  text: string;
  isCorrect: boolean;
  order?: number;
}

export interface ExerciseQuestion {
  question: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'coding' | 'short-answer';
  correctAnswer?: string;
  options?: ExerciseOption[];
}

export interface Exercise {
  _id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topicId?: string;
  topic?: string;
  questions: ExerciseQuestion[];
}

export interface ExerciseAttempt {
  exerciseId: string;
  success: boolean;
  timeSpent: number;
}