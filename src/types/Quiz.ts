import type { Topic } from './Topic';
export interface QuizOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  _id: string;
  topic: Topic;
  question: string;
  options: QuizOption[];
  createdAt: string;
  updatedAt: string;
}
