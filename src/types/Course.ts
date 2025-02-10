export interface Course {
  _id: string;
  title: string;
  description: string;
  teacher: string;
  scope: string;
  semester: string;
  learningObjectives: string[];
  skills: string[];
  competencies: string[];
  topics: string[];
  createdAt: string;
  updatedAt: string;
}
