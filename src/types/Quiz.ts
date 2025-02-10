export interface QuizOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  _id: string;
  topic_id: string;
  question: string;
  options: QuizOption[];
  createdAt: string;
  updatedAt: string;
}
